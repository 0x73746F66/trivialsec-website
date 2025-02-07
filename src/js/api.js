const BaseApi = Object.assign({
    version: "v1",
    handle_webauthn_error: async error => {
        if (['InvalidStateError'].includes(error.name) && error.message.startsWith('A request is already pending')) {
            return;
        }
        if (['NotAllowedError'].includes(error.name)) {
            void toast('warning', 'The operation either timed out or was cancelled', 'Cancelled')
            return;
        }
        void toast('error', error.message, error.name, true)
    },
    handle_debug: async error => {// Server DEBUG=on
        console.error(error)
    },
    request: async (url, options) => {
        const response = await fetch(url, options).catch(BaseApi.handle_debug)
        if (!response || response.status === 404) {
            return {'status': 'warning', 'message': 'The server is currently not available.<br>Please try again in a few moments'};
        }
        if (response.status === 401) {
            return {'status': 'error', 'message': 'Request was cancelled as being unauthorised'}
        }
        if (response.status !== 200) {
            console.log(response)
            return {'status': 'info', 'message': 'This feature is not currently available'};
        }
        const json = await response.json()
        if (json.error) {
            BaseApi.handle_debug(json.error)
        }
        return json
    },
    authorization_transaction: async target => {
        const apiKeySecret = localStorage.getItem('_apiKeySecret')
        const endpoint_authz_body = JSON.stringify({target})
        const json = await BaseApi.request(
            `${app.apiScheme}${app.apiDomain}/${BaseApi.version}/auth/transaction`, {
            mode: "cors",
            credentials: "omit",
            method: "POST",
            body: endpoint_authz_body,
            headers: {
                'Authorization': await HMAC.header({
                    credentials: {
                        id: app.apiKeyId,
                        key: apiKeySecret,
                        alg: HMAC.default_algorithm
                    },
                    uri: `/${BaseApi.version}/auth/transaction`,
                    body: endpoint_authz_body,
                    method: "POST"
                })
            }
        })
        if (typeof json === 'object') {
            if ('transaction_id' in json && typeof json.transaction_id === 'string') {
                void sessionStorage.setItem(`_authz_${target}`, json.transaction_id)
                return json.transaction_id
            }
            if (json.status && json.message && json.status !== 'success') {
                void toast(json.status, json.message)
            }
        }
        return json
    },
    prompt_webauthn: async (credentials, transaction_id) => {
        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge: HMAC.enc.encode(app.apiKeyId),
                rpId: app.domainName,
                userVerification: "discouraged",
                allowCredentials: credentials,
                timeout: 90000,
            }
        }).catch(BaseApi.handle_webauthn_error)
        if (assertion && assertion.response) {
            const apiKeySecret = localStorage.getItem('_apiKeySecret')
            const authData = new Uint8Array(assertion.response.authenticatorData)
            const clientDataJSON = new Uint8Array(assertion.response.clientDataJSON)
            const rawId = new Uint8Array(assertion.rawId)
            const sig = new Uint8Array(assertion.response.signature)
            const assertionClientExtensions = assertion.getClientExtensionResults()
            const assertion_response = {
              id: assertion.id,
              rawId: arrayBufferToBase64(rawId),
              type: assertion.type,
              authData: arrayBufferToBase64(authData),
              clientData: arrayBufferToBase64(clientDataJSON),
              signature: hexEncode(sig),
              assertionClientExtensions: JSON.stringify(assertionClientExtensions),
            }
            const authz_body = JSON.stringify({
                assertion_response,
                transaction_id
            })
            return BaseApi.request(
                `${app.apiScheme}${app.apiDomain}/${BaseApi.version}/auth/authorization-verify`, {
                mode: "cors",
                credentials: "omit",
                method: "POST",
                body: authz_body,
                headers: {
                    'Authorization': await HMAC.header({
                        credentials: {
                            id: app.apiKeyId,
                            key: apiKeySecret,
                            alg: HMAC.default_algorithm
                        },
                        uri: `/${BaseApi.version}/auth/authorization-verify`,
                        body: authz_body,
                        method: "POST"
                    })
                }
            })
        }
    },
    authorization: async (transaction_id, target) => {
        const authorization_token = sessionStorage.getItem(`_totp_${transaction_id}`)
        if (typeof authorization_token === 'string') {
            const apiKeySecret = localStorage.getItem('_apiKeySecret')
            const authz_body = JSON.stringify({
                target,
                transaction_id,
                authorization_token,
            })
            const json = await BaseApi.request(
                `${app.apiScheme}${app.apiDomain}/${BaseApi.version}/auth/authorization-check`, {
                mode: "cors",
                credentials: "omit",
                method: "POST",
                body: authz_body,
                headers: {
                    'Authorization': await HMAC.header({
                        credentials: {
                            id: app.apiKeyId,
                            key: apiKeySecret,
                            alg: HMAC.default_algorithm
                        },
                        uri: `/${BaseApi.version}/auth/authorization-check`,
                        body: authz_body,
                        method: "POST"
                    })
                }
            })
            // First handle any errors, info is expected when something is not fresh
            json.status ??= 'error'
            json.message ??= 'Authorization Failed'
            if (json.status === "error") {
                void toast(json.status, json.message, undefined, true)
                return json
            }
            // Then check transaction_id freshness
            const old_transaction_id = transaction_id
            transaction_id = json?.transaction_id || old_transaction_id
            if (old_transaction_id === transaction_id) {
                // transaction_id is fresh
                return authorization_token
            } else {
                void sessionStorage.setItem(`_authz_${target}`, transaction_id)
            }
            if (json.status === "success" && json.message === "ok") {
                // both authorization_token and transaction_id are fresh
                return authorization_token
            }
        }
        // authorization_token is stale
        const try_webauthn = app.keys.length >= 1
        const try_totp = !!app.mfaId
        if (try_webauthn) {
            const allowCredentials = []
            for await(const key of app.keys) {
                allowCredentials.push({
                    id: base64ToArrayBuffer(key.webauthn_id),
                    type: 'public-key',
                    transports: ['usb', 'ble', 'nfc', 'internal'],
                })
            }
            const prompt_resp = await BaseApi.prompt_webauthn(allowCredentials, transaction_id)
            if (typeof prompt_resp === 'object' && 'authorization_token' in prompt_resp && typeof prompt_resp.authorization_token === 'string') {
                void sessionStorage.setItem(`_totp_${transaction_id}`, prompt_resp.authorization_token)
                return prompt_resp.authorization_token
            }
            return prompt_resp
        }
        if (try_totp) {
            const overlay = document.createElement('div')
            overlay.classList.add('totp-overlay')
            document.body.insertAdjacentElement('afterbegin', overlay)
            document.querySelector('.totp-container').classList.add('open')
            for (const el of document.querySelectorAll('.totp-container .totp__fieldset input')) {
                el.addEventListener('input', BaseApi.check_totp_fieldset, false)
                el.addEventListener('paste', BaseApi.handle_totp_paste, false)
            }
            const verifyTotpBtn = document.getElementById('verify-totp')
            verifyTotpBtn.addEventListener('click', BaseApi.handle_verify_totp, false)
            verifyTotpBtn.addEventListener('touchstart', BaseApi.handle_verify_totp, supportsPassive ? { passive: true } : false)
            verifyTotpBtn.dataset.transactionId = transaction_id
            return {'status': 'info', 'message': 'Enter the 6 digit code generated by your app'}
        }
    },
    handle_verify_totp: async() => {
        const totp_code = Array.from(document.querySelectorAll('.totp-container .totp__fieldset input')).map(n=>n.value).join('')
        if (totp_code.length === 6) {
            const apiKeySecret = localStorage.getItem('_apiKeySecret')
            const verifyTotpBtn = document.getElementById('verify-totp')
            const transaction_id = verifyTotpBtn.dataset.transactionId
            const authz_body = JSON.stringify({
                totp_code,
                transaction_id
            })
            const json = await BaseApi.request(
                `${app.apiScheme}${app.apiDomain}/${BaseApi.version}/auth/authorization-verify`, {
                mode: "cors",
                credentials: "omit",
                method: "POST",
                body: authz_body,
                headers: {
                    'Authorization': await HMAC.header({
                        credentials: {
                            id: app.apiKeyId,
                            key: apiKeySecret,
                            alg: HMAC.default_algorithm
                        },
                        uri: `/${BaseApi.version}/auth/authorization-verify`,
                        body: authz_body,
                        method: "POST"
                    })
                }
            })
            if (json.status && json.status == "success") {
                void sessionStorage.setItem(`_totp_${transaction_id}`, json.authorization_token)
                document.querySelector('.totp-container .totp-message').remove()
                document.querySelector('.totp-container .totp__fieldset').remove()
                document.getElementById('verify-totp').remove()
                const successEl = document.querySelector('.totp-container .success-checkmark_off')
                successEl.classList.remove('success-checkmark_off')
                successEl.classList.remove('hide')
                successEl.classList.add('success-checkmark')
                verifyTotpBtn.removeEventListener('click', BaseApi.handle_verify_totp, false)
                verifyTotpBtn.removeEventListener('touchstart', BaseApi.handle_verify_totp, supportsPassive ? { passive: true } : false)
                void setTimeout(() => {
                    document.querySelector('.totp-container').classList.remove('open')
                    document.querySelector('.totp-overlay').remove()
                    void toast('success', 'You can now perform elevated privilege actions', 'Authenticated', true)
                }
                , 3000)
            } else {
                void toast(json.status, json.message)
            }
        }
    },
    handle_totp_paste: async event => {
        event.stopPropagation()
        event.preventDefault()
        let clipboardData = event.clipboardData || window.clipboardData
        const totp_code = clipboardData.getData('Text')
        if (!totp_code) {
            void toast('warning', 'The copy/paste did not work, please try to type your recovery code', 'Sorry')
            return;
        }
        const firstEl = document.querySelectorAll('.totp-container .totp__fieldset input')[0]
        if (totp_code.length === 6) {
            let thisEl = firstEl
            for (const num of Array.from(totp_code)) {
                thisEl.value = num
                if (thisEl.nextElementSibling) {
                    thisEl = thisEl.nextElementSibling
                } else {
                    break;
                }
            }
            document.getElementById('verify-totp').click()
        } else {
            firstEl.focus()
        }
    },
    check_totp_fieldset: async event => {
        event.preventDefault()
        const input = event.currentTarget.value
        if (!input) return;
        const number = parseInt(input, 10) // radix properly handles leading zeros
        if (!number.between(0, 9, true)) {
            event.currentTarget.value = Array.from(input).shift()
            return;
        }
        event.currentTarget.value = number // drops leading zeros
        const totp_code = Array.from(document.querySelectorAll('.totp-container .totp__fieldset input')).map(n=>n.value).join('')
        if (totp_code.length === 6) {
            document.getElementById('verify-totp').click()
        }
    }
})
/** Derived from Hawk Authentication */
const HMAC = Object.assign({
    supported_algorithms: ['SHA-256', 'SHA-384', 'SHA-512'],
    default_algorithm: 'SHA-512',
    default_content_type: 'application/json',
    default_port: 443,
    default_method: 'GET',
    enc: new TextEncoder,
    valid_credentials: credentials => {
        if (!credentials ||
            !credentials.id ||
            !credentials.key ||
            !credentials.alg) {
            throw new Error(`Invalid credentials`);
        }
    },
    header: async options => {
        const config = Object.assign({
            credentials: {},
            uri: undefined,
            body: '',
            method: HMAC.default_method,
            host: app.apiDomain,
            port: HMAC.default_port,
            payload_verification: true,
            payload: undefined,
            timestamp: parseInt(Date.now() / 1000, 10),
            nonce: ''.random(8),
        }, options)
        HMAC.valid_credentials(config.credentials)
        if (config.payload_verification !== false) {
            config.payload = btoa(config.body)
        }
        const mac = await HMAC.sign(config)
        return 'HMAC id="' + config.credentials.id +
                     '", ts="' + config.timestamp +
                     '", nonce="' + config.nonce +
                     '", mac="' + mac + '"';
    },
    sign: async options => {
        const config = Object.assign({
            credentials: {},
            uri: undefined,
            body: '',
            method: HMAC.default_method,
            host: app.apiDomain,
            port: HMAC.default_port,
            payload_verification: true,
            payload: undefined,
            timestamp: parseInt(Date.now() / 1000, 10),
            nonce: ''.random(8),
            ext: undefined,
        }, options)
        HMAC.valid_credentials(config.credentials)
        config.credentials.alg = config.credentials.alg.toUpperCase()
        if (!(config.credentials.alg in HMAC.supported_algorithms)) {
            config.credentials.alg = HMAC.default_algorithm
        }
        if (config.payload_verification !== false && config.payload === undefined) {
            config.payload = btoa(config.body)
        }
        const cryptoKey = await crypto.subtle.importKey('raw', utf8Bytes(config.credentials.key), { name: 'HMAC', hash: config.credentials.alg }, true, ['sign'])
        const canonical_string = HMAC.canonical_string(config)
        const encoded = utf8Bytes(canonical_string)
        const hmac = await crypto.subtle.sign('HMAC', cryptoKey, encoded)
        return [...new Uint8Array(hmac)].map(b => b.toString(16).padStart(2, '0')).join('')
    },
    canonical_string: options => {
        let normalized = options.timestamp + '\n' +
            options.nonce + '\n' +
            options.method.toUpperCase() + '\n' +
            options.uri + '\n' +
            options.host.toLowerCase() + '\n' +
            options.port
        if (options.payload_verification !== false) {
            normalized += '\n' + options.payload
        }
        return normalized
    }
})

const Fetch = Object.assign({
    get: async (options) => {
        document.body.classList.add('loading')
        const config = Object.assign({
            target: '',
            headers: {}
        }, options)
        const url = `${app.appScheme}${app.appDomain}${config.target}`
        const json = await BaseApi.request(url, {
            mode: "same-origin",
            credentials: "same-origin",
            method: "GET",
            headers: Object.assign({}, config.headers)
        })
        document.body.classList.remove('loading')
        json.status ??= 'error'
        json.message ??= 'Unexpected server response'
        return json
    },
    post: async (options) => {
        document.body.classList.add('loading')
        const config = Object.assign({
            target: undefined,
            body: undefined,
            headers: {"Content-Type": HMAC.default_content_type}
        }, options)
        const url = `${app.domainScheme}${app.domainName}${config.target}`
        const content = JSON.stringify(config.body)
        const method = 'POST'
        let json
        json = await BaseApi.request(url, {
            mode: "same-origin",
            credentials: "same-origin",
            method: method,
            body: content,
            headers: config.headers
        })
        document.body.classList.remove('loading')
        if (json.status && json.action && json.status == 'retry') {
            content.recaptcha_token = await refresh_recaptcha_token(json.action)
            json = await BaseApi.request(url, {
                mode: "same-origin",
                credentials: "same-origin",
                method: method,
                body: content,
                headers: config.headers
            })
        }
        json.status ??= 'error'
        json.message ??= 'Unexpected server response'
        return json
    }
})
const PublicApi = Object.assign({
    get: async (options) => {
        document.body.classList.add('loading')
        const config = Object.assign({
            target: undefined,
            headers: {},
            sign: true,
        }, options)
        const url = `${app.apiScheme}${app.apiDomain}/${BaseApi.version}${config.target}`
        const method = 'GET'
        if (config.sign !== false) {
            let transaction_id = sessionStorage.getItem(`_authz_${config.target}`)
            if (typeof transaction_id !== 'string') {
                transaction_id = await BaseApi.authorization_transaction(config.target)
            }
            if (typeof transaction_id === 'string') {
                const authz_resp = await BaseApi.authorization(transaction_id, config.target)
                if (!authz_resp) {
                    return;
                } else if (typeof authz_resp === 'string') {
                    config.headers['X-Authorization-Token'] = authz_resp
                } else if (typeof authz_resp === 'object' && 'status' in authz_resp && authz_resp.message != 'ok') {
                    document.body.classList.remove('loading')
                    return authz_resp
                }
            }
            if (!('apiKeyId' in app)) {
                BaseApi.handle_debug(`HMAC requires an apiKeyId`)
                void toast('warning', 'This feature is not currently available', 'Sorry')
                document.body.classList.remove('loading')
                return;
            }
            const apiKeySecret = localStorage.getItem('_apiKeySecret')
            config.headers['Authorization'] = await HMAC.header({
                credentials: {
                    id: app.apiKeyId,
                    key: apiKeySecret,
                    alg: HMAC.default_algorithm
                },
                uri: `/${BaseApi.version}${config.target}`,
                method: method
            })
        }
        const json = await BaseApi.request(url, {
            mode: "cors",
            credentials: "omit",
            method: method,
            headers: Object.assign({}, config.headers)
        })
        document.body.classList.remove('loading')
        json.status ??= 'error'
        json.message ??= 'Unexpected server response'
        return json
    },
    post: async (options) => {
        document.body.classList.add('loading')
        const config = Object.assign({
            target: undefined,
            body: {},
            headers: {"Content-Type": HMAC.default_content_type},
            sign: true
        }, options)
        const url = `${app.apiScheme}${app.apiDomain}/${BaseApi.version}${config.target}`
        const content = JSON.stringify(config.body)
        const method = 'POST'
        const apiKeySecret = localStorage.getItem('_apiKeySecret')
        let json
        if (config.sign !== false) {
            let transaction_id = sessionStorage.getItem(`_authz_${config.target}`)
            if (typeof transaction_id !== 'string') {
                transaction_id = await BaseApi.authorization_transaction(config.target)
            }
            if (typeof transaction_id === 'string') {
                const authz_resp = await BaseApi.authorization(transaction_id, config.target)
                if (!authz_resp) {
                    return;
                } else if (typeof authz_resp === 'string') {
                    config.headers['X-Authorization-Token'] = authz_resp
                } else if (typeof authz_resp === 'object' && 'status' in authz_resp && authz_resp.message != 'ok') {
                    document.body.classList.remove('loading')
                    return authz_resp
                }
            }                
            if (!('apiKeyId' in app)) {
                BaseApi.handle_debug(`HMAC requires an apiKeyId`)
                void toast('warning', 'This feature is not currently available', 'Sorry')
                document.body.classList.remove('loading')
                return;
            }
            config.headers['Authorization'] = await HMAC.header({
                credentials: {
                    id: app.apiKeyId,
                    key: apiKeySecret,
                    alg: HMAC.default_algorithm
                },
                uri: `/${BaseApi.version}${config.target}`,
                body: content,
                method: method
            })
        }
        json = await BaseApi.request(url, {
            mode: "cors",
            credentials: "omit",
            method: method,
            body: content,
            headers: config.headers
        })
        if (json.status && json.action && json.status == 'retry') {
            content.recaptcha_token = await refresh_recaptcha_token(json.action)
            json = await BaseApi.request(url, {
                mode: "cors",
                credentials: "omit",
                method: method,
                body: content,
                headers: config.headers
            })
        }
        document.body.classList.remove('loading')
        json.status ??= 'error'
        json.message ??= 'Unexpected server response'
        return json
    }
})

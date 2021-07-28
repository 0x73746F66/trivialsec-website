const BaseApi = Object.assign({
    version: "v1",
    handle_error: async error => {
        // TODO
        console.error(error)
    },
    handle_debug: async error => {// Server DEBUG=on
        console.error(error)
    },
    request: async (url, options) => {
        const response = await fetch(url, options).catch(BaseApi.handle_error)
        const json = await response.json()
        if (json.error) {
            BaseApi.handle_debug(json.error)
        }
        return json
    },
    authorization: async target => {
        const apiKeySecret = localStorage.getItem('_apiKeySecret')
        const endpoint_authz_body = JSON.stringify({target})
        const json = await BaseApi.request(
            `${app.apiScheme}${app.apiDomain}/${BaseApi.version}/endpoints/authorization`, {
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
                    uri: `/${BaseApi.version}/endpoints/authorization`,
                    body: endpoint_authz_body,
                    method: "POST"
                })
            }
        })
        if (!('transaction_id' in json && typeof json['transaction_id'] === 'string')) {
            return false
        }
        if (app.keys.length >= 1) {
            const allowCredentials = []
            for await(const key of app.keys) {
                allowCredentials.push({
                    id: base64ToArrayBuffer(key.webauthn_id),
                    type: 'public-key',
                    transports: ['usb', 'ble', 'nfc', 'internal'],
                })
            }
            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge: HMAC.enc.encode(app.apiKeyId),
                    rpId: app.domainName,
                    userVerification: "discouraged",
                    allowCredentials,
                    timeout: 90000,
                }
            }).catch(BaseApi.handle_error)
            if (assertion) {
                const response = assertion.response
                const authData = new Uint8Array(response.authenticatorData)
                const clientDataJSON = new Uint8Array(response.clientDataJSON)
                const rawId = new Uint8Array(assertion.rawId)
                const sig = new Uint8Array(response.signature)
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
                    target,
                    transaction_id: json.transaction_id
                })
                const authz = await BaseApi.request(
                    `${app.apiScheme}${app.apiDomain}/${BaseApi.version}/authorization`, {
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
                            uri: `/${BaseApi.version}/authorization`,
                            body: authz_body,
                            method: "POST"
                        })
                    }
                })
                if (!('authorization_token' in authz && typeof authz.authorization_token === 'string')) {
                    return false
                }
                return authz.authorization_token
            }
        } else {
            // const totp_code = Array.from(document.querySelectorAll('.totp__fieldset input')).map(n=>n.value).join('')
            // const json = await PublicApi.post({
            //     target: '/authorization/totp',
            //     body: {
            //         recaptcha_token,
            //         totp_code,
            //         transaction_id
            //     },
            // })
            // if (json.status && json.status == "success") {
            //     const successEl = document.querySelector('.verify-totp .success-checkmark_off')
            //     successEl.classList.remove('success-checkmark_off')
            //     successEl.classList.remove('hide')
            //     successEl.classList.add('success-checkmark')
            // }
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
        return json
    }
})
const PublicApi = Object.assign({
    get: async (options) => {
        document.body.classList.add('loading')
        const config = Object.assign({
            target,
            headers,
            sign: true
        }, options)
        const url = `${app.apiScheme}${app.apiDomain}/${BaseApi.version}${config.target}`
        const method = 'GET'
        if (config.sign !== false) {
            if (!('apiKeyId' in app)) {
                BaseApi.handle_error(`HMAC requires an apiKeyId`)
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
        const authorization_token = await BaseApi.authorization(config.target)
        if (typeof authorization_token === 'string') {
            config.body.authorization_token = authorization_token
        }
        const url = `${app.apiScheme}${app.apiDomain}/${BaseApi.version}${config.target}`
        const content = JSON.stringify(config.body)
        const method = 'POST'
        const apiKeySecret = localStorage.getItem('_apiKeySecret')
        let json
        if (config.sign !== false) {
            if (!('apiKeyId' in app)) {
                BaseApi.handle_error(`HMAC requires an apiKeyId`)
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
        document.body.classList.remove('loading')
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
        return json
    }
})

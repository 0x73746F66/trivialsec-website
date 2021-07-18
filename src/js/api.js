const BaseApi = Object.assign({}, {
    version: "v1",
    _do_request: async (url, options) => {
        const response = await fetch(url, options).catch(err => {
            console.error(err)
        })
        return response.json()
    }
})
const Hawk = Object.assign({}, {
    version: 1,
    supported_algorithms: ['SHA1', 'SHA256'],
    default_algorithm: 'SHA256',
    default_content_type: 'application/json',
    default_port: 443,
    default_method: 'GET',
    enc: new TextEncoder,
    valid_credentials: credentials => {
        if (!credentials ||
            !credentials.id ||
            !credentials.key ||
            !credentials.algorithm) {

            throw new Error('Invalid credentials');
        }
    },
    hash_payload: (contentType, payload, algorithm) => {
        algorithm = algorithm.toUpperCase()
        if (!(algorithm in Hawk.supported_algorithms)) {
            algorithm = Hawk.default_algorithm
        }
        const hash = CryptoJS.algo[algorithm].create()
        contentType = contentType.split(';')[0].replace(/^\s+|\s+$/g, '').toLowerCase()
        hash.update('hawk.' + Hawk.version + '.payload\n')
        hash.update(contentType + '\n')
        hash.update(payload)
        hash.update('\n')
        return hash.finalize().toString(CryptoJS.enc.Base64)
    },
    header: options => {
        const config = Object.assign({
            credentials: {},
            uri: undefined,
            body: '',
            method: Hawk.default_method,
            host: app.apiDomain,
            port: Hawk.default_port,
            contentType: Hawk.default_content_type,
            payload_verification: true,
            hash: undefined,
            timestamp: Date.now() / 1000,
            nonce: ''.random(8),
            ext: undefined,
        }, options)
        Hawk.valid_credentials(config.credentials)
        if (config.payload_verification && !config.hash) {
            config.hash = Hawk.hash_payload(config.contentType, config.body, config.credentials.alg)
        }
        const mac = Hawk.sign(options)
        return 'Hawk id="' + config.credentials.id +
                     '", ts="' + config.timestamp +
                     '", nonce="' + config.nonce +
                     (!!config.hash ? '", hash="' + config.hash : '') +
                     (!!config.ext ? '", ext="' + config.ext : '') +
                     '", mac="' + mac + '"';
    },
    sign: options => {
        const config = Object.assign({
            credentials: {},
            uri: undefined,
            body: '',
            method: Hawk.default_method,
            host: app.apiDomain,
            port: Hawk.default_port,
            contentType: Hawk.default_content_type,
            payload_verification: true,
            hash: undefined,
            timestamp: Date.now() / 1000,
            nonce: ''.random(8),
            ext: undefined,
        }, options)
        Hawk.valid_credentials(config.credentials)
        config.credentials.alg = config.credentials.alg.toUpperCase()
        if (!(config.credentials.alg in Hawk.supported_algorithms)) {
            config.credentials.alg = Hawk.default_algorithm
        }
        if (config.payload_verification && !config.hash) {
            config.hash = Hawk.hash_payload(config.contentType, config.body, config.credentials.alg)
        }
        const normalized = Hawk.normalized_header(config)
        const hmac = CryptoJS['Hmac' + config.credentials.alg](Hawk.enc.encode(normalized), config.credentials.key)
        return hmac.toString(CryptoJS.enc.Base64)
    },
    normalized_header: options => {
        let normalized = `hawk.${Hawk.version}.header\n` +
            options.timestamp + '\n' +
            options.nonce + '\n' +
            options.method.toUpperCase() + '\n' +
            options.uri + '\n' +
            options.host.toLowerCase() + '\n' +
            options.port + '\n' +
            (options.hash || '') + '\n'
        if (!!options.ext) {
            normalized += options.ext.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')
        }
        normalized += '\n'
        return normalized
    }
})

const PublicApi = Object.assign(BaseApi, {
    get: async (options) => {
        document.body.classList.add('loading')
        const config = Object.assign({
            target,
            headers,
            hawk: true
        }, options)
        const url = `${app.apiScheme}${app.apiDomain}/${BaseApi.version}${config.target}`
        const json = await BaseApi._do_request(url, {
            mode: "cors",
            credentials: "omit",
            method: "GET",
            headers: Object.assign({}, config.headers)
        })
        document.body.classList.remove('loading')
        if (json.error) {
            console.error(json.error)
        }
        return json
    },
    post: async (options) => {
        document.body.classList.add('loading')
        const config = Object.assign({
            target: undefined,
            body: undefined,
            headers: {"Content-Type": Hawk.default_content_type},
            hawk: true
        }, options)
        const url = `${app.apiScheme}${app.apiDomain}/${BaseApi.version}${config.target}`
        const content = JSON.stringify(config.body)
        const method = 'POST'
        let json
        if (config.hawk) {
            let apiKeySecret
            if (!('apiKeyId' in app)) {
                console.error(`Hawk requires an apiKeyId`)
                return;
            }
            if (!('apiKeyId' in app)) {
                apiKeySecret = localStorage.getItem('_apiKeySecret')
                if (!apiKeySecret) {
                    console.error(`Hawk requires an apiKeySecret`)
                    return;
                }
            }
            config.headers['Authorization'] = Hawk.header({
                credentials: {
                    id: app.apiKeyId,
                    key: apiKeySecret,
                    alg: Hawk.default_algorithm
                },
                uri: `/${BaseApi.version}${config.target}`,
                body: content,
                method: 'POST',
                contentType: config.headers['Content-Type']
            })
        }
        json = await BaseApi._do_request(url, {
            mode: "cors",
            credentials: "omit",
            method: method,
            body: content,
            headers: config.headers
        })
        document.body.classList.remove('loading')
        if (json.status && json.action && json.status == 'retry') {
            content.recaptcha_token = await refresh_recaptcha_token(json.action)
            json = await BaseApi._do_request(url, {
                mode: "cors",
                credentials: "omit",
                method: method,
                body: content,
                headers: config.headers
            })
        }
        if (json.error) {
            console.error(json.error)
        }
        return json
    }
})

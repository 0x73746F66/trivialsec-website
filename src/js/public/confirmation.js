const init_confirmation = async() => {
    if (location.pathname != '/confirmation') {
        history.pushState({}, document.title, '/confirmation')
    }
    if (!('credentials' in navigator)) {
        document.querySelector('.ChooseMfa__label.webauthn').title = 'Hardware Security Keys are not supported on this browser'
        document.querySelector('.ChooseMfa__label.webauthn').classList.add('disabled')
        document.querySelector('.ChooseMfa__label.webauthn input').disabled = true
    }
    const chooseMfaEl = document.getElementById('choose-mfa')
    chooseMfaEl.addEventListener('click', chooseMfa, false)
    chooseMfaEl.addEventListener('touchstart', chooseMfa, supportsPassive ? { passive: true } : false)
    const retryWebauthnEl = document.getElementById('retry-webauthn')
    retryWebauthnEl.addEventListener('click', verifyWebauthn, false)
    retryWebauthnEl.addEventListener('touchstart', verifyWebauthn, supportsPassive ? { passive: true } : false)
    const verifyTotpEl = document.getElementById('verify-totp')
    verifyTotpEl.addEventListener('click', verifyTotp, false)
    verifyTotpEl.addEventListener('touchstart', verifyTotp, supportsPassive ? { passive: true } : false)
    for (const el of document.querySelectorAll('.totp__fieldset input')) {
        el.addEventListener('input', check_totp_fieldset, false)
        el.addEventListener('paste', handle_totp_paste, false)
    }
}
const chooseMfa = async event => {
    if (event.currentTarget.id != 'choose-mfa') {
        void toast('warning', 'This feature is not currently available', 'Sorry')
        return;
    }
    const mfaTypeArr = Array.from(document.getElementsByName('mfaType')).filter(e => e.checked)
    const mfaType = mfaTypeArr.length == 1 ? mfaTypeArr.pop().value : null
    if (mfaType == 'webauthn') {
        event.currentTarget.textContent = 'Retry'
        document.querySelector('.choose-mfa h1').textContent = 'Setup U2F'
        document.querySelector('.choose-mfa h2').classList.add('invisible')
        document.querySelector('.ChooseMfa__label.totp').classList.add('invisible')
        return createWebauthn()
    }
    if (mfaType == 'totp') {
        event.currentTarget.remove()
        document.querySelector('.choose-mfa h1').textContent = 'Setup TOTP'
        document.querySelector('.LoginCard__card.choose-mfa').classList.add('hide')
        document.querySelector('.LoginCard__card.verify-totp').classList.remove('hide')
        document.querySelector('button.verify-code').classList.remove('hide')
        return generateTotp()
    }
}

const generateTotp = async () => {
    const confirmation_hash = document.getElementById('confirmation_hash').value
    const json = await PublicApi.post({
        target: '/registration/totp',
        body: {
            recaptcha_token,
            confirmation_hash
        },
        sign: false,
    })
    if (json.status && json.status == 'success') {
        init_recaptcha('authorization_action')
        document.getElementById('totp-secret-code').textContent = json.totp_code
        const image = document.createElement('img')
        image.src = `data:image/png;base64,${json.qr_code}`
        image.id = 'register-qr'
        image.classList.add('qr-code')
        document.querySelector('.img-wrapper--container').insertAdjacentElement('afterend', image)
        const registerQREl = document.getElementById('register-qr')
        const canvas = document.createElement("canvas")
        canvas.width = image.width
        canvas.height = image.height
        canvas.getContext("2d").drawImage(image, 0, 0)
        const url = canvas.toDataURL("image/png")    
        const triggerDownload = document.getElementById("temporary")
        triggerDownload.setAttribute("href", url)
        triggerDownload.setAttribute("download", "QR code.png")
        registerQREl.addEventListener('click', triggerDownload.click, false)
        registerQREl.addEventListener('touchstart', triggerDownload.click, supportsPassive ? { passive: true } : false)
        document.getElementById('totp-message').textContent = json.message
    }
    void toast(json.status, json.message)
}

const verifyTotp = async event => {
    const confirmation_hash = document.getElementById('confirmation_hash').value
    const totp_code = Array.from(document.querySelectorAll('.totp__fieldset input')).map(n=>n.value).join('')
    const json = await PublicApi.post({
        target: '/authorization/totp',
        body: {
            recaptcha_token,
            confirmation_hash,
            totp_code,
        },
        sign: false,
    })
    if (json.status && json.status == "success") {
        const successEl = document.querySelector('.verify-totp .success-checkmark_off')
        successEl.classList.remove('success-checkmark_off')
        successEl.classList.remove('hide')
        successEl.classList.add('success-checkmark')
        const scratchEl = document.getElementById('totp-secret-code')
        scratchEl.textContent = json.scratch_code
        document.getElementById('verify-totp').remove()
        document.querySelector('.verify-totp .img-wrapper--container').remove()
        document.querySelector('.verify-totp .totp__fieldset').remove()
        document.getElementById('register-qr').remove()
        document.getElementById('totp-message').remove()
        document.querySelector('.verify-totp h1').textContent = json.message
        document.querySelector('.verify-totp .ChooseMfa__parra').textContent = json.description
    }
    void toast(json.status, json.message)
}
let nameWebauthnActive = false
const nameWebauthn = async event => {
    if (nameWebauthnActive === false) {
        nameWebauthnActive = true
    }
    const deviceEl = document.getElementById('name-device')
    const device_name = deviceEl.value
    const device_id = deviceEl.dataset.deviceId
    const json = PublicApi.post({
        target: '/webauthn/device-name',
        body: {
            recaptcha_token,
            device_id,
            device_name,
        },
        sign: false,
    })
    nameWebauthnActive = false
    void toast(json.status, json.message)
}

const createWebauthn = async () => {
    const enc = (new TextEncoder)
    const confirmation_hash = document.getElementById('confirmation_hash').value
    let credential = await navigator.credentials.create({
        publicKey: {
            challenge: enc.encode(app.apiKeyId),
            rp: {
                name: app.domainName,
            },
            user: {
                id: enc.encode(app.accountEmail),
                name: app.accountEmail,
                displayName: app.accountEmail,
            },
            pubKeyCredParams: [{
                alg: -7,
                type: "public-key"
            }, {
                alg: -257,
                type: "public-key"
            }],
            authenticatorSelection: {
                authenticatorAttachment: "cross-platform",
                requireResidentKey: false,
                userVerification: "discouraged"
            },
            timeout: 90000,
            attestation: "direct"
        }
    }).catch(BaseApi.handle_webauthn_error)
    if (credential) {
        const decoder = (new TextDecoder)
        const decodedClientData = decoder.decode(credential.response.clientDataJSON)
        const webauthn_challenge = JSON.parse(decodedClientData).challenge
        const webauthn_id = arrayBufferToBase64(credential.rawId)
        const clientDataJSON = arrayBufferToBase64(credential.response.clientDataJSON)
        const attestationObject = arrayBufferToBase64(credential.response.attestationObject)
        const dataView = new DataView(new ArrayBuffer(2))
        const decodedAttestationObj = CBOR.decode(credential.response.attestationObject)
        const idLenBytes = decodedAttestationObj.authData.slice(53, 55)
        idLenBytes.forEach((value, index) => dataView.setUint8(index, value))
        const credentialIdLength = dataView.getUint16()
        const webauthn_public_key = arrayBufferToBase64(decodedAttestationObj.authData.slice(55 + credentialIdLength))
        const json = await PublicApi.post({
            target: '/registration/webauthn',
            body: {
                recaptcha_token,
                confirmation_hash,
                webauthn_id,
                webauthn_public_key,
                webauthn_challenge,
                clientDataJSON,
                attestationObject,
            },
            sign: false,
        })
        if (json.status && json.status == 'success') {
            init_recaptcha('authorization_action')
            document.querySelector('.LoginCard__card.choose-mfa').hide()
            document.querySelector('.LoginCard__card.confirm-webauthn').show()
            app.keys = [{webauthn_id}]
            return verifyWebauthn()
        }
        void toast(json.status, json.message)
    }
}
const verifyWebauthn = async () => {
    const enc = (new TextEncoder)
    const confirmation_hash = document.getElementById('confirmation_hash').value
    if (app.keys.length === 0) {
        void toast('error', 'No device registered')
        return;
    }
    const credentialId = app.keys[0].webauthn_id
    const assertion = await navigator.credentials.get({
        publicKey: {
            challenge: enc.encode(app.apiKeyId),
            rpId: app.domainName,
            userVerification: "discouraged",
            allowCredentials: [{
                id: base64ToArrayBuffer(credentialId),
                type: 'public-key',
                transports: ['usb', 'ble', 'nfc', 'internal'],
            }],
            timeout: 90000,
        }
    }).catch(BaseApi.handle_webauthn_error)
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
        const json = await PublicApi.post({
            target: '/authorization/webauthn',
            body: {
                recaptcha_token,
                confirmation_hash,
                assertion_response,
            },
            sign: false,
        })
        if (json.status && json.status == "success") {
            init_recaptcha('name_device_action')
            document.getElementById('name-device').setAttribute('data-device-id', json.device_id)
            const successEl = document.querySelector('.confirm-webauthn .success-checkmark_off')
            successEl.classList.remove('success-checkmark_off')
            successEl.classList.remove('hide')
            successEl.classList.add('success-checkmark')
            const retryBtn = document.getElementById('retry-webauthn')
            retryBtn.removeEventListener('click', verifyWebauthn, false)
            retryBtn.removeEventListener('touchstart', verifyWebauthn, supportsPassive ? { passive: true } : false)
            retryBtn.textContent = 'Save'
            retryBtn.addEventListener('click', nameWebauthn, false)
            retryBtn.addEventListener('touchstart', nameWebauthn, supportsPassive ? { passive: true } : false)
            document.getElementById('name-webauthn').classList.remove('hide')
            document.querySelector('.Card__card.confirm-webauthn h1').textContent = json.message
            document.querySelector('.Card__card.confirm-webauthn h2').textContent = json.description
            document.querySelector('.Card__card.confirm-webauthn img').remove()
            const scratchEl = document.querySelector('.Card__card.confirm-webauthn .ChooseMfa__parra')
            scratchEl.classList.add('source-code')
            scratchEl.textContent = json.scratch_code
        }
        void toast(json.status, json.message)
    }
}
const check_totp_fieldset = async event => {
    event.preventDefault()
    const input = event.currentTarget.value
    if (!input) return;
    const number = parseInt(input, 10) // radix properly handles leading zeros
    if (!number.between(0, 9, true)) {
        event.currentTarget.value = Array.from(input).shift()
        return;
    }
    event.currentTarget.value = number // drops leading zeros
    const totp_code = Array.from(document.querySelectorAll('.totp__fieldset input')).map(n=>n.value).join('')
    if (totp_code.length === 6) {
        const verifyTotpBtn = document.getElementById('verify-totp')
        verifyTotpBtn.setAttribute('disabled', true)
        return verifyTotp()
    } else {
        event.target.nextElementSibling.focus()
    }
}
const handle_totp_paste = async event => {
    event.stopPropagation()
    event.preventDefault()
    let clipboardData = event.clipboardData || window.clipboardData
    const totp_code = clipboardData.getData('Text')
    if (!totp_code) {
        void toast('warning', 'The copy/paste did not work, please try to type your recovery code', 'Sorry')
        return;
    }
    const firstEl = document.querySelectorAll('.totp__fieldset input')[0]
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
        const verifyTotpBtn = document.getElementById('verify-totp')
        verifyTotpBtn.setAttribute('disabled', true)
        return verifyTotp()
    } else {
        firstEl.focus()
    }
}

grecaptcha.ready(() => init_recaptcha('confirmation_action'))
document.addEventListener('DOMContentLoaded', init_confirmation, false)

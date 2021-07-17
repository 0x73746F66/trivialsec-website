const confirmation_hash = document.getElementById('confirmation_hash').value
const decoder = (new TextDecoder)
const enc = (new TextEncoder)
const chooseMfa = async event => {
    if (event.currentTarget.id != 'choose-mfa') {
        return;
    }
    const mfaTypeArr = Array.from(document.getElementsByName('mfaType')).filter(e => e.checked)
    const mfaType = mfaTypeArr.length == 1 ? mfaTypeArr.pop().value : null
    if (mfaType == 'webauthn') {
        event.currentTarget.textContent = 'Retry'
        document.querySelector('.choose-mfa h2').classList.add('invisible')
        document.querySelector('.ChooseMfa__label.totp').classList.add('invisible')
        return createWebauthn()
    }
    if (mfaType == 'totp') {
        event.currentTarget.remove()
        document.querySelector('.choose-mfa h2').classList.add('invisible')
        document.querySelector('.ChooseMfa__label.webauthn').classList.add('invisible')
        alert('not implemented')
    }
}

const createWebauthn = async () => {
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
    }).catch(console.error)
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
        hawk: false,
    })
    if (json.status && json.status == 'success') {
        init_recaptcha('authorization_action')
        document.querySelector('.LoginCard__card.choose-mfa').hide()
        document.querySelector('.LoginCard__card.confirm-webauthn').show()
        localStorage.setItem('_WebAuthn_credentialId', webauthn_id)
        return verifyWebauthn()
    }
}
const verifyWebauthn = async () => {
    let credentialId = localStorage.getItem('_WebAuthn_credentialId')
    if (!credentialId) {
        alert('No device registered')
        return;
    }
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
    }).catch(console.error)
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
            hawk: false,
        })
        if (json.status && json.status == "success") {
            const successEl = document.querySelector('.success-checkmark_off')
            successEl.classList.remove('success-checkmark_off')
            successEl.classList.remove('hide')
            successEl.classList.add('success-checkmark')
            document.getElementById('retry-webauthn').remove()
            document.querySelector('.Card__card.confirm-webauthn h1').remove()
            document.querySelector('.Card__card.confirm-webauthn h2').textContent = 'Successfully Registered'
            document.querySelector('.Card__card.confirm-webauthn img').remove()
            document.querySelector('.Card__card.confirm-webauthn .ChooseMfa__parra').remove()
        }
    }
}

grecaptcha.ready(() => {
    init_recaptcha('confirmation_action')
})
document.addEventListener('DOMContentLoaded', () => {
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
}, false)

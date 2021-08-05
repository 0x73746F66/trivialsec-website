const auth_hash = document.getElementById('auth_hash').value
const decoder = (new TextDecoder)
const enc = (new TextEncoder)
const chooseMfa = async event => {
    if (event.currentTarget.id != 'choose-mfa') {
        void toast('warning', 'This feature is not currently available', 'Sorry')
        return;
    }
    const mfaTypeArr = Array.from(document.getElementsByName('mfaType')).filter(e => e.checked)
    const mfaType = mfaTypeArr.length == 1 ? mfaTypeArr.pop().value : null
    if (mfaType == 'webauthn') {
        document.querySelector('.LoginCard__card.choose-mfa').classList.add('hide')
        document.querySelector('.LoginCard__card.confirm-webauthn').classList.remove('hide')
        return verifyWebauthn()
    }
    if (mfaType == 'totp') {
        document.querySelectorAll('.totp__fieldset input')[0].focus()
        document.querySelector('.LoginCard__card.choose-mfa').classList.add('hide')
        document.querySelector('.LoginCard__card.verify-totp').classList.remove('hide')
    }
}

const verifyTotp = async event => {
    const totp_code = Array.from(document.querySelectorAll('.totp__fieldset input')).map(n=>n.value).join('')
    const json = await Fetch.post({
        target: '/verify/totp',
        body: {
            recaptcha_token,
            auth_hash,
            totp_code,
        },
    })
    if (json.status && json.status == "success") {
        const successEl = document.querySelector('.verify-totp .success-checkmark_off')
        successEl.classList.remove('success-checkmark_off')
        successEl.classList.remove('hide')
        successEl.classList.add('success-checkmark')
        document.querySelector('.totp__fieldset').classList.add('invisible')
        document.getElementById('totp-message').textContent = json.message
        void localStorage.setItem('_apiKeySecret', json.api_key_secret)
        void setTimeout(()=>{document.getElementById('app-link').click()}, 3000)
    }
}

const verifyWebauthn = async () => {
    if (app.keys.length === 0) {
        void toast('warning', 'No device registered')
        return;
    }
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
            challenge: enc.encode(app.apiKeyId),
            rpId: app.domainName,
            userVerification: "discouraged",
            allowCredentials,
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
        const json = await Fetch.post({
            target: '/verify/webauthn',
            body: {
                recaptcha_token,
                auth_hash,
                assertion_response,
            },
        })
        if (json.status && json.status == "success") {
            const successEl = document.querySelector('.confirm-webauthn .success-checkmark_off')
            successEl.classList.remove('success-checkmark_off')
            successEl.classList.remove('hide')
            successEl.classList.add('success-checkmark')
            document.querySelector('.confirm-webauthn .ChooseMfa__subheader').textContent = json.message
            document.querySelector('.confirm-webauthn img').remove()
            document.querySelector('.confirm-webauthn .ChooseMfa__parra').classList.add('invisible')
            void localStorage.setItem('_apiKeySecret', json.api_key_secret)
            void setTimeout(()=>{document.getElementById('app-link').click()}, 3000)
        }
    }
}

grecaptcha.ready(() => {
    init_recaptcha('login_action')
})
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

document.addEventListener('DOMContentLoaded', async() => {
    if (location.pathname != '/login') {
        history.pushState({}, document.title, '/login')
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
}, false)

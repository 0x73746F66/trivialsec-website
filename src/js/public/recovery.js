const chooseMethod = async event => {
    if (event.currentTarget.id != 'choose-method') {
        return;
    }
    const methodTypeArr = Array.from(document.getElementsByName('recoveryType')).filter(e => e.checked)
    const methodType = methodTypeArr.length == 1 ? methodTypeArr.pop().value : null
    if (methodType == 'scratch') {
        document.querySelector('.recoveryCard__card.choose-method').classList.add('hide')
        document.querySelector('.recoveryCard__card.confirm-scratch').classList.remove('hide')
    }
    if (methodType == 'email') {
        document.querySelector('.recoveryCard__card.choose-method').classList.add('hide')
        document.querySelector('.recoveryCard__card.request-email').classList.remove('hide')
    }
}
const recoverScratch = async event => {
    const scratch_code = document.getElementById('scratch-code').value
    const json = await PublicApi.post({
        target: '/recovery/scratch',
        body: {
            recaptcha_token,
            scratch_code,
        },
        hawk: false,
    })
    if (json.status && json.status == "success") {
        const successEl = document.querySelector('.confirm-scratch .success-checkmark_off')
        successEl.classList.remove('success-checkmark_off')
        successEl.classList.remove('hide')
        successEl.classList.add('success-checkmark')
        for (const elem of document.querySelectorAll('.recovery__fieldset')) {
            elem.classList.add('invisible')
        }
        document.getElementById('recover-scratch').remove()
        const messageEl = document.getElementById('scratch-message')
        messageEl.classList.remove('hide')
        messageEl.textContent = json.message
    }
}
const recoverEmail = async event => {
    const old_email = document.getElementById('old-email').value
    const new_email = document.getElementById('new-email').value
    const json = await PublicApi.post({
        target: '/recovery/email',
        body: {
            recaptcha_token,
            old_email,
            new_email,
        },
        hawk: false,
    })
    if (json.status && json.status == "success") {
        const successEl = document.querySelector('.request-email .success-checkmark_off')
        successEl.classList.remove('success-checkmark_off')
        successEl.classList.remove('hide')
        successEl.classList.add('success-checkmark')
        for (const elem of document.querySelectorAll('.recovery__fieldset')) {
            elem.classList.add('hide')
        }
        document.querySelector('.recovery__subheader.request').remove()
        document.getElementById('recover-email').remove()
        const messageEl = document.getElementById('recovery-message')
        messageEl.classList.remove('hide')
        messageEl.textContent = json.message
    }
}
grecaptcha.ready(() => {
    init_recaptcha('recovery_action')
})
document.addEventListener('DOMContentLoaded', async() => {
    const chooseMethodEl = document.getElementById('choose-method')
    if (chooseMethodEl) {
        chooseMethodEl.addEventListener('click', chooseMethod, false)
        chooseMethodEl.addEventListener('touchstart', chooseMethod, supportsPassive ? { passive: true } : false)
    }
    const recoverScratchEl = document.getElementById('recover-scratch')
    if (recoverScratchEl) {
        recoverScratchEl.addEventListener('click', recoverScratch, false)
        recoverScratchEl.addEventListener('touchstart', recoverScratch, supportsPassive ? { passive: true } : false)
    }
    const recoverEmailEl = document.getElementById('recover-email')
    if (recoverEmailEl) {
        recoverEmailEl.addEventListener('click', recoverEmail, false)
        recoverEmailEl.addEventListener('touchstart', recoverEmail, supportsPassive ? { passive: true } : false)
    }

}, false)

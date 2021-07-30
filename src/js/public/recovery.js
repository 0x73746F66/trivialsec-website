const chooseMethod = async event => {
    if (event.currentTarget.id != 'choose-method') {
        toast('warning', 'This feature is not currently available', 'Sorry')
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
        sign: false,
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
        sign: false,
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
const check_scratch_code = async event => {
    event.preventDefault()
    const input = event.currentTarget.value
    if (!input) return;
    if (input.length >= 28) {
        event.currentTarget.value = input.substring(0, 27)
        return;
    }
    let newChar = Array.from(input).pop()
    if (newChar === '-' || newChar === ' ') return;
    let prevString = Array.from(input)
    prevString.pop()
    if (typeof newChar === 'string') {
        newChar = newChar.toUpperCase()
    }
    let newInput = prevString.join('') + newChar
    if (newInput.length === 4 || newInput.length === 11 || newInput.length === 20) {
        newInput = newInput + '-'
    }
    event.currentTarget.value = newInput
}
const handle_scratch_paste = async event => {
    event.stopPropagation()
    event.preventDefault()
    let clipboardData = event.clipboardData || window.clipboardData
    const scratch_code = clipboardData.getData('Text')
    if (!scratch_code) return;
    const arr = Array.from(scratch_code)
    if (arr[4] !== '-' || arr[11] !== '-' || arr[20] !== '-') return;
    document.getElementById('scratch-code').value = scratch_code.toUpperCase()
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
    const scratchCodeEl = document.getElementById('scratch-code')
    scratchCodeEl.addEventListener('input', check_scratch_code, false)
    scratchCodeEl.addEventListener('paste', handle_scratch_paste, false)

}, false)

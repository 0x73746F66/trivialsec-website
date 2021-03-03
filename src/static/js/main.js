const domainName = window.location.hostname == 'localhost' ? 'http://localhost:5000' : 'https://app.trivialsec.com'
const openSignUp = async event => {
    event.preventDefault()
    for await(const el of document.querySelectorAll('.main__section')) {
        el.style.flex = '0 0 52%'
    }
    document.querySelector('.main').style.flex = '0 0 60%'
    for await(const el of document.querySelectorAll('.aside--spacer')) {
        el.style.display = 'initial'
    }
    document.querySelector('.aside').style.display = 'flex'
    document.querySelector('.open-sign-up').style.display = 'none'
}
const closeSignUp = async event => {
    event.preventDefault()
    document.querySelector('.open-sign-up').style.display = 'block'
    document.querySelector('.aside').style.display = 'none'
    for await(const el of document.querySelectorAll('.aside--spacer')) {
        el.style.display = 'none'
    }
    document.querySelector('.main').style.flex = '0 0 100%'
    for await(const el of document.querySelectorAll('.main__section')) {
        el.style.flex = '0 0 92%'
    }
}

const loginAction = async(event) => {
    window.location.href = `${domainName}/login`
}

const registerAction = async(event) => {
    event.preventDefault()
    const token = document.getElementById('recaptcha_token').value
    const response = await fetch(`${domainName}/register`, {
        credentials: 'same-origin',
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            recaptcha_token: token,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            company: document.getElementById('company').value,
            email: document.getElementById('email').value,
            privacy: document.getElementById('privacy-acceptance').checked,
        })
    }).catch(err => {
        appMessage('error', 'An unexpected error occurred. Please refresh the page and try again.')
        console.log(err)
    })
    const json = await response.json()
    appMessage(json.status, json.message)
    refresh_recaptcha_token('register_action')
}

document.addEventListener('DOMContentLoaded', async() => {
    if (recaptcha_site_key) {
        grecaptcha.ready(() => {
            refresh_recaptcha_token('register_action')
        })
    }
    const signInEl = document.getElementById('sign-in')
    signInEl.addEventListener('click', loginAction, false)
    signInEl.addEventListener('touchstart', loginAction, supportsPassive ? { passive: true } : false)
    const signUpEl = document.getElementById('register-form')
    signUpEl.addEventListener('click', registerAction, false)
    signUpEl.addEventListener('touchstart', registerAction, supportsPassive ? { passive: true } : false)
    for (const closeEl of document.querySelectorAll('.alert .icofont-close')) {
        closeEl.addEventListener('click', event => event.currentTarget.parent('.alert').remove(), false)
        closeEl.addEventListener('touchstart', event => event.currentTarget.parent('.alert').remove(), supportsPassive ? { passive: true } : false)
    }
    const openSignUpEl = document.querySelector('.open-sign-up')
    openSignUpEl.addEventListener('click', openSignUp, false)
    openSignUpEl.addEventListener('touchstart', openSignUp, supportsPassive ? { passive: true } : false)
    const closeSignUpEl = document.querySelector('.close-sign-up')
    closeSignUpEl.addEventListener('click', closeSignUp, false)
    closeSignUpEl.addEventListener('touchstart', closeSignUp, supportsPassive ? { passive: true } : false)

}, false)

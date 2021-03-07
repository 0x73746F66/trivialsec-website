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

const navActions = async(event) => {
    for (const el of document.querySelectorAll('.aside__forms')) {
        el.style.display = 'none'
    }
    if (event.currentTarget.classList.contains('contact-us')) {
        document.querySelector('.aside__forms.contact-us').style.display = ''
        document.querySelector('.aside__links .contact-us').style.display = 'none'
        document.querySelector('.aside__links .sign-in').style.display = ''
        document.querySelector('.aside__links .sign-up').style.display = ''
    }
    if (event.currentTarget.classList.contains('sign-in')) {
        document.querySelector('.aside__forms.sign-in').style.display = ''
        document.querySelector('.aside__links .sign-in').style.display = 'none'
        document.querySelector('.aside__links .sign-up').style.display = ''
        document.querySelector('.aside__links .contact-us').style.display = ''
    }
    if (event.currentTarget.classList.contains('sign-up')) {
        document.querySelector('.aside__forms.sign-up').style.display = ''
        document.querySelector('.aside__links .sign-up').style.display = 'none'
        document.querySelector('.aside__links .sign-in').style.display = ''
        document.querySelector('.aside__links .contact-us').style.display = ''
    }
}

const signInAction = async(event) => {
    
}

const contactUsAction = async(event) => {
    
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
    for (const el of document.querySelectorAll('.aside__links a')) {
        el.addEventListener('click', navActions, false)
        el.addEventListener('touchstart', navActions, supportsPassive ? { passive: true } : false)
    }
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

const openSignUp = async() => {
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
const closeSignUp = async() => {
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
const navActions = async event => {
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
const signInAction = async() => {
    const appAlert = document.getElementById('sign-in-messages')
    const email = document.getElementById('login_email').value
    let invalid = false
    document.querySelector('.invalid.login_email').style.visibility = 'hidden'
    if (!email || !email.includes('@')) {
        document.querySelector('.invalid.login_email').style.visibility = 'unset'
        invalid = true
    }
    if (email || email.includes('@')) {
        let email_domain = email.split('@')[1]
        if (!validDomain(email_domain)) {
            document.querySelector('.invalid.contact_email').style.visibility = 'unset'
            invalid = true
        }
    }
    if (invalid === true) {
        return;
    }
    const json = await PublicApi.post({
        target: '/magic-link',
        body: {
            recaptcha_token,
            email,
        },
        sign: false,
    })
    appMessage(appAlert, json.status, json.message)
}
const contactUsAction = async event => {
    const appAlert = document.getElementById('contact-us-messages')
    const first_name = document.getElementById('first_name').value
    const last_name = document.getElementById('last_name').value
    const company = document.getElementById('contact_company').value
    const email = document.getElementById('contact_email').value
    const message = document.getElementById('message').value
    let invalid = false
    document.querySelector('.invalid.first_name').style.visibility = 'hidden'
    document.querySelector('.invalid.last_name').style.visibility = 'hidden'
    document.querySelector('.invalid.contact_company').style.visibility = 'hidden'
    document.querySelector('.invalid.contact_email').style.visibility = 'hidden'
    document.querySelector('.invalid.message').style.visibility = 'hidden'
    if (!first_name || first_name.length <= 2) {
        document.querySelector('.invalid.first_name').style.visibility = 'unset'
        invalid = true
    }
    if (!last_name || last_name.length <= 2) {
        document.querySelector('.invalid.last_name').style.visibility = 'unset'
        invalid = true
    }
    if (!company || company.length <= 8) {
        document.querySelector('.invalid.contact_company').style.visibility = 'unset'
        invalid = true
    }
    if (!email || !email.includes('@')) {
        document.querySelector('.invalid.contact_email').style.visibility = 'unset'
        invalid = true
    }
    if (email || email.includes('@')) {
        let email_domain = email.split('@')[1]
        if (!validDomain(email_domain)) {
            document.querySelector('.invalid.contact_email').style.visibility = 'unset'
            invalid = true
        }
    }
    if (!message || message.length <= 20) {
        document.querySelector('.invalid.message').style.visibility = 'unset'
        invalid = true
    }
    if (invalid == true) {
        return;
    }
    const json = await PublicApi.post(`/contact-form`, {
        recaptcha_token,
        first_name,
        last_name,
        company,
        email,
        message
    }).catch(err => {
        appMessage(appAlert, 'error', 'An unexpected error occurred. Please refresh the page and try again.')
        console.log(err)
    })
    appMessage(appAlert, json.status, json.message)
}
const registerAction = async event => {
    const appAlert = document.getElementById('register-messages')
    const company = document.getElementById('register_company').value
    const email = document.getElementById('register_email').value
    const privacy = document.getElementById('privacy-acceptance').checked
    let invalid = false
    document.querySelector('.invalid.register_company').style.visibility = 'hidden'
    document.querySelector('.invalid.register_email').style.visibility = 'hidden'
    document.querySelector('.invalid.privacy').style.visibility = 'hidden'
    if (!company || company.length <= 8) {
        document.querySelector('.invalid.register_company').style.visibility = 'unset'
        invalid = true
    }
    if (!email || !email.includes('@')) {
        document.querySelector('.invalid.register_email').style.visibility = 'unset'
        invalid = true
    }
    if (email || email.includes('@')) {
        let email_domain = email.split('@')[1]
        if (!validDomain(email_domain)) {
            document.querySelector('.invalid.register_email').style.visibility = 'unset'
            invalid = true
        }
    }
    if (!privacy) {
        document.querySelector('.invalid.privacy').style.visibility = 'unset'
        invalid = true
    }
    if (invalid === true) {
        return;
    }
    const json = await PublicApi.post(`/register`, {
        recaptcha_token,
        first_name,
        last_name,
        company,
        email,
        privacy
    }).catch(err => {
        appMessage(appAlert, 'error', 'An unexpected error occurred. Please refresh the page and try again.')
        console.log(err)
    })
    appMessage(appAlert, json.status, json.message)
}

document.addEventListener('DOMContentLoaded', async() => {
    for (const el of document.querySelectorAll('.aside__links a')) {
        el.addEventListener('click', navActions, false)
        el.addEventListener('touchstart', navActions, supportsPassive ? { passive: true } : false)
    }
    const signUpEl = document.getElementById('register-form')
    signUpEl.addEventListener('click', registerAction, false)
    signUpEl.addEventListener('touchstart', registerAction, supportsPassive ? { passive: true } : false)
    const contactUsEl = document.getElementById('contact-us-form')
    contactUsEl.addEventListener('click', contactUsAction, false)
    contactUsEl.addEventListener('touchstart', contactUsAction, supportsPassive ? { passive: true } : false)
    const signInEl = document.getElementById('sign-in-form')
    signInEl.addEventListener('click', signInAction, false)
    signInEl.addEventListener('touchstart', signInAction, supportsPassive ? { passive: true } : false)
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

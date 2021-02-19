document.addEventListener('DOMContentLoaded', async() => {
    if (location.pathname != '/') {
        history.pushState({}, document.title, '/')
    }
    if (recaptcha_site_key) {
        grecaptcha.ready(() => {
            refresh_recaptcha_token('subscribe_action')
        })
    }
    document.getElementById('subscribe_form').addEventListener('submit', async(e) => {
        e.preventDefault()
        const token = document.getElementById('recaptcha_token').value
        const response = await fetch('https://www.trivialsec.com/subscribe', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                recaptcha_token: token,
                email: document.getElementById('email').value,
            })
        }).catch(err => {
            appMessage('error', 'An unexpected error occurred. Please refresh the page and try again.')
            console.log(err)
        })
        const json = await response.json()
        appMessage(json.status, json.message)
        refresh_recaptcha_token('subscribe_action')
    }, false)
    for (const closeEl of document.querySelectorAll('.alert .icofont-close')) {
        closeEl.addEventListener('click', event => event.currentTarget.parent('.alert').remove(), false)
        closeEl.addEventListener('touchstart', event => event.currentTarget.parent('.alert').remove(), supportsPassive ? { passive: true } : false)
    }

}, false)

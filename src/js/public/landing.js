document.addEventListener('DOMContentLoaded', async() => {
    if (location.pathname != '/') {
        history.pushState({}, document.title, '/')
    }
    document.getElementById('subscribe_form').addEventListener('submit', async(e) => {
        e.preventDefault()
        const response = await fetch('/subscribe', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                recaptcha_token,
                email: document.getElementById('email').value,
            })
        })
        const json = await response.json()
        appMessage(json.status, json.message)
        await refresh_recaptcha_token('subscribe_action')
    }, false)
}, false)

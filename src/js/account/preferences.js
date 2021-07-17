const saveNewEmail = async() => {
    const email = document.getElementById('email').value
    const assertion_response
    const json = await Api.post_async('/v1/update-email', {email, assertion_response})
        .catch(()=>appMessage('error', 'An unexpected error occurred. Please refresh the page and try again.'))
    appMessage(json.status, json.message)
}

document.addEventListener('DOMContentLoaded', async() => {
    if (location.pathname != '/account/preferences') {
        history.pushState({}, document.title, '/account/preferences')
    }
    sidebar()
    livetime()
    setInterval(livetime, 1000)
    document.querySelectorAll('select').forEach(el => { new Choices(el, { searchEnabled: true }) })
    for await(const el of document.querySelectorAll('.toggle-sidenav')) {
        el.addEventListener('click', toggler, false)
        el.addEventListener('touchstart', toggler, supportsPassive ? { passive: true } : false)
    }
    for await(const el of document.querySelectorAll('.menu-opener')) {
        el.addEventListener('click', toggler, false)
        el.addEventListener('touchstart', toggler, supportsPassive ? { passive: true } : false)
    }
    const emailChangeEl = document.getElementById('change-email-button')
    emailChangeEl.addEventListener("click", saveNewEmail, false)
    emailChangeEl.addEventListener("touchstart", saveNewEmail, supportsPassive ? { passive: true } : false)

}, false)
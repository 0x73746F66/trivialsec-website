const save_email = async event => {
    if (event.key && event.key !== 'Enter') return;
    event.preventDefault()
    const emailEl = document.getElementById('email')
    emailEl.classList.remove('error')
    emailEl.classList.remove('success')
    const new_email = emailEl.value
    const json = await PublicApi.post({
        target: '/account/update-email',
        body: {new_email}
    })
    emailEl.classList.add(json.status)
    toast(json.status, json.message)
}

document.addEventListener('DOMContentLoaded', async() => {
    if (location.pathname != '/me') {
        history.pushState({}, document.title, '/me')
    }
    const emailChangeEl = document.getElementById('email')
    emailChangeEl.addEventListener("change", save_email, false)
    emailChangeEl.addEventListener('keypress', save_email, false)

}, false)

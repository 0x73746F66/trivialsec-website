const save_email = async() => {
    const emailEl = document.getElementById('email')
    emailEl.classList.remove('error')
    emailEl.classList.remove('success')
    const new_email = emailEl.value
    const json = await PublicApi.post({
        target: '/account/update-email',
        body: {new_email}
    })
    if (json.status == 'success') {
        emailEl.classList.add('success')
    }
    if (json.status == 'error') {
        emailEl.classList.add('error')
        alert(json.message)
    }
}

const regenerate_scratch = async() => {
    console.log('regenerate_scratch')
}

const setup_totp = async() => {
    console.log('setup_totp')
}
const change_name = async event => {
    event.preventDefault()
    if (inputHandle) {
        clearTimeout(inputHandle)
    }
    const device_name = event.target.textContent
    const device_id = event.target.parent('tr').getAttribute('data-mfa-id')
    const json = await PublicApi.post({
        target: '/mfa/rename-device',
        body: {
            device_id,
            device_name,
        },
    })
    if (json.status == 'success') {
        event.target.classList.add('success')
    }
    if (json.status == 'error') {
        event.target.classList.add('error')
        alert(json.message)
    }
}
var inputHandle;
const handle_input = async event => {
    if (inputHandle) {
        clearTimeout(inputHandle)
    }
    inputHandle = setTimeout(change_name.bind(null, event), 2000)
}

document.addEventListener('DOMContentLoaded', async() => {
    if (location.pathname != '/account/preferences') {
        history.pushState({}, document.title, '/account/preferences')
    }
    sidebar()
    livetime()
    setInterval(livetime, 1000)
    const emailChangeEl = document.getElementById('email')
    emailChangeEl.addEventListener("change", save_email, false)
    emailChangeEl.addEventListener('keypress', async event => event.key === 'Enter' ? save_email() : void 0)
    const regenerateEl = document.getElementById('regenerate')
    if (regenerateEl) {
        regenerateEl.addEventListener("click", regenerate_scratch, false)
        regenerateEl.addEventListener("touchstart", regenerate_scratch, supportsPassive ? { passive: true } : false)
    }
    const setupEl = document.getElementById('setup_totp')
    if (setupEl) {
        setupEl.addEventListener("click", setup_totp, false)
        setupEl.addEventListener("touchstart", setup_totp, supportsPassive ? { passive: true } : false)
    }
    for (const el of document.querySelectorAll('.u2fkeyname')) {
        el.addEventListener("input", handle_input, false)
        el.addEventListener("keypress", async event => event.key === 'Enter' ? change_name(event) : void 0)
    }

}, false)
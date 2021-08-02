const regenerate_scratch = async() => {
    const scratchEl = document.getElementById('scratch_code')
    const json = await PublicApi.get({target: '/recovery/regenerate-scratch'})
    if (json.status == 'success') {
        scratchEl.value = json.scratch_code
        scratchEl.disabled = false
        document.getElementById('regenerate').remove()
    }
    scratchEl.classList.add(json.status)
    toast(json.status, json.message)
}
const remove_device = async event => {
    const device_id = event.currentTarget.parent('tr').dataset.mfaId
    if (!device_id) {
        toast('info', 'This feature is not currently available', 'Sorry')
        return;
    }
    const json = await PublicApi.post({
        target: '/mfa/remove-device',
        body: {device_id},
    })
    event.target.classList.add(json.status)
    toast(json.status, json.message)
    if (json.status === 'success') {
        document.querySelector(`tr[data-mfa-id="${device_id}"]`).remove()
    }
}
const change_name = async event => {
    if (event.key && event.key !== 'Enter') return;
    event.preventDefault()
    if (inputHandle) {
        clearTimeout(inputHandle)
    }
    const device_name = event.target.textContent
    const device_id = event.target.parent('tr').dataset.mfaId
    const json = await PublicApi.post({
        target: '/mfa/rename-device',
        body: {
            device_id,
            device_name,
        },
    })
    event.target.classList.add(json.status)
    toast(json.status, json.message)
}
var inputHandle;
const handle_input = async event => {
    if (inputHandle) {
        clearTimeout(inputHandle)
    }
    inputHandle = setTimeout(change_name.bind(null, event), 2000)
}

document.addEventListener('DOMContentLoaded', async() => {
    if (location.pathname != '/me/security') {
        history.pushState({}, document.title, '/me/security')
    }
    sidebar()
    livetime()
    setInterval(livetime, 1000)

    const regenerateEl = document.getElementById('regenerate')
    if (regenerateEl) {
        regenerateEl.addEventListener("click", regenerate_scratch, false)
        regenerateEl.addEventListener("touchstart", regenerate_scratch, supportsPassive ? { passive: true } : false)
    }
    for (const el of document.querySelectorAll('.u2fkeyname')) {
        el.addEventListener("input", handle_input, false)
        el.addEventListener("keypress", change_name, false)
    }
    for (const el of document.querySelectorAll('.remove-device')) {
        el.addEventListener("click", remove_device, false)
        el.addEventListener("touchstart", remove_device, supportsPassive ? { passive: true } : false)
    }

}, false)

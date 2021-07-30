const setupActions = async(event) => {
    if (event.currentTarget.id == 'step1') {
        const json = await Api.post_async('/v1/setup-account', [{
            prop: 'alias',
            value: document.querySelector('[name="account_alias"]').value
        }, {
            prop: 'default_role_id',
            value: document.querySelector('[name="default_role_id"]').value
        }])
        toast(json.status, json.message)
        if (json.status == 'success') {
            setTimeout(()=>{window.location.href = '/account/setup/2'}, 2000)
            return;
        }
    }
}

document.addEventListener('DOMContentLoaded', async() => {
    sidebar()
    livetime()
    setInterval(livetime, 1000)
    document.querySelectorAll('select').forEach(el => { new Choices(el, { searchEnabled: true }) })
    for await(const el of document.querySelectorAll('button')) {
        el.addEventListener('click', setupActions, false)
        el.addEventListener('touchstart', setupActions, supportsPassive ? { passive: true } : false)
    }
}, false)
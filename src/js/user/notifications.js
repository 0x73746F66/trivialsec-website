document.addEventListener('DOMContentLoaded', async() => {
    if (location.pathname != '/me/notifications') {
        history.pushState({}, document.title, '/me/notifications')
    }
    sidebar()
    livetime()
    setInterval(livetime, 1000)
    document.querySelectorAll('select').forEach(el => { new Choices(el, { searchEnabled: true }) })

}, false)
document.addEventListener('DOMContentLoaded', async() => {
    if (location.pathname != '/account/notifications') {
        history.pushState({}, document.title, '/account/notifications')
    }
    sidebar()
    livetime()
    setInterval(livetime, 1000)
    document.querySelectorAll('select').forEach(el => { new Choices(el, { searchEnabled: true }) })

}, false)
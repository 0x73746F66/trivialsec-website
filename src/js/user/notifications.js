document.addEventListener('DOMContentLoaded', async() => {
    if (location.pathname != '/me/notifications') {
        history.pushState({}, document.title, '/me/notifications')
    }

}, false)
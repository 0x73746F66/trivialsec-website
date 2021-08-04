document.addEventListener('DOMContentLoaded', async() => {
    if (location.pathname != '/me/apikeys') {
        history.pushState({}, document.title, '/me/apikeys')
    }

}, false)

document.addEventListener('DOMContentLoaded', () => {
    if (location.pathname != '/invitation') {
        history.pushState({}, document.title, '/invitation')
    }

}, false)

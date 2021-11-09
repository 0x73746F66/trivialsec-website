window.supportsPassive = false
try {
  let opts = Object.defineProperty({}, 'passive', {
    get: function() {
        window.supportsPassive = true
    }
  })
  window.addEventListener("testPassive", null, opts)
  window.removeEventListener("testPassive", null, opts)
} catch (e) {}
const init_site = async() => {
    window.app = {...document.head.querySelector('[name=application-name]').dataset}
    app.charts = {}
    app.keys = 'keys' in app ?JSON.parse(app.keys):[]    
    app.lang = window.navigator.userLanguage || window.navigator.language
    app.sidebarState = localStorage.getItem('sidebarState')
    if (!app.sidebarState) {
        app.sidebarState = 'sidenav-open'
    }
    const appLogoutAction = document.getElementById('app-logout-action')
    if (appLogoutAction) {
        appLogoutAction.addEventListener('click', logout_action, false)
        appLogoutAction.addEventListener('touchstart', logout_action, supportsPassive ? { passive: true } : false)
    }
    for await(const el of document.querySelectorAll('.toggle-sidenav .toggler')) {
        el.addEventListener('click', toggler, false)
        el.addEventListener('touchstart', toggler, supportsPassive ? { passive: true } : false)
    }
    for await(const el of document.querySelectorAll('.toast')) {
        el.addEventListener('click', closeToast, false)
        el.addEventListener('touchstart', closeToast, supportsPassive ? { passive: true } : false)
    }
    app.ERRORS = {
        corrupt: 'Critical account data has been modified or is unavailable.\nTry refreshing the page or allow a moment for us to correct a known issue reported at; https://status.trivialsec.com/'
    }
}
const browserErrorHandler = async event => {
    if (event.origin !== `${app.domainScheme}${app.domainName}`) return;
    toast('error', event.reason, `Browser Exception`);
}
const sidebar = () => {
    document.body.classList.remove('sidenav-open')
    document.body.classList.remove('sidenav-closed')
    document.body.classList.add(sidebarState)
}
const toggler = () => {
    app.sidebarState = document.body.classList.contains('sidenav-open') ? 'sidenav-closed' : 'sidenav-open'
    void localStorage.setItem('sidebarState', app.sidebarState)
    document.body.classList.toggle('sidenav-open')
    document.body.classList.toggle('sidenav-closed')
}
const logout_action = async(e) => {
    e.preventDefault()
    localStorage.removeItem('_apiKeySecret')
    if (navigator.credentials && navigator.credentials.preventSilentAccess) {
        navigator.credentials.preventSilentAccess()
    }
    window.location.href = '/logout'
}
document.addEventListener('DOMContentLoaded', init_site, false)
window.addEventListener("unhandledrejection", browserErrorHandler, false)
window.addEventListener("error", browserErrorHandler, false)
console.log('%c'+
' _____      _       _       _ __             \n'+
'/__   \\_ __(_)_   _(_) __ _| / _\\ ___  ___   \n'+
'  / /\\/ \'__| \\ \\ / / |/ _` | \\ \\ / _ \\/ __| \n'+
' / /  | |  | |\\ V /| | (_| | |\\ \\  __/ (__   \n'+
' \\/   |_|  |_| \\_/ |_|\\__,_|_\\__/\\___|\\___|',
'color: #1abb9c;')
console.log('%c'+
'Please check out some open source repositories we released:\n'+
'https://gitlab.com/chrislangton/py-tls-trust/\n'+
'https://gitlab.com/chrislangton/py-tls-veryify/\n'+
'\nCheers\n- Stof',
'font-family: Roboto; font-size: 1.2em; line-height: 1.4em; font-style: italic;')

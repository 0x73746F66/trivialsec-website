const init_site = async() => {
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
    window.app = {...document.head.querySelector('[name=application-name]').dataset}
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
}
const sidebar = () => {
    document.body.classList.remove('sidenav-open')
    document.body.classList.remove('sidenav-closed')
    document.body.classList.add(sidebarState)
}
const toggler = () => {
    app.sidebarState = document.body.classList.contains('sidenav-open') ? 'sidenav-closed' : 'sidenav-open'
    localStorage.setItem('sidebarState', app.sidebarState)
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

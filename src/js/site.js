const sidebarStateKey = 'sidebarState'
let sidebarState = localStorage.getItem(sidebarStateKey)
if (!sidebarState) {
    sidebarState = 'sidenav-closed'
}
const sidebar = () => {
    document.body.classList.remove('sidenav-open')
    document.body.classList.remove('sidenav-closed')
    document.body.classList.add(sidebarState)
}
const toggler = () => {
    sidebarState = document.body.classList.contains('sidenav-open') ? 'sidenav-closed' : 'sidenav-open'
    localStorage.setItem(sidebarStateKey, sidebarState)
    document.body.classList.toggle('sidenav-open')
    document.body.classList.toggle('sidenav-closed')
}
const logout_action = async(e) => {
    e.preventDefault()
    localStorage.removeItem('hmac-secret')
    window.location.href = '/logout'
}
document.addEventListener('DOMContentLoaded', async() => {
    const appLogoutAction = document.getElementById('app-logout-action')
    if (appLogoutAction) {
        appLogoutAction.addEventListener('click', logout_action, false)
        appLogoutAction.addEventListener('touchstart', logout_action, supportsPassive ? { passive: true } : false)
    }
}, false)

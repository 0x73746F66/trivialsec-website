const appMessage = (appAlert, type, str) => {
    const messageTypes = ['warning', 'error', 'info', 'success']
    let obj;
    if (str && messageTypes.includes(type)) {
        obj = {
            status: type,
            message: str
        }
    } else if (type.hasOwnProperty('status') && messageTypes.includes(type['status'])) {
        obj = type
    }
    if (obj) {
        let font;
        if (obj['status'] == 'success') {
            font = 'tick-mark'
        } else if (obj['status'] == 'error') {
            font = 'exclamation-square'
        } else {
            font = obj['status']
        }
        if (appAlert) {
            const msgId = String().random()
            appAlert.innerHTML = `<div id="${msgId}" class="alert alert-${obj['status']}"><i class="icofont-${font}"></i>${obj['message']}<i class="icofont-close" title="Dismiss"></i></div>` // nosemgrep
            const alertEl = document.getElementById(msgId)
            const closeEl = alertEl.querySelector('.icofont-close')
            closeEl.addEventListener('click', event => event.currentTarget.parent('.alert').remove(), false)
            closeEl.addEventListener('touchstart', event => event.currentTarget.parent('.alert').remove(), supportsPassive ? { passive: true } : false)
        }
    }
}

document.addEventListener('DOMContentLoaded', async() => {
    for (const closeEl of document.querySelectorAll('.alert .icofont-close')) {
        closeEl.addEventListener('click', event => event.currentTarget.parent('.alert').remove(), false)
        closeEl.addEventListener('touchstart', event => event.currentTarget.parent('.alert').remove(), supportsPassive ? { passive: true } : false)
    }
}, false)

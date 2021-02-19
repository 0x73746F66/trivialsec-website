const lang = window.navigator.userLanguage || window.navigator.language
var supportsPassive = false
try {
  let opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true
    }
  })
  window.addEventListener("testPassive", null, opts)
  window.removeEventListener("testPassive", null, opts)
} catch (e) {}

const siblings = function() {
    let elems = []
    let sibling = this.parentNode.firstChild
    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== this) {
            elems.push(sibling)
        }
        sibling = sibling.nextSibling
    }

    return elems
}
String.prototype.random = (len=16) => {
    return [...Array(len)].map(_=>(Math.random()*32|0).toString(32)).join``
}
EventTarget.prototype.siblings = siblings
Element.prototype.siblings = siblings
Element.prototype.show = function(cb) {
    this.style.display = this.getAttribute('data-css-display') || 'block'
    if (cb) {
        cb.call(this)
    }
}
Element.prototype.hide = function(cb) {
    let originalDisplay = this.getAttribute('data-css-display')
    if (!originalDisplay && this.style.display != 'none') {
        originalDisplay = this.style.display
    }
    this.setAttribute('data-css-display', originalDisplay)
    this.style.display = 'none'
    if (cb) {
        cb.call(this)
    }
}
Element.prototype.remove = function(cb) {
    this.parentNode.removeChild(this)
    if (cb) {
        cb.call(this)
    }
}
Element.prototype.parent = function(selector) {
    let elem = this
	for ( ; elem && elem !== document && elem !== Window; elem = elem.parentNode ) {
		if (elem.matches( selector )) return elem
	}
	return;
}
Array.prototype.clone = function() {
	return this.slice(0)
}
const createUTCDate = d => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()))
const convertDateToUTC = d => new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds())

const appMessage = (type, str) => {
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
        } else {
            font = obj['status']
        }
        const modalAlert = document.querySelector('.modal-open[data-modal-id]')
        if (modalAlert) {
            const alertId = String().random()
            const msgEl = modalAlert.querySelector('.modal-messages')
            msgEl.innerHTML = `<div id="${alertId}" class="alert alert-${obj['status']}"><i class="icofont-${font}"></i>${obj['message']}<i class="icofont-close"></i></div>`
            const alertEl = document.getElementById(alertId)
            const closeEl = alertEl.querySelector('.icofont-close')
            closeEl.addEventListener('click', event => event.currentTarget.parent('.alert').remove(), false)
            closeEl.addEventListener('touchstart', event => event.currentTarget.parent('.alert').remove(), supportsPassive ? { passive: true } : false)
            if (document.querySelectorAll('.modal-open').length > 0) {
                return;
            }
        }
        const appAlert = document.getElementById('app-messages')
        if (appAlert) {
            const msgId = String().random()
            appAlert.innerHTML = `<div id="${msgId}" class="alert alert-${obj['status']}"><i class="icofont-${font}"></i>${obj['message']}<i class="icofont-close"></i></div>`
            const alertEl = document.getElementById(msgId)
            const closeEl = alertEl.querySelector('.icofont-close')
            closeEl.addEventListener('click', event => event.currentTarget.parent('.alert').remove(), false)
            closeEl.addEventListener('touchstart', event => event.currentTarget.parent('.alert').remove(), supportsPassive ? { passive: true } : false)
        }
    }
}
const livetime = async() => {
    for await(const el of document.querySelectorAll('time')) {
        const utc = createUTCDate(new Date(el.getAttribute('datetime')))
        el.setAttribute('title', utc.toLocaleString(window.navigator.userLanguage || window.navigator.language))
        el.textContent = timeago.format(utc, lang)
    }
}
const validDomain = domain_name => {
    let re = new RegExp(/^(?!.*?_.*?)(?!^-|.*?\.-.*?|.*?-\..*?)(?!(?:[\d\w]+?\.)?\-[\w\d\.\-]*?)(?![\w\d]+?\-\.(?:[\d\w\.\-]+?))(?=[\w\d])(?=[\w\d\.\-]*?\.+[\w\d\.\-]*?)(?![\w\d\.\-]{254})(?!(?:\.?[\w\d\-\.]*?[\w\d\-]{64,}\.)+?)[\w\d\.\-]+?\.(?![\d]+?$)[\w\d\-]{2,24}$/)
    return re.test(domain_name)
}
const validIPAddress = ip_address => {
    let re = new RegExp(/((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/)
    return re.test(ip_address)
}
const htmlDecode = input => {
    let e = document.createElement('textarea')
    e.innerHTML = input
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue
}
const refresh_recaptcha_token = async(action) => {
    for await(const el of document.querySelectorAll('.wait_recaptcha')) {
        el.disabled = true
    }
    let token = await grecaptcha.execute(recaptcha_site_key, {action})
    document.getElementById('recaptcha_token').value = token
    for await(const el of document.querySelectorAll('.wait_recaptcha')) {
        el.disabled = false
    }

}

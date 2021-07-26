window.app = {...document.head.querySelector('[name=application-name]').dataset}
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
Number.prototype.between = function(a, b, inclusive) {
    const min = Math.min(a, b)
    const max = Math.max(a, b)
    return !!inclusive ? this >= min && this <= max : this > min && this < max
}

const createUTCDate = d => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()))
const convertDateToUTC = d => new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds())

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
    e.innerHTML = input // nosemgrep
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue
}
const init_recaptcha = async(action) => {
    for await(const el of document.querySelectorAll('.wait_recaptcha')) {
        el.disabled = true
    }
    let token = await grecaptcha.execute(app.recaptchaSiteKey, {action})
    for await(const el of document.querySelectorAll('.wait_recaptcha')) {
        el.disabled = false
    }
    window.recaptcha_token = token
    return token
}
const refresh_recaptcha_token = async(action) => {
    await grecaptcha.reset(app.recaptchaSiteKey)
    return init_recaptcha(action)
}
const arrayBufferToBase64 = bufferArray => btoa([].reduce.call(new Uint8Array(bufferArray),(p,c)=>p+String.fromCharCode(c),''));
const base64ToArrayBuffer = base64 => Uint8Array.from(atob(base64), c => c.charCodeAt(0));
const hexEncode = bufUint8Array => Array.from(bufUint8Array).map(x => ("0" + x.toString(16)).substr(-2)).join("");
const utf8Bytes = str => new Uint8Array([...unescape(encodeURIComponent(str))].map(c => c.charCodeAt(0)));
const COSE_Key_Types = [
    void 0,
    'OKP, Octet Key Pair - Elliptic Curve',
    'EC2, Elliptic Curve Keys w/ x- and y-coordinate pair',
    'RSA, RSA Key',
    'Symmetric, Symmetric Keys',
    'HSS-LMS, Public key for HSS/LMS hash-based digital signature',
    'WalnutDSA, WalnutDSA public key',
]
const COSE_Elliptic_Curves = [
    void 0,
    'P-256, EC2, NIST P-256 also known as secp256r1	',
    'P-384, EC2, NIST P-384 also known as secp384r1	',
    'P-521, EC2, NIST P-521 also known as secp521r1	',
    'X25519, OKP, X25519 for use w/ ECDH only',
    'X448, OKP, X448 for use w/ ECDH only',
    'Ed25519, OKP, Ed25519 for use w/ EdDSA only',
    'Ed448, OKP, Ed448 for use w/ EdDSA only',
    'secp256k1, EC2, SECG secp256k1 curve',
]
const COSE_Algorithms = Object.assign({}, {
    '-65535': 'RS1',
    '-260': 'WalnutDSA',
    '-259': 'RS512',
    '-258': 'RS384',
    '-257': 'RS256',
    '-47': 'ES256K',
    '-46': 'HSS-LMS',
    '-45': 'SHAKE256',
    '-44': 'SHA-512',
    '-43': 'SHA-384',
    '-42': 'RSAES-OAEP-SHA-512',
    '-41': 'RSAES-OAEP-SHA-256',
    '-40': 'RSAES-OAEP-SHA-1',
    '-39': 'RSASSA-PSS-SHA-512',
    '-38': 'RSASSA-PSS-SHA-384',
    '-37': 'RSASSA-PSS-SHA-256',
    '-36': 'ECDSA-SHA-512',
    '-35': 'ECDSA-SHA-384',
    '-34': 'ECDH-SS-A256KW',
    '-33': 'ECDH-SS-A192KW',
    '-32': 'ECDH-SS-A128KW',
    '-31': 'ECDH-ES-A256KW',
    '-30': 'ECDH-ES-A192KW',
    '-29': 'ECDH-ES-A128KW',
    '-28': 'ECDH-SS-HKDF-512',
    '-27': 'ECDH-SS-HKDF-256',
    '-26': 'ECDH-ES-HKDF-512',
    '-25': 'ECDH-ES-HKDF-256',
    '-18': 'SHAKE128',
    '-17': 'SHA-512/256',
    '-16': 'SHA-256',
    '-15': 'SHA-256/64',
    '-14': 'SHA-1',
    '-13': 'HKDF-AES-256',
    '-12': 'HKDF-AES-128',
    '-11': 'HKDF-SHA-512',
    '-10': 'HKDF-SHA-256',
    '-8': 'EdDSA',
    '-7': 'ECDSA-SHA-256',
    '-6': 'CEK',
    '-5': 'A256KW',
    '-4': 'A192KW',
    '-3': 'A128KW',
    1: 'AES-GCM-128',
    2: 'AES-GCM-192',
    3: 'AES-GCM-256',
    4: 'HMAC-SHA256/64',
    5: 'HMAC-SHA256',
    6: 'HMAC-SHA-384',
    7: 'HMAC-SHA-512',
    10: 'AES-CCM-16-64-128',
    11: 'AES-CCM-16-64-256',
    12: 'AES-CCM-64-64-128',
    13: 'AES-CCM-64-64-256',
    14: 'AES-MAC 128/64',
    15: 'AES-MAC 256/64',
    24: 'ChaCha20/Poly1305',
    25: 'AES-MAC 128/128',
    26: 'AES-MAC 256/128',
    30: 'AES-CCM-16-128-128',
    31: 'AES-CCM-16-128-256',
    32: 'AES-CCM-64-128-128',
    33: 'AES-CCM-64-128-256',
    34: 'IV-GENERATION'
})

document.addEventListener('DOMContentLoaded', async(event) => {
    document.addEventListener('keyup', e => {
        if (e.keyCode == 13 && e.ctrlKey) {
            let el = document.querySelector('textarea[name="note"]:focus')
            if (el) {
                let finding_id = el.getAttribute('id').split('note')[1]
                noteFinding(null, el.value, finding_id)
                el.value = ''
            }
        }
    }, false)
    let elem = document.getElementById('table_findings')
    elem.addEventListener('click', selectAll, false)
    elem.addEventListener('touchstart', selectAll, supportsPassive ? { passive: true } : false)
    for await(const el of document.querySelectorAll('button[name="archive"]')) {
        el.addEventListener('click', async e => {
            for await(const ele of document.querySelectorAll('.modal-open')) {
                ele.classList.remove('modal-open')
            }
            archiveFinding(e)
        }, false)
    }
    for await(const el of document.querySelectorAll('button[name="resolve-finding"]')) {
        el.addEventListener('click', resolveFinding, false)
        el.addEventListener('touchstart', resolveFinding, supportsPassive ? { passive: true } : false)
    }
    for await(const el of document.querySelectorAll('button[name="true_positive"], button[name="benign_positive"], button[name="false_positive"]')) {
        el.addEventListener('click', verifyFinding, false)
        el.addEventListener('touchstart', verifyFinding, supportsPassive ? { passive: true } : false)
    }
    for await(const el of document.querySelectorAll('button[name="duplicate"]')) {
        el.addEventListener('click', duplicateFinding, false)
        el.addEventListener('touchstart', duplicateFinding, supportsPassive ? { passive: true } : false)
    }
    for await(const el of document.querySelectorAll('select[name="assign"]')) {
        el.addEventListener('change', assignFinding, false)
    }
    for await(const el of document.querySelectorAll('select[name="project"]')) {
        el.addEventListener('change', projectFinding, false)
    }
    for await(const el of document.querySelectorAll('input[name="defer"]')) {
        el.addEventListener('change', deferFinding, false)
    }
    for await(const el of document.querySelectorAll('button[name="finding-note"]')) {
        el.addEventListener('click', noteFinding, false)
        el.addEventListener('touchstart', noteFinding, supportsPassive ? { passive: true } : false)
    }
    for await(const el of document.querySelectorAll('[data-action="archive"]')) {
        el.addEventListener('click', archiveFinding, false)
        el.addEventListener('touchstart', archiveFinding, supportsPassive ? { passive: true } : false)
    }
}, false)
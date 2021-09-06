window.choices_rendered = {}
const memberAction = async() => {
    const cid = document.getElementById('assigned_roles').dataset.cid
    if (!(cid in choices_rendered)) {
        void toast('error', 'Problem encountered gathering assigned roles, please try refreshing the page')
    }
    const json = await PublicApi.post({
        target: '/account/update-member',
        body: {
            member_id: document.querySelector('section[data-member-id]').dataset.memberId,
            email: document.getElementById('member_email').value,
            roles: choices_rendered[cid].getValue().map(i=>i.value)
        }
    })
    if (json.status == 'success' && !json.message) {
        json.message = 'No changes'
        json.status = 'info'
    }
    void toast(json.status, json.message)
}

document.addEventListener('DOMContentLoaded', async() => {
    sidebar()
    livetime()
    setInterval(livetime, 1000)
    for await(const el of document.querySelectorAll('select')) {
        const cid = ''.random()
        el.setAttribute('data-cid', cid)
        const unique = []
        const choices = []
        for await(const option of Array.from(el.options)) {
            if (!unique.includes(option.value)) {
                unique.push(option.value)
                choices.push({label: option.textContent, value: option.value})
            }
        }
        choices_rendered[cid] = new Choices(el, {
            searchEnabled: true,
            duplicateItemsAllowed: false
        }).clearChoices().setChoices(choices)
    }
    const memberBtnEl = document.getElementById('member-button')
    memberBtnEl.addEventListener('click', memberAction, false)
    memberBtnEl.addEventListener('touchstart', memberAction, supportsPassive ? { passive: true } : false)

}, false)
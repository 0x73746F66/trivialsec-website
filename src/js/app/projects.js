window.choices_rendered = {}
const projectsAction = async event => {
    const project_id = event.currentTarget.parent('tr').dataset.projectId
    location.href = `/scope/${project_id}`
}
const handleSocket = async data => {
    console.debug(data)
}
const createProject = async event => {
    const project_name = document.getElementById('project_name_input').value
    const domain_name = document.getElementById('domain_name_input').value
    const iconEl = event.currentTarget.querySelector('i')
    iconEl.classList.remove('icofont-ui-add')
    iconEl.classList.add('icofont-spinner-alt-2')
    iconEl.classList.add('rotate')
    const json = await Api.post_async('/v1/create-project', {
        project_name,
        domain_name
    }).catch(() => toast('error', 'An unexpected error occurred. Please refresh the page and try again.'))
    console.debug(json)
    toast(json.status, json.message)
    if (!!json['domain']) {
        const noProjectsEl = document.getElementById('no-projects')
        if (noProjectsEl) {
            noProjectsEl.remove()
        }
        document.getElementById('projects-list').style.display = 'block'
        const project_id = json['domain']['project_id']
        const tr = document.querySelector(`[data-project-id="${project_id}"]`)
        if (tr) {
            const domainsEl = tr.querySelector('[title="Domains"] div')
            domainsEl.textContent = parseInt(domainsEl.textContent) + 1
        } else {
            const row = document.createElement('tr')
            row.setAttribute('data-project-id', project_id)
            row.classList.add('highlight')
            row.innerHTML = `<td width="5px"><div class="border info"></div></td>`+ // nosemgrep
                `<td>${json['project_name']}</td>`+ // nosemgrep
                `<td title="Domains"><i class="icofont-globe"></i><div>1</div></td>
                <td width="65px"><span title="High Severity Findings" class="label high">0</span></td>
                <td width="65px"><span title="Medium Severity Findings" class="label medium">0</span></td>
                <td width="65px"><span title="Low Severity Findings" class="label low">0</span></td>
                <td width="65px"><span title="Informational Findings" class="label info">0</span></td>
                <td width="100px"><span class="details">Details</span><i class="icofont-curved-right"></i></td>`
            document.querySelector('.projects-list tbody').insertAdjacentElement("beforeend", row)
            row.addEventListener('click', projectsAction, false)
            row.addEventListener('touchstart', projectsAction, supportsPassive ? { passive: true } : false)
        }
    }
    iconEl.setAttribute('disabled', true)
    iconEl.classList.remove('icofont-spinner-alt-2')
    iconEl.classList.remove('rotate')
    iconEl.classList.add('icofont-ui-check')
}
let socket, socketio_token;
document.addEventListener('DOMContentLoaded', async () => {
    socketio_token = document.querySelector('[name=socketio_token]').value
    socket = io(`${app.websocketScheme}${app.websocketDomain}`)
    socket.on('disconnect', (reason) => {
        console.debug(`Disconnected: ${reason}`)
    })
    socket.on('connect', () => {
        console.debug('Connected')
        socket.emit('checkin', socketio_token)
    })
    socket.on('update_job_state', handleSocket)
    socket.on('dns_changes', handleSocket)
    socket.on('domain_changes', handleSocket)
    socket.on('check_domains_tld', handleSocket)

    const createEl = document.getElementById('create_project_input')
    createEl.addEventListener('click', createProject, false)
    createEl.addEventListener('touchstart', createProject, supportsPassive ? { passive: true } : false)
    document.getElementById('domain_name_input').addEventListener('keyup', async event => event.keyCode == 13 ? createProject(event) : 0, false)

    for await (const projectsEl of document.querySelectorAll('.projects-list tr')) {
        projectsEl.addEventListener('click', projectsAction, false)
        projectsEl.addEventListener('touchstart', projectsAction, supportsPassive ? { passive: true } : false)
    }

}, false)

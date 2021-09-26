const init_projects = async () => {
    void app.websocket.on('update_job_state', handleSocket)
    void app.websocket.on('dns_changes', handleSocket)
    void app.websocket.on('domain_changes', handleSocket)
    void app.websocket.on('check_domains_tld', handleSocket)

    const createEl = document.getElementById('create_project_input')
    createEl.addEventListener('click', createProject, false)
    createEl.addEventListener('touchstart', createProject, supportsPassive ? { passive: true } : false)
    document.getElementById('domain_name_input').addEventListener('keyup', async event => event.keyCode == 13 ? createProject(event) : 0, false)

    for await (const projectsEl of document.querySelectorAll('.projects-list tr')) {
        projectsEl.addEventListener('click', projectsAction, false)
        projectsEl.addEventListener('touchstart', projectsAction, supportsPassive ? { passive: true } : false)
    }
}
const projectsAction = async event => {
    const project_id = event.currentTarget.parent('tr').dataset.projectId
    location.href = `/project/${project_id}`
}
const handleSocket = async data => {
    console.debug(data)
}
const createProject = async event => {
    const project_name = document.getElementById('project_name_input').value
    const domain_name = document.getElementById('domain_name_input').value
    const json = await PublicApi.post({
        target: '/project/create',
        body: {project_name, domain_name}
    })
    void toast(json.status, json.message)
    if (!!json.domain) {
        document.querySelector('#projects-list caption').textContent = 'Projects'
        const tr = document.querySelector(`[data-project-id="${json.project_id}"]`)
        if (tr) {
            const domainsEl = tr.querySelector('[title="Domains"] div')
            domainsEl.textContent = parseInt(domainsEl.textContent) + 1
        } else {
            const template_raw = document.getElementById(`tmpl-project-row`)
            if (!template_raw) {
                void toast('warning', 'Project template not found')
                return;
            }
            const container = document.querySelector('.projects-list tbody')
            const template = micromustache.render(htmlDecode(template_raw.innerHTML), {project_id: json.project_id, project_name})
            container.insertAdjacentHTML('beforeend', template)
            const row = document.querySelector(`tr[data-project-id="${json.project_id}"]`)
            row.addEventListener('click', projectsAction, false)
            row.addEventListener('touchstart', projectsAction, supportsPassive ? { passive: true } : false)
        }
    }
}
document.addEventListener('DOMContentLoaded', init_projects, false)

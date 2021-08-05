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
    const iconEl = event.currentTarget.querySelector('i')
    iconEl.classList.remove('icofont-ui-add')
    iconEl.classList.add('icofont-spinner-alt-2')
    iconEl.classList.add('rotate')
    const json = await PublicApi.post({
        target: '/create-project',
        body: {project_name, domain_name}
    })
    console.debug(json)
    void toast(json.status, json.message)
    if (!!json.domain) {
        document.querySelector('#projects-list caption').textContent = 'Projects'

        const project_id = json.domain.project_id
        const tr = document.querySelector(`[data-project-id="${project_id}"]`)
        if (tr) {
            const domainsEl = tr.querySelector('[title="Domains"] div')
            domainsEl.textContent = parseInt(domainsEl.textContent) + 1
        } else {
            row = renderer(`tmpl-project-row`, `.projects-list tbody`, {project_id, project_name})
            console.log(`row`, row)
            row.addEventListener('click', projectsAction, false)
            row.addEventListener('touchstart', projectsAction, supportsPassive ? { passive: true } : false)
        }
    }
    iconEl.setAttribute('disabled', true)
    iconEl.classList.remove('icofont-spinner-alt-2')
    iconEl.classList.remove('rotate')
    iconEl.classList.add('icofont-ui-check')
}
document.addEventListener('DOMContentLoaded', init_projects, false)

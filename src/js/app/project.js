const initProject = async event => {
    void livetime()
    void setInterval(livetime, 1000)
    void app.websocket.on('update_job_state', handleSocket)
    void app.websocket.on('dns_changes', handleSocket)
    void app.websocket.on('domain_changes', handleSocket)
    void app.websocket.on('check_domains_tld', handleSocket)
    void renderFindingsChart.call({}, event)
    void renderJobsChart.call({}, event)
    const projectActionEl = document.querySelector('.archive-project')
    projectActionEl.addEventListener('click', projectArchiveButton, false)
    projectActionEl.addEventListener('touchstart', projectArchiveButton, supportsPassive ? { passive: true } : false)
    for await(const domainEl of document.querySelectorAll('.domains-list td.click-through')) {
        const disabled = domainEl.parent('.disabled-events')
        if (disabled) continue
        domainEl.addEventListener('click', domainsAction, false)
        domainEl.addEventListener('touchstart', domainsAction, supportsPassive ? { passive: true } : false)
    }
    for await(const domainEl of document.querySelectorAll('.domains-list td.toggle-monitoring')) {
        domainEl.addEventListener('click', toggleDomainAction, false)
        domainEl.addEventListener('touchstart', toggleDomainAction, supportsPassive ? { passive: true } : false)
    }
    for await(const domainEl of document.querySelectorAll('.domains-list td.delete-domain')) {
        domainEl.addEventListener('click', deleteDomainAction, false)
        domainEl.addEventListener('touchstart', deleteDomainAction, supportsPassive ? { passive: true } : false)
    }
}
const domainsAction = async event => {
    const domain_id = event.currentTarget.parent('tr').dataset.domainId
    location.href = `/domain/${domain_id}`
}
const projectArchiveButton = async event => {
    const project_id = event.currentTarget.parent('.project-actions').dataset.projectId
    const json = await PublicApi.post({
        target: `/project/archive`,
        body: {project_id}
    })
    void toast(json.status, json.message)

}
const toggleDomainAction = async event => {
    const domain_id = event.currentTarget.parent('tr').dataset.domainId
    const toggleTd = document.querySelector(`tr[data-domain-id="${domain_id}"] td.toggle-monitoring`)
    const is_monitoring = toggleTd.getAttribute('data-monitoring') === 'on'
    const target = is_monitoring ? '/domain/disable' : '/domain/enable'
    const json = await PublicApi.post({
        target,
        body: {domain_id}
    })
    void toast(json.status, json.message)
    if (json?.status !== 'success') {
        return;
    }
    const iconEl = toggleTd.querySelector('img.icon')
    if (is_monitoring) {
        iconEl.setAttribute('src', `${app.staticScheme}${app.staticDomain}/images/icon-toggle-off.svg`)
        iconEl.title = 'Enable domain monitoring'
        toggleTd.setAttribute('data-monitoring', 'off')
    } else {
        iconEl.setAttribute('src', `${app.staticScheme}${app.staticDomain}/images/icon-toggle-on.svg`)
        iconEl.title = 'Disable domain monitoring'
        toggleTd.setAttribute('data-monitoring', 'on')
    }
}
const deleteDomainAction = async event => {
    const toggleTd = event.currentTarget
    const domain_id = toggleTd.parent('tr').dataset.domainId
    const json = await PublicApi.post({
        target: `/domain/delete`,
        body: {domain_id}
    })
    void toast(json.status, json.message)
    if (json?.status !== 'success') {
        return;
    }
    toggleTd.parent('tr').remove()
}
const handleSocket = async data => {
    if (data.service_category === 'crawler' && data.state === 'completed') {
        const trEl = document.querySelector(`tr.disabled-events[data-domain-id="${data.id}"`)
        if (trEl) {
            location.reload()
        }
    }
}
const renderFindingsChart = async event => {
    const findings_info    = document.getElementById('findings-info').value
    const findings_low     = document.getElementById('findings-low').value
    const findings_medium  = document.getElementById('findings-medium').value
    const findings_high    = document.getElementById('findings-high').value
    const canvasEl         = document.getElementById('findings-chart')
    if (!findings_high || !findings_medium || !findings_low || !findings_info || !canvasEl) {
        toast('warning', app.ERRORS.corrupt, 'Application Error', true)
        return;
    }
    if (canvasEl) {
        const findings_data = [
            findings_info,
            findings_low,
            findings_medium,
            findings_high,
        ]
        app.charts.projectFindings = new Chart(canvasEl.getContext('2d'), {
            type: 'pie',
            data: {
                labels: [
                    'Info', 'Low', 'Medium', 'High'
                ],
                datasets: [{
                    borderWidth: 0,
                    backgroundColor: [
                        'rgb(40, 112, 204)',
                        'rgb(26, 140, 39)',
                        'rgb(255, 164, 56)',
                        'rgb(255, 56, 56)'
                    ],
                    hoverBackgroundColor: [
                        'rgba(40, 112, 204, 0.8)',
                        'rgba(26, 140, 39, 0.8)',
                        'rgba(255, 164, 56, 0.8)',
                        'rgba(255, 56, 56, 0.8)'
                    ],
                    data: findings_data
                }],
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        })
    }
}
const renderJobsChart = async event => {
    const completed = document.getElementById('jobs-completed').value
    const pending   = document.getElementById('jobs-pending').value
    const total     = document.getElementById('jobs-total').value
    const canvasEl  = document.getElementById('jobs-chart')
    if (!completed || !pending || !total || !canvasEl) {
        toast('warning', app.ERRORS.corrupt, 'Application Error', true)
        return;
    }
    if (canvasEl) {
        const jobs_data = [
            completed,
            pending,
            total,
        ]
        app.charts.projectJobs = new Chart(canvasEl.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: [`Complete`, `Pending`],
                datasets: [{
                    borderWidth: 0,
                    backgroundColor: [
                        'rgb(26 187 156)',
                        'rgb(79 111 141)',
                        'transparent'
                    ],
                    hoverOffset: 4,
                    rotation: -90,
                    data: jobs_data
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        })
    }
}

document.addEventListener('DOMContentLoaded', initProject, false)

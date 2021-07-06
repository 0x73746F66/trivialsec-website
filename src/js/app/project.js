const domainsAction = async event => {
    const domain_id = event.currentTarget.parent('tr').getAttribute('data-domain-id')
    location.href = `/domain/${domain_id}`
}
const projectArchiveButton = async event => {
    document.body.insertAdjacentHTML('afterbegin', `<div class="loading"></div>`)
    const project_id = event.currentTarget.parent('.project-actions').getAttribute('data-project-id')
    const json = await Api.post_async(`/v1/archive-project`, {
        project_id
    }).catch(() => {
        appMessage('error', 'An unexpected error occurred. Please refresh the page and try again.')
        document.querySelector('.loading').remove()
    })
    document.querySelector('.loading').remove()
    appMessage(json.status, json.message)
    if (json.status == 'error') {
        return;
    }
}
const toggleDomainAction = async event => {
    const toggleTd = event.currentTarget
    const toggleIconEl = toggleTd.querySelector('i')
    const domain_id = toggleTd.parent('tr').getAttribute('data-domain-id')
    let action = 'enable-domain'
    let classNameAlt = 'icofont-toggle-on'
    if (toggleIconEl.classList.contains('icofont-toggle-on')) {
        classNameAlt = 'icofont-toggle-off'
        action = 'disable-domain'
    }
    const json = await Api.post_async(`/v1/${action}`, {domain_id}).catch(()=>appMessage('error', 'An unexpected error occurred. Please refresh the page and try again.'))
    if (json.status != 'success') {
        appMessage(json.status, json.message)
        return;
    }
    toggleIconEl.classList.remove(toggleIconEl.className)
    toggleIconEl.classList.add(classNameAlt)
    toggleTd.title = action == 'disable-domain' ? 'Enable domain monitoring' : 'Disable domain monitoring'
}
const deleteDomainAction = async event => {
    const toggleTd = event.currentTarget
    const domain_id = toggleTd.parent('tr').getAttribute('data-domain-id')
    const json = await Api.post_async(`/v1/delete-domain`, {domain_id}).catch(()=>appMessage('error', 'An unexpected error occurred. Please refresh the page and try again.'))
    appMessage(json.status, json.message)
    if (json.status != 'success') {
        return;
    }
    toggleTd.parent('tr').remove()
}
const handleSocket = async data => {
    console.log(data)
    if (data.service_category == 'crawler' && data.state == 'completed') {
        const trEl = document.querySelector(`tr.disabled-events[data-domain-id="${data.id}"`)
        if (trEl) {
            location.reload()
        }
    }
}
let socket, socketio_token;
document.addEventListener('DOMContentLoaded', async() => {
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
    const findingsCanvasEl = document.querySelector('.findings-canvas canvas')
    if (findingsCanvasEl) {
        new Chart(findingsCanvasEl.getContext('2d'), {
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
                legend: {
                    display: false
                }
            }
        })
    }
    const jobsCanvasEl = document.querySelector('.jobs-canvas canvas')
    if (jobsCanvasEl) {
        new Chart(jobsCanvasEl.getContext('2d'), {
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
                    borderWidth: 0,
                    hoverOffset: 4,
                    rotation: -90,
                    data: jobs_data
                }]
            },
            options: {
                legend: {
                    display: false
                }
            }
        })
    }

}, false)

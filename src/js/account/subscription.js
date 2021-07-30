const saveBillingEmail = async event => {
    if (event.key && event.key !== 'Enter') return;
    event.preventDefault()
    const billingEmailEl = document.getElementById('billing_email')
    billingEmailEl.classList.remove('error')
    billingEmailEl.classList.remove('success')
    const billing_email = billingEmailEl.value
    const json = await PublicApi.post({
        target: '/account/update-billing-email',
        body: {billing_email}
    })
    if (json) {
        billingEmailEl.classList.add(json.status)
        toast(json.status, json.message)
    }
}

document.addEventListener('DOMContentLoaded', async() => {
    sidebar()
    livetime()
    setInterval(livetime, 1000)
    const emailChangeEl = document.getElementById('billing_email')
    emailChangeEl.addEventListener("change", saveBillingEmail, false)
    emailChangeEl.addEventListener('keypress', saveBillingEmail, false)
    const live_charts = {}
    for await(const ctx of document.querySelectorAll('.chart.half-doughnut canvas')) {
        const chart_key = ctx.dataset.key
        const data_used = document.querySelector(`[name=${chart_key}-used]`).value
        const data_total = document.querySelector(`[name=${chart_key}-total]`).value
        live_charts[chart_key] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [`${data_used} Used`, `${data_total - data_used} Remain`],
                datasets: [{
                    data: [
                        data_used,
                        data_total - data_used,
                        data_total,
                    ],
                    backgroundColor: [
                        'rgb(42 63 84)',
                        'rgb(26 187 156)',
                        'transparent'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4,
                    rotation: -90
                }]
            }
        })
    }

}, false)
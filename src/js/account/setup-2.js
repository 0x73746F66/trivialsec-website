const stripe = Stripe(app.stripePublishableKey)

const buttonActions = async(event) => {
    if (event.currentTarget.id == 'plan_enterprise') {
        toast('info', 'Please contact us to activate your Enterprise plan')
        return;
    }
    
    const json = await Api.post_async('/v1/checkout', {
        selection: event.currentTarget.id
    }).catch(()=>toast('error', 'An unexpected error occurred. Please refresh the page and try again.'))
    toast(json.status, json.message)
    if (json.status != 'success') {
        return;
    }
    if (!json.result || !json.result.hasOwnProperty('id')) {
        toast('error', 'Failed to start Checkout with Stripe.com')
        return;
    }
    stripe.redirectToCheckout({sessionId: json.result['id']}).then(result => {
        if (result.error.message) {
            toast('error', result.error.message)
        }
    })
}

document.addEventListener('DOMContentLoaded', async() => {
    sidebar()
    livetime()
    setInterval(livetime, 1000)
    document.querySelectorAll('select').forEach(el => { new Choices(el, { searchEnabled: true }) })
    for await(const el of document.querySelectorAll('button')) {
        el.addEventListener('click', buttonActions, false)
        el.addEventListener('touchstart', buttonActions, supportsPassive ? { passive: true } : false)
    }

}, false)

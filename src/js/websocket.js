const init_websocket = async() => {
    app.websocket = io(`${app.websocketScheme}${app.websocketDomain}`, { transports: ['websocket'] })
    app.websocket.on('disconnect', async reason => {
        console.debug(`Offline`, reason)
    })
    app.websocket.on('connect', async() => {
        app.websocket.emit('checkin', app.websocketUuid)
        console.debug(`Online`)
    })
}
document.addEventListener('DOMContentLoaded', init_websocket)

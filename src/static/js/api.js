/* API */
const app_domain = window.location.hostname == 'localhost' ? 'http://localhost:5000' : 'https://app.trivialsec.com'
const Api = Object.assign({
    get: async(path_uri, headers) => {
        const url = `${app_domain}${path_uri}`
        const response = await fetch(url, {
            credentials: 'omit',
            method: 'GET',
            headers: Object.assign({}, headers)
        })
        return await response.json()
    },
    post: async(path_uri, data, headers) => {
        const url = `${app_domain}${path_uri}`
        const json = JSON.stringify(data)
        const response = await fetch(url, {
            credentials: 'omit',
            method: 'POST',
            body: json,
            headers: Object.assign({'Content-Type': 'application/json'}, headers),
        })
        return await response.json()
    }
})
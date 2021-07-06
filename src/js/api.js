const api_version = "/v1", api_href = window.location.href.replace('www', 'api')
const Api = Object.assign({
    get: async (path_uri, headers) => {
        const url = `${api_href}/${api_version}${path_uri}`
        const response = await fetch(url, {
            mode: "cors",
            credentials: "omit",
            method: "GET",
            headers: Object.assign({}, headers)
        })
        return response.json()
    },
    post: async (path_uri, data, headers) => {
        const url = `${api_href}/${api_version}${path_uri}`
        const json = JSON.stringify(data)
        const response = await fetch(url, {
            mode: "cors",
            credentials: "omit",
            method: "POST",
            body: json,
            headers: Object.assign({ "Accept": "application/json", "Content-Type": "application/json" }, headers)
        })
        return response.json()
    }
})

export function getJson(url = "") {
    return fetch(url)
        .then((response) => response.json());
}

export function postJson(url = "", json = {}) {
    return fetch(url, {
        method: "POST",
        body: JSON.stringify(json),
        headers: {
            "Content-Type": "application/json"
        }
    });
}

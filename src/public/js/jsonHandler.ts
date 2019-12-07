export function getJson(url: string) {
    return fetch(url)
        .then((response) => response.json());
}

export function postJson(url: string, json) {
    return fetch(url, {
        method: "POST",
        body: JSON.stringify(json),
        headers: {
            "Content-Type": "application/json"
        }
    });
}

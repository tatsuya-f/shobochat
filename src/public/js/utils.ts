
export function hasChar(input: string): boolean {
    return input.trim() !== "";
}

export function escapeHTML(str : string): string {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#x27;");
    str = str.replace(/`/g, "&#x60;");
    return str;
}

export function changeTimeFormat(time : Date): string {
    const year = time.getFullYear();
    const month = time.getMonth() + 1;
    const day = time.getDate();
    const hour = time.getHours();
    const minites = time.getMinutes();

    return (year + "<sub>ねん</sub>" +
            month + "<sub>がつ</sub>" +
            day + "<sub>にち</sub>" +
            hour + "<sub>じ</sub>" +
            minites + "<sub>ふん</sub>");
}


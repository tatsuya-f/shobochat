
export function isPrime(num: number): boolean {
    if (num < 2) return false;

    for (let i: number = 2; i * i <= num;i++) {
        if (num % i === 0) {
            return false;
        }
    }
    return true;
}

const pattern = new RegExp(/(\d+)(は|って)素数(ですか|なの|かな|だよね|)(？|\?|。)/, "u");

export function extractNumFromPrimeQ(input: string): number | null {
    const match = pattern.exec(input);
    if (match !== null && match.length > 0) {
        return parseInt(match[1]);
    }
    return null;
}


export function primeCheck(num: number): boolean {
    if (num < 2) return false;

    for (let i: number = 2; i * i <= num;i++) {
        if (num % i === 0) return false;
    }

    return true;
}

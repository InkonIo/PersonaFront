export const getCorrectRatingWord = (count: number, t: unknown, lang: string): string => {
    if (lang === 'en') {
        return count === 1 ? 'rating' : 'ratings';
    }

    if (lang === 'kz') {
        return count === 1 ? 'баға' : 'бағалар';
    }

    // ru (default)
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'оценок';
    if (lastDigit === 1) return 'оценка';
    if (lastDigit >= 2 && lastDigit <= 4) return 'оценки';
    return 'оценок';
};
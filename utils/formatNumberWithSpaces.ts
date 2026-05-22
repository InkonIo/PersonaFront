export const formatNumberWithSpaces = (value: string) => {
    return value.replace(/\D/g, '')
        .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

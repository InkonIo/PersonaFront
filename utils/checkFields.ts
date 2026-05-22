export function checkFields(searchFields: any) {
    const emptyFields = [];

    for (const field in searchFields) {
        if (!searchFields[field]) {
            emptyFields.push(field);
        }
    }

    return emptyFields;
}
export const searchMapper = (searchFields: any) => {
    
    return {
        id: Number(searchFields.id) || null,
        login: searchFields.login || null,
        fullName: searchFields.fullName,
        statusId: searchFields.status?.id || null,
        cityId: (searchFields.city?.id && searchFields.city.id !== -1 && searchFields.city.id !== -2) ? searchFields.city.id : null,
        regionId: searchFields.city?.id === -2 ? searchFields.city?.regionId ?? null : null,
        countryId: searchFields.country?.id || null,
        workFieldId: searchFields.fieldOfWork?.id || null,
        maritalStatusId: searchFields.maritalStatuses?.id || null,
        professionsIds: searchFields.professions.length ? searchFields.professions.map((profession: any) => profession.id) : null,
        ageFrom: searchFields.ageFrom,
        ageTo: searchFields.ageTo,
        education: searchFields.educationAndCourses || "",
        skills: searchFields.experienceAndSkills || "",
        salaryFrom: searchFields.minDesiredIncome ? Number(searchFields.minDesiredIncome.replace(/\s/g, "")) : "",
        salaryTo: searchFields.maxDesiredIncome ? Number(searchFields.maxDesiredIncome.replace(/\s/g, "")) : "",
        dreamWork: searchFields.dreamWork,
        hobby: searchFields.hobby,
    }
}
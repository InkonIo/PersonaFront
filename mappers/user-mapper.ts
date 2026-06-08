export const userMapper = (user: any, imageUrl: string) => {
    return {
        login: user.login,
        fullName: user.fullName,
        dateOfBirth: user.dateOfBirth || undefined,
        password: user.password,
        city: user.city?.id || undefined,
        fieldOfWork: user.fieldOfWork?.id ?? null,
        professions: user.professions?.length ? user.professions.map((profession: any) => profession.id) : [],
        email: user?.email,
        linksToSocial: user?.linksToSocial,
        maritalStatus: user?.maritalStatus?.id || undefined,
        educationAndCourses: user?.educationAndCourses,
        experienceAndSkills: user?.experienceAndSkills,
        salary: {
            upper: user?.maxDesiredIncome ? Number(user.maxDesiredIncome.replace(/\s/g, "")) : null,
            lower: user?.minDesiredIncome ? Number(user.minDesiredIncome.replace(/\s/g, "")) : null
        },
        dreamWork: user?.dreamWork,
        hobby: user?.hobby,
        status: user?.status?.id ?? null,
        imageUrl
    }
}
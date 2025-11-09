const validateInputs = (joiSchema, dataToValidate) => {
    const { error } = joiSchema.validate(dataToValidate);
    if (error) {
        return error;
    }
    return false;
};
export default validateInputs;

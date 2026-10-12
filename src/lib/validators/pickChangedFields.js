const normalize = (val) => (val === "" || val === undefined ? null : val);

const isUnchanged = (next, previous) => normalize(next) === normalize(previous);

export const pickChangedFields = (formValues, loadedProfile, fieldNames) => {
    return fieldNames.reduce((changed, field) => {
        if (!isUnchanged(formValues?.[field], loadedProfile?.[field])) {
            changed[field] = normalize(formValues[field]);
        }
        return changed;
    }, {});
};

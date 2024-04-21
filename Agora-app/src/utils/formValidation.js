export function validateForm(formValues) {
	let errors = {};
	console.log(formValues);
	if (formValues.personId.length === 0) {

		errors.personIdLabel = "Field should not be empty";
	}
	if (formValues.voteId.length === 0) {
		errors.voteId = "Field should not be empty";
	}

	return errors;
}
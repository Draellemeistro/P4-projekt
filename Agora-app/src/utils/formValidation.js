export function validateForm(formValues) {
	let errors = {};

	// Check if personId is empty
	if (formValues.personId.length === 0) {
		errors.personIdLabel = "Field should not be empty";
	} else {
		// Check if personId is a valid SSIN
		const ssinPattern = /^(\d{2})(\d{2})(\d{2})\d{4}$/;
		if (!ssinPattern.test(formValues.personId)) {
			errors.personIdLabel = "Invalid SSIN. It should be a 10-digit number where the first six digits are the date of birth in the format DDMMYY.";
		} else {
			// Extract year, month, and day
			const [, day, month, year] = formValues.personId.match(ssinPattern);

			// Validate year, month, and day ranges
			const numericYear = parseInt(year, 10);
			const numericMonth = parseInt(month, 10);
			const numericDay = parseInt(day, 10);

			console.log("Year:", numericYear);
			console.log("Month:", numericMonth);
			console.log("Day:", numericDay);

			if (numericYear < 0 || numericYear > 99) {
				errors.personIdLabel = "Invalid year in SSIN.";
			}
			if (numericMonth < 1 || numericMonth > 12) {
				errors.personIdLabel = "Invalid month in SSIN.";
			}
			if (numericDay < 1 || numericDay > 31) {
				errors.personIdLabel = "Invalid day in SSIN.";
			}
		}
	}

	// Check if voteId is empty
	if (formValues.voteId.length === 0) {
		errors.voteId = "Field should not be empty";
	}

	return errors;
}
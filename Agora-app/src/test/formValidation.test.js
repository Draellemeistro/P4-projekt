import { test, assert } from 'vitest'
import { validateForm } from '../utils/formValidation.js';

test('validateForm returns no errors for valid SSIN and voteId', async () => {
	// Define valid form values
	const formValues = {
		personId: "0101011234", // valid SSIN
		voteId: "123456789"
	};

	// Validate the form values
	const errors = validateForm(formValues);

	// Check if no errors are returned
	assert(Object.keys(errors).length === 0);
});

test('validateForm returns errors for invalid SSIN', async () => {
	// Define invalid form values
	const formValues = {
		personId: "9999999999", // invalid SSIN
		voteId: "123456789"
	};

	// Validate the form values
	const errors = validateForm(formValues);

	// Check if errors are returned
	assert(errors.personIdLabel === "Invalid day in SSIN.");
});

test('validateForm returns errors for empty fields', async () => {
	// Define empty form values
	const formValues = {
		personId: "",
		voteId: ""
	};

	// Validate the form values
	const errors = validateForm(formValues);

	// Check if errors are returned
	assert(errors.personIdLabel === "Field should not be empty");
	assert(errors.voteId === "Field should not be empty");
});

test('validateForm returns errors for invalid month in SSIN', async () => {
	// Define form values with invalid month in SSIN
	const formValues = {
		personId: "0113011234", // invalid SSIN
		voteId: "123456789"
	};

	// Validate the form values
	const errors = validateForm(formValues);

	// Check if errors are returned
	assert(errors.personIdLabel === "Invalid month in SSIN.");
});
import { test, assert } from 'vitest'
import { login, logout, checkAuthentication } from '../utils/auth.js';

test('login function sets isAuthenticated to true', async () => {
	// Call the login function
	login();

	// Check if isAuthenticated is true
	const isAuthenticated = checkAuthentication();
	assert(isAuthenticated === true);
});

test('logout function sets isAuthenticated to false', async () => {
	// Call the logout function
	logout();

	// Check if isAuthenticated is false
	const isAuthenticated = checkAuthentication();
	assert(isAuthenticated === false);
});

test('checkAuthentication returns correct authentication status', async () => {
	// Initially, isAuthenticated should be false
	let isAuthenticated = checkAuthentication();
	assert(isAuthenticated === false);

	// After login, isAuthenticated should be true
	login();
	isAuthenticated = checkAuthentication();
	assert(isAuthenticated === true);

	// After logout, isAuthenticated should be false
	logout();
	isAuthenticated = checkAuthentication();
	assert(isAuthenticated === false);
});
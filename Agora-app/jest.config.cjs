module.exports = {
	testEnvironment: 'node',
	transform: {
		'^.+\\.js$': 'babel-jest',
	},
	moduleFileExtensions: ['js'],
	testMatch: ['**/tests/**/*.test.js'],
};
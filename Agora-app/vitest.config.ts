import 'isomorphic-fetch';

export default {
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'], // Include all test files in the src directory
	},
	plugins: [], // Add any Vitest plugins here
	server: {
		hmr: { overlay: false }, // Disable the HMR overlay
	},
}
module.exports = {
	preset: "jest-expo",
	setupFiles: ["<rootDir>/jest.setup.js"],
	transformIgnorePatterns: [
		"node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-redux)",
	],
	collectCoverage: true,
	collectCoverageFrom: [
		"app/**/*.{ts,tsx}",
		"src/components/**/*.{ts,tsx}",
		"!app/_layout.tsx",
		"!**/node_modules/**",
	],
	coverageReporters: ["lcov", "text", "html"], // 'html' sẽ tạo ra index.html cho artifact
	coverageDirectory: "coverage",
};

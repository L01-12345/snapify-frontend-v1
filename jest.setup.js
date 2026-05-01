// jest.setup.js

if (typeof global.structuredClone === "undefined") {
	global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
// 1. Phá vỡ lỗi __ExpoImportMetaRegistry của Expo Core
global.__ExpoImportMetaRegistry = {
	resolve: jest.fn(),
	get: jest.fn(),
};

// 2. Giả lập toàn cục Expo Router để không bao giờ chạy code Native
jest.mock("expo-router", () => ({
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
		back: jest.fn(),
	}),
	useLocalSearchParams: () => ({ id: "1" }),
	useFocusEffect: jest.fn((callback) =>
		require("react").useEffect(callback, []),
	),
	Redirect: "Redirect",
	Link: "Link",
}));

// 3. Giả lập các thư viện giao diện Native
jest.mock("expo-linear-gradient", () => ({
	LinearGradient: "LinearGradient",
}));

jest.mock("@expo/vector-icons", () => ({
	Feather: "Feather",
	Ionicons: "Ionicons",
}));

// 4. Giả lập Sentry để tránh lỗi ESM parsing trong Jest
jest.mock("@sentry/react-native", () => ({
	captureException: jest.fn(),
	captureEvent: jest.fn(),
	captureMessage: jest.fn(),
	addBreadcrumb: jest.fn(),
	setUser: jest.fn(),
	setContext: jest.fn(),
	setExtra: jest.fn(),
	setTag: jest.fn(),
	setTags: jest.fn(),
	startTransaction: jest.fn(),
	withScope: jest.fn((cb) => cb({ setTag: jest.fn(), setContext: jest.fn() })),
	init: jest.fn(),
	configureScope: jest.fn(),
	NativeTransport: jest.fn(),
	getCurrentHub: jest.fn(),
	startTransaction: jest.fn(),
}));

jest.mock("expo-camera", () => ({
	CameraView: "CameraView",
	useCameraPermissions: () => [{ granted: true }, jest.fn()],
}));

jest.mock("expo-image-manipulator", () => ({
	manipulateAsync: jest.fn(() =>
		Promise.resolve({ uri: "mock-compressed-uri.jpg" }),
	),
	SaveFormat: { JPEG: "jpeg" },
}));

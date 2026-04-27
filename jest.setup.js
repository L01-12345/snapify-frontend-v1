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
	useFocusEffect: jest.fn(),
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

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import OnboardingScreen from "../app/onboarding"; // Sửa lại đường dẫn nếu file nằm ở chỗ khác

// --- 1. MOCK REACT NATIVE (FLATLIST) ---
jest.mock("react-native", () => {
	const RN = jest.requireActual("react-native");
	// Ép FlatList thành ScrollView để Jest render toàn bộ các slide (bao gồm slide cuối)
	RN.FlatList = (props: any) => (
		<RN.ScrollView>
			{props.data.map((item: any, index: number) =>
				props.renderItem({ item, index }),
			)}
		</RN.ScrollView>
	);
	return RN;
});

// --- 2. MOCK CÁC THƯ VIỆN GIAO DIỆN ---
// Thay vì trả về string, ta trả về thẻ <View> hợp lệ của React Native
jest.mock("@expo/vector-icons", () => {
	const { View } = require("react-native");
	return { Feather: (props: any) => <View {...props} /> };
});

jest.mock("expo-linear-gradient", () => {
	const { View } = require("react-native");
	return { LinearGradient: (props: any) => <View {...props} /> };
});

// --- 3. MOCK EXPO ROUTER ---
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
	useRouter: jest.fn(() => ({ replace: mockReplace })),
}));

describe("OnboardingScreen - Deep Tests", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	// Kịch bản 1: Đảm bảo giao diện render đầy đủ (Không crash)
	it("renders correctly without crashing", () => {
		const { toJSON } = render(<OnboardingScreen />);
		expect(toJSON()).toBeDefined();
	});

	// Kịch bản 2: Render chính xác Text của Slide đầu tiên
	it("renders the first slide texts correctly", () => {
		const { getByText } = render(<OnboardingScreen />);

		expect(getByText("Snap it...\nthen lose it?")).toBeTruthy();
		expect(
			getByText(
				"You take hundreds of photos of lecture slides, whiteboards, and documents, but can never find them when needed.",
			),
		).toBeTruthy();
	});

	// Kịch bản 3: Tương tác với nút Skip
	it("navigates to login when Skip is pressed", () => {
		const { getByText } = render(<OnboardingScreen />);

		const skipButton = getByText("Skip");
		fireEvent.press(skipButton);

		expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
	});

	// Kịch bản 4: Render Button Get Started (Của slide cuối)
	it("renders Get Started button correctly", () => {
		const { getByText } = render(<OnboardingScreen />);

		// Nhờ mock FlatList ở trên, Jest giờ đã có thể thấy slide cuối cùng!
		expect(getByText("Ready to\nNote Smarter?")).toBeTruthy();
		expect(getByText("Get Started")).toBeTruthy();
	});
});

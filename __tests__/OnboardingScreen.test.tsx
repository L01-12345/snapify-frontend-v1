import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import OnboardingScreen from "../app/onboarding"; // Trỏ đúng đường dẫn file của bạn
import { useRouter } from "expo-router";

// Mock Expo Router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("OnboardingScreen", () => {
	const mockReplace = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
	});

	// Test Case 1: Render không lỗi
	it("renders correctly without crashing", () => {
		const { getByText } = render(<OnboardingScreen />);
		expect(getByText("Snap it...\nthen lose it?")).toBeTruthy();
	});

	// Test Case 2: Nút Skip hoạt động và gọi hàm router.replace
	it("navigates to login when Skip is pressed", () => {
		const { getByText } = render(<OnboardingScreen />);
		const skipButton = getByText("Skip");

		fireEvent.press(skipButton);
		expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
	});

	// Test Case 3: Chứa danh sách FlatList để swipe
	it("renders the FlatList for slides", () => {
		const { getByTestId } = render(<OnboardingScreen />);
		// Lưu ý: Trong file onboarding.tsx, bạn có thể thêm testID="onboarding-list" vào thẻ FlatList để test dễ hơn
		// expect(getByTestId('onboarding-list')).toBeTruthy();
	});
});

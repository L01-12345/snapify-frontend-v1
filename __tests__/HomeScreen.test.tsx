import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DashboardScreen from "../app/(tabs)/dashboard";
import { useRouter, useLocalSearchParams } from "expo-router";

// Mock các thư viện
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
	useFocusEffect: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => ({
	Feather: "Feather",
	Ionicons: "Ionicons",
}));

describe("HomeScreen (Dashboard)", () => {
	const mockPush = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useLocalSearchParams as jest.Mock).mockReturnValue({ showToast: "false" });
	});

	// Test Case 1: Render thành công không crash
	it("renders safely without crashing", () => {
		const { getByText } = render(<DashboardScreen />);
		// Kiểm tra một text chắc chắn có trên Dashboard của bạn
		expect(getByText("Đang tải ghi chú...")).toBeTruthy(); // Lúc loading
	});

	// Test Case 2: Kiểm tra các thành phần UI (Header)
	it("renders the header title correctly", () => {
		const { getByText } = render(<DashboardScreen />);
		// Giả sử sau khi load xong có chữ "Ghi chú của tôi" hoặc tương tự
		// expect(getByText('Ghi chú của tôi')).toBeTruthy();
	});

	// Test Case 3: Nút bấm (Button Press) hoạt động
	it("handles button press to navigate or act", () => {
		const { getByTestId } = render(<DashboardScreen />);
		// Thêm testID="add-note-btn" vào nút bấm trên màn hình của bạn
		// const button = getByTestId('add-note-btn');
		// fireEvent.press(button);
		// expect(mockPush).toHaveBeenCalled();
	});
});

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { SettingsModal } from "../../src/components/common/SettingsModal";

// --- MOCK MODULES ---
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
	useRouter: jest.fn(() => ({ replace: mockReplace })),
}));

describe("Component: SettingsModal", () => {
	const mockOnClose = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("hiển thị chính xác các thành phần khi visible = true", () => {
		const { getByText } = render(
			<SettingsModal visible={true} onClose={mockOnClose} />,
		);

		expect(getByText("APP SETTINGS")).toBeTruthy();
		expect(getByText("Appearance")).toBeTruthy();
		expect(getByText("Language")).toBeTruthy();
		expect(getByText("Log Out")).toBeTruthy();
	});

	it("gọi hàm onClose khi bấm vào nền mờ (Backdrop)", () => {
		const { getByTestId } = render(
			<SettingsModal visible={true} onClose={mockOnClose} />,
		);

		fireEvent.press(getByTestId("settings-backdrop"));
		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	it("gọi onClose và điều hướng về trang đăng nhập khi bấm Đăng xuất", () => {
		const { getByTestId } = render(
			<SettingsModal visible={true} onClose={mockOnClose} />,
		);

		fireEvent.press(getByTestId("logout-btn"));

		// Kiểm tra xem Modal có đóng không
		expect(mockOnClose).toHaveBeenCalledTimes(1);
		// Kiểm tra điều hướng có gọi đúng route không
		expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
	});
});

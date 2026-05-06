import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { SettingsModal } from "../../src/components/common/SettingsModal";

// --- MOCK MODULES ---
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
	useRouter: jest.fn(() => ({ replace: mockReplace })),
}));
jest.mock("react-redux", () => ({
	useDispatch: () => jest.fn(),
}));
jest.mock("expo-secure-store", () => ({
	deleteItemAsync: jest.fn(),
}));
jest.mock("../../src/store/slices/authSlice", () => ({
	logout: jest.fn(),
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

	it("gọi onClose và điều hướng về trang đăng nhập khi bấm Đăng xuất", async () => {
		const { getByTestId } = render(
			<SettingsModal visible={true} onClose={mockOnClose} />,
		);

		fireEvent.press(getByTestId("logout-btn"));

		// 2. Bọc expect trong waitFor để chờ hàm async xử lý xong
		await waitFor(() => {
			expect(mockOnClose).toHaveBeenCalledTimes(1);
			expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
		});
	});
	it("xử lý lỗi (catch) khi đăng xuất thất bại nhưng vẫn đóng modal và về trang login", async () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation(); // Chặn log đỏ ra màn hình console
		const SecureStore = require("expo-secure-store");

		// Giả lập SecureStore ném ra lỗi
		SecureStore.deleteItemAsync.mockRejectedValueOnce(new Error("Lỗi bộ nhớ"));

		const { getByTestId } = render(
			<SettingsModal visible={true} onClose={mockOnClose} />,
		);

		fireEvent.press(getByTestId("logout-btn"));

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalledWith(
				"Lỗi khi đăng xuất:",
				expect.any(Error),
			);
			expect(mockOnClose).toHaveBeenCalledTimes(1);
			expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
		});

		consoleSpy.mockRestore(); // Trả lại console.error như bình thường
	});
});

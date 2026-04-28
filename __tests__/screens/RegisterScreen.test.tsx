import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import RegisterScreen from "../../app/(auth)/register";
import { authApi } from "../../src/api/authApi";

// --- MOCK MODULES ---
jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
jest.mock("../../src/api/authApi", () => ({
	authApi: { register: jest.fn() },
}));
jest.spyOn(Alert, "alert");

describe("RegisterScreen - Đăng ký tài khoản", () => {
	const mockBack = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ back: mockBack });
	});

	it("đăng ký thành công và hiển thị popup yêu cầu đăng nhập", async () => {
		// Dùng Once để cô lập test
		(authApi.register as jest.Mock).mockResolvedValueOnce({
			status: "success",
		});

		const { getByTestId } = render(<RegisterScreen />);

		fireEvent.changeText(getByTestId("reg-name"), "Snapify User");
		fireEvent.changeText(getByTestId("reg-email"), "new@abc.com");
		fireEvent.changeText(getByTestId("reg-password"), "secret123");

		// BỌC ACT VÌ CÓ SET LOADING BẤT ĐỒNG BỘ
		await act(async () => {
			fireEvent.press(getByTestId("reg-btn"));
		});

		await waitFor(() => {
			expect(authApi.register).toHaveBeenCalledWith({
				email: "new@abc.com",
				password: "secret123",
				displayName: "Snapify User",
			});

			// Kiểm tra Alert có xuất hiện
			expect(Alert.alert).toHaveBeenCalledWith(
				"Success",
				"Your account has been created.",
				expect.any(Array), // Mảng chứa các nút bấm
			);
		});

		// Mô phỏng người dùng bấm nút "Log in now" trên Alert
		const alertCallArgs = (Alert.alert as jest.Mock).mock.calls[0];
		const loginNowButton = alertCallArgs[2][0];
		loginNowButton.onPress(); // Kích hoạt sự kiện bấm

		// Đảm bảo router.back() được gọi
		expect(mockBack).toHaveBeenCalled();
	});

	it("hiển thị báo lỗi khi đăng ký thất bại (trùng email...)", async () => {
		(authApi.register as jest.Mock).mockRejectedValueOnce(
			new Error("Email already exists"),
		);

		const { getByTestId } = render(<RegisterScreen />);

		fireEvent.changeText(getByTestId("reg-email"), "exist@abc.com");

		// BỌC ACT
		await act(async () => {
			fireEvent.press(getByTestId("reg-btn"));
		});

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Registration Error",
				"Email already exists",
			);
		});
	});

	it("quay lại trang đăng nhập khi bấm Log in ở footer", () => {
		const { getByText } = render(<RegisterScreen />);
		fireEvent.press(getByText("Log in"));
		expect(mockBack).toHaveBeenCalled();
	});

	it("hiển thị báo lỗi mặc định khi đăng ký thất bại không có message (Cover line 45)", async () => {
		// Reject với object rỗng {} để kích hoạt nhánh "|| Unable to create account."
		(authApi.register as jest.Mock).mockRejectedValueOnce({});

		const { getByTestId } = render(<RegisterScreen />);

		fireEvent.changeText(getByTestId("reg-email"), "test@abc.com");

		// BỌC ACT
		await act(async () => {
			fireEvent.press(getByTestId("reg-btn"));
		});

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Registration Error",
				"Unable to create account.",
			);
		});
	});
});

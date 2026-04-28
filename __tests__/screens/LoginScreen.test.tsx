import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useDispatch } from "react-redux";

import LoginScreen from "../../app/(auth)/login";
import { authApi } from "../../src/api/authApi";
import { setCredentials } from "../../src/store/slices/authSlice";

// --- MOCK MODULES ---
jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
jest.mock("react-redux", () => ({ useDispatch: jest.fn() }));

// Đảm bảo mock trả về Promise vì setItemAsync là hàm bất đồng bộ
jest.mock("expo-secure-store", () => ({
	setItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../src/api/authApi", () => ({
	authApi: { login: jest.fn() },
}));
jest.spyOn(Alert, "alert");
jest.mock("../../src/store/slices/authSlice", () => ({
	setCredentials: jest.fn(),
}));

describe("LoginScreen - Đăng nhập", () => {
	const mockReplace = jest.fn();
	const mockPush = jest.fn();
	const mockDispatch = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			replace: mockReplace,
			push: mockPush,
		});
		(useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
	});

	it("báo lỗi nếu để trống thông tin", () => {
		const { getByTestId } = render(<LoginScreen />);

		// Bấm login ngay mà không nhập gì
		fireEvent.press(getByTestId("login-btn"));

		expect(Alert.alert).toHaveBeenCalledWith(
			"Error",
			"Please enter all required information.",
		);
		expect(authApi.login).not.toHaveBeenCalled();
	});

	it("đăng nhập thành công, lưu token, dispatch Redux và chuyển hướng", async () => {
		const mockResponse = {
			data: { token: "mock-jwt-token", user: { id: 1, name: "John" } },
		};

		// Dùng Once để tránh rò rỉ dữ liệu sang bài test khác
		(authApi.login as jest.Mock).mockResolvedValueOnce(mockResponse);

		const { getByTestId } = render(<LoginScreen />);

		fireEvent.changeText(getByTestId("login-email"), "test@abc.com");
		fireEvent.changeText(getByTestId("login-password"), "123456");

		// QUAN TRỌNG: Bọc sự kiện bấm nút gọi API trong act() để triệt tiêu cảnh báo console.error trên CI/CD
		await act(async () => {
			fireEvent.press(getByTestId("login-btn"));
		});

		await waitFor(() => {
			// 1. Gọi API đúng params
			expect(authApi.login).toHaveBeenCalledWith({
				email: "test@abc.com",
				password: "123456",
			});
			// 2. Lưu token vào SecureStore
			expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
				"access_token",
				"mock-jwt-token",
			);
			// 3. Dispatch Redux
			expect(mockDispatch).toHaveBeenCalledWith(
				setCredentials({
					user: mockResponse.data.user,
					token: mockResponse.data.token,
				}),
			);
			// 4. Chuyển hướng vào app
			expect(mockReplace).toHaveBeenCalledWith("/(tabs)/dashboard");
		});
	});

	it("báo lỗi khi sai tài khoản / mật khẩu", async () => {
		(authApi.login as jest.Mock).mockRejectedValueOnce(
			new Error("Invalid credentials"),
		);

		const { getByTestId } = render(<LoginScreen />);

		fireEvent.changeText(getByTestId("login-email"), "test@abc.com");
		fireEvent.changeText(getByTestId("login-password"), "wrong-pass");

		// Bọc trong act() tương tự
		await act(async () => {
			fireEvent.press(getByTestId("login-btn"));
		});

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Login Failed",
				"Invalid credentials",
			);
			expect(mockReplace).not.toHaveBeenCalled();
		});
	});

	it("chuyển sang trang đăng ký khi bấm Sign up", () => {
		const { getByText } = render(<LoginScreen />);
		fireEvent.press(getByText("Sign up"));
		expect(mockPush).toHaveBeenCalledWith("/register");
	});
});

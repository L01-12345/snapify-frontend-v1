import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useDispatch } from "react-redux";

import LoginScreen from "../../app/(auth)/login";
import { authApi } from "../../src/api/authApi";
import { setCredentials } from "../../src/store/slices/authSlice";

// --- MOCK MODULES CƠ BẢN ---
jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
jest.mock("react-redux", () => ({ useDispatch: jest.fn() }));
jest.spyOn(Alert, "alert");

jest.mock("expo-secure-store", () => ({
	setItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../src/api/authApi", () => ({
	authApi: { login: jest.fn() },
}));

jest.mock("../../src/store/slices/authSlice", () => ({
	setCredentials: jest.fn(),
}));

// --- MOCK CÁC THƯ VIỆN & COMPONENT UI GÂY LỖI (Sentry, Icons, Logo) ---
jest.mock("@sentry/react-native", () => ({
	setUser: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => {
	const { View } = require("react-native");
	return { AntDesign: (props: any) => <View testID="mock-icon" {...props} /> };
});

jest.mock("react-native-safe-area-context", () => {
	const { View } = require("react-native");
	return {
		SafeAreaView: ({ children, style }: any) => (
			<View style={style}>{children}</View>
		),
	};
});

jest.mock("../../src/components/common/Logo", () => {
	const { View } = require("react-native");
	return { Logo: () => <View testID="mock-logo" /> };
});

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

		(authApi.login as jest.Mock).mockResolvedValueOnce(mockResponse);

		const { getByTestId } = render(<LoginScreen />);

		fireEvent.changeText(getByTestId("login-email"), "test@abc.com");
		fireEvent.changeText(getByTestId("login-password"), "123456");

		await act(async () => {
			fireEvent.press(getByTestId("login-btn"));
		});

		await waitFor(() => {
			expect(authApi.login).toHaveBeenCalledWith({
				email: "test@abc.com",
				password: "123456",
			});
			expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
				"access_token",
				"mock-jwt-token",
			);
			expect(mockDispatch).toHaveBeenCalledWith(
				setCredentials({
					user: mockResponse.data.user,
					token: mockResponse.data.token,
				}),
			);
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

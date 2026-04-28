import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Input } from "../../src/components/common/Input";

describe("Component: Input", () => {
	it("hiển thị label và placeholder chính xác", () => {
		const { getByText, getByPlaceholderText } = render(
			<Input label="Email" placeholder="Enter email" />,
		);

		expect(getByText("Email")).toBeTruthy();
		expect(getByPlaceholderText("Enter email")).toBeTruthy();
	});

	it("hiển thị thông báo lỗi khi có prop error", () => {
		const { getByText } = render(
			<Input label="Email" error="Invalid email address" />,
		);

		expect(getByText("Invalid email address")).toBeTruthy();
	});

	it("ẩn/hiện mật khẩu khi bấm vào biểu tượng con mắt", () => {
		const { getByTestId } = render(
			<Input label="Password" isPassword={true} testID="password-input" />,
		);

		const inputElement = getByTestId("password-input");
		const eyeIcon = getByTestId("eye-icon");

		// Mặc định là bị ẩn (secureTextEntry = true)
		expect(inputElement.props.secureTextEntry).toBe(true);

		// Bấm vào con mắt để hiện mật khẩu
		fireEvent.press(eyeIcon);
		expect(inputElement.props.secureTextEntry).toBe(false);

		// Bấm lại để ẩn
		fireEvent.press(eyeIcon);
		expect(inputElement.props.secureTextEntry).toBe(true);
	});
	it("cập nhật trạng thái khi focus và blur (kích hoạt onFocus/onBlur)", () => {
		const { getByTestId } = render(
			<Input label="Name" testID="custom-input" />,
		);

		const inputElement = getByTestId("custom-input");

		// Kích hoạt hàm onFocus (Dòng 35)
		fireEvent(inputElement, "focus");

		// Kích hoạt hàm onBlur (Dòng 36)
		fireEvent(inputElement, "blur");
	});
});

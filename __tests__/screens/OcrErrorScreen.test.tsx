import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import OcrErrorScreen from "../../app/ocr-error";

// --- MOCK MODULES ---
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => {
	const { Text } = require("react-native");
	return { Feather: ({ name }: { name: string }) => <Text>{name}</Text> };
});

describe("OcrErrorScreen - Lỗi nhận diện chữ", () => {
	const mockBack = jest.fn();
	const mockPush = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			back: mockBack,
			push: mockPush,
		});
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			imageUri: "file://test-document.jpg",
		});
	});

	it("hiển thị chính xác các thông báo lỗi và mẹo chụp ảnh", () => {
		const { getByText } = render(<OcrErrorScreen />);

		// Kiểm tra tiêu đề và phụ đề
		expect(getByText("No Text Detected")).toBeTruthy();
		expect(getByText(/We couldn't extract any readable text/i)).toBeTruthy();

		// Kiểm tra Tips
		expect(getByText("TIPS FOR BETTER SCAN")).toBeTruthy();
		expect(getByText("Ensure good lighting")).toBeTruthy();
		expect(getByText("Keep the camera steady")).toBeTruthy();
	});

	it("quay lại trang trước khi bấm nút X", () => {
		const { getByText } = render(<OcrErrorScreen />);

		// Biểu tượng X được mock thành chữ "x"
		fireEvent.press(getByText("x"));
		expect(mockBack).toHaveBeenCalledTimes(1);
	});

	it("điều hướng sang màn hình Camera khi chọn Retake Photo", () => {
		const { getByText } = render(<OcrErrorScreen />);

		fireEvent.press(getByText("Retake Photo"));
		expect(mockPush).toHaveBeenCalledWith("/snap");
	});

	it("điều hướng sang màn hình New Note kèm theo ảnh khi chọn Enter Manually", () => {
		const { getByText } = render(<OcrErrorScreen />);
		fireEvent.press(getByText("Enter Manually"));

		expect(mockPush).toHaveBeenCalledWith({
			pathname: "/note/new",
			params: { imageUri: "file://test-document.jpg" },
		});
	});
});

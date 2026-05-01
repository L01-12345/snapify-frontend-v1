import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Platform } from "react-native";

import PdfDetailsScreen from "../../app/pdf-details";

// --- MOCK MODULES ---
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

// Mock WebView vì đây là Native Component không thể chạy thẳng trong Jest
jest.mock("react-native-webview", () => {
	const { View } = require("react-native");
	return { WebView: (props: any) => <View testID="mock-webview" {...props} /> };
});

// Mock Icon để dễ dàng tìm kiếm nút Back bằng tên icon
jest.mock("@expo/vector-icons", () => {
	const { Text } = require("react-native");
	return { Feather: ({ name }: { name: string }) => <Text>{name}</Text> };
});

describe("PdfDetailsScreen - Xem trước PDF", () => {
	const mockBack = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ back: mockBack });
		// Reset Platform OS về mặc định là iOS để dễ test
		Platform.OS = "ios";
	});

	it("hiển thị WebView và tiêu đề khi có truyền pdfUrl", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			pdfUrl: "https://example.com/test.pdf",
			title: "Tài liệu Toán",
		});

		const { getByText, getByTestId } = render(<PdfDetailsScreen />);

		// Kiểm tra tiêu đề hiển thị đúng
		expect(getByText("Tài liệu Toán")).toBeTruthy();

		// Kiểm tra WebView được render
		expect(getByTestId("mock-webview")).toBeTruthy();

		// Kiểm tra Loading text vẫn còn (do WebView chưa gọi onLoadEnd trong môi trường test)
		expect(getByText("Loading document...")).toBeTruthy();
	});

	it("hiển thị URL qua Google Docs Viewer nếu đang ở thiết bị Android", () => {
		Platform.OS = "android";
		const testUrl = "https://example.com/test.pdf";
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			pdfUrl: testUrl,
			title: "Tài liệu Android",
		});

		const { getByTestId } = render(<PdfDetailsScreen />);
		const webview = getByTestId("mock-webview");

		// Trên Android, URL phải bị kẹp vào link Google Docs Viewer
		expect(webview.props.source.uri).toContain("docs.google.com/gview");
		expect(webview.props.source.uri).toContain(encodeURIComponent(testUrl));
	});

	it("hiển thị giao diện lỗi nếu không truyền pdfUrl", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			pdfUrl: "",
			title: "",
		});

		const { getByText, queryByTestId } = render(<PdfDetailsScreen />);

		// Không hiển thị WebView
		expect(queryByTestId("mock-webview")).toBeNull();

		// Hiển thị lỗi và tiêu đề mặc định
		expect(getByText("No PDF URL provided")).toBeTruthy();
		expect(getByText("PDF Document")).toBeTruthy(); // Mặc định khi không truyền title
	});

	it("gọi hàm router.back() khi bấm nút quay lại", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			pdfUrl: "url",
			title: "title",
		});
		const { getByText } = render(<PdfDetailsScreen />);

		// Tìm nút back thông qua chữ "arrow-left" từ mock Feather
		fireEvent.press(getByText("arrow-left"));
		expect(mockBack).toHaveBeenCalledTimes(1);
	});
});

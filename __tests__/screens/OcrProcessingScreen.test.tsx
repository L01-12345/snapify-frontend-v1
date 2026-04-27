import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert, Animated } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

// Import component và API
import OcrProcessingScreen from "../../app/ocr-processing";
import { noteApi } from "../../src/api/noteApi";

// ---------------------------------------------------------
// 1. MOCK CÁC THƯ VIỆN BÊN NGOÀI
// ---------------------------------------------------------

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

jest.mock("../../src/api/noteApi", () => ({
	noteApi: {
		snapAndAutoCategorize: jest.fn(),
	},
}));

// Mock Alert
jest.spyOn(Alert, "alert");

// Tắt vòng lặp Animation của React Native để test không bị treo (timeout)
jest.spyOn(Animated, "loop").mockImplementation(
	() =>
		({
			start: jest.fn(),
			stop: jest.fn(),
			reset: jest.fn(),
		}) as any,
);

describe("OcrProcessingScreen - Màn hình xử lý ảnh", () => {
	const mockPush = jest.fn();
	const mockReplace = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			push: mockPush,
			replace: mockReplace,
		});
	});

	// --- KỊCH BẢN 1: GIAO DIỆN & ANIMATION KHỞI TẠO ---
	it("hiển thị đúng giao diện Processing và bỏ qua gọi API nếu không có ảnh", async () => {
		// Giả lập không có imageUri được truyền vào
		(useLocalSearchParams as jest.Mock).mockReturnValue({});

		const { getByText } = render(<OcrProcessingScreen />);

		// Kiểm tra UI render đúng
		expect(getByText("Smart OCR")).toBeTruthy();
		expect(getByText("Processing...")).toBeTruthy();
		expect(getByText("Extracting text from image")).toBeTruthy();

		// Do không có imageUri nên API tuyệt đối không được gọi
		await waitFor(() => {
			expect(noteApi.snapAndAutoCategorize).not.toHaveBeenCalled();
		});
	});

	// --- KỊCH BẢN 2: HAPPY PATH (XỬ LÝ THÀNH CÔNG) ---
	it("gọi API OCR và chuyển hướng sang trang chi tiết Note khi thành công", async () => {
		// Giả lập có ảnh truyền sang
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			imageUri: "file://document.jpg",
		});

		// Giả lập API xử lý ảnh thành công, tạo ra noteId mới
		(noteApi.snapAndAutoCategorize as jest.Mock).mockResolvedValue({
			id: "note-999",
		});

		render(<OcrProcessingScreen />);

		// Đợi quá trình gọi API và xử lý
		await waitFor(() => {
			// 1. Kiểm tra API được gọi với tham số chuẩn xác
			expect(noteApi.snapAndAutoCategorize).toHaveBeenCalledWith(
				"file://document.jpg",
				"scanned_document.jpg",
				"image/jpeg",
			);

			// 2. Phải chuyển hướng sang màn hình Note Detail thay vì ocr-error
			expect(mockReplace).toHaveBeenCalledWith("/note/note-999");
			// Đảm bảo không hiển thị cảnh báo lỗi
			expect(Alert.alert).not.toHaveBeenCalled();
		});
	});

	// --- KỊCH BẢN 3: ERROR PATH (XỬ LÝ THẤT BẠI) ---
	it("hiển thị Alert và chuyển sang màn hình ocr-error khi xử lý thất bại", async () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			imageUri: "file://document.jpg",
		});

		// Giả lập API lỗi (ví dụ ảnh mờ hoặc server sập)
		(noteApi.snapAndAutoCategorize as jest.Mock).mockRejectedValue(
			new Error("Extract Failed"),
		);

		render(<OcrProcessingScreen />);

		await waitFor(() => {
			expect(noteApi.snapAndAutoCategorize).toHaveBeenCalled();

			// 1. Alert phải hiện lên để thông báo
			expect(Alert.alert).toHaveBeenCalledWith(
				"Processing Error",
				"Unable to extract text from the image.",
			);

			// 2. Chuyển hướng sang màn hình báo lỗi chi tiết
			expect(mockReplace).toHaveBeenCalledWith("ocr-error");
		});
	});

	// --- KỊCH BẢN 4: HỦY BỎ GIỮA CHỪNG ---
	it("quay về trang chủ Dashboard khi nhấn nút Cancel", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			imageUri: "file://document.jpg",
		});

		const { getByTestId } = render(<OcrProcessingScreen />);

		// Nhấn nút Cancel
		fireEvent.press(getByTestId("cancel-btn"));

		// Kiểm tra Router push về Dashboard
		expect(mockPush).toHaveBeenCalledWith("/(tabs)/dashboard");
	});
});

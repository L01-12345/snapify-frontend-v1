import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert, Animated } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import OcrProcessingScreen from "../../app/ocr-processing";
import { noteApi } from "../../src/api/noteApi";

// --- 1. MOCK CÁC THƯ VIỆN BÊN NGOÀI ---
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

// Tắt vòng lặp Animation của React Native
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

	// --- KỊCH BẢN 1: BỎ QUA GỌI API NẾU KHÔNG CÓ ẢNH ---
	it("hiển thị giao diện Processing và bỏ qua gọi API nếu không có ảnh", async () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({});

		const { getByText } = render(<OcrProcessingScreen />);

		// UI khởi tạo
		expect(getByText("Processing...")).toBeTruthy();

		await waitFor(() => {
			// Đảm bảo không gọi API nếu thiếu imageUri
			expect(noteApi.snapAndAutoCategorize).not.toHaveBeenCalled();
		});
	});

	// --- KỊCH BẢN 2: HAPPY PATH (XỬ LÝ THÀNH CÔNG) ---
	it("gọi API OCR và chuyển hướng sang trang chi tiết Note khi thành công", async () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			imageUri: "file://document.jpg",
		});

		// SỬ DỤNG 'Once' ĐỂ KHÔNG RÒ RỈ DỮ LIỆU SANG TEST KHÁC
		(noteApi.snapAndAutoCategorize as jest.Mock).mockResolvedValueOnce({
			id: "note-999",
		});

		render(<OcrProcessingScreen />);

		await waitFor(() => {
			expect(noteApi.snapAndAutoCategorize).toHaveBeenCalledWith(
				"file://document.jpg",
				"scanned_document.jpg",
				"image/jpeg",
			);
			// Chuyển sang route chi tiết Note
			expect(mockReplace).toHaveBeenCalledWith("/note/note-999");
		});
	});

	// --- KỊCH BẢN 3: ERROR PATH (XỬ LÝ THẤT BẠI) ---
	it("hiển thị Alert và chuyển sang màn hình ocr-error khi xử lý thất bại", async () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			imageUri: "file://document.jpg",
		});

		// SỬ DỤNG 'Once' ĐỂ BÁO LỖI CHÍNH XÁC
		(noteApi.snapAndAutoCategorize as jest.Mock).mockRejectedValueOnce(
			new Error("Extract Failed"),
		);

		render(<OcrProcessingScreen />);

		await waitFor(() => {
			expect(noteApi.snapAndAutoCategorize).toHaveBeenCalled();

			// Kiểm tra popup báo lỗi
			expect(Alert.alert).toHaveBeenCalledWith(
				"Processing Error",
				"Unable to extract text from the image.",
			);

			// KHỚP CHÍNH XÁC VỚI CODE CỦA BẠN: router.replace("ocr-error")
			expect(mockReplace).toHaveBeenCalledWith("ocr-error");
		});
	});

	// --- KỊCH BẢN 4: HỦY BỎ GIỮA CHỪNG ---
	it("quay về trang chủ Dashboard khi nhấn nút Cancel", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			imageUri: "file://document.jpg",
		});

		const { getByText } = render(<OcrProcessingScreen />);

		// Nhấn nút Cancel (Dùng getByText cho tiện, khỏi cần testID)
		fireEvent.press(getByText("Cancel"));

		expect(mockPush).toHaveBeenCalledWith("/(tabs)/dashboard");
	});
});

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Animated } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import OcrProcessingScreen from "../../app/ocr-processing";
import { noteApi } from "../../src/api/noteApi";

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

jest.mock("../../src/api/noteApi", () => ({
	noteApi: {
		snapAndAutoCategorize: jest.fn(),
		getNoteStatus: jest.fn(), // MOCK THÊM HÀM POLLING
	},
}));

jest
	.spyOn(Animated, "loop")
	.mockImplementation(
		() => ({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() }) as any,
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
		// Kích hoạt cỗ máy thời gian để test setInterval
		jest.useFakeTimers();
	});

	afterEach(() => {
		// Tắt cỗ máy thời gian sau mỗi test case
		jest.useRealTimers();
	});

	// --- KỊCH BẢN 1: BỎ QUA ---
	it("hiển thị giao diện Processing và bỏ qua gọi API nếu không có ảnh", async () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({});
		const { getByText } = render(<OcrProcessingScreen />);
		expect(getByText("Processing...")).toBeTruthy();
		await waitFor(() => {
			expect(noteApi.snapAndAutoCategorize).not.toHaveBeenCalled();
		});
	});

	// --- KỊCH BẢN 2: HAPPY PATH (XỬ LÝ THÀNH CÔNG VỚI POLLING) ---
	it("gọi API OCR, thực hiện polling và chuyển hướng sang trang chi tiết Note", async () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			imageUri: "file://document.jpg",
		});

		// 1. Mock Upload trả về "Vé giữ xe" (draft)
		(noteApi.snapAndAutoCategorize as jest.Mock).mockResolvedValueOnce({
			id: "draft-999",
		});

		// 2. Mock Polling trả về trạng thái THÀNH CÔNG
		(noteApi.getNoteStatus as jest.Mock).mockResolvedValueOnce({
			data: { id: "note-999", status: "ACTIONED" },
		});

		render(<OcrProcessingScreen />);

		// Đợi hàm Upload được gọi
		await waitFor(() => {
			expect(noteApi.snapAndAutoCategorize).toHaveBeenCalled();
		});

		// TUA NHANH THỜI GIAN 3 GIÂY để kích hoạt setInterval
		jest.advanceTimersByTime(3000);

		await waitFor(() => {
			// Kiểm tra đã gọi hỏi thăm đúng ID
			expect(noteApi.getNoteStatus).toHaveBeenCalledWith("draft-999");
			// Chuyển sang route chi tiết Note
			expect(mockReplace).toHaveBeenCalledWith("/note/note-999");
		});
	});

	// --- KỊCH BẢN 3: ERROR PATH (UPLOAD HOẶC POLLING THẤT BẠI) ---
	it("chuyển sang màn hình ocr-error kèm ảnh khi xử lý thất bại", async () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			imageUri: "file://document.jpg",
		});

		// Giả lập Upload lỗi ngay từ đầu
		(noteApi.snapAndAutoCategorize as jest.Mock).mockRejectedValueOnce(
			new Error("Upload Failed"),
		);

		render(<OcrProcessingScreen />);

		await waitFor(() => {
			expect(noteApi.snapAndAutoCategorize).toHaveBeenCalled();

			// Kiểm tra điều hướng có mang theo params
			expect(mockReplace).toHaveBeenCalledWith({
				pathname: "/ocr-error",
				params: { imageUri: "file://document.jpg" },
			});
		});
	});

	// --- KỊCH BẢN 4: HỦY BỎ ---
	it("quay về trang chủ Dashboard khi nhấn nút Cancel", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			imageUri: "file://document.jpg",
		});
		const { getByText } = render(<OcrProcessingScreen />);
		fireEvent.press(getByText("Cancel"));
		expect(mockPush).toHaveBeenCalledWith("/(tabs)/dashboard");
	});
});

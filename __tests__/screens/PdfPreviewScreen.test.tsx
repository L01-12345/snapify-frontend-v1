import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

// Import component màn hình và API
import PdfPreviewScreen from "../../app/pdf-preview";
import { batchApi } from "../../src/api/batchApi";

// ---------------------------------------------------------
// 1. MOCK CÁC THƯ VIỆN & API
// ---------------------------------------------------------

// Mock expo-router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

// Mock batchApi
jest.mock("../../src/api/batchApi", () => ({
	batchApi: {
		scanBatch: jest.fn(),
	},
}));

// Mock Alert
jest.spyOn(Alert, "alert");

// Mock Vector Icons
jest.mock("@expo/vector-icons", () => ({
	Feather: "Feather",
}));

describe("PdfPreviewScreen - Tạo file PDF", () => {
	const mockReplace = jest.fn();
	const mockBack = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			replace: mockReplace,
			back: mockBack,
		});
	});

	// --- KỊCH BẢN 1: KHÔNG CÓ HÌNH ẢNH NÀO ---
	it("hiển thị thông báo rỗng và báo lỗi khi nhấn lưu nếu không có ảnh", () => {
		// Giả lập params không có mảng images
		(useLocalSearchParams as jest.Mock).mockReturnValue({});

		const { getByText } = render(<PdfPreviewScreen />);

		// UI phải hiện chữ "No images available."
		expect(getByText("No images available.")).toBeTruthy();

		// Bấm nút Save
		fireEvent.press(getByText("Save PDF to Snapify"));

		// Phải văng ra Alert báo lỗi chứ không được gọi API
		expect(Alert.alert).toHaveBeenCalledWith(
			"Error",
			"No images available to create a PDF.",
		);
		expect(batchApi.scanBatch).not.toHaveBeenCalled();
	});

	// --- KỊCH BẢN 2: RENDER CÓ HÌNH ẢNH VÀ TÊN FILE MẶC ĐỊNH ---
	it("hiển thị đúng tên file mặc định và số lượng trang khi có ảnh truyền vào", () => {
		const mockImages = ["file://image1.jpg", "file://image2.jpg"];
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			images: JSON.stringify(mockImages),
		});

		const { getByDisplayValue, getByText } = render(<PdfPreviewScreen />);

		// Tên file mặc định phải là Scanned_Document.pdf
		expect(getByDisplayValue("Scanned_Document.pdf")).toBeTruthy();

		// Do có 2 ảnh nên mảng map sẽ render ra số trang 1 và 2 (trong text của Badge)
		expect(getByText("1")).toBeTruthy();
		expect(getByText("2")).toBeTruthy();
	});

	// --- KỊCH BẢN 3: HAPPY PATH - ĐỔI TÊN VÀ LƯU THÀNH CÔNG ---
	it("đổi tên file, gọi API tạo PDF thành công và chuyển về Dashboard", async () => {
		const mockImages = ["file://test-img.jpg"];
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			images: JSON.stringify(mockImages),
		});

		// Giả lập API chạy thành công
		(batchApi.scanBatch as jest.Mock).mockResolvedValue({ status: "success" });

		const { getByText, getByTestId } = render(<PdfPreviewScreen />);

		// Hành động 1: Người dùng sửa tên file
		const nameInput = getByTestId("filename-input");
		fireEvent.changeText(nameInput, "Math_Homework.pdf");

		// Hành động 2: Nhấn Save
		fireEvent.press(getByText("Save PDF to Snapify"));

		await waitFor(() => {
			// 1. Kiểm tra API được gọi đúng Payload
			expect(batchApi.scanBatch).toHaveBeenCalledWith({
				title: "Math_Homework.pdf", // Tên mới đã được cập nhật
				images: [
					{
						uri: "file://test-img.jpg",
						name: "page_1.jpg",
						type: "image/jpeg",
					},
				],
			});

			// 2. Chuyển hướng về Dashboard và truyền kèm trigger bật Toast
			expect(mockReplace).toHaveBeenCalledWith({
				pathname: "/(tabs)/dashboard",
				params: {
					showToast: "true",
					batchId: undefined,
					batchTitle: undefined,
				},
			});
		});
	});

	// --- KỊCH BẢN 4: LỖI SERVER KHI TẠO PDF ---
	it("hiển thị lỗi khi API tạo PDF thất bại", async () => {
		const mockImages = ["file://test-img.jpg"];
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			images: JSON.stringify(mockImages),
		});

		// Giả lập API lỗi
		(batchApi.scanBatch as jest.Mock).mockRejectedValue(
			new Error("Server Error"),
		);

		const { getByText } = render(<PdfPreviewScreen />);

		fireEvent.press(getByText("Save PDF to Snapify"));

		await waitFor(() => {
			expect(batchApi.scanBatch).toHaveBeenCalled();
			// Không được chuyển trang
			expect(mockReplace).not.toHaveBeenCalled();
			// Báo lỗi cho người dùng
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Unable to create PDF. Please try again.",
			);
		});
	});

	// --- KỊCH BẢN 5: NÚT BACK HOẠT ĐỘNG ---
	it("quay lại trang trước khi bấm nút Back", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({ images: "[]" });
		const { getByTestId } = render(<PdfPreviewScreen />);

		fireEvent.press(getByTestId("back-btn"));
		expect(mockBack).toHaveBeenCalled();
	});
});

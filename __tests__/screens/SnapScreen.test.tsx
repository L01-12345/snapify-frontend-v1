import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useCameraPermissions } from "expo-camera";

// Import component màn hình của bạn
import SnapToNoteScreen from "../../app/snap";

// ---------------------------------------------------------
// 1. MOCK CÁC THƯ VIỆN BÊN NGOÀI
// ---------------------------------------------------------

// Mock expo-router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

// Tạo 1 mock function cho hàm takePictureAsync của CameraView
const mockTakePictureAsync = jest.fn();

// Mock expo-camera
jest.mock("expo-camera", () => {
	const React = require("react");
	const { View } = require("react-native");

	return {
		useCameraPermissions: jest.fn(),
		// Dùng forwardRef để giả lập component CameraView và gắn hàm mock vào ref của nó
		CameraView: React.forwardRef((props, ref) => {
			React.useImperativeHandle(ref, () => ({
				takePictureAsync: mockTakePictureAsync,
			}));
			return <View testID="camera-view" {...props} />;
		}),
	};
});

// Mock Vector Icons để tránh lỗi render icon
jest.mock("@expo/vector-icons", () => ({
	Feather: "Feather",
	Ionicons: "Ionicons",
}));

describe("SnapToNoteScreen - Giao diện chụp ảnh", () => {
	const mockPush = jest.fn();
	const mockBack = jest.fn();
	const mockRequestPermission = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			push: mockPush,
			back: mockBack,
		});
	});

	// --- KỊCH BẢN 1: CHƯA CẤP QUYỀN CAMERA ---
	it("hiển thị màn hình xin quyền khi chưa có quyền Camera", () => {
		// Giả lập quyền granted = false
		(useCameraPermissions as jest.Mock).mockReturnValue([
			{ granted: false },
			mockRequestPermission,
		]);

		const { getByText } = render(<SnapToNoteScreen />);

		// Kiểm tra dòng text xin quyền có xuất hiện không
		expect(
			getByText("Snapify needs camera access to scan documents."),
		).toBeTruthy();

		// Bấm nút xin quyền và kiểm tra hàm requestPermission có được gọi không
		fireEvent.press(getByText("Grant Camera Access"));
		expect(mockRequestPermission).toHaveBeenCalled();
	});

	// --- KỊCH BẢN 2: RENDER GIAO DIỆN KHI ĐÃ CẤP QUYỀN ---
	it("hiển thị giao diện camera khi đã có quyền", () => {
		// Giả lập quyền granted = true
		(useCameraPermissions as jest.Mock).mockReturnValue([
			{ granted: true },
			mockRequestPermission,
		]);

		const { getByText, getByTestId } = render(<SnapToNoteScreen />);

		// Phải thấy các dòng text hướng dẫn
		expect(getByText("Focus on Document")).toBeTruthy();
		expect(getByText("(Align within brackets)")).toBeTruthy();

		// Phải có nút chụp ảnh
		expect(getByTestId("shutter-btn")).toBeTruthy();
	});

	// --- KỊCH BẢN 3: HAPPY PATH - CHỤP ẢNH VÀ CHUYỂN TRANG ---
	it("chụp ảnh và truyền URI sang trang ocr-processing", async () => {
		(useCameraPermissions as jest.Mock).mockReturnValue([
			{ granted: true },
			mockRequestPermission,
		]);

		// Giả lập camera chụp ra 1 bức ảnh thành công
		mockTakePictureAsync.mockResolvedValue({
			uri: "file://fake-photo-uri.jpg",
		});

		const { getByTestId } = render(<SnapToNoteScreen />);

		// Hành động: Bấm nút chụp ảnh
		const shutterBtn = getByTestId("shutter-btn");
		fireEvent.press(shutterBtn);

		await waitFor(() => {
			// 1. Đảm bảo hàm chụp ảnh của Expo Camera được gọi với tham số nén ảnh
			expect(mockTakePictureAsync).toHaveBeenCalledWith({
				quality: 0.7,
				base64: false,
			});

			// 2. Đảm bảo router push sang đúng trang và mang theo imageUri
			expect(mockPush).toHaveBeenCalledWith({
				pathname: "/ocr-processing",
				params: { imageUri: "file://fake-photo-uri.jpg" },
			});
		});
	});

	// --- KỊCH BẢN 4: CHỤP ẢNH LỖI HOẶC BỊ HỦY ---
	it("không chuyển trang nếu quá trình chụp ảnh bị lỗi hoặc không trả về ảnh", async () => {
		(useCameraPermissions as jest.Mock).mockReturnValue([
			{ granted: true },
			mockRequestPermission,
		]);

		// Giả lập camera bị lỗi hoặc người dùng vuốt bỏ (trả về undefined/null)
		mockTakePictureAsync.mockResolvedValue(null);

		const { getByTestId } = render(<SnapToNoteScreen />);

		fireEvent.press(getByTestId("shutter-btn"));

		await waitFor(() => {
			expect(mockTakePictureAsync).toHaveBeenCalled();
			// Router KHÔNG ĐƯỢC CHẠY
			expect(mockPush).not.toHaveBeenCalled();
		});
	});

	// --- KỊCH BẢN 5: NÚT BACK HOẠT ĐỘNG ---
	it("quay lại màn hình trước khi bấm nút Back (X)", () => {
		(useCameraPermissions as jest.Mock).mockReturnValue([
			{ granted: true },
			mockRequestPermission,
		]);

		const { getByTestId } = render(<SnapToNoteScreen />);

		fireEvent.press(getByTestId("back-btn"));
		expect(mockBack).toHaveBeenCalled();
	});
});

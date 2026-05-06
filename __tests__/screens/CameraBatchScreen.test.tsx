import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert, Animated } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";

// Import component màn hình
import CameraBatchScreen from "../../app/camera-batch";

// ---------------------------------------------------------
// 1. MOCK CÁC THƯ VIỆN BÊN NGOÀI
// ---------------------------------------------------------

// Mock expo-router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

// Mock expo-image-manipulator
jest.mock("expo-image-manipulator", () => ({
	manipulateAsync: jest.fn(),
	SaveFormat: { JPEG: "jpeg" },
}));

// Mock hàm chụp ảnh của CameraView
const mockTakePictureAsync = jest.fn();

// Mock expo-camera
jest.mock("expo-camera", () => {
	const React = require("react");
	const { View } = require("react-native");
	return {
		useCameraPermissions: jest.fn(),
		CameraView: React.forwardRef((props, ref) => {
			React.useImperativeHandle(ref, () => ({
				takePictureAsync: mockTakePictureAsync,
			}));
			return <View testID="camera-view" {...props} />;
		}),
	};
});

// Mock Alert
jest.spyOn(Alert, "alert");

// Tắt cảnh báo vòng lặp Animation của React Native trong lúc chạy test
jest.spyOn(Animated, "loop").mockImplementation(
	() =>
		({
			start: jest.fn(),
			stop: jest.fn(),
			reset: jest.fn(),
		}) as any,
);

describe("CameraBatchScreen - Chụp và nén nhiều ảnh", () => {
	const mockPush = jest.fn();
	const mockBack = jest.fn();
	const mockRequestPermission = jest.fn();
	const mockReplace = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			push: mockPush,
			back: mockBack,
			replace: mockReplace,
		});
		(useLocalSearchParams as jest.Mock).mockReturnValue({});
	});

	// --- KỊCH BẢN 1: CHƯA CẤP QUYỀN CAMERA ---
	it("hiển thị màn hình xin quyền và gọi requestPermission khi nhấn", () => {
		(useCameraPermissions as jest.Mock).mockReturnValue([
			{ granted: false },
			mockRequestPermission,
		]);

		const { getByText } = render(<CameraBatchScreen />);

		expect(
			getByText("We need your permission to show the camera"),
		).toBeTruthy();

		fireEvent.press(getByText("Grant Permission"));
		expect(mockRequestPermission).toHaveBeenCalled();
	});

	// --- KỊCH BẢN 2: BẤM DONE KHI CHƯA CHỤP ẢNH NÀO ---
	it("hiển thị Alert cảnh báo nếu nhấn Done mà chưa có ảnh", () => {
		(useCameraPermissions as jest.Mock).mockReturnValue([
			{ granted: true },
			mockRequestPermission,
		]);

		const { getByTestId } = render(<CameraBatchScreen />);

		// Nhấn nút Done ngay lập tức
		fireEvent.press(getByTestId("done-btn"));

		expect(Alert.alert).toHaveBeenCalledWith(
			"Notice",
			"Please capture at least one image.",
		);
		expect(mockPush).not.toHaveBeenCalled();
	});

	// --- KỊCH BẢN 3: HAPPY PATH - CHỤP VÀ NÉN ẢNH THÀNH CÔNG ---
	it("chụp ảnh, nén ảnh thành công và hiển thị bộ đếm (badge)", async () => {
		(useCameraPermissions as jest.Mock).mockReturnValue([
			{ granted: true },
			mockRequestPermission,
		]);

		// Giả lập Camera trả về ảnh gốc
		mockTakePictureAsync.mockResolvedValue({ uri: "file://raw-image.jpg" });

		// Giả lập ImageManipulator nén ảnh thành công
		(ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
			uri: "file://compressed-image.jpg",
		});

		const { getByTestId, getByText } = render(<CameraBatchScreen />);

		// Nhấn nút chụp
		fireEvent.press(getByTestId("capture-btn"));

		await waitFor(() => {
			// Đảm bảo hàm chụp được gọi với chất lượng = 1 (Gốc)
			expect(mockTakePictureAsync).toHaveBeenCalledWith({ quality: 1 });

			// Đảm bảo hàm nén được gọi với đúng cấu hình (width 1080, compress 0.7)
			expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
				"file://raw-image.jpg",
				[{ resize: { width: 1080 } }],
				{ compress: 0.7, format: "jpeg" },
			);

			// UI phải hiện lên số "1" trên Badge
			expect(getByText("1")).toBeTruthy();
		});
	});

	// --- KỊCH BẢN 4: LƯU VÀ CHUYỂN TRANG THÀNH CÔNG ---
	it("chuyển sang trang batch-preview và truyền đúng mảng ảnh đã nén", async () => {
		(useCameraPermissions as jest.Mock).mockReturnValue([
			{ granted: true },
			mockRequestPermission,
		]);

		mockTakePictureAsync.mockResolvedValue({ uri: "file://raw.jpg" });
		(ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
			uri: "file://compressed-1.jpg",
		});

		const { getByTestId } = render(<CameraBatchScreen />);

		// 1. Chụp bức ảnh thứ nhất
		fireEvent.press(getByTestId("capture-btn"));

		// Đợi ảnh 1 xử lý xong
		await waitFor(() =>
			expect(ImageManipulator.manipulateAsync).toHaveBeenCalledTimes(1),
		);

		// 2. Chụp tiếp bức ảnh thứ hai (đổi mock data 1 chút)
		(ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
			uri: "file://compressed-2.jpg",
		});
		fireEvent.press(getByTestId("capture-btn"));

		// Đợi ảnh 2 xử lý xong
		await waitFor(() =>
			expect(ImageManipulator.manipulateAsync).toHaveBeenCalledTimes(2),
		);

		// 3. Nhấn nút Done
		fireEvent.press(getByTestId("done-btn"));

		// Đảm bảo router push sang đúng trang và truyền mảng 2 ảnh
		expect(mockPush).toHaveBeenCalledWith({
			pathname: "/batch-preview",
			params: {
				images: JSON.stringify([
					"file://compressed-1.jpg",
					"file://compressed-2.jpg",
				]),
			},
		});
	});

	// --- KỊCH BẢN 5: LỖI KHI CHỤP ẢNH ---
	it("hiển thị lỗi nếu quá trình chụp ảnh thất bại", async () => {
		(useCameraPermissions as jest.Mock).mockReturnValue([
			{ granted: true },
			mockRequestPermission,
		]);

		// Giả lập Camera văng lỗi
		mockTakePictureAsync.mockRejectedValue(new Error("Camera Error"));

		const { getByTestId } = render(<CameraBatchScreen />);
		fireEvent.press(getByTestId("capture-btn"));

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Failed to capture image.",
			);
		});
	});

	// --- KỊCH BẢN 6: NÚT BACK HOẠT ĐỘNG ---
	it("quay lại màn hình trước khi nhấn nút Back", () => {
		(useCameraPermissions as jest.Mock).mockReturnValue([
			{ granted: true },
			mockRequestPermission,
		]);

		const { getByTestId } = render(<CameraBatchScreen />);
		fireEvent.press(getByTestId("back-btn"));

		expect(mockReplace).toHaveBeenCalledWith("/dashboard");
	});
});

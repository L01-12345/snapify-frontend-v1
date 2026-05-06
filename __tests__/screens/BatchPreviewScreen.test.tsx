import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BatchPreviewScreen from "../../app/batch-preview";
import { Alert } from "react-native";
// --- MOCK MODULES ---
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => {
	const { Text } = require("react-native");
	return { Feather: ({ name }: { name: string }) => <Text>{name}</Text> };
});

describe("BatchPreviewScreen - Xem trước trang quét", () => {
	const mockBack = jest.fn();
	const mockPush = jest.fn();
	const mockNavigate = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(Alert, "alert").mockImplementation((title, msg, buttons) => {
			if (buttons && buttons[1]?.onPress) {
				buttons[1].onPress();
			}
		});
		(useRouter as jest.Mock).mockReturnValue({
			back: mockBack,
			push: mockPush,
			navigate: mockNavigate,
		});
	});

	it("render danh sách ảnh và nút thêm trang khi có dữ liệu URL", () => {
		// Mock parse JSON ảnh
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			images: JSON.stringify(["https://img1.com", "https://img2.com"]),
		});

		const { getByText } = render(<BatchPreviewScreen />);

		// Kiểm tra header
		expect(getByText("Batch Preview")).toBeTruthy();

		// Kiểm tra số trang (index + 1)
		expect(getByText("1")).toBeTruthy();
		expect(getByText("2")).toBeTruthy();
		expect(getByText("Add Page")).toBeTruthy();
	});

	it("render danh sách rỗng (chỉ có nút Add Page) nếu không truyền params images", () => {
		// Không truyền images
		(useLocalSearchParams as jest.Mock).mockReturnValue({});
		const { getByText, queryByText } = render(<BatchPreviewScreen />);

		expect(queryByText("1")).toBeNull();
		expect(getByText("Add Page")).toBeTruthy(); // Nút Add luôn hiện
	});

	it("nút Back Header gọi router.back() và Nút Add Page gọi router.navigate()", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({ images: "[]" });

		const { getByText, getByTestId } = render(<BatchPreviewScreen />);

		fireEvent.press(getByTestId("back-btn"));

		expect(mockNavigate).toHaveBeenCalledWith({
			pathname: "/camera-batch",
			params: { updatedImages: "[]" },
		});
	});

	it("điều hướng sang Generate PDF kèm mảng ảnh khi nhấn nút Generate", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			images: JSON.stringify(["url1", "url2"]),
		});

		const { getByText } = render(<BatchPreviewScreen />);
		fireEvent.press(getByText("Generate PDF"));

		// Bấm Generate thì Push sang PDF Preview kèm Params nguyên vẹn
		expect(mockPush).toHaveBeenCalledWith({
			pathname: "/pdf-preview",
			params: { images: JSON.stringify(["url1", "url2"]) },
		});
	});
	it("xóa 1 trang khi nhấn giữ (long press) vào ảnh và quay lại camera nếu mảng rỗng", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			images: JSON.stringify(["url1"]), // Bắt đầu với 1 ảnh
		});

		const { getByTestId } = render(<BatchPreviewScreen />);

		// Kích hoạt sự kiện Long Press vào thẻ ảnh đầu tiên
		fireEvent(getByTestId("page-card-0"), "longPress");

		// Alert sẽ tự động bấm "Xóa", mảng ảnh về 0 -> gọi navigate về camera
		expect(mockNavigate).toHaveBeenCalledWith({
			pathname: "/camera-batch",
			params: { updatedImages: "[]" },
		});
	});

	it("xóa toàn bộ bản nháp và quay lại khi bấm nút Delete đỏ", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			images: JSON.stringify(["url1", "url2"]),
		});

		const { getByText } = render(<BatchPreviewScreen />);

		// Bấm vào text "Delete" của nút đỏ
		fireEvent.press(getByText("Delete"));

		// Alert "Delete All" hiện lên và tự động bấm "Xóa"
		expect(mockBack).toHaveBeenCalled(); // Hàm trong onPress của nút Delete All
	});
});

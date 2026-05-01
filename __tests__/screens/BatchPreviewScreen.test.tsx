import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BatchPreviewScreen from "../../app/batch-preview";

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

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			back: mockBack,
			push: mockPush,
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

	it("nút Back Header và Nút Add Page gọi hàm router.back()", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({ images: "[]" });
		const { getByText } = render(<BatchPreviewScreen />);

		// Bấm Back ở Header
		fireEvent.press(getByText("arrow-left"));
		expect(mockBack).toHaveBeenCalledTimes(1);

		// Bấm Add Page
		fireEvent.press(getByText("Add Page"));
		expect(mockBack).toHaveBeenCalledTimes(2);
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
});

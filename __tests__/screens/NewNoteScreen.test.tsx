import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import NewNoteScreen from "../../app/note/new";
import { noteApi } from "../../src/api/noteApi";

// --- MOCK MODULES ---
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(() => ({})),
}));
jest.mock("../../src/api/noteApi", () => ({
	noteApi: { createNote: jest.fn() },
}));
jest.spyOn(Alert, "alert");
jest.mock("@expo/vector-icons", () => ({ Feather: "Feather" }));
jest.mock("../../src/components/common/FolderSelectModal", () => {
	const { View, TouchableOpacity } = require("react-native");
	return {
		FolderSelectModal: ({ visible, onSelect }: any) => {
			if (!visible) return null;
			return (
				<View testID="mock-folder-modal">
					<TouchableOpacity
						testID="select-work"
						onPress={() => onSelect({ id: "f-work", name: "Work", icon: "💼" })}
					/>
					<TouchableOpacity
						testID="select-null"
						onPress={() => onSelect(null)}
					/>
				</View>
			);
		},
	};
});

describe("NewNoteScreen - Tạo ghi chú mới", () => {
	const mockBack = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ back: mockBack });
	});

	it("báo lỗi nếu lưu khi chưa nhập tiêu đề", async () => {
		const { getByTestId } = render(<NewNoteScreen />);

		// BỌC ACT: Dù không gọi API nhưng hàm handleSave là async
		await act(async () => {
			fireEvent.press(getByTestId("save-btn"));
		});

		expect(Alert.alert).toHaveBeenCalledWith(
			"Error",
			"Please enter a note title.",
		);
		expect(noteApi.createNote).not.toHaveBeenCalled();
	});

	it("tạo ghi chú thành công và quay lại trang trước", async () => {
		// DÙNG Once ĐỂ TRÁNH RÒ RỈ PROMISE
		(noteApi.createNote as jest.Mock).mockResolvedValueOnce({
			status: "success",
		});

		const { getByTestId } = render(<NewNoteScreen />);

		// Nhập dữ liệu
		fireEvent.changeText(getByTestId("title-input"), "Meeting Notes");
		fireEvent.changeText(
			getByTestId("content-input"),
			"Discuss about Q3 plan.",
		);

		// BỌC ACT DO CÓ STATE UPDATE (setIsSaving)
		await act(async () => {
			fireEvent.press(getByTestId("save-btn"));
		});

		await waitFor(() => {
			// Đảm bảo API được gọi đúng cấu trúc
			expect(noteApi.createNote).toHaveBeenCalledWith({
				title: "Meeting Notes",
				content: "Discuss about Q3 plan.",
			});
			// Đảm bảo chuyển trang thành công
			expect(mockBack).toHaveBeenCalled();
		});
	});

	it("hiển thị Alert lỗi nếu gọi API thất bại", async () => {
		// DÙNG Once
		(noteApi.createNote as jest.Mock).mockRejectedValueOnce(
			new Error("Network Error"),
		);

		const { getByTestId } = render(<NewNoteScreen />);

		fireEvent.changeText(getByTestId("title-input"), "Valid Title");

		// BỌC ACT
		await act(async () => {
			fireEvent.press(getByTestId("save-btn"));
		});

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith("Save Error", "Network Error");
			expect(mockBack).not.toHaveBeenCalled(); // Không được thoát trang nếu lỗi
		});
	});

	it("quay về trang trước khi bấm Cancel", async () => {
		const { getByTestId } = render(<NewNoteScreen />);

		// BỌC ACT
		await act(async () => {
			fireEvent.press(getByTestId("cancel-btn"));
		});

		expect(mockBack).toHaveBeenCalled();
	});
	it("mở FolderSelectModal, cập nhật UI khi chọn thư mục và gửi đủ dữ liệu khi Save", async () => {
		(noteApi.createNote as jest.Mock).mockResolvedValueOnce({
			status: "success",
		});

		const { getByText, getByTestId, queryByTestId } = render(<NewNoteScreen />);

		// 1. Nhập tiêu đề
		fireEvent.changeText(getByTestId("title-input"), "My Folder Note");

		// 2. Bấm vào nút Badge (hiện chữ Uncategorized) để mở Modal
		fireEvent.press(getByText("Uncategorized"));
		expect(getByTestId("mock-folder-modal")).toBeTruthy();

		// 3. Chọn thư mục Work
		fireEvent.press(getByTestId("select-work"));

		// Modal đóng và hiển thị chữ Work
		await waitFor(() => {
			expect(queryByTestId("mock-folder-modal")).toBeNull();
			expect(getByText("Work")).toBeTruthy();
			// expect(getByText("💼")).toBeTruthy();
		});

		// 4. Bấm Save
		await act(async () => {
			fireEvent.press(getByTestId("save-btn"));
		});

		// 5. Kiểm tra API gửi đi có đính kèm folderId
		await waitFor(() => {
			expect(noteApi.createNote).toHaveBeenCalledWith({
				title: "My Folder Note",
				content: "",
				folderId: "f-work", // Dữ liệu quan trọng nhất để ăn điểm Coverage
			});
		});
	});

	it("chọn null từ FolderModal sẽ reset về Uncategorized", async () => {
		const { getByText, getByTestId } = render(<NewNoteScreen />);
		fireEvent.press(getByText("Uncategorized")); // Mở modal
		fireEvent.press(getByTestId("select-null")); // Chọn Null

		await waitFor(() => {
			expect(getByText("Uncategorized")).toBeTruthy(); // Quay về mặc định
		});
	});
	// --- KỊCH BẢN: NHẬN ẢNH TỪ LỖI OCR & PHÓNG TO ---
	it("hiển thị ảnh ban đầu nếu có imageUri từ params và cho phép phóng to", async () => {
		// Giả lập params có chứa imageUri
		const { useLocalSearchParams } = require("expo-router");
		useLocalSearchParams.mockReturnValue({ imageUri: "file://error-doc.jpg" });

		const { getByText, getByTestId, queryByTestId } = render(<NewNoteScreen />);

		// 1. Đảm bảo UI hiển thị thẻ Original Image
		await waitFor(() => {
			expect(getByText("Original Image")).toBeTruthy();
		});

		// Nút đóng Zoom ban đầu chưa có vì Modal đang tắt
		expect(queryByTestId("zoom-close-btn")).toBeNull();

		// 2. Bấm vào khung ảnh để phóng to
		fireEvent.press(getByTestId("new-image-thumbnail"));

		// 3. Modal Zoom hiện lên
		await waitFor(() => {
			expect(getByTestId("zoom-close-btn")).toBeTruthy();
		});

		// 4. Bấm nút tắt Zoom
		fireEvent.press(getByTestId("zoom-close-btn"));
		await waitFor(() => {
			expect(queryByTestId("zoom-close-btn")).toBeNull();
		});
	});
});

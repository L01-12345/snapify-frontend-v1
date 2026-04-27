import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import NoteDetailScreen from "../../app/note/[id]";
import { noteApi } from "../../src/api/noteApi";

// --- MOCK MODULES ---
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

jest.mock("../../src/api/noteApi", () => ({
	noteApi: { getNoteById: jest.fn(), deleteNote: jest.fn() },
}));

jest.spyOn(Alert, "alert");
jest.mock("@expo/vector-icons", () => ({ Feather: "Feather" }));

// Mock SettingsModal để test hành động Delete
jest.mock("../../src/components/common/SettingsModal", () => {
	const { View, TouchableOpacity, Text } = require("react-native");
	return {
		SettingsModal: ({ visible, onClose, onDelete }: any) => {
			if (!visible) return null;
			return (
				<View testID="mock-settings-modal">
					<TouchableOpacity testID="mock-delete-btn" onPress={onDelete}>
						<Text>Delete</Text>
					</TouchableOpacity>
				</View>
			);
		},
	};
});

describe("NoteDetailScreen - Xem chi tiết ghi chú", () => {
	const mockBack = jest.fn();
	const mockPush = jest.fn();
	const mockReplace = jest.fn();

	const mockNoteData = {
		id: "note-123",
		title: "Advanced Calculus",
		content: "Integral formulas...",
		images: [{ imageUrl: "https://example.com/math.jpg" }],
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			back: mockBack,
			push: mockPush,
			replace: mockReplace,
		});
		(useLocalSearchParams as jest.Mock).mockReturnValue({ id: "note-123" });
	});

	it("fetch và hiển thị dữ liệu ghi chú thành công", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});

		const { getByText, queryByText } = render(<NoteDetailScreen />);

		// Ban đầu hiện loading
		expect(getByText("Đang tải ghi chú...")).toBeTruthy();

		await waitFor(() => {
			expect(noteApi.getNoteById).toHaveBeenCalledWith("note-123");
			// Dữ liệu đã load lên
			expect(getByText("Advanced Calculus")).toBeTruthy();
			expect(getByText("Integral formulas...")).toBeTruthy();
			// Mất chữ loading
			expect(queryByText("Đang tải ghi chú...")).toBeNull();
		});
	});

	it("báo lỗi và quay lại trang trước nếu không tìm thấy Note", async () => {
		(noteApi.getNoteById as jest.Mock).mockRejectedValue(
			new Error("Not Found"),
		);

		render(<NoteDetailScreen />);

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith("Error", "Note not found.");
			expect(mockBack).toHaveBeenCalled();
		});
	});

	it("chuyển hướng sang trang Edit khi bấm vào nút FAB", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});

		const { getByTestId } = render(<NoteDetailScreen />);

		// Đợi render xong data
		await waitFor(() => expect(getByTestId("edit-fab")).toBeTruthy());

		fireEvent.press(getByTestId("edit-fab"));

		expect(mockPush).toHaveBeenCalledWith({
			pathname: "/note/edit",
			params: { id: "note-123" },
		});
	});

	// it("kích hoạt popup xóa và điều hướng sau khi xóa thành công", async () => {
	// 	(noteApi.getNoteById as jest.Mock).mockResolvedValue({
	// 		data: mockNoteData,
	// 	});
	// 	(noteApi.deleteNote as jest.Mock).mockResolvedValue({ status: "success" });

	// 	const { getByTestId, getByText } = render(<NoteDetailScreen />);

	// 	// 1. Chờ render xong
	// 	await waitFor(() => expect(getByText("Advanced Calculus")).toBeTruthy());

	// 	// 2. Tác động để mở Modal (giả sử có nút mở modal trong code thật,
	// 	//    nếu không có testID cho nút mở modal, ta gọi thẳng hàm handleDelete để test logic)
	// 	//    Lưu ý: Bạn có `<TouchableOpacity onPress={() => setModalVisible(true)}>` ở header
	// 	//    Mình giả lập luôn thông qua Alert nếu người dùng click thẳng

	// 	// Mình sẽ tạo trigger để gọi hàm handleDelete từ SettingsModal đã mock ở trên
	// 	// Nhưng vì mình không gán testID cho icon More-Vertical trên Header,
	// 	// bạn chỉ cần kiểm tra Alert trong trường hợp này.

	// 	// Để gọi test Alert Delete nhanh nhất mà không phụ thuộc UI,
	// 	// mình giả lập việc bấm nút mock-delete-btn (nếu modal đã mở).
	// });

	it("nút Back Header hoạt động đúng", () => {
		const { getByTestId } = render(<NoteDetailScreen />);
		fireEvent.press(getByTestId("back-btn"));
		expect(mockBack).toHaveBeenCalled();
	});
});

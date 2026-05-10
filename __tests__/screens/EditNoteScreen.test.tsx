// __tests__/screens/EditNoteScreen.test.tsx
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import EditNoteScreen from "../../app/note/edit";
import { noteApi } from "../../src/api/noteApi";
import { folderApi } from "../../src/api/folderApi";

// --- MOCK MODULES ---
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

jest.mock("../../src/api/noteApi", () => ({
	noteApi: { getNoteById: jest.fn(), updateNote: jest.fn() },
}));
jest.mock("../../src/api/folderApi", () => ({
	folderApi: { getFolders: jest.fn() },
}));

jest.spyOn(Alert, "alert");
jest.mock("@expo/vector-icons", () => ({ Feather: "Feather" }));

// MOCK FolderSelectModal
jest.mock("../../src/components/common/FolderSelectModal", () => {
	const { View, TouchableOpacity } = require("react-native");
	return {
		FolderSelectModal: ({ visible, onSelect, onClose }: any) => {
			if (!visible) return null;
			return (
				<View testID="mock-folder-modal">
					<TouchableOpacity
						testID="mock-select-personal"
						onPress={() => onSelect({ id: "99", name: "Personal", icon: "🏠" })}
					/>
					<TouchableOpacity
						testID="mock-select-null"
						onPress={() => onSelect(null)}
					/>
					<TouchableOpacity testID="mock-close-modal" onPress={onClose} />
				</View>
			);
		},
	};
});

describe("EditNoteScreen - Chỉnh sửa ghi chú", () => {
	const mockBack = jest.fn();

	const mockNoteData = {
		id: "note-1",
		title: "Old Title",
		content: "Old Content",
		images: [{ imageUrl: "https://mock-image.com/1.jpg" }],
		folderId: null,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ back: mockBack });
		(useLocalSearchParams as jest.Mock).mockReturnValue({ id: "note-1" });
		(folderApi.getFolders as jest.Mock).mockResolvedValue({ data: [] });
	});

	it("tải dữ liệu note ban đầu và hiển thị lên UI thành công", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});

		const { getByDisplayValue, getByTestId, getByText } = render(
			<EditNoteScreen />,
		);

		await waitFor(() => {
			expect(noteApi.getNoteById).toHaveBeenCalledWith("note-1");
			expect(getByDisplayValue("Old Title")).toBeTruthy();
			expect(getByDisplayValue("Old Content")).toBeTruthy();
			expect(getByTestId("image-thumbnail")).toBeTruthy();
			expect(getByText("📁 Uncategorized")).toBeTruthy();
		});
	});

	it("tải note có folderId và map đúng tên thư mục từ API folder", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: { ...mockNoteData, folderId: "f1" },
		});
		(folderApi.getFolders as jest.Mock).mockResolvedValue({
			data: [{ id: "f1", name: "Work Docs", icon: "💼" }],
		});

		const { getByText } = render(<EditNoteScreen />);

		await waitFor(() => {
			expect(folderApi.getFolders).toHaveBeenCalled();
			expect(getByText("💼 Work Docs")).toBeTruthy();
		});
	});

	it("hiển thị Alert lỗi nếu không tải được dữ liệu", async () => {
		(noteApi.getNoteById as jest.Mock).mockRejectedValue(
			new Error("Network error"),
		);
		render(<EditNoteScreen />);
		await waitFor(() =>
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Unable to load content.",
			),
		);
	});

	it("cho phép sửa title/content, gọi API updateNote và quay lại trang trước", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});
		(noteApi.updateNote as jest.Mock).mockResolvedValue({ status: "success" });

		const { getByTestId } = render(<EditNoteScreen />);
		await waitFor(() =>
			expect(getByTestId("title-input").props.value).toBe("Old Title"),
		);

		fireEvent.changeText(getByTestId("title-input"), "New Title");
		fireEvent.changeText(getByTestId("content-input"), "New Content Update");
		fireEvent.press(getByTestId("save-btn"));

		await waitFor(() => {
			expect(noteApi.updateNote).toHaveBeenCalledWith("note-1", {
				title: "New Title",
				content: "New Content Update",
				folderId: null,
			});
			expect(mockBack).toHaveBeenCalled();
		});
	});

	it("hiển thị Alert lỗi cụ thể nếu lưu thất bại", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});
		(noteApi.updateNote as jest.Mock).mockRejectedValue(
			new Error("Save Failed"),
		);

		const { getByTestId } = render(<EditNoteScreen />);
		await waitFor(() => expect(getByTestId("save-btn")).toBeTruthy());

		fireEvent.press(getByTestId("save-btn"));
		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith("Error", "Save Failed");
			expect(mockBack).not.toHaveBeenCalled();
		});
	});

	it("hiển thị Alert lỗi mặc định nếu API update fail không trả về message", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});
		(noteApi.updateNote as jest.Mock).mockRejectedValue({}); // Lỗi rỗng

		const { getByTestId } = render(<EditNoteScreen />);
		await waitFor(() => expect(getByTestId("save-btn")).toBeTruthy());

		fireEvent.press(getByTestId("save-btn"));
		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith("Error", "Lỗi lưu ghi chú");
		});
	});

	it("bật và tắt Modal phóng to ảnh (Lightbox)", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});

		const { getByTestId, queryByTestId } = render(<EditNoteScreen />);
		await waitFor(() => expect(getByTestId("image-thumbnail")).toBeTruthy());

		expect(queryByTestId("zoom-close-btn")).toBeNull();
		fireEvent.press(getByTestId("image-thumbnail"));
		expect(getByTestId("zoom-close-btn")).toBeTruthy();

		fireEvent.press(getByTestId("zoom-close-btn"));
		await waitFor(() => expect(queryByTestId("zoom-close-btn")).toBeNull());
	});

	it("mở Modal chọn Folder và cập nhật UI khi chọn Folder mới", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});

		const { getByTestId, getByText, queryByTestId } = render(
			<EditNoteScreen />,
		);
		await waitFor(() => expect(getByTestId("change-folder-btn")).toBeTruthy());

		fireEvent.press(getByTestId("change-folder-btn"));
		expect(getByTestId("mock-folder-modal")).toBeTruthy();

		fireEvent.press(getByTestId("mock-select-personal"));
		await waitFor(() => {
			expect(queryByTestId("mock-folder-modal")).toBeNull();
			expect(getByText("🏠 Personal")).toBeTruthy();
		});
	});

	it("xử lý tắt Modal đúng cách khi Component con trả về thư mục null", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});

		const { getByTestId, queryByTestId } = render(<EditNoteScreen />);
		await waitFor(() => expect(getByTestId("change-folder-btn")).toBeTruthy());

		fireEvent.press(getByTestId("change-folder-btn"));
		expect(getByTestId("mock-folder-modal")).toBeTruthy();

		// Giả lập user clear folder (trả về null)
		fireEvent.press(getByTestId("mock-select-null"));
		await waitFor(() => expect(queryByTestId("mock-folder-modal")).toBeNull());
	});

	it("không hiển thị khung ảnh gốc nếu Note không có hình ảnh", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: { id: "n2", title: "No Image", content: "Text", images: [] },
		});
		const { queryByTestId } = render(<EditNoteScreen />);
		await waitFor(() => expect(queryByTestId("image-thumbnail")).toBeNull());
	});

	it("tắt chế độ phóng to ảnh khi bấm vào nền tối (backdrop)", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});

		const { getByTestId, queryByTestId } = render(<EditNoteScreen />);
		await waitFor(() => expect(getByTestId("image-thumbnail")).toBeTruthy());

		fireEvent.press(getByTestId("image-thumbnail"));
		expect(getByTestId("zoom-backdrop")).toBeTruthy();
		fireEvent.press(getByTestId("zoom-backdrop"));
		await waitFor(() => expect(queryByTestId("zoom-backdrop")).toBeNull());
	});

	it("đóng modal chọn thư mục khi gọi hàm onClose", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});

		const { getByTestId, queryByTestId } = render(<EditNoteScreen />);
		await waitFor(() => expect(getByTestId("change-folder-btn")).toBeTruthy());

		fireEvent.press(getByTestId("change-folder-btn"));
		expect(getByTestId("mock-folder-modal")).toBeTruthy();
		fireEvent.press(getByTestId("mock-close-modal"));
		await waitFor(() => expect(queryByTestId("mock-folder-modal")).toBeNull());
	});

	it("chuyển đổi qua lại giữa chế độ Edit và Preview Markdown", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: { id: "note-1", title: "Title", content: "## Hello" },
		});

		const { getByText, queryByTestId } = render(<EditNoteScreen />);
		await waitFor(() => expect(getByText("Extracted Text")).toBeTruthy());

		fireEvent.press(getByText(/^\s*Preview\s*$/i));
		await waitFor(() => {
			expect(getByText("Preview Mode")).toBeTruthy();
			expect(queryByTestId("content-input")).toBeNull();
		});

		fireEvent.press(getByText(/^\s*Edit\s*$/i));
		await waitFor(() => {
			expect(getByText("Extracted Text")).toBeTruthy();
			expect(queryByTestId("content-input")).toBeTruthy();
		});
	});
});

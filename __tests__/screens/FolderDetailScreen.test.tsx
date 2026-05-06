import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";

import FolderDetailScreen from "../../app/folder/[id]";
import { folderApi } from "../../src/api/folderApi";
import { batchApi } from "../../src/api/batchApi";
import { noteApi } from "../../src/api/noteApi";

jest.mock("expo-router", () => {
	const React = require("react");
	return {
		useRouter: jest.fn(),
		useLocalSearchParams: jest.fn(),
		useFocusEffect: jest.fn((callback) => React.useEffect(callback, [])),
	};
});

jest.mock("../../src/api/folderApi", () => ({
	folderApi: {
		getFolderById: jest.fn(),
		updateFolder: jest.fn(),
		deleteFolder: jest.fn(),
	},
}));

jest.mock("../../src/api/batchApi", () => ({
	batchApi: { getBatches: jest.fn(), updateBatch: jest.fn() },
}));

jest.mock("../../src/api/noteApi", () => ({
	noteApi: { updateNote: jest.fn() },
}));

jest.spyOn(Alert, "alert");
jest.mock("@expo/vector-icons", () => ({ Feather: "Feather" }));

jest.mock("../../src/components/common/NoteActionSheet", () => {
	const { View, TouchableOpacity } = require("react-native");
	return {
		NoteActionSheet: ({ visible, onMove, onPin, onSuccess, onClose }: any) => {
			if (!visible) return null;
			return (
				<View testID="mock-action-sheet">
					<TouchableOpacity testID="mock-move" onPress={onMove} />
					<TouchableOpacity testID="mock-pin" onPress={onPin} />
					<TouchableOpacity testID="mock-success" onPress={onSuccess} />
					<TouchableOpacity testID="mock-close" onPress={onClose} />
				</View>
			);
		},
	};
});

jest.mock("../../src/components/common/FolderSelectModal", () => {
	const { View, TouchableOpacity } = require("react-native");
	return {
		FolderSelectModal: ({ visible, onSelect, onClose }: any) => {
			if (!visible) return null;
			return (
				<View testID="mock-folder-modal">
					<TouchableOpacity
						testID="mock-select-new-folder"
						onPress={() => onSelect({ id: "folder-new" })}
					/>
					<TouchableOpacity
						testID="mock-select-same-folder"
						onPress={() => onSelect({ id: "f1" })} // Sửa thành f1
					/>
					<TouchableOpacity testID="mock-close-folder" onPress={onClose} />
				</View>
			);
		},
	};
});

describe("FolderDetailScreen - Chi tiết Thư mục", () => {
	const mockBack = jest.fn();
	const mockPush = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			back: mockBack,
			push: mockPush,
		});
		(useLocalSearchParams as jest.Mock).mockReturnValue({ id: "f1" });

		(folderApi.getFolderById as jest.Mock).mockResolvedValue({
			data: { id: "f1", name: "Toán Học", notes: [] },
		});
		(batchApi.getBatches as jest.Mock).mockResolvedValue({ data: [] });
		(folderApi.updateFolder as jest.Mock).mockResolvedValue({
			status: "success",
		});
		(folderApi.deleteFolder as jest.Mock).mockResolvedValue({
			status: "success",
		});
		(noteApi.updateNote as jest.Mock).mockResolvedValue({ status: "success" });
		(batchApi.updateBatch as jest.Mock).mockResolvedValue({
			status: "success",
		});
	});

	it("tải danh sách trộn (Note và PDF) và điều hướng đúng khi click", async () => {
		(folderApi.getFolderById as jest.Mock).mockResolvedValue({
			data: {
				id: "f1",
				name: "Lịch sử",
				notes: [{ id: "n1", title: "Note 1" }],
			},
		});
		(batchApi.getBatches as jest.Mock).mockResolvedValue({
			data: [{ id: "b1", title: "PDF 1", folderId: "f1", pdfUrl: "url" }],
		});

		const { getByTestId, getByText } = render(<FolderDetailScreen />);
		await waitFor(() =>
			expect(getByText("2 items in this folder")).toBeTruthy(),
		);

		fireEvent.press(getByTestId("card-n1"));
		expect(mockPush).toHaveBeenCalledWith("/note/n1");

		fireEvent.press(getByTestId("card-b1"));
		expect(mockPush).toHaveBeenCalledWith({
			pathname: "/pdf-details",
			params: { pdfUrl: "url", title: "PDF 1" },
		});
	});

	it("nhấn đè mở Modal, ghim, di chuyển và đóng modal Folder", async () => {
		(folderApi.getFolderById as jest.Mock).mockResolvedValue({
			data: {
				id: "f1",
				notes: [{ id: "n1", title: "Note 1", itemType: "note" }],
			},
		});

		const { getByTestId, queryByTestId } = render(<FolderDetailScreen />);
		await waitFor(() => expect(getByTestId("card-n1")).toBeTruthy());

		fireEvent(getByTestId("card-n1"), "longPress");
		expect(getByTestId("mock-action-sheet")).toBeTruthy();

		fireEvent.press(getByTestId("mock-pin"));
		expect(Alert.alert).toHaveBeenCalledWith("Pinned", expect.any(String));

		fireEvent(getByTestId("card-n1"), "longPress");
		fireEvent.press(getByTestId("mock-move"));
		expect(queryByTestId("mock-action-sheet")).toBeNull();
		expect(getByTestId("mock-folder-modal")).toBeTruthy();

		await act(async () => {
			fireEvent.press(getByTestId("mock-select-new-folder"));
		});
		await waitFor(() => {
			expect(noteApi.updateNote).toHaveBeenCalledWith(
				"n1",
				expect.objectContaining({ folderId: "folder-new" }),
			);
		});
	});

	it("chuyển PDF sang thư mục khác thành công", async () => {
		(folderApi.getFolderById as jest.Mock).mockResolvedValue({
			data: { id: "f1", notes: [] },
		});
		(batchApi.getBatches as jest.Mock).mockResolvedValue({
			data: [{ id: "b1", title: "PDF 1", folderId: "f1", itemType: "batch" }],
		});

		const { getByTestId } = render(<FolderDetailScreen />);
		await waitFor(() => expect(getByTestId("card-b1")).toBeTruthy());

		fireEvent(getByTestId("card-b1"), "longPress");
		fireEvent.press(getByTestId("mock-move"));
		await act(async () => {
			fireEvent.press(getByTestId("mock-select-new-folder"));
		});

		await waitFor(() => {
			expect(batchApi.updateBatch).toHaveBeenCalledWith("b1", {
				folderId: "folder-new",
			});
		});
	});

	it("đổi tên folder thành công", async () => {
		const { getByText, getByDisplayValue } = render(<FolderDetailScreen />);
		await waitFor(() => expect(getByText("Toán Học")).toBeTruthy());

		fireEvent.press(getByText("Toán Học"));
		const input = getByDisplayValue("Toán Học");
		fireEvent.changeText(input, "Toán Cao Cấp");

		await act(async () => {
			fireEvent(input, "submitEditing");
		});

		await waitFor(() => {
			expect(folderApi.updateFolder).toHaveBeenCalledWith("f1", {
				name: "Toán Cao Cấp",
			});
			expect(getByText("Toán Cao Cấp")).toBeTruthy();
		});
	});

	it("tự động lưu khi người dùng bấm ra ngoài (onBlur) hoặc nhập tên rỗng", async () => {
		const { getByText, getByDisplayValue } = render(<FolderDetailScreen />);
		await waitFor(() => expect(getByText("Toán Học")).toBeTruthy());

		fireEvent.press(getByText("Toán Học"));
		const input = getByDisplayValue("Toán Học");

		fireEvent.changeText(input, "   ");
		await act(async () => {
			fireEvent(input, "blur");
		});

		await waitFor(() => {
			expect(folderApi.updateFolder).not.toHaveBeenCalled();
			expect(getByText("Toán Học")).toBeTruthy();
		});
	});

	it("báo lỗi nếu đổi tên folder thất bại", async () => {
		(folderApi.updateFolder as jest.Mock).mockRejectedValueOnce(
			new Error("Lỗi API"),
		);
		const { getByText, getByDisplayValue } = render(<FolderDetailScreen />);
		await waitFor(() => expect(getByText("Toán Học")).toBeTruthy());

		fireEvent.press(getByText("Toán Học"));
		const input = getByDisplayValue("Toán Học");
		fireEvent.changeText(input, "Toán Cao Cấp");

		await act(async () => {
			fireEvent(input, "submitEditing");
		});

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Unable to rename folder.",
			);
			expect(getByText("Toán Học")).toBeTruthy();
		});
	});

	it("xóa folder qua hộp thoại xác nhận", async () => {
		jest.spyOn(Alert, "alert").mockImplementation((title, msg, buttons) => {
			buttons?.[1]?.onPress?.();
		});

		const { getByTestId, getByText } = render(<FolderDetailScreen />);
		await waitFor(() => expect(getByText("Toán Học")).toBeTruthy());

		fireEvent.press(getByTestId("delete-folder-btn"));

		await waitFor(() => {
			expect(folderApi.deleteFolder).toHaveBeenCalledWith("f1");
			expect(mockBack).toHaveBeenCalled();
		});
	});

	it("hiển thị Alert lỗi nếu API xóa thư mục thất bại (catch block)", async () => {
		jest.spyOn(Alert, "alert").mockImplementation((title, msg, buttons) => {
			buttons?.[1]?.onPress?.();
		});
		(folderApi.deleteFolder as jest.Mock).mockRejectedValueOnce(
			new Error("Lỗi xóa"),
		);

		const { getByTestId, getByText } = render(<FolderDetailScreen />);
		await waitFor(() => expect(getByText("Toán Học")).toBeTruthy());

		fireEvent.press(getByTestId("delete-folder-btn"));

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith("Error", "Lỗi xóa");
		});
	});

	it("Báo lỗi và văng ra ngoài khi fetchFolderDetail bị lỗi mạng", async () => {
		(folderApi.getFolderById as jest.Mock).mockRejectedValueOnce(
			new Error("Mạng chập chờn"),
		);
		render(<FolderDetailScreen />);
		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Unable to load folder data.",
			);
			expect(mockBack).toHaveBeenCalled();
		});
	});

	it("không làm gì cả nếu chọn lại đúng thư mục hiện tại khi Move", async () => {
		(folderApi.getFolderById as jest.Mock).mockResolvedValue({
			data: { id: "f1", notes: [{ id: "n1", title: "Note 1" }] },
		});
		const { getByTestId, queryByTestId } = render(<FolderDetailScreen />);
		await waitFor(() => expect(getByTestId("card-n1")).toBeTruthy());

		fireEvent(getByTestId("card-n1"), "longPress");
		fireEvent.press(getByTestId("mock-move"));

		await act(async () => {
			fireEvent.press(getByTestId("mock-select-same-folder"));
		});

		expect(noteApi.updateNote).not.toHaveBeenCalled();
		expect(queryByTestId("mock-folder-modal")).toBeNull();
	});

	it("hiển thị Alert lỗi khi API chuyển tài liệu thất bại", async () => {
		(folderApi.getFolderById as jest.Mock).mockResolvedValue({
			data: {
				id: "f1",
				notes: [{ id: "n1", title: "Note 1", itemType: "note" }],
			},
		});
		(noteApi.updateNote as jest.Mock).mockRejectedValueOnce(
			new Error("Lỗi API"),
		);

		const { getByTestId } = render(<FolderDetailScreen />);
		await waitFor(() => expect(getByTestId("card-n1")).toBeTruthy());

		fireEvent(getByTestId("card-n1"), "longPress");
		fireEvent.press(getByTestId("mock-move"));

		await act(async () => {
			fireEvent.press(getByTestId("mock-select-new-folder"));
		});

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Failed to move the document.",
			);
		});
	});

	it("không làm gì cả nếu đóng Folder Modal mà không chọn", async () => {
		(folderApi.getFolderById as jest.Mock).mockResolvedValue({
			data: {
				id: "f1",
				notes: [{ id: "n1", title: "Note 1", itemType: "note" }],
			},
		});

		const { getByTestId, queryByTestId } = render(<FolderDetailScreen />);
		await waitFor(() => expect(getByTestId("card-n1")).toBeTruthy());

		fireEvent(getByTestId("card-n1"), "longPress");
		fireEvent.press(getByTestId("mock-move"));

		await act(async () => {
			fireEvent.press(getByTestId("mock-close-folder"));
		});

		expect(noteApi.updateNote).not.toHaveBeenCalled();
		expect(queryByTestId("mock-folder-modal")).toBeNull();
	});

	it("hiển thị UI Uncategorized nếu truyền itemType null", async () => {
		(folderApi.getFolderById as jest.Mock).mockResolvedValue({
			data: {
				id: "f1",
				notes: [{ id: "n-broken", title: "Broken Note", itemType: null }],
			},
		});

		const { getByText } = render(<FolderDetailScreen />);
		await waitFor(() => {
			expect(getByText("Broken Note")).toBeTruthy();
		});
	});

	it("chuyển trang tạo mới Note khi bấm FAB", async () => {
		// Mock data có chứa ít nhất 1 Note để FAB hiện lên
		(folderApi.getFolderById as jest.Mock).mockResolvedValue({
			data: {
				id: "f1",
				name: "Toán Học",
				notes: [{ id: "n1", title: "Note 1" }],
			},
		});

		const { getByTestId, getByText } = render(<FolderDetailScreen />);
		await waitFor(() => expect(getByText("Toán Học")).toBeTruthy());

		fireEvent.press(getByTestId("add-note-fab"));
		expect(mockPush).toHaveBeenCalledWith({
			pathname: "/note/new",
			params: { folderId: "f1", folderName: "Toán Học" },
		});
	});
});

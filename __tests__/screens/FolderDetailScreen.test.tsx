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
		useFocusEffect: jest.fn((callback) =>
			React.useEffect(callback, [callback]),
		),
	};
});

jest.mock("../../src/api/folderApi", () => ({
	folderApi: { getFolderById: jest.fn(), deleteFolder: jest.fn() },
}));
jest.mock("../../src/api/batchApi", () => ({
	batchApi: { getBatches: jest.fn(), updateBatch: jest.fn() },
}));
jest.mock("../../src/api/noteApi", () => ({
	noteApi: { updateNote: jest.fn() },
}));

jest.spyOn(Alert, "alert");
jest.mock("@expo/vector-icons", () => ({ Feather: "Feather" }));

// Mock 2 Modals
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
						onPress={() => onSelect({ id: "folder-1" })}
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
		(useLocalSearchParams as jest.Mock).mockReturnValue({ id: "folder-1" });
	});

	it("tải danh sách trộn (Note và PDF) và điều hướng đúng khi click", async () => {
		(folderApi.getFolderById as jest.Mock).mockResolvedValue({
			data: {
				id: "folder-1",
				name: "Lịch sử",
				notes: [{ id: "n1", title: "Note 1" }],
			},
		});
		(batchApi.getBatches as jest.Mock).mockResolvedValue({
			data: [{ id: "b1", title: "PDF 1", folderId: "folder-1", pdfUrl: "url" }],
		});

		const { getByTestId, getByText } = render(<FolderDetailScreen />);
		await waitFor(() =>
			expect(getByText("2 items in this folder")).toBeTruthy(),
		);

		// Click Note
		fireEvent.press(getByTestId("card-n1"));
		expect(mockPush).toHaveBeenCalledWith("/note/n1");

		// Click PDF
		fireEvent.press(getByTestId("card-b1"));
		expect(mockPush).toHaveBeenCalledWith({
			pathname: "/pdf-details",
			params: { pdfUrl: "url", title: "PDF 1" },
		});
	});

	it("nhấn đè mở Modal, ghim, di chuyển và đóng modal Folder", async () => {
		(folderApi.getFolderById as jest.Mock).mockResolvedValue({
			data: { id: "folder-1", notes: [{ id: "n1", title: "Note 1" }] },
		});
		(batchApi.getBatches as jest.Mock).mockResolvedValue({ data: [] });

		const { getByTestId, queryByTestId } = render(<FolderDetailScreen />);
		await waitFor(() => expect(getByTestId("card-n1")).toBeTruthy());

		// 1. Nhấn đè mở Action Sheet
		fireEvent(getByTestId("card-n1"), "longPress");
		expect(getByTestId("mock-action-sheet")).toBeTruthy();

		// 2. Test Pin
		fireEvent.press(getByTestId("mock-pin"));
		expect(Alert.alert).toHaveBeenCalledWith("Pinned", expect.any(String));

		// 3. Mở lại và test Move (Mở Folder Modal)
		fireEvent(getByTestId("card-n1"), "longPress");
		fireEvent.press(getByTestId("mock-move"));
		expect(queryByTestId("mock-action-sheet")).toBeNull();
		expect(getByTestId("mock-folder-modal")).toBeTruthy();

		// 4. Chọn thư mục mới -> Gọi API -> Cập nhật List
		await act(async () => {
			fireEvent.press(getByTestId("mock-select-new-folder"));
		});
		await waitFor(() => {
			expect(noteApi.updateNote).toHaveBeenCalledWith(
				"n1",
				expect.objectContaining({ folderId: "folder-new" }),
			);
			expect(queryByTestId("mock-folder-modal")).toBeNull();
		});
	});

	it("chuyển PDF sang thư mục khác thành công", async () => {
		(folderApi.getFolderById as jest.Mock).mockResolvedValue({
			data: { id: "folder-1", notes: [] },
		});
		(batchApi.getBatches as jest.Mock).mockResolvedValue({
			data: [{ id: "b1", title: "PDF 1", folderId: "folder-1" }],
		});
		(batchApi.updateBatch as jest.Mock).mockResolvedValue({
			status: "success",
		});

		const { getByTestId } = render(<FolderDetailScreen />);
		await waitFor(() => expect(getByTestId("card-b1")).toBeTruthy());

		fireEvent(getByTestId("card-b1"), "longPress"); // Mở Modal
		fireEvent.press(getByTestId("mock-move")); // Bấm Move
		await act(async () => {
			fireEvent.press(getByTestId("mock-select-new-folder"));
		}); // Chọn folder

		await waitFor(() => {
			expect(batchApi.updateBatch).toHaveBeenCalledWith("b1", {
				folderId: "folder-new",
			});
		});
	});
	it("Báo lỗi và văng ra ngoài khi fetchFolderDetail (trong FocusEffect) bị lỗi mạng", async () => {
		(folderApi.getFolderById as jest.Mock).mockRejectedValueOnce(
			new Error("Mạng chập chờn"),
		);

		const { queryByText } = render(<FolderDetailScreen />);

		// API văng lỗi sẽ hiện Alert và gọi router.back()
		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Unable to load folder data.",
			);
			expect(mockBack).toHaveBeenCalled();
		});
	});
});

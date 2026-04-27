import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import FolderDetailScreen from "../../app/folder/[id]"; // Cập nhật đường dẫn
import { folderApi } from "../../src/api/folderApi";

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

jest.spyOn(Alert, "alert");
jest.mock("@expo/vector-icons", () => ({ Feather: "Feather" }));

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

	it("báo lỗi và quay lại trang trước nếu không tải được folder", async () => {
		(folderApi.getFolderById as jest.Mock).mockRejectedValue(
			new Error("Lỗi mạng"),
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

	it("hiển thị giao diện rỗng và điều hướng thêm Note khi thư mục không có ghi chú", async () => {
		(folderApi.getFolderById as jest.Mock).mockResolvedValue({
			data: { id: "folder-1", name: "Lịch sử", notes: [] },
		});

		const { getByText, getByTestId } = render(<FolderDetailScreen />);

		await waitFor(() => {
			expect(getByText("Lịch sử")).toBeTruthy();
			expect(getByText("This folder is empty")).toBeTruthy();
		});

		fireEvent.press(getByTestId("add-note-empty-btn"));
		expect(mockPush).toHaveBeenCalledWith("/note/new");
	});

	it("hiển thị danh sách ghi chú và nút FAB khi thư mục có dữ liệu", async () => {
		const mockData = {
			id: "folder-1",
			name: "Lịch sử",
			notes: [
				{
					id: "note-1",
					title: "Bài 1",
					content: "Nội dung",
					status: "PROCESSED",
				},
			],
		};
		(folderApi.getFolderById as jest.Mock).mockResolvedValue({
			data: mockData,
		});

		const { getByText, getByTestId, queryByText } = render(
			<FolderDetailScreen />,
		);

		await waitFor(() => {
			expect(getByText("1 Notes in this folder")).toBeTruthy();
			expect(getByText("Bài 1")).toBeTruthy();
			expect(queryByText("This folder is empty")).toBeNull();
		});

		// Bấm vào Note
		fireEvent.press(getByTestId("note-card-note-1"));
		expect(mockPush).toHaveBeenCalledWith("/note/note-1");

		// Bấm vào FAB thêm note
		fireEvent.press(getByTestId("add-note-fab"));
		expect(mockPush).toHaveBeenCalledWith("/note/new");
	});

	it("hiển thị popup cảnh báo xóa thư mục và thực hiện xóa thành công", async () => {
		(folderApi.getFolderById as jest.Mock).mockResolvedValue({
			data: { id: "folder-1", name: "Lịch sử", notes: [] },
		});
		(folderApi.deleteFolder as jest.Mock).mockResolvedValue({
			status: "success",
		});

		const { getByTestId } = render(<FolderDetailScreen />);

		await waitFor(() => expect(getByTestId("delete-folder-btn")).toBeTruthy());

		// 1. Nhấn nút xóa
		fireEvent.press(getByTestId("delete-folder-btn"));

		// 2. Kiểm tra Alert cảnh báo đã xuất hiện
		expect(Alert.alert).toHaveBeenCalledWith(
			"Delete Folder",
			expect.any(String),
			expect.any(Array),
		);

		// 3. Trích xuất nút "Delete" từ Alert và giả lập việc người dùng bấm vào
		const alertCallArgs = (Alert.alert as jest.Mock).mock.calls[0];
		const deleteConfirmButton = alertCallArgs[2][1]; // Nút thứ 2 trong mảng là Delete

		await act(async () => {
			deleteConfirmButton.onPress();
		});

		await waitFor(() => {
			expect(folderApi.deleteFolder).toHaveBeenCalledWith("folder-1");
			expect(mockBack).toHaveBeenCalled(); // Xóa xong phải quay lại
		});
	});
});

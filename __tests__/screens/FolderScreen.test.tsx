import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import FoldersScreen from "../../app/(tabs)/folders"; // Sửa lại đường dẫn nếu cần
import { folderApi } from "../../src/api/folderApi";

// --- MOCK MODULES ---
jest.mock("expo-router", () => {
	const React = require("react");
	return {
		useRouter: jest.fn(),
		useFocusEffect: jest.fn((callback) =>
			React.useEffect(callback, [callback]),
		),
	};
});

jest.mock("../../src/api/folderApi", () => ({
	folderApi: { getFolders: jest.fn(), createFolder: jest.fn() },
}));

jest.spyOn(Alert, "alert");

describe("FoldersScreen - Quản lý danh sách Thư mục", () => {
	const mockPush = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
	});

	it("fetch và hiển thị danh sách thư mục thành công", async () => {
		const mockFolders = [
			{ id: "f1", name: "Toán học", type: "MANUAL" },
			{ id: "f2", name: "Hóa học", type: "SMART" },
		];
		(folderApi.getFolders as jest.Mock).mockResolvedValue({
			data: mockFolders,
		});

		const { getByText, getByTestId } = render(<FoldersScreen />);

		await waitFor(() => {
			expect(folderApi.getFolders).toHaveBeenCalled();
			expect(getByText("Toán học")).toBeTruthy();
			expect(getByText("Hóa học")).toBeTruthy();
		});

		// Bấm vào thư mục điều hướng sang chi tiết
		fireEvent.press(getByTestId("folder-card-f1"));
		expect(mockPush).toHaveBeenCalledWith("/folder/f1");
	});

	it("hiển thị trạng thái rỗng nếu không có thư mục nào", async () => {
		(folderApi.getFolders as jest.Mock).mockResolvedValue({ data: [] });

		const { getByText } = render(<FoldersScreen />);

		await waitFor(() => {
			expect(getByText("No folders yet.")).toBeTruthy();
		});
	});

	it("mở Modal, tạo thư mục mới thành công và load lại danh sách", async () => {
		(folderApi.getFolders as jest.Mock).mockResolvedValue({ data: [] });
		(folderApi.createFolder as jest.Mock).mockResolvedValue({
			status: "success",
		});

		const { getByTestId, getByText, queryByText } = render(<FoldersScreen />);

		// Đợi lần load đầu tiên xong
		await waitFor(() => expect(folderApi.getFolders).toHaveBeenCalledTimes(1));

		// Mở modal
		fireEvent.press(getByTestId("add-folder-btn"));
		expect(getByText("Create New Folder")).toBeTruthy();

		// Nhập tên
		fireEvent.changeText(getByTestId("folder-name-input"), "Tiếng Anh");

		// Bấm Tạo (bọc trong act vì có gọi API và set state)
		await act(async () => {
			fireEvent.press(getByTestId("create-folder-btn"));
		});

		await waitFor(() => {
			// API tạo được gọi đúng tên
			expect(folderApi.createFolder).toHaveBeenCalledWith({
				name: "Tiếng Anh",
			});
			// API getFolders được gọi lại (lần 2) để làm mới danh sách
			expect(folderApi.getFolders).toHaveBeenCalledTimes(2);
			// Modal đã đóng
			expect(queryByText("Create New Folder")).toBeNull();
		});
	});

	it("báo lỗi nếu tạo thư mục thất bại", async () => {
		(folderApi.getFolders as jest.Mock).mockResolvedValue({ data: [] });
		(folderApi.createFolder as jest.Mock).mockRejectedValue(
			new Error("Tên đã tồn tại"),
		);

		const { getByTestId, getByText } = render(<FoldersScreen />);
		await waitFor(() => expect(folderApi.getFolders).toHaveBeenCalledTimes(1));

		fireEvent.press(getByTestId("add-folder-btn"));
		fireEvent.changeText(getByTestId("folder-name-input"), "Toán học");

		await act(async () => {
			fireEvent.press(getByTestId("create-folder-btn"));
		});

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith("Error", "Tên đã tồn tại");
		});
	});
});

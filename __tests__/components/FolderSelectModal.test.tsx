import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { FolderSelectModal } from "../../src/components/common/FolderSelectModal";
import { folderApi } from "../../src/api/folderApi";
import { Alert } from "react-native";

// Mock API và Icon
jest.mock("../../src/api/folderApi", () => ({
	folderApi: { getFolders: jest.fn() },
}));
jest.mock("@expo/vector-icons", () => ({ Feather: "Feather" }));
jest.spyOn(Alert, "alert");

describe("Component: FolderSelectModal", () => {
	const mockOnClose = jest.fn();
	const mockOnSelect = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("gọi API fetchFolders khi modal hiển thị (visible = true)", async () => {
		const mockFolders = [{ id: "1", name: "Work" }];
		(folderApi.getFolders as jest.Mock).mockResolvedValueOnce({
			data: mockFolders,
		});

		// 1. Render bình thường không cần act
		const { getByText } = render(
			<FolderSelectModal
				visible={true}
				onClose={mockOnClose}
				onSelect={mockOnSelect}
			/>,
		);

		// 2. Chờ cho đến khi UI hiển thị được chữ "Work" (nghĩa là API đã load xong)
		await waitFor(() => {
			expect(getByText("Work")).toBeTruthy();
		});

		expect(folderApi.getFolders).toHaveBeenCalledTimes(1);
	});

	it("hiển thị thông báo khi danh sách thư mục rỗng", async () => {
		(folderApi.getFolders as jest.Mock).mockResolvedValueOnce({ data: [] });

		const { getByText } = render(
			<FolderSelectModal
				visible={true}
				onClose={mockOnClose}
				onSelect={mockOnSelect}
			/>,
		);

		// Chờ API chạy xong và UI hiện câu báo rỗng
		await waitFor(() => {
			expect(getByText("You don't have any folders yet.")).toBeTruthy();
		});
	});

	it("gọi hàm onSelect khi người dùng chọn một thư mục", async () => {
		const mockFolders = [{ id: "1", name: "Study" }];
		(folderApi.getFolders as jest.Mock).mockResolvedValueOnce({
			data: mockFolders,
		});

		const { getByTestId } = render(
			<FolderSelectModal
				visible={true}
				onClose={mockOnClose}
				onSelect={mockOnSelect}
			/>,
		);

		// Đợi render xong data
		await waitFor(() => expect(getByTestId("folder-item-1")).toBeTruthy());

		// Thao tác click
		fireEvent.press(getByTestId("folder-item-1"));
		expect(mockOnSelect).toHaveBeenCalledWith(mockFolders[0]);
	});

	it("gọi hàm onClose khi bấm vào vùng nền mờ (backdrop)", async () => {
		(folderApi.getFolders as jest.Mock).mockResolvedValueOnce({ data: [] });

		const { getByTestId, getByText } = render(
			<FolderSelectModal
				visible={true}
				onClose={mockOnClose}
				onSelect={mockOnSelect}
			/>,
		);

		// Quan trọng: Đợi cho API fetch xong để tránh cảnh báo "update unmounted component"
		await waitFor(() =>
			expect(getByText("You don't have any folders yet.")).toBeTruthy(),
		);

		fireEvent.press(getByTestId("folder-modal-backdrop"));
		expect(mockOnClose).toHaveBeenCalled();
	});

	it("hiển thị Alert thông báo lỗi khi gọi API thất bại", async () => {
		const consoleSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		(folderApi.getFolders as jest.Mock).mockRejectedValueOnce(
			new Error("Network Error"),
		);

		render(
			<FolderSelectModal
				visible={true}
				onClose={jest.fn()}
				onSelect={jest.fn()}
			/>,
		);

		// Chờ cho đến khi Alert bật lên
		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Unable to load folder list.",
			);
		});

		consoleSpy.mockRestore();
	});
});

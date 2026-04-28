import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
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
		// Dùng Once để tránh rò rỉ bộ nhớ
		(folderApi.getFolders as jest.Mock).mockResolvedValueOnce({
			data: mockFolders,
		});

		let component: any;
		// Ép Jest chờ Component render và API fetch xong xuôi
		await act(async () => {
			component = render(
				<FolderSelectModal
					visible={true}
					onClose={mockOnClose}
					onSelect={mockOnSelect}
				/>,
			);
		});

		expect(folderApi.getFolders).toHaveBeenCalledTimes(1);
		expect(component.getByText("Work")).toBeTruthy();
	});

	it("hiển thị thông báo khi danh sách thư mục rỗng", async () => {
		(folderApi.getFolders as jest.Mock).mockResolvedValueOnce({ data: [] });

		let component: any;
		await act(async () => {
			component = render(
				<FolderSelectModal
					visible={true}
					onClose={mockOnClose}
					onSelect={mockOnSelect}
				/>,
			);
		});

		expect(component.getByText("You don't have any folders yet.")).toBeTruthy();
	});

	it("gọi hàm onSelect khi người dùng chọn một thư mục", async () => {
		const mockFolders = [{ id: "1", name: "Study" }];
		(folderApi.getFolders as jest.Mock).mockResolvedValueOnce({
			data: mockFolders,
		});

		let component: any;
		await act(async () => {
			component = render(
				<FolderSelectModal
					visible={true}
					onClose={mockOnClose}
					onSelect={mockOnSelect}
				/>,
			);
		});

		await act(async () => {
			fireEvent.press(component.getByTestId("folder-item-1"));
		});

		expect(mockOnSelect).toHaveBeenCalledWith(mockFolders[0]);
	});

	it("gọi hàm onClose khi bấm vào vùng nền mờ (backdrop)", async () => {
		// SỬA LỖI ĐỒNG BỘ Ở ĐÂY: Biến thành async và đợi API chạy xong
		(folderApi.getFolders as jest.Mock).mockResolvedValueOnce({ data: [] });

		let component: any;
		await act(async () => {
			component = render(
				<FolderSelectModal
					visible={true}
					onClose={mockOnClose}
					onSelect={mockOnSelect}
				/>,
			);
		});

		await act(async () => {
			fireEvent.press(component.getByTestId("folder-modal-backdrop"));
		});

		expect(mockOnClose).toHaveBeenCalled();
	});

	it("hiển thị Alert thông báo lỗi khi gọi API thất bại", async () => {
		const consoleSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		(folderApi.getFolders as jest.Mock).mockRejectedValueOnce(
			new Error("Network Error"),
		);

		await act(async () => {
			render(
				<FolderSelectModal
					visible={true}
					onClose={jest.fn()}
					onSelect={jest.fn()}
				/>,
			);
		});

		expect(Alert.alert).toHaveBeenCalledWith(
			"Error",
			"Unable to load folder list.",
		);

		consoleSpy.mockRestore();
	});
});

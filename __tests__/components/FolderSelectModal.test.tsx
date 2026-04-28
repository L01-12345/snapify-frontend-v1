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
		(folderApi.getFolders as jest.Mock).mockResolvedValue({
			data: mockFolders,
		});

		const { getByText } = render(
			<FolderSelectModal
				visible={true}
				onClose={mockOnClose}
				onSelect={mockOnSelect}
			/>,
		);

		await waitFor(() => {
			expect(folderApi.getFolders).toHaveBeenCalledTimes(1);
			expect(getByText("Work")).toBeTruthy();
		});
	});

	it("hiển thị thông báo khi danh sách thư mục rỗng", async () => {
		(folderApi.getFolders as jest.Mock).mockResolvedValue({ data: [] });

		const { getByText } = render(
			<FolderSelectModal
				visible={true}
				onClose={mockOnClose}
				onSelect={mockOnSelect}
			/>,
		);

		await waitFor(() => {
			expect(getByText("You don't have any folders yet.")).toBeTruthy();
		});
	});

	it("gọi hàm onSelect khi người dùng chọn một thư mục", async () => {
		const mockFolders = [{ id: "1", name: "Study" }];
		(folderApi.getFolders as jest.Mock).mockResolvedValue({
			data: mockFolders,
		});

		const { getByTestId } = render(
			<FolderSelectModal
				visible={true}
				onClose={mockOnClose}
				onSelect={mockOnSelect}
			/>,
		);

		await waitFor(() => expect(getByTestId("folder-item-1")).toBeTruthy());

		fireEvent.press(getByTestId("folder-item-1"));
		expect(mockOnSelect).toHaveBeenCalledWith(mockFolders[0]);
	});

	it("gọi hàm onClose khi bấm vào vùng nền mờ (backdrop)", () => {
		const { getByTestId } = render(
			<FolderSelectModal
				visible={true}
				onClose={mockOnClose}
				onSelect={mockOnSelect}
			/>,
		);

		fireEvent.press(getByTestId("folder-modal-backdrop"));
		expect(mockOnClose).toHaveBeenCalled();
	});
	it("hiển thị Alert thông báo lỗi khi gọi API thất bại", async () => {
		// Giả lập API văng lỗi
		(folderApi.getFolders as jest.Mock).mockRejectedValue(
			new Error("Network Error"),
		);
		jest.spyOn(Alert, "alert");

		render(
			<FolderSelectModal
				visible={true}
				onClose={jest.fn()}
				onSelect={jest.fn()}
			/>,
		);

		await waitFor(() => {
			// Đảm bảo nhảy vào dòng 58-59
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Unable to load folder list.",
			);
		});
	});
});

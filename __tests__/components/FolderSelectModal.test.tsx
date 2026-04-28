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
		// 1. Tạm thời "bịt miệng" console.error để CI/CD không đánh rớt test
		const consoleSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		// 2. Sử dụng 'Once' để tránh rò rỉ lỗi (leakage) sang test case khác
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

		await waitFor(() => {
			// Đảm bảo nhảy vào khối catch và gọi Alert
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Unable to load folder list.",
			);
		});

		// 3. Dọn dẹp: Trả lại hàm console.error nguyên thủy sau khi test xong
		consoleSpy.mockRestore();
	});
});

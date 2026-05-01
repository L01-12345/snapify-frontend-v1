import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import ArchiveScreen from "../../app/archive";
import { archiveApi } from "../../src/api/archiveApi";

// ---------------------------------------------------------
// 1. MOCK CÁC MODULE BÊN NGOÀI
// ---------------------------------------------------------

jest.mock("expo-router", () => {
	const React = require("react");
	return {
		useRouter: jest.fn(),
		useFocusEffect: jest.fn((callback) => React.useEffect(callback, [])),
	};
});

jest.mock("@expo/vector-icons", () => ({
	Feather: "Feather",
}));

jest.mock("../../src/api/archiveApi", () => ({
	archiveApi: {
		getArchivedNotes: jest.fn(),
		restoreNote: jest.fn(),
		deleteNote: jest.fn(),
	},
}));

// Mock Alert để kiểm tra popup
jest.spyOn(Alert, "alert");

describe("ArchiveScreen - Quản lý Ghi chú lưu trữ", () => {
	const mockBack = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ back: mockBack });
		(archiveApi.getArchivedNotes as jest.Mock).mockResolvedValue({
			data: [
				{
					id: "1",
					title: "Tax Receipt 2024",
					content: "Receipt details",
					status: "ARCHIVED",
				},
				{
					id: "2",
					title: "Old Project Ideas",
					content: "Some notes",
					status: "ARCHIVED",
				},
				{
					id: "3",
					title: "Meeting Notes",
					content: "Client call summary",
					status: "ARCHIVED",
				},
			],
		});
		(archiveApi.restoreNote as jest.Mock).mockResolvedValue({ data: null });
		(archiveApi.deleteNote as jest.Mock).mockResolvedValue({ data: null });
	});

	// --- KỊCH BẢN 1: GIAO DIỆN KHỞI TẠO ---
	it("hiển thị danh sách các ghi chú đã lưu trữ", async () => {
		const { getByText, getByTestId, queryByTestId } = render(<ArchiveScreen />);

		await waitFor(() => {
			expect(getByText("Archived Notes")).toBeTruthy();
		});

		expect(getByText("Select")).toBeTruthy();
		expect(getByText("Tax Receipt 2024")).toBeTruthy();
		expect(getByText("Old Project Ideas")).toBeTruthy();
		expect(queryByTestId("restore-btn")).toBeNull();
	});

	// --- KỊCH BẢN 2: BẬT / TẮT CHẾ ĐỘ SELECTION MODE ---
	it("thay đổi giao diện khi bật và tắt chế độ chọn (Selection Mode)", async () => {
		const { getByText, getByTestId } = render(<ArchiveScreen />);
		await waitFor(() => expect(getByText("Archived Notes")).toBeTruthy());

		const toggleBtn = getByTestId("toggle-select-btn");

		// Bật chế độ chọn
		fireEvent.press(toggleBtn);
		expect(getByText("0 Selected")).toBeTruthy();
		expect(getByText("Cancel")).toBeTruthy(); // Nút Select đã đổi thành Cancel

		// Tắt chế độ chọn
		fireEvent.press(toggleBtn);
		expect(getByText("Archived Notes")).toBeTruthy();
		expect(getByText("Select")).toBeTruthy(); // Đổi lại thành Select
	});

	// --- KỊCH BẢN 3: HIỂN THỊ BOTTOM SHEET KHI CHỌN NOTE ---
	it("hiển thị thanh công cụ Bottom Sheet khi có ít nhất 1 note được chọn", async () => {
		const { getByTestId, getByText } = render(<ArchiveScreen />);
		await waitFor(() => expect(getByText("Archived Notes")).toBeTruthy());

		// 1. Bật selection mode
		fireEvent.press(getByTestId("toggle-select-btn"));

		// 2. Click chọn Note số 1
		fireEvent.press(getByTestId("note-item-1"));

		// 3. Kiểm tra Header cập nhật số lượng
		expect(getByText("1 Selected")).toBeTruthy();

		// 4. Kiểm tra Bottom Sheet xuất hiện
		expect(getByText("Note Actions")).toBeTruthy();
		expect(getByText("Restore")).toBeTruthy();
		expect(getByText("Delete")).toBeTruthy();
	});

	// --- KỊCH BẢN 4: RESTORE NOTE ---
	it("hiển thị Alert và thoát chế độ chọn khi bấm Restore", async () => {
		const { getByTestId, getByText, queryByTestId, queryByText } = render(
			<ArchiveScreen />,
		);
		await waitFor(() => expect(getByText("Archived Notes")).toBeTruthy());

		fireEvent.press(getByTestId("toggle-select-btn"));
		fireEvent.press(getByTestId("note-item-2")); // Chọn Note 2

		// Bấm Restore
		fireEvent.press(getByText("Restore"));

		// Kiểm tra Alert gọi đúng message
		expect(Alert.alert).toHaveBeenCalledWith(
			"Restore Notes",
			expect.any(String),
			expect.any(Array),
		);

		const alertCallArgs = (Alert.alert as jest.Mock).mock.calls[0];
		const restoreButton = alertCallArgs[2][1];

		await act(async () => {
			await restoreButton.onPress();
		});

		await waitFor(() => {
			expect(getByText("Archived Notes")).toBeTruthy();
			expect(queryByText("Restore")).toBeNull(); // Bottom sheet ẩn đi
		});
	});

	// --- KỊCH BẢN 5 & 6: DELETE NOTE & HIỂN THỊ EMPTY STATE ---
	// Ở đây chúng ta test gộp: Xóa hết toàn bộ Note để ép component nhảy sang Empty State
	it("xóa note và hiển thị màn hình Empty State khi không còn note nào", async () => {
		const { getByTestId, getByText, queryByText } = render(<ArchiveScreen />);
		await waitFor(() => expect(getByText("Archived Notes")).toBeTruthy());

		// Bật chế độ chọn
		fireEvent.press(getByTestId("toggle-select-btn"));

		// Chọn cả 3 notes hiện có (ID: 1, 2, 3)
		fireEvent.press(getByTestId("note-item-1"));
		fireEvent.press(getByTestId("note-item-2"));
		fireEvent.press(getByTestId("note-item-3"));

		expect(getByText("3 Selected")).toBeTruthy();

		// Bấm Delete
		fireEvent.press(getByText("Delete"));

		// Kiểm tra Alert xóa đã được gọi và lấy callback xác nhận
		expect(Alert.alert).toHaveBeenCalledWith(
			"Delete Permanently",
			expect.any(String),
			expect.any(Array),
		);

		const deleteAlertArgs = (Alert.alert as jest.Mock).mock.calls[0];
		const deleteConfirmButton = deleteAlertArgs[2][1];
		(archiveApi.getArchivedNotes as jest.Mock).mockResolvedValueOnce({
			data: [],
		});

		await act(async () => {
			await deleteConfirmButton.onPress();
		});

		await waitFor(() => {
			expect(archiveApi.deleteNote).toHaveBeenCalledTimes(3);
			expect(queryByText("Tax Receipt 2024")).toBeNull();
			expect(getByText("No archived notes")).toBeTruthy();
			expect(getByText(/Keep your dashboard clean/)).toBeTruthy();
		});
	});

	// --- KỊCH BẢN 7: NÚT BACK HOẠT ĐỘNG ---
	it("quay lại trang trước khi nhấn nút Back", async () => {
		const { getByTestId, getByText } = render(<ArchiveScreen />);

		// Đợi màn hình load xong
		await waitFor(() => expect(getByText("Archived Notes")).toBeTruthy());

		fireEvent.press(getByTestId("back-btn"));
		expect(mockBack).toHaveBeenCalled();
	});
});

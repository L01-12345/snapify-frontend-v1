import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import ArchiveScreen from "../../app/archive";

// ---------------------------------------------------------
// 1. MOCK CÁC MODULE BÊN NGOÀI
// ---------------------------------------------------------

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => ({
	Feather: "Feather",
}));

// Mock Alert để kiểm tra popup
jest.spyOn(Alert, "alert");

describe("ArchiveScreen - Quản lý Ghi chú lưu trữ", () => {
	const mockBack = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ back: mockBack });
	});

	// --- KỊCH BẢN 1: GIAO DIỆN KHỞI TẠO ---
	it("hiển thị danh sách các ghi chú đã lưu trữ", () => {
		const { getByText, getByTestId, queryByTestId } = render(<ArchiveScreen />);

		// Header
		expect(getByText("Archived Notes")).toBeTruthy();
		expect(getByText("Select")).toBeTruthy();

		// Ghi chú mặc định
		expect(getByText("Tax Receipt 2024")).toBeTruthy();
		expect(getByText("Old Project Ideas")).toBeTruthy();

		// Nút action ở Bottom Sheet không được xuất hiện
		expect(queryByTestId("restore-btn")).toBeNull();
	});

	// --- KỊCH BẢN 2: BẬT / TẮT CHẾ ĐỘ SELECTION MODE ---
	it("thay đổi giao diện khi bật và tắt chế độ chọn (Selection Mode)", () => {
		const { getByText, getByTestId } = render(<ArchiveScreen />);

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
	it("hiển thị thanh công cụ Bottom Sheet khi có ít nhất 1 note được chọn", () => {
		const { getByTestId, getByText } = render(<ArchiveScreen />);

		// 1. Bật selection mode
		fireEvent.press(getByTestId("toggle-select-btn"));

		// 2. Click chọn Note số 1
		fireEvent.press(getByTestId("note-item-1"));

		// 3. Kiểm tra Header cập nhật số lượng
		expect(getByText("1 Selected")).toBeTruthy();

		// 4. Kiểm tra Bottom Sheet xuất hiện
		expect(getByText("Note Actions")).toBeTruthy();
		expect(getByTestId("restore-btn")).toBeTruthy();
		expect(getByTestId("delete-btn")).toBeTruthy();
	});

	// --- KỊCH BẢN 4: RESTORE NOTE ---
	it("hiển thị Alert và thoát chế độ chọn khi bấm Restore", () => {
		const { getByTestId, getByText, queryByTestId } = render(<ArchiveScreen />);

		fireEvent.press(getByTestId("toggle-select-btn"));
		fireEvent.press(getByTestId("note-item-2")); // Chọn Note 2

		// Bấm Restore
		fireEvent.press(getByTestId("restore-btn"));

		// Kiểm tra Alert gọi đúng message
		expect(Alert.alert).toHaveBeenCalledWith("Restore", "Restored 1 notes!");

		// Kiểm tra đã tự động thoát chế độ chọn
		expect(getByText("Archived Notes")).toBeTruthy();
		expect(queryByTestId("restore-btn")).toBeNull(); // Bottom sheet ẩn đi
	});

	// --- KỊCH BẢN 5 & 6: DELETE NOTE & HIỂN THỊ EMPTY STATE ---
	// Ở đây chúng ta test gộp: Xóa hết toàn bộ Note để ép component nhảy sang Empty State
	it("xóa note và hiển thị màn hình Empty State khi không còn note nào", async () => {
		const { getByTestId, getByText, queryByText } = render(<ArchiveScreen />);

		// Bật chế độ chọn
		fireEvent.press(getByTestId("toggle-select-btn"));

		// Chọn cả 3 notes hiện có (ID: 1, 2, 3)
		fireEvent.press(getByTestId("note-item-1"));
		fireEvent.press(getByTestId("note-item-2"));
		fireEvent.press(getByTestId("note-item-3"));

		expect(getByText("3 Selected")).toBeTruthy();

		// Bấm Delete
		fireEvent.press(getByTestId("delete-btn"));

		// Kiểm tra Alert xóa
		expect(Alert.alert).toHaveBeenCalledWith(
			"Delete",
			"Deleted 3 notes permanently!",
		);

		// Đợi UI cập nhật và hiển thị Empty State
		await waitFor(() => {
			// Các note cũ phải biến mất
			expect(queryByText("Tax Receipt 2024")).toBeNull();

			// Màn hình rỗng (Empty State) phải xuất hiện
			expect(getByText("No archived notes")).toBeTruthy();
			expect(getByText(/Keep your dashboard clean/)).toBeTruthy();
		});
	});

	// --- KỊCH BẢN 7: NÚT BACK HOẠT ĐỘNG ---
	it("quay lại trang trước khi nhấn nút Back", () => {
		const { getByTestId } = render(<ArchiveScreen />);

		fireEvent.press(getByTestId("back-btn"));
		expect(mockBack).toHaveBeenCalled();
	});
});

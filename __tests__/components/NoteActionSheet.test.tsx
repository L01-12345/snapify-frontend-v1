import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { NoteActionSheet } from "../../src/components/common/NoteActionSheet";
import { noteApi } from "../../src/api/noteApi";

// 1. MOCK CÁC API
jest.mock("../../src/api/noteApi", () => ({
	noteApi: { updateNote: jest.fn(), deleteNote: jest.fn() },
}));
jest.mock("../../src/api/batchApi", () => ({
	batchApi: { updateBatch: jest.fn(), deleteBatch: jest.fn() },
}));
jest.spyOn(Alert, "alert");

describe("Component: NoteActionSheet", () => {
	// Khai báo Props khớp với logic mới
	const mockProps = {
		visible: true,
		onClose: jest.fn(),
		onMove: jest.fn(),
		onPin: jest.fn(),
		onSuccess: jest.fn(),
		noteId: "note-1",
		noteTitle: "Math Homework",
		itemType: "note" as "note" | "batch",
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("render chính xác title và danh sách các nút", () => {
		const { getByText } = render(<NoteActionSheet {...mockProps} />);
		expect(getByText("Note Actions")).toBeTruthy();
		expect(getByText("Math Homework")).toBeTruthy();
		expect(getByText("Archive Note")).toBeTruthy();
	});

	it("gọi đúng callback props (Move, Pin) và đóng (Cancel) Modal", () => {
		const { getByText, getByTestId } = render(
			<NoteActionSheet {...mockProps} />,
		);

		fireEvent.press(getByTestId("move-btn"));
		expect(mockProps.onMove).toHaveBeenCalledTimes(1);

		fireEvent.press(getByTestId("pin-btn"));
		expect(mockProps.onPin).toHaveBeenCalledTimes(1);

		// Bấm nút Cancel bằng cách tìm Text
		fireEvent.press(getByText("Cancel"));
		expect(mockProps.onClose).toHaveBeenCalledTimes(1);

		// Bấm Backdrop
		fireEvent.press(getByTestId("sheet-backdrop"));
		expect(mockProps.onClose).toHaveBeenCalledTimes(2);
	});

	it("xử lý Archive bằng cách gọi API updateNote và gọi onSuccess", async () => {
		(noteApi.updateNote as jest.Mock).mockResolvedValueOnce({
			status: "success",
		});
		const { getByText } = render(<NoteActionSheet {...mockProps} />);

		// Bọc trong act() vì sự kiện này có cập nhật State (isProcessing)
		await act(async () => {
			fireEvent.press(getByText("Archive Note"));
		});

		await waitFor(() => {
			// Đảm bảo gọi API đổi status
			expect(noteApi.updateNote).toHaveBeenCalledWith("note-1", {
				status: "ARCHIVED",
			});
			expect(Alert.alert).toHaveBeenCalledWith(
				"Archived",
				"Note has been moved to Archive.",
			);

			// Đảm bảo Modal báo về cho Component cha
			expect(mockProps.onSuccess).toHaveBeenCalledTimes(1);
			expect(mockProps.onClose).toHaveBeenCalledTimes(1);
		});
	});
	it("hiển thị nút Restore và gọi updateNote(PENDING) nếu isArchived = true", async () => {
		(noteApi.updateNote as jest.Mock).mockResolvedValueOnce({
			status: "success",
		});
		const { getByText } = render(
			<NoteActionSheet {...mockProps} isArchived={true} />,
		);

		// Đảm bảo nút Archive đã bị thay bằng Restore
		expect(getByText("Restore Note")).toBeTruthy();

		await act(async () => {
			fireEvent.press(getByText("Restore Note"));
		});

		await waitFor(() => {
			expect(noteApi.updateNote).toHaveBeenCalledWith("note-1", {
				status: "PENDING",
			});
			expect(Alert.alert).toHaveBeenCalledWith(
				"Restored",
				"Note has been restored.",
			);
			expect(mockProps.onSuccess).toHaveBeenCalledTimes(1);
		});
	});

	it("xử lý Delete Note thành công", async () => {
		(noteApi.deleteNote as jest.Mock).mockResolvedValueOnce({
			status: "success",
		});
		const { getByText } = render(<NoteActionSheet {...mockProps} />);

		// 1. Bấm nút Delete trên Modal
		fireEvent.press(getByText("Delete Note"));

		// 2. Kiểm tra Alert xác nhận có xuất hiện
		expect(Alert.alert).toHaveBeenCalledWith(
			"Delete Note",
			expect.any(String),
			expect.any(Array), // Phải có mảng [Cancel, Delete]
		);

		// 3. Trích xuất nút "Delete" màu đỏ từ Alert và giả lập việc bấm vào
		const alertCallArgs = (Alert.alert as jest.Mock).mock.calls[0];
		const deleteConfirmButton = alertCallArgs[2][1];

		await act(async () => {
			deleteConfirmButton.onPress();
		});

		await waitFor(() => {
			expect(noteApi.deleteNote).toHaveBeenCalledWith("note-1");
			expect(Alert.alert).toHaveBeenCalledWith(
				"Deleted",
				"Note has been deleted.",
			);
			expect(mockProps.onSuccess).toHaveBeenCalledTimes(1);
		});
	});

	it("thay đổi giao diện và gọi API deleteBatch nếu itemType = 'batch'", async () => {
		const { batchApi } = require("../../src/api/batchApi");
		(batchApi.deleteBatch as jest.Mock).mockResolvedValueOnce({
			status: "success",
		});

		const { getByText, queryByText } = render(
			<NoteActionSheet {...mockProps} itemType="batch" />,
		);

		// Đảm bảo Header là PDF
		expect(getByText("PDF Actions")).toBeTruthy();
		// Đảm bảo không có Archive và Pin
		expect(queryByText("Archive Note")).toBeNull();
		expect(queryByText("Pin to Top")).toBeNull();
		// Nút xóa phải ghi là PDF
		expect(getByText("Delete PDF")).toBeTruthy();

		// Bấm Delete PDF
		fireEvent.press(getByText("Delete PDF"));

		const alertCallArgs = (Alert.alert as jest.Mock).mock.calls[0];
		const deleteConfirmButton = alertCallArgs[2][1];

		await act(async () => {
			deleteConfirmButton.onPress();
		});

		await waitFor(() => {
			expect(batchApi.deleteBatch).toHaveBeenCalledWith("note-1");
			expect(Alert.alert).toHaveBeenCalledWith(
				"Deleted",
				"PDF Document has been deleted.",
			);
		});
	});

	it("hiển thị Alert lỗi nếu gọi API Archive thất bại", async () => {
		(noteApi.updateNote as jest.Mock).mockRejectedValueOnce(
			new Error("Network Error"),
		);
		const { getByText } = render(<NoteActionSheet {...mockProps} />);

		await act(async () => {
			fireEvent.press(getByText("Archive Note"));
		});

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Failed to archive the note.",
			);
			expect(mockProps.onSuccess).not.toHaveBeenCalled(); // Không được gọi callback success
		});
	});
});

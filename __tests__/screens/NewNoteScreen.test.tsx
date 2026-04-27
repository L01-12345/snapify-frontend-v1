import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import NewNoteScreen from "../../app/note/new";
import { noteApi } from "../../src/api/noteApi";

// --- MOCK MODULES ---
jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
jest.mock("../../src/api/noteApi", () => ({
	noteApi: { createNote: jest.fn() },
}));
jest.spyOn(Alert, "alert");
jest.mock("@expo/vector-icons", () => ({ Feather: "Feather" }));

describe("NewNoteScreen - Tạo ghi chú mới", () => {
	const mockBack = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ back: mockBack });
	});

	it("báo lỗi nếu lưu khi chưa nhập tiêu đề", () => {
		const { getByTestId } = render(<NewNoteScreen />);

		// Bấm Save ngay khi title trống
		fireEvent.press(getByTestId("save-btn"));

		expect(Alert.alert).toHaveBeenCalledWith(
			"Error",
			"Please enter a note title.",
		);
		expect(noteApi.createNote).not.toHaveBeenCalled();
	});

	it("tạo ghi chú thành công và quay lại trang trước", async () => {
		(noteApi.createNote as jest.Mock).mockResolvedValue({ status: "success" });

		const { getByTestId } = render(<NewNoteScreen />);

		// Nhập dữ liệu
		fireEvent.changeText(getByTestId("title-input"), "Meeting Notes");
		fireEvent.changeText(
			getByTestId("content-input"),
			"Discuss about Q3 plan.",
		);

		// Bấm Save
		fireEvent.press(getByTestId("save-btn"));

		await waitFor(() => {
			// Đảm bảo API được gọi đúng cấu trúc
			expect(noteApi.createNote).toHaveBeenCalledWith({
				title: "Meeting Notes",
				content: "Discuss about Q3 plan.",
				folderId: null,
			});
			// Đảm bảo chuyển trang thành công
			expect(mockBack).toHaveBeenCalled();
		});
	});

	it("hiển thị Alert lỗi nếu gọi API thất bại", async () => {
		(noteApi.createNote as jest.Mock).mockRejectedValue(
			new Error("Network Error"),
		);

		const { getByTestId } = render(<NewNoteScreen />);

		fireEvent.changeText(getByTestId("title-input"), "Valid Title");
		fireEvent.press(getByTestId("save-btn"));

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith("Save Error", "Network Error");
			expect(mockBack).not.toHaveBeenCalled(); // Không được thoát trang nếu lỗi
		});
	});

	it("quay về trang trước khi bấm Cancel", () => {
		const { getByTestId } = render(<NewNoteScreen />);
		fireEvent.press(getByTestId("cancel-btn"));
		expect(mockBack).toHaveBeenCalled();
	});
});

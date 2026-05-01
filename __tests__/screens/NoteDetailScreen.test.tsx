import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";

import NoteDetailScreen from "../../app/note/[id]";
import { noteApi } from "../../src/api/noteApi";
import { folderApi } from "../../src/api/folderApi";

// --- MOCK MODULES ---
jest.mock("expo-router", () => {
	const React = require("react");
	return {
		useRouter: jest.fn(),
		useLocalSearchParams: jest.fn(),
		useFocusEffect: jest.fn((callback) => React.useEffect(callback, [])),
	};
});

jest.mock("../../src/api/noteApi", () => ({
	noteApi: { getNoteById: jest.fn() },
}));

jest.mock("../../src/api/folderApi", () => ({
	folderApi: { getFolders: jest.fn() },
}));

jest.spyOn(Alert, "alert");

// Mock NoteActionSheet để test đóng/mở và onSuccess
jest.mock("../../src/components/common/NoteActionSheet", () => {
	const { View, TouchableOpacity } = require("react-native");
	return {
		NoteActionSheet: ({ visible, onClose, onSuccess }: any) => {
			if (!visible) return null;
			return (
				<View testID="mock-action-sheet">
					<TouchableOpacity testID="mock-close" onPress={onClose} />
					<TouchableOpacity testID="mock-success" onPress={onSuccess} />
				</View>
			);
		},
	};
});

// Mock Icons để dễ dàng tìm nút 3 chấm
jest.mock("@expo/vector-icons", () => {
	const { Text } = require("react-native");
	return {
		Feather: ({ name }: { name: string }) => (
			<Text testID={`icon-${name}`}>{name}</Text>
		),
	};
});

describe("NoteDetailScreen - Xem chi tiết ghi chú", () => {
	const mockBack = jest.fn();
	const mockPush = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			back: mockBack,
			push: mockPush,
		});
		(useLocalSearchParams as jest.Mock).mockReturnValue({ id: "note-1" });
	});

	it("fetch và hiển thị dữ liệu ghi chú, gọi API lấy tên Folder thành công", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: {
				id: "note-1",
				title: "Test Note",
				content: "Content",
				folderId: "folder-2",
			},
		});
		(folderApi.getFolders as jest.Mock).mockResolvedValue({
			data: [{ id: "folder-2", name: "Work", icon: "💼" }],
		});

		const { getByText, queryByText } = render(<NoteDetailScreen />);

		await waitFor(() => {
			expect(noteApi.getNoteById).toHaveBeenCalledWith("note-1");
			expect(folderApi.getFolders).toHaveBeenCalled();
			expect(getByText("Test Note")).toBeTruthy();
			// Kiểm tra UI đã hiển thị tên folder mới thay vì UNCATEGORIZED
			expect(getByText("💼 WORK")).toBeTruthy();
		});
	});

	it("báo lỗi và quay lại trang trước nếu không tìm thấy Note", async () => {
		(noteApi.getNoteById as jest.Mock).mockRejectedValue(
			new Error("Not Found"),
		);
		render(<NoteDetailScreen />);
		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Notice",
				"Note not found or has been deleted.",
			);
			expect(mockBack).toHaveBeenCalled();
		});
	});

	it("mở NoteActionSheet, gọi lại fetchNote khi onSuccess và đóng Modal", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: { id: "note-1", title: "Test Note", content: "Content" },
		});

		const { getByTestId, queryByTestId } = render(<NoteDetailScreen />);
		await waitFor(() => expect(getByTestId("icon-more-vertical")).toBeTruthy());

		// 1. Nhấn icon 3 chấm để mở Modal
		fireEvent.press(getByTestId("icon-more-vertical"));
		expect(getByTestId("mock-action-sheet")).toBeTruthy();

		// 2. Giả lập hành động thành công trong Modal -> Gọi onSuccess
		(noteApi.getNoteById as jest.Mock).mockClear(); // Xóa lịch sử gọi để đếm lại
		fireEvent.press(getByTestId("mock-success"));

		await waitFor(() => {
			expect(noteApi.getNoteById).toHaveBeenCalled(); // Hàm fetchNote được gọi lại
		});

		// 3. Giả lập bấm Close Modal
		fireEvent.press(getByTestId("mock-close"));
		await waitFor(() => {
			expect(queryByTestId("mock-action-sheet")).toBeNull();
		});
	});

	it("chuyển hướng sang trang Edit khi bấm vào nút FAB", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: { id: "note-1" },
		});
		const { getByTestId } = render(<NoteDetailScreen />);
		await waitFor(() => expect(getByTestId("edit-fab")).toBeTruthy());
		fireEvent.press(getByTestId("edit-fab"));
		expect(mockPush).toHaveBeenCalledWith({
			pathname: "/note/edit",
			params: { id: "note-1" },
		});
	});
});

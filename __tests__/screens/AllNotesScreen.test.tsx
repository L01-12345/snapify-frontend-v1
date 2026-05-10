// __tests__/screens/AllNotesScreen.test.tsx
import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert, Modal } from "react-native";
import { useRouter } from "expo-router";

import AllNotesScreen from "../../app/all-notes";
import { noteApi } from "../../src/api/noteApi";
import { batchApi } from "../../src/api/batchApi";

// --- MOCK CÁC MODULE BÊN NGOÀI ---
jest.mock("expo-router", () => {
	const React = require("react");
	return {
		useRouter: jest.fn(),
		useFocusEffect: jest.fn((callback) =>
			React.useEffect(callback, [callback]),
		),
	};
});

jest.mock("../../src/api/noteApi", () => ({
	noteApi: {
		getNotes: jest.fn(),
		deleteNote: jest.fn(),
		searchNotes: jest.fn(),
	},
}));
jest.mock("../../src/api/batchApi", () => ({
	batchApi: { getBatches: jest.fn() },
}));

jest.mock("@expo/vector-icons", () => ({ Feather: "Feather" }));
jest.spyOn(Alert, "alert");

// --- MOCK COMPONENT NOTE ACTION SHEET ---
jest.mock("../../src/components/common/NoteActionSheet", () => {
	const { View, TouchableOpacity, Text } = require("react-native");
	return {
		NoteActionSheet: ({ visible, onSuccess, onMove, onPin, onClose }: any) => {
			if (!visible) return null;
			return (
				<View testID="mock-action-sheet">
					<TouchableOpacity testID="mock-success" onPress={onSuccess}>
						<Text>Success</Text>
					</TouchableOpacity>
					<TouchableOpacity testID="mock-pin" onPress={onPin}>
						<Text>Pin</Text>
					</TouchableOpacity>
					<TouchableOpacity testID="mock-move" onPress={onMove}>
						<Text>Move</Text>
					</TouchableOpacity>
					{/* Cover Line 559 */}
					<TouchableOpacity testID="mock-close" onPress={onClose}>
						<Text>Close</Text>
					</TouchableOpacity>
				</View>
			);
		},
	};
});

describe("AllNotesScreen - Màn hình tất cả ghi chú", () => {
	const mockPush = jest.fn();
	const mockBack = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			push: mockPush,
			back: mockBack,
		});
		(batchApi.getBatches as jest.Mock).mockResolvedValue({ data: [] });
	});

	it("fetch items có cả note và batch, sắp xếp và điều hướng đúng trang PDF (Cover Line 428)", async () => {
		(noteApi.getNotes as jest.Mock).mockResolvedValue({
			data: {
				notes: [
					{ id: "n1", title: "Note 1", createdAt: "2023-01-01T00:00:00Z" },
				],
			},
		});
		(batchApi.getBatches as jest.Mock).mockResolvedValue({
			data: [
				{
					id: "b1",
					title: "Batch 1",
					pdfUrl: "http://pdf",
					createdAt: "2023-01-03T00:00:00Z",
				},
			],
		});

		const { getByText, getByTestId } = render(<AllNotesScreen />);
		await waitFor(() => {
			expect(getByText("Note 1")).toBeTruthy();
			expect(getByText("Batch 1")).toBeTruthy();
		});

		// Nhấn vào Note thì sang /note/[id]
		fireEvent.press(getByTestId("card-n1"));
		expect(mockPush).toHaveBeenCalledWith("/note/n1");

		// Nhấn vào Batch thì sang /pdf-details (Cover Line 428)
		fireEvent.press(getByTestId("card-b1"));
		expect(mockPush).toHaveBeenCalledWith({
			pathname: "/pdf-details",
			params: { pdfUrl: "http://pdf", title: "Batch 1" },
		});
	});

	it("lọc đúng itemType='note' khi chọn tab Pending (Cover Line 142)", async () => {
		(noteApi.getNotes as jest.Mock).mockResolvedValue({
			data: { notes: [{ id: "n1", title: "Note 1" }] },
		});
		(batchApi.getBatches as jest.Mock).mockResolvedValue({
			data: [{ id: "b1", title: "Batch 1" }],
		});

		const { getByText, queryByText } = render(<AllNotesScreen />);
		await waitFor(() => expect(getByText("Batch 1")).toBeTruthy());

		// Click chuyển sang Tab Pending
		await act(async () => {
			fireEvent.press(getByText("Pending"));
		});

		await waitFor(() => {
			expect(getByText("Note 1")).toBeTruthy();
			expect(queryByText("Batch 1")).toBeNull(); // Batch đã bị bộ lọc Line 142 loại trừ
		});
	});

	it("thao tác với tất cả lựa chọn Date, Sort (Cover Line 85-88, 92-93, 510, 522-528) và test Modal onRequestClose (Line 495)", async () => {
		(noteApi.getNotes as jest.Mock).mockResolvedValue({
			data: {
				notes: [
					{ id: "n1", title: "Note 1", createdAt: new Date().toISOString() },
					{
						id: "n2",
						title: "Note 2",
						createdAt: new Date(Date.now() - 10000000).toISOString(),
					},
				],
			},
		});

		const { getByText, queryByText, UNSAFE_getByType } = render(
			<AllNotesScreen />,
		);
		await waitFor(() => expect(getByText("Note 1")).toBeTruthy());

		// --- SORT FILTER ---
		fireEvent.press(getByText("Newest First"));
		await waitFor(() => expect(getByText("Sort By")).toBeTruthy());

		// Chọn "Oldest First" (Cover Line 92-93 vòng lặp callback sort)
		act(() => {
			fireEvent.press(getByText("Oldest First"));
		});
		await waitFor(() => expect(getByText("Oldest First")).toBeTruthy());

		// --- DATE FILTER ---
		fireEvent.press(getByText("Any Date"));
		await waitFor(() => expect(getByText("Filter by Date")).toBeTruthy());

		// Chọn "Past 7 Days" (Cover Line 86, 522-524)
		act(() => {
			fireEvent.press(getByText("Past 7 Days"));
		});
		await waitFor(() => expect(getByText("Past 7 Days")).toBeTruthy());

		fireEvent.press(getByText("Past 7 Days")); // Mở lại modal
		// Chọn "Past 30 Days" (Cover Line 87, 525-528)
		act(() => {
			fireEvent.press(getByText("Past 30 Days"));
		});
		await waitFor(() => expect(getByText("Past 30 Days")).toBeTruthy());

		fireEvent.press(getByText("Past 30 Days")); // Mở lại modal
		// Chọn "Any Date" (Cover Line 510)
		act(() => {
			fireEvent.press(getByText("Any Date"));
		});
		await waitFor(() => expect(getByText("Any Date")).toBeTruthy());

		// --- MODAL ON REQUEST CLOSE (Cover Line 495) ---
		fireEvent.press(getByText("Any Date")); // Mở lại modal
		await waitFor(() => expect(getByText("Filter by Date")).toBeTruthy());

		// Lấy component Modal trực tiếp và gọi sự kiện requestClose (Tương đương việc bấm nút Back cứng trên Android)
		const modal = UNSAFE_getByType(Modal);
		act(() => {
			fireEvent(modal, "requestClose");
		});
		await waitFor(() => expect(queryByText("Filter by Date")).toBeNull());
	});

	it("nhánh useFocusEffect không gọi fetchItems khi searchQuery không rỗng (Cover Line 60)", async () => {
		jest.useFakeTimers();
		(noteApi.getNotes as jest.Mock).mockResolvedValue({ data: { notes: [] } });

		const { getByPlaceholderText, getByText } = render(<AllNotesScreen />);
		await act(async () => {
			jest.advanceTimersByTime(500);
		}); // Xả timer initial

		// Nhập tìm kiếm vào ô input
		const searchInput = getByPlaceholderText("Search notes...");
		await act(async () => {
			fireEvent.changeText(searchInput, "Keyword");
		});
		await act(async () => {
			jest.advanceTimersByTime(500);
		}); // Để debounce timer chạy API search

		(noteApi.getNotes as jest.Mock).mockClear();

		// Bấm đổi Status -> trigger useFocusEffect callback kích hoạt lại
		await act(async () => {
			fireEvent.press(getByText("Processed"));
		});

		// Không gọi API do searchQuery.trim().length !== 0 (Cover nhánh false của mệnh đề if tại dòng 60)
		expect(noteApi.getNotes).not.toHaveBeenCalled();

		jest.useRealTimers();
	});

	it("bắt lỗi catch(error) khi fetchItems thất bại (Cover Line 149)", async () => {
		const consoleSpy = jest.spyOn(console, "log").mockImplementation();
		(noteApi.getNotes as jest.Mock).mockRejectedValue(
			new Error("API GetNotes Error"),
		);

		render(<AllNotesScreen />);

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalledWith(
				"Lỗi fetch items:",
				expect.any(Error),
			);
		});
		consoleSpy.mockRestore();
	});

	it("đóng ActionSheet khi nhấn Close (Cover Line 559)", async () => {
		(noteApi.getNotes as jest.Mock).mockResolvedValue({
			data: { notes: [{ id: "n1", title: "Note 1" }] },
		});

		const { getByTestId, queryByTestId } = render(<AllNotesScreen />);
		await waitFor(() => expect(getByTestId("card-n1")).toBeTruthy());

		// Mở Action Sheet
		fireEvent(getByTestId("card-n1"), "longPress");
		expect(getByTestId("mock-action-sheet")).toBeTruthy();

		// Bấm nút Close Mock
		act(() => {
			fireEvent.press(getByTestId("mock-close"));
		});
		await waitFor(() => expect(queryByTestId("mock-action-sheet")).toBeNull());
	});

	// --- CÁC TEST GIỮ LẠI TỪ BẢN TRƯỚC CHO ĐỦ ĐỘ PHỦ TỔNG THỂ ---
	it("hiển thị thông báo khi không có ghi chú nào", async () => {
		(noteApi.getNotes as jest.Mock).mockResolvedValue({ data: { notes: [] } });
		const { getByText } = render(<AllNotesScreen />);
		await waitFor(() =>
			expect(getByText("There are no documents here.")).toBeTruthy(),
		);
	});

	it("gọi lại API để lấy danh sách mới khi thực hiện hành động thành công trong Modal", async () => {
		(noteApi.getNotes as jest.Mock).mockResolvedValue({
			data: { notes: [{ id: "n1", title: "Note 1" }] },
		});

		const { getByTestId } = render(<AllNotesScreen />);
		await waitFor(() => expect(getByTestId("card-n1")).toBeTruthy());

		fireEvent(getByTestId("card-n1"), "longPress");
		expect(getByTestId("mock-action-sheet")).toBeTruthy();
		(noteApi.getNotes as jest.Mock).mockClear();

		await act(async () => {
			fireEvent.press(getByTestId("mock-success"));
		});
		await waitFor(() => expect(noteApi.getNotes).toHaveBeenCalled());

		// Test Pin & Move feature
		fireEvent(getByTestId("card-n1"), "longPress");
		fireEvent.press(getByTestId("mock-pin"));
		expect(Alert.alert).toHaveBeenCalledWith(
			"Pinned",
			'"Note 1" pinned to top.',
		);

		fireEvent(getByTestId("card-n1"), "longPress");
		fireEvent.press(getByTestId("mock-move"));
		expect(Alert.alert).toHaveBeenCalledWith(
			"Tính năng đang phát triển",
			"Mở Folder Modal ở đây.",
		);
	});

	it("điều hướng khi nhấn FAB và nút Back", () => {
		const { getByTestId } = render(<AllNotesScreen />);
		fireEvent.press(getByTestId("fab-btn"));
		expect(mockPush).toHaveBeenCalledWith("/note/new");

		fireEvent.press(getByTestId("back-btn"));
		expect(mockBack).toHaveBeenCalled();
	});

	it("gọi API searchNotes khi người dùng gõ vào ô tìm kiếm và hightlight đúng từ", async () => {
		jest.useFakeTimers();
		(noteApi.searchNotes as jest.Mock).mockResolvedValue({
			data: [
				{
					id: "search-1",
					title: "Keyword Match",
					content: "Result of Math Formulas",
				},
			],
		});

		const { getByPlaceholderText, getByTestId, getByText } = render(
			<AllNotesScreen />,
		);
		const searchInput = getByPlaceholderText("Search notes...");

		await act(async () => {
			fireEvent.changeText(searchInput, "Keyword");
		});
		await act(async () => {
			jest.advanceTimersByTime(500);
		});
		jest.useRealTimers();

		await waitFor(() => {
			expect(noteApi.searchNotes).toHaveBeenCalledWith("Keyword");
			expect(getByTestId("card-search-1")).toBeTruthy();
			expect(getByText("Keyword")).toBeTruthy();
		});
	});
});

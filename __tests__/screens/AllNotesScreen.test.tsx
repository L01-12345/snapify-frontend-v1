import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

// Import component và API
import AllNotesScreen from "../../app/all-notes";
import { noteApi } from "../../src/api/noteApi";
import { batchApi } from "../../src/api/batchApi";

// ---------------------------------------------------------
// 1. MOCK CÁC MODULE BÊN NGOÀI
// ---------------------------------------------------------

jest.mock("expo-router", () => {
	// Require react trực tiếp bên trong mock factory
	const React = require("react");

	return {
		useRouter: jest.fn(),
		// Sử dụng React vừa được require
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

jest.mock("@expo/vector-icons", () => ({
	Feather: "Feather",
}));

jest.spyOn(Alert, "alert");

jest.mock("../../src/api/batchApi", () => ({
	batchApi: {
		getBatches: jest.fn(),
	},
}));

// ---------------------------------------------------------
// 2. MOCK COMPONENT NOTE ACTION SHEET
// ---------------------------------------------------------
jest.mock("../../src/components/common/NoteActionSheet", () => {
	const { View, TouchableOpacity, Text } = require("react-native");
	return {
		NoteActionSheet: ({ visible, onSuccess, onMove, onPin, onClose }: any) => {
			if (!visible) return null;
			return (
				<View testID="mock-action-sheet">
					{/* Nút giả lập hành động xóa/archive đã thành công từ bên trong Modal */}
					<TouchableOpacity testID="mock-success" onPress={onSuccess}>
						<Text>Success</Text>
					</TouchableOpacity>
					<TouchableOpacity testID="mock-pin" onPress={onPin}>
						<Text>Pin</Text>
					</TouchableOpacity>
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

	const mockNotesData = [
		{
			id: "1",
			title: "Calculus Lecture 04",
			content: "Math...",
			status: "PROCESSED",
		},
		{
			id: "2",
			title: "Physics Chapter 2",
			content: "Newton...",
			status: "PENDING",
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			push: mockPush,
			back: mockBack,
		});
		(batchApi.getBatches as jest.Mock).mockResolvedValue({ data: [] });
	});

	// --- KỊCH BẢN 1: FETCH DATA THÀNH CÔNG VÀ HIỂN THỊ ---
	it("gọi API lấy danh sách note và hiển thị lên giao diện", async () => {
		(noteApi.getNotes as jest.Mock).mockResolvedValue({
			data: { notes: mockNotesData },
		});

		const { getByText, getByTestId } = render(<AllNotesScreen />);

		await waitFor(() => {
			// API gọi mặc định không có status param (vì tab All)
			expect(noteApi.getNotes).toHaveBeenCalledWith({ status: undefined });

			// Hiển thị note
			expect(getByText("Calculus Lecture 04")).toBeTruthy();
			expect(getByText("Physics Chapter 2")).toBeTruthy();
		});

		// Bấm vào note chuyển sang màn hình chi tiết
		fireEvent.press(getByTestId("card-1"));
		expect(mockPush).toHaveBeenCalledWith("/note/1");
	});

	// --- KỊCH BẢN 2: TRẠNG THÁI RỖNG (EMPTY STATE) ---
	it("hiển thị thông báo khi không có ghi chú nào", async () => {
		(noteApi.getNotes as jest.Mock).mockResolvedValue({ data: { notes: [] } });

		const { getByText } = render(<AllNotesScreen />);

		await waitFor(() => {
			expect(getByText("There are no documents here.")).toBeTruthy();
		});
	});

	// --- KỊCH BẢN 3: LỌC TRẠNG THÁI (FILTERS) ---
	it("gọi lại API với tham số tương ứng khi bấm vào Pill lọc trạng thái", async () => {
		(noteApi.getNotes as jest.Mock).mockResolvedValue({ data: { notes: [] } });

		const { getByText } = render(<AllNotesScreen />);

		// Chờ fetch mặc định xong (lần 1)
		await waitFor(() =>
			expect(noteApi.getNotes).toHaveBeenCalledWith({ status: undefined }),
		);

		// Reset lại cờ đếm của mock để test lần 2 cho sạch
		(noteApi.getNotes as jest.Mock).mockClear();

		// Bọc trong act vì việc bấm nút này sẽ kích hoạt state và API call
		await act(async () => {
			fireEvent.press(getByText("Processed"));
		});

		await waitFor(() => {
			expect(noteApi.getNotes).toHaveBeenCalledWith({ status: "ACTIONED" });
		});

		(noteApi.getNotes as jest.Mock).mockClear();

		await act(async () => {
			fireEvent.press(getByText("Pending"));
		});

		await waitFor(() => {
			expect(noteApi.getNotes).toHaveBeenCalledWith({ status: "PENDING" });
		});
	});
	// --- KỊCH BẢN 4 & 5 (GỘP): BOTTOM SHEET THÀNH CÔNG VÀ TẢI LẠI LIST ---
	it("gọi lại API để lấy danh sách mới khi thực hiện hành động thành công trong Modal", async () => {
		(noteApi.getNotes as jest.Mock).mockResolvedValue({
			data: { notes: mockNotesData },
		});

		const { getByTestId, queryByTestId } = render(<AllNotesScreen />);
		await waitFor(() => expect(getByTestId("card-1")).toBeTruthy());

		// 1. Nhấn đè mở Modal
		fireEvent(getByTestId("card-1"), "longPress");
		expect(getByTestId("mock-action-sheet")).toBeTruthy();

		// Xóa lịch sử gọi API trước đó để test lần gọi mới
		(noteApi.getNotes as jest.Mock).mockClear();

		// 2. Giả lập Modal đã xử lý Delete/Archive xong và gọi onSuccess
		await act(async () => {
			fireEvent.press(getByTestId("mock-success"));
		});

		// 3. Đảm bảo AllNotesScreen đã gọi lại API fetchItems
		await waitFor(() => {
			expect(noteApi.getNotes).toHaveBeenCalled();
		});

		// 4. Test chức năng Pin (Alert)
		fireEvent(getByTestId("card-2"), "longPress");
		fireEvent.press(getByTestId("mock-pin"));
		expect(Alert.alert).toHaveBeenCalledWith(
			"Pinned",
			'"Physics Chapter 2" pinned to top.',
		);
	});

	// --- KỊCH BẢN 6: ĐIỀU HƯỚNG CƠ BẢN ---
	it("điều hướng khi nhấn FAB và nút Back", () => {
		const { getByTestId } = render(<AllNotesScreen />);

		fireEvent.press(getByTestId("fab-btn"));
		expect(mockPush).toHaveBeenCalledWith("/note/new");

		fireEvent.press(getByTestId("back-btn"));
		expect(mockBack).toHaveBeenCalled();
	});
	// --- KỊCH BẢN 7: TÌM KIẾM (SEARCH VỚI DEBOUNCE) ---
	it("gọi API searchNotes khi người dùng gõ vào ô tìm kiếm sau 500ms", async () => {
		jest.useFakeTimers();
		(noteApi.searchNotes as jest.Mock).mockResolvedValue({
			data: [{ id: "search-1", title: "Keyword Match", content: "Result" }],
		});

		const { getByPlaceholderText, getByTestId } = render(<AllNotesScreen />);

		await act(async () => {
			jest.runAllTimers();
		});

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
		});
	});
	// --- KỊCH BẢN 8: BỘ LỌC SORT ---
	it("hiển thị Alert chọn Sort và thay đổi thứ tự sắp xếp", async () => {
		const { getByText } = render(<AllNotesScreen />);

		// Tìm và bấm nút Dropdown đang hiển thị mặc định "Newest First"
		await waitFor(() => expect(getByText("Newest First")).toBeTruthy());
		fireEvent.press(getByText("Newest First"));

		expect(Alert.alert).toHaveBeenCalledWith(
			"Sort By",
			"Choose how documents are ordered",
			expect.any(Array),
		);

		// Trích xuất danh sách các nút bấm trong Alert và gọi sự kiện onPress của nút "Oldest First"
		const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
		const oldestBtn = alertButtons.find(
			(btn: any) => btn.text === "Oldest First",
		);

		act(() => {
			oldestBtn.onPress();
		});

		// UI phải cập nhật text thành Oldest First
		await waitFor(() => expect(getByText("Oldest First")).toBeTruthy());
	});

	// --- KỊCH BẢN 9: BỘ LỌC DATE ---
	it("hiển thị Alert chọn Date và cập nhật UI", async () => {
		// Mock hàm Alert để reset gọi trước đó
		(Alert.alert as jest.Mock).mockClear();

		const { getByText } = render(<AllNotesScreen />);

		await waitFor(() => expect(getByText("Any Date")).toBeTruthy());
		fireEvent.press(getByText("Any Date"));

		expect(Alert.alert).toHaveBeenCalledWith(
			"Filter by Date",
			"Show documents created within:",
			expect.any(Array),
		);

		// Lấy nút "Today" và bấm
		const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
		const todayBtn = alertButtons.find((btn: any) => btn.text === "Today");

		act(() => {
			todayBtn.onPress();
		});

		// UI phải cập nhật thành Today
		await waitFor(() => expect(getByText("Today")).toBeTruthy());
	});
});

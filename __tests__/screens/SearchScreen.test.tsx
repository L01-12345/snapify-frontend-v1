import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { useRouter } from "expo-router";

// Import component và API
import SearchScreen from "../../app/(tabs)/search";
import { noteApi } from "../../src/api/noteApi";

// ---------------------------------------------------------
// 1. MOCK CÁC MODULE BÊN NGOÀI
// ---------------------------------------------------------

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

jest.mock("../../src/api/noteApi", () => ({
	noteApi: {
		searchNotes: jest.fn(),
	},
}));

jest.mock("@expo/vector-icons", () => ({
	Feather: "Feather",
}));

describe("SearchScreen - Tìm kiếm Ghi chú", () => {
	const mockPush = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
	});

	// --- KỊCH BẢN 1: GIAO DIỆN KHỞI TẠO (TRỐNG) ---
	it("hiển thị gợi ý tìm kiếm gần đây khi chưa nhập từ khóa", () => {
		const { getByText, getByTestId } = render(<SearchScreen />);

		// UI khởi tạo phải có Recent Searches và Suggested Folders
		expect(getByText("Recent Searches")).toBeTruthy();
		expect(getByText("Suggested Folders")).toBeTruthy();

		// Input phải rỗng
		expect(getByTestId("search-input").props.value).toBe("");

		// API KHÔNG ĐƯỢC GỌI
		expect(noteApi.searchNotes).not.toHaveBeenCalled();
	});

	// --- KỊCH BẢN 2: CHỌN TAG TÌM KIẾM GẦN ĐÂY ---
	it("cập nhật từ khóa vào ô tìm kiếm khi click vào tag Recent Search", async () => {
		jest.useFakeTimers(); // Bật thời gian giả cho Debounce
		(noteApi.searchNotes as jest.Mock).mockResolvedValue({ data: [] });

		const { getByText, getByTestId } = render(<SearchScreen />);

		// Bấm vào tag "Calculus"
		fireEvent.press(getByText("Calculus"));

		// Input phải được cập nhật
		expect(getByTestId("search-input").props.value).toBe("Calculus");

		// Tua nhanh 500ms
		act(() => {
			jest.advanceTimersByTime(500);
		});

		await waitFor(() => {
			expect(noteApi.searchNotes).toHaveBeenCalledWith("Calculus");
		});

		jest.useRealTimers();
	});

	// --- KỊCH BẢN 3: CƠ CHẾ DEBOUNCE (QUAN TRỌNG NHẤT) ---
	it("chỉ gọi API 1 lần sau khi người dùng ngừng gõ 500ms (Debounce)", async () => {
		jest.useFakeTimers();
		(noteApi.searchNotes as jest.Mock).mockResolvedValue({ data: [] });

		const { getByTestId } = render(<SearchScreen />);
		const searchInput = getByTestId("search-input");

		// Người dùng gõ chữ "Math" liên tục
		fireEvent.changeText(searchInput, "M");
		fireEvent.changeText(searchInput, "Ma");
		fireEvent.changeText(searchInput, "Mat");
		fireEvent.changeText(searchInput, "Math");

		// Trong lúc vừa gõ xong (chưa đủ 500ms), API tuyệt đối chưa được gọi
		expect(noteApi.searchNotes).not.toHaveBeenCalled();

		// Tua nhanh thời gian qua 500ms
		act(() => {
			jest.advanceTimersByTime(500);
		});

		// Lúc này API mới được gọi 1 lần duy nhất với từ khóa cuối cùng
		await waitFor(() => {
			expect(noteApi.searchNotes).toHaveBeenCalledTimes(1);
			expect(noteApi.searchNotes).toHaveBeenCalledWith("Math");
		});

		jest.useRealTimers();
	});

	// --- KỊCH BẢN 4: TÌM THẤY KẾT QUẢ VÀ ĐIỀU HƯỚNG ---
	it("hiển thị kết quả tìm kiếm và chuyển hướng khi nhấn vào Note", async () => {
		jest.useFakeTimers();

		const mockNotes = [
			{
				id: "note-1",
				title: "Math Homework",
				content: "Derivative rules...",
				createdAt: "2025-10-20",
				folder: { name: "Study" },
			},
		];
		(noteApi.searchNotes as jest.Mock).mockResolvedValue({ data: mockNotes });

		const { getByTestId, getByText } = render(<SearchScreen />);

		// Gõ tìm kiếm
		fireEvent.changeText(getByTestId("search-input"), "Math");
		act(() => {
			jest.advanceTimersByTime(500);
		});

		await waitFor(() => {
			// Phải thấy tiêu đề Note và số lượng kết quả
			expect(getByText(/1\s*Results Found/)).toBeTruthy();
			expect(getByText("Math Homework")).toBeTruthy();
			// Phải render ra text "Study" từ folder
			expect(getByText("Study")).toBeTruthy();
		});

		// Bấm vào thẻ kết quả
		fireEvent.press(getByText("Math Homework"));

		// Đảm bảo router push sang màn hình chi tiết
		expect(mockPush).toHaveBeenCalledWith("/note/note-1");

		jest.useRealTimers();
	});

	// --- KỊCH BẢN 5: EMPTY STATE & NÚT CLEAR TEXT ---
	it("hiển thị màn hình rỗng khi không tìm thấy kết quả, nút Clear hoạt động", async () => {
		jest.useFakeTimers();

		// Mock API trả về mảng rỗng
		(noteApi.searchNotes as jest.Mock).mockResolvedValue({ data: [] });

		const { getByTestId, getByText, queryByText } = render(<SearchScreen />);

		// Gõ một từ khóa không tồn tại
		fireEvent.changeText(getByTestId("search-input"), "KhongTonTai");
		act(() => {
			jest.advanceTimersByTime(500);
		});

		await waitFor(() => {
			// Phải xuất hiện màn hình Empty State
			expect(getByText("No results found")).toBeTruthy();
		});

		// --- TEST NÚT XÓA Ở EMPTY STATE ---
		fireEvent.press(getByText("Clear Search"));

		// Input phải về chuỗi rỗng
		expect(getByTestId("search-input").props.value).toBe("");
		// Trở về giao diện khởi tạo
		expect(getByText("Recent Searches")).toBeTruthy();
		// Empty state biến mất
		expect(queryByText("No results found")).toBeNull();

		jest.useRealTimers();
	});

	// --- KỊCH BẢN 6: NÚT CLEAR (X) TRÊN HEADER HOẠT ĐỘNG ---
	it("xóa text input khi bấm nút X trên thanh tìm kiếm", async () => {
		jest.useFakeTimers();
		(noteApi.searchNotes as jest.Mock).mockResolvedValue({ data: [] });

		const { getByTestId } = render(<SearchScreen />);
		const searchInput = getByTestId("search-input");

		// Gõ chữ để hiện nút (X)
		fireEvent.changeText(searchInput, "Hello");

		// Bấm nút X (dùng testID đã thêm ở Bước 1)
		fireEvent.press(getByTestId("header-clear-btn"));

		// Text phải bị reset
		expect(searchInput.props.value).toBe("");

		jest.useRealTimers();
	});
});

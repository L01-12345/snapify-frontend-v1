import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

// Import Component và API
import EditNoteScreen from "../../app/note/edit"; // Sửa lại đường dẫn nếu cần
import { noteApi } from "../../src/api/noteApi";

// ---------------------------------------------------------
// 1. MOCK CÁC MODULE BÊN NGOÀI
// ---------------------------------------------------------

// Mock expo-router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

// Mock API
jest.mock("../../src/api/noteApi", () => ({
	noteApi: {
		getNoteById: jest.fn(),
		updateNote: jest.fn(),
	},
}));

// Mock Alert
jest.spyOn(Alert, "alert");

// Mock Vector Icons
jest.mock("@expo/vector-icons", () => ({
	Feather: "Feather",
}));

// MOCK Component FolderSelectModal để test độc lập luồng chọn Folder của EditScreen
jest.mock("../../src/components/common/FolderSelectModal", () => {
	const { View, TouchableOpacity, Text } = require("react-native");
	return {
		FolderSelectModal: ({ visible, onSelect, onClose }: any) => {
			if (!visible) return null;
			return (
				<View testID="mock-folder-modal">
					{/* Nút giả lập người dùng đã chọn một Folder tên là Personal */}
					<TouchableOpacity
						testID="mock-select-personal"
						onPress={() => onSelect({ id: "99", name: "Personal", icon: "🏠" })}
					/>
					<TouchableOpacity testID="mock-close-modal" onPress={onClose} />
				</View>
			);
		},
	};
});

describe("EditNoteScreen - Chỉnh sửa ghi chú", () => {
	const mockBack = jest.fn();

	// Dữ liệu giả lập Note trả về từ API
	const mockNoteData = {
		id: "note-1",
		title: "Old Title",
		content: "Old Content",
		images: [{ imageUrl: "https://mock-image.com/1.jpg" }],
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ back: mockBack });
		(useLocalSearchParams as jest.Mock).mockReturnValue({ id: "note-1" });
	});

	// --- KỊCH BẢN 1: MOUNT & FETCH DATA THÀNH CÔNG ---
	it("tải dữ liệu note ban đầu và hiển thị lên UI thành công", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});

		const { getByDisplayValue, getByTestId } = render(<EditNoteScreen />);

		await waitFor(() => {
			expect(noteApi.getNoteById).toHaveBeenCalledWith("note-1");
			// Dữ liệu từ API phải được đổ vào các TextInput
			expect(getByDisplayValue("Old Title")).toBeTruthy();
			expect(getByDisplayValue("Old Content")).toBeTruthy();
			// Ảnh thumbnail phải hiển thị
			expect(getByTestId("image-thumbnail")).toBeTruthy();
		});
	});

	// --- KỊCH BẢN 2: FETCH DATA LỖI ---
	it("hiển thị Alert lỗi nếu không tải được dữ liệu", async () => {
		(noteApi.getNoteById as jest.Mock).mockRejectedValue(
			new Error("Network error"),
		);

		render(<EditNoteScreen />);

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Unable to load content.",
			);
		});
	});

	// --- KỊCH BẢN 3: SỬA VÀ LƯU THÀNH CÔNG (HAPPY PATH) ---
	it("cho phép sửa title/content, gọi API updateNote và quay lại trang trước", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});
		(noteApi.updateNote as jest.Mock).mockResolvedValue({ status: "success" });

		const { getByTestId } = render(<EditNoteScreen />);

		// Đợi API Get hoàn thành
		await waitFor(() =>
			expect(getByTestId("title-input").props.value).toBe("Old Title"),
		);

		// Người dùng gõ text mới
		fireEvent.changeText(getByTestId("title-input"), "New Title");
		fireEvent.changeText(getByTestId("content-input"), "New Content Update");

		// Người dùng nhấn nút Save
		fireEvent.press(getByTestId("save-btn"));

		await waitFor(() => {
			// API Update phải nhận đúng ID và Dữ liệu mới
			expect(noteApi.updateNote).toHaveBeenCalledWith("note-1", {
				title: "New Title",
				content: "New Content Update",
				folderId: null,
			});
			// Update xong thì lùi lại màn hình trước
			expect(mockBack).toHaveBeenCalled();
		});
	});

	// --- KỊCH BẢN 4: LƯU THẤT BẠI ---
	it("hiển thị Alert nếu lưu thất bại và không thoát trang", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});
		(noteApi.updateNote as jest.Mock).mockRejectedValue(
			new Error("Save Failed"),
		);

		const { getByTestId } = render(<EditNoteScreen />);

		await waitFor(() => expect(getByTestId("save-btn")).toBeTruthy());
		fireEvent.press(getByTestId("save-btn"));

		await waitFor(() => {
			expect(noteApi.updateNote).toHaveBeenCalled();
			expect(Alert.alert).toHaveBeenCalledWith("Error", "Save Failed");
			expect(mockBack).not.toHaveBeenCalled();
		});
	});

	// --- KỊCH BẢN 5: TÍNH NĂNG PHÓNG TO ẢNH (LIGHTBOX) ---
	it("bật và tắt Modal phóng to ảnh (Lightbox) khi nhấn vào Thumbnail", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});

		const { getByTestId, queryByTestId } = render(<EditNoteScreen />);

		await waitFor(() => expect(getByTestId("image-thumbnail")).toBeTruthy());

		// Ban đầu nút Close Zoom không hiển thị (do modal đang ẩn)
		expect(queryByTestId("zoom-close-btn")).toBeNull();

		// Nhấn vào ảnh thu nhỏ
		fireEvent.press(getByTestId("image-thumbnail"));

		// Modal hiện lên, thấy được nút Close
		expect(getByTestId("zoom-close-btn")).toBeTruthy();

		// Nhấn nút Close (X)
		fireEvent.press(getByTestId("zoom-close-btn"));

		// Modal ẩn đi
		await waitFor(() => {
			expect(queryByTestId("zoom-close-btn")).toBeNull();
		});
	});

	// --- KỊCH BẢN 6: ĐỔI FOLDER TỪ MODAL ---
	it("mở Modal chọn Folder và cập nhật UI khi chọn Folder mới", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});

		const { getByTestId, getByText, queryByTestId } = render(
			<EditNoteScreen />,
		);

		await waitFor(() => expect(getByTestId("change-folder-btn")).toBeTruthy());

		// 1. Nhấn nút Change ở cục AI Card
		fireEvent.press(getByTestId("change-folder-btn"));

		// 2. Modal phải hiện ra
		expect(getByTestId("mock-folder-modal")).toBeTruthy();

		// 3. Giả lập bấm chọn Folder tên là 'Personal' (từ mock bên trên)
		fireEvent.press(getByTestId("mock-select-personal"));

		await waitFor(() => {
			// Modal phải tắt đi
			expect(queryByTestId("mock-folder-modal")).toBeNull();

			// Trên UI bên ngoài (AI Card) phải đổi text thành Folder mới
			expect(getByText("🏠 Personal")).toBeTruthy();
			// Nhãn "AI SUGGESTED FOLDER" đã đổi thành "FOLDER" (chữ màu xám)
			expect(getByText("FOLDER")).toBeTruthy();
		});
	});
	// --- KỊCH BẢN 7: NOTE KHÔNG CÓ ẢNH (Cover nhánh if (data.images)) ---
	it("không hiển thị khung ảnh gốc nếu Note không có hình ảnh", async () => {
		// Giả lập Note không có mảng images
		const noImageNote = {
			id: "note-2",
			title: "No Image",
			content: "Text",
			images: [],
		};
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({ data: noImageNote });

		const { queryByTestId } = render(<EditNoteScreen />);

		await waitFor(() => {
			// Đảm bảo không render cái image-thumbnail ra UI
			expect(queryByTestId("image-thumbnail")).toBeNull();
		});
	});

	// --- KỊCH BẢN 8: BẤM NỀN ĐEN ĐỂ TẮT ẢNH ZOOM (Cover Function dòng 212) ---
	it("tắt chế độ phóng to ảnh khi bấm vào nền tối (backdrop)", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});

		const { getByTestId, queryByTestId } = render(<EditNoteScreen />);
		await waitFor(() => expect(getByTestId("image-thumbnail")).toBeTruthy());

		// 1. Mở ảnh
		fireEvent.press(getByTestId("image-thumbnail"));
		expect(getByTestId("zoom-backdrop")).toBeTruthy();

		// 2. Bấm vào nền đen thay vì bấm nút X
		fireEvent.press(getByTestId("zoom-backdrop"));

		// 3. Đảm bảo modal đã tắt
		await waitFor(() => {
			expect(queryByTestId("zoom-backdrop")).toBeNull();
		});
	});

	// --- KỊCH BẢN 9: HỦY CHỌN FOLDER (Cover Function onClose dòng 188) ---
	it("đóng modal chọn thư mục khi gọi hàm onClose", async () => {
		(noteApi.getNoteById as jest.Mock).mockResolvedValue({
			data: mockNoteData,
		});

		const { getByTestId, queryByTestId } = render(<EditNoteScreen />);
		await waitFor(() => expect(getByTestId("change-folder-btn")).toBeTruthy());

		// Mở Modal
		fireEvent.press(getByTestId("change-folder-btn"));
		expect(getByTestId("mock-folder-modal")).toBeTruthy();

		// Gọi hàm tắt Modal (Bấm nút giả lập onClose)
		fireEvent.press(getByTestId("mock-close-modal"));

		// Đảm bảo Modal đã biến mất
		await waitFor(() => {
			expect(queryByTestId("mock-folder-modal")).toBeNull();
		});
	});
});

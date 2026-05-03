import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Animated } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";

import DashboardScreen from "../app/(tabs)/dashboard";
import { noteApi } from "../src/api/noteApi";
import { dashboardApi } from "../src/api/dashboardApi";
import { batchApi } from "../src/api/batchApi";

// --- MOCK MODULES ---
jest.mock("expo-router", () => {
	const React = require("react");
	return {
		useRouter: jest.fn(),
		useLocalSearchParams: jest.fn(),
		useFocusEffect: jest.fn((callback) => React.useEffect(callback, [])),
	};
});

jest.mock("react-redux", () => ({
	useSelector: jest.fn(),
	useDispatch: jest.fn(),
}));

jest.mock("../src/api/noteApi", () => ({
	noteApi: { getNotes: jest.fn() },
}));
jest.mock("../src/api/dashboardApi", () => ({
	dashboardApi: { getMetrics: jest.fn() },
}));
jest.mock("../src/api/batchApi", () => ({
	batchApi: { getBatches: jest.fn() },
}));
jest.mock("@expo/vector-icons", () => ({
	Feather: "Feather",
	Ionicons: "Ionicons",
}));

// Mock Animation để không bị lỗi timeout
jest.spyOn(Animated, "spring").mockReturnValue({ start: jest.fn() } as any);
jest.spyOn(Animated, "timing").mockReturnValue({ start: jest.fn() } as any);

describe("DashboardScreen - Màn hình chính", () => {
	const mockPush = jest.fn();

	const mockUser = {
		displayName: "John Doe",
		avatarUrl: "https://example.com/avatar.jpg",
	};

	const mockNotes = [
		{
			id: "1",
			title: "Note 1 Large",
			content: "Content 1",
			status: "PROCESSED",
		},
		{
			id: "2",
			title: "Note 2 Normal",
			content: "Content 2",
			status: "PENDING",
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useLocalSearchParams as jest.Mock).mockReturnValue({ showToast: "false" });
		(useSelector as unknown as jest.Mock).mockReturnValue({ user: mockUser });
		(batchApi.getBatches as jest.Mock).mockResolvedValue({ data: [] });
	});

	it("fetch dữ liệu và hiển thị thông tin User, Notes thành công", async () => {
		(noteApi.getNotes as jest.Mock).mockResolvedValue({
			data: { notes: mockNotes },
		});
		(dashboardApi.getMetrics as jest.Mock).mockResolvedValue({ data: {} });

		const { getByText, getByTestId } = render(<DashboardScreen />);

		await waitFor(() => {
			// 1. Kiểm tra Greeting lấy tên từ Redux
			expect(getByText("Hello, John Doe")).toBeTruthy();

			// 2. Gọi API đủ
			expect(noteApi.getNotes).toHaveBeenCalledWith({ limit: 10 });
			expect(dashboardApi.getMetrics).toHaveBeenCalled();

			// 3. Hiển thị Note
			expect(getByText("Note 1 Large")).toBeTruthy();
			expect(getByText("Note 2 Normal")).toBeTruthy();
		});

		// Test Điều hướng vào Note
		fireEvent.press(getByTestId("card-1"));
		expect(mockPush).toHaveBeenCalledWith("/note/1");
	});

	it("điều hướng đúng các nút Quick Actions và Header", () => {
		const { getByTestId } = render(<DashboardScreen />);

		fireEvent.press(getByTestId("search-input"));
		expect(mockPush).toHaveBeenCalledWith("/search");

		fireEvent.press(getByTestId("action-batch"));
		expect(mockPush).toHaveBeenCalledWith("/camera-batch");

		fireEvent.press(getByTestId("action-archive"));
		expect(mockPush).toHaveBeenCalledWith("/archive");

		fireEvent.press(getByTestId("view-all-notes"));
		expect(mockPush).toHaveBeenCalledWith("/all-notes");
	});

	it("kích hoạt Animation Toast khi params showToast = true", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({ showToast: "true" });

		render(<DashboardScreen />);

		// Vì useEffect gọi Animated.spring ngay khi mount (do showToast="true")
		expect(Animated.spring).toHaveBeenCalled();
	});
	it("hiển thị Avatar dạng Image khi user có avatarUrl (Nhánh 1)", async () => {
		// Giả lập user có avatarUrl
		const userWithAvatar = {
			displayName: "John Doe",
			avatarUrl: "https://example.com/avatar.jpg",
		};
		(useSelector as unknown as jest.Mock).mockReturnValue({
			user: userWithAvatar,
		});

		(noteApi.getNotes as jest.Mock).mockResolvedValue({ data: { notes: [] } });
		(dashboardApi.getMetrics as jest.Mock).mockResolvedValue({ data: null });

		const { getByText, queryByText } = render(<DashboardScreen />);

		await waitFor(() => {
			// Vì đã có avatarUrl nên nó sẽ render thẻ Image, KHÔNG render chữ viết tắt "JO" hay "JD"
			expect(queryByText("JO")).toBeNull();
			expect(queryByText("JD")).toBeNull();
		});
	});

	it('hiển thị Avatar mặc định "JD" khi user bị null hoặc không có tên (Nhánh 3)', async () => {
		// Giả lập user bị null hoàn toàn (chưa load kịp thông tin)
		(useSelector as unknown as jest.Mock).mockReturnValue({ user: null });

		(noteApi.getNotes as jest.Mock).mockResolvedValue({ data: { notes: [] } });
		(dashboardApi.getMetrics as jest.Mock).mockResolvedValue({ data: null });

		const { getByText } = render(<DashboardScreen />);

		await waitFor(() => {
			// Đảm bảo chữ "JD" xuất hiện do rơi vào nhánh fallback || "JD"
			expect(getByText("JD")).toBeTruthy();
		});
	});
	it("hiển thị danh sách PDF và điều hướng sang trang PDF Details", async () => {
		// Mock để tab All Notes trả về 1 PDF thay vì Note
		(noteApi.getNotes as jest.Mock).mockResolvedValue({ data: { notes: [] } });
		(dashboardApi.getMetrics as jest.Mock).mockResolvedValue({ data: {} });
		(batchApi.getBatches as jest.Mock).mockResolvedValue({
			data: [
				{
					id: "batch-1",
					title: "My PDF",
					pdfUrl: "https://pdf.com",
					createdAt: new Date(),
				},
			],
		});

		const { getByText, getByTestId } = render(<DashboardScreen />);

		await waitFor(() => {
			expect(getByText("My PDF")).toBeTruthy();
		});

		// Bấm vào PDF
		fireEvent.press(getByTestId("card-batch-1"));

		// Đảm bảo được Push sang trang PDF thay vì trang Note
		expect(mockPush).toHaveBeenCalledWith({
			pathname: "/pdf-details",
			params: { pdfUrl: "https://pdf.com", title: "My PDF" },
		});
	});

	it("không crash và bỏ qua ngầm nếu API bị lỗi mạng", async () => {
		(noteApi.getNotes as jest.Mock).mockRejectedValue(
			new Error("Network Error"),
		);
		(dashboardApi.getMetrics as jest.Mock).mockRejectedValue(
			new Error("Network Error"),
		);

		const { getByText } = render(<DashboardScreen />);

		await waitFor(() => {
			// Vẫn hiển thị giao diện cơ bản chứ không sập app
			expect(getByText("Hello, John Doe")).toBeTruthy();
		});
	});
	it("hiển thị Initials khi user có tên nhưng không có avatarUrl", async () => {
		// Nhánh này cover việc user tồn tại nhưng avatarUrl bị rỗng
		const userWithoutAvatar = { displayName: "Tran Kien", avatarUrl: "" };
		(useSelector as unknown as jest.Mock).mockReturnValue({
			user: userWithoutAvatar,
		});
		(noteApi.getNotes as jest.Mock).mockResolvedValue({ data: { notes: [] } });
		(dashboardApi.getMetrics as jest.Mock).mockResolvedValue({ data: {} });

		const { getByText } = render(<DashboardScreen />);

		await waitFor(() => {
			expect(getByText("TR")).toBeTruthy();
		});
	});

	it("xử lý mượt mà (không sập app) khi danh sách note trả về bị undefined", async () => {
		(noteApi.getNotes as jest.Mock).mockResolvedValue({ data: {} }); // Cố tình không trả về mảng notes
		(dashboardApi.getMetrics as jest.Mock).mockResolvedValue({ data: {} });

		const { queryByTestId } = render(<DashboardScreen />);

		await waitFor(() => {
			// Đảm bảo app vẫn render bình thường, chỉ là không có card nào thôi
			expect(queryByTestId("card-1")).toBeNull();
		});
	});
	it("xử lý hiển thị Toast, tương tác nút Move và tự động ẩn theo thời gian", async () => {
		// 1. Kích hoạt đồng hồ giả của Jest để test các hàm setTimeout
		jest.useFakeTimers();

		(useLocalSearchParams as jest.Mock).mockReturnValue({ showToast: "true" });
		const { getByText } = render(<DashboardScreen />);

		// 2. Đảm bảo Toast hiện lên
		expect(getByText("PDF Created")).toBeTruthy();

		// 3. Bấm vào nút Move trên Toast (cover dòng 372)
		await act(async () => {
			fireEvent.press(getByText("Move"));
		});

		// 4. Tua nhanh thời gian để kích hoạt setTimeout ẩn Toast (cover dòng 131-146)
		await act(async () => {
			jest.runAllTimers();
		});

		// 5. Trả lại đồng hồ thật cho hệ thống
		jest.useRealTimers();
	});
});

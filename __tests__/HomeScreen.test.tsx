import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Animated } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";

import DashboardScreen from "../app/(tabs)/dashboard";
import { noteApi } from "../src/api/noteApi";
import { dashboardApi } from "../src/api/dashboardApi";

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
	});

	it("fetch dữ liệu và hiển thị thông tin User, Notes thành công", async () => {
		(noteApi.getNotes as jest.Mock).mockResolvedValue({
			data: { notes: mockNotes },
		});
		(dashboardApi.getMetrics as jest.Mock).mockResolvedValue({ data: {} });

		const { getByText, getByTestId } = render(<DashboardScreen />);

		await waitFor(() => {
			// 1. Kiểm tra Greeting lấy tên từ Redux
			expect(getByText("Hello, John Doe 👋")).toBeTruthy();

			// 2. Gọi API đủ
			expect(noteApi.getNotes).toHaveBeenCalledWith({ limit: 5 });
			expect(dashboardApi.getMetrics).toHaveBeenCalled();

			// 3. Hiển thị Note
			expect(getByText("Note 1 Large")).toBeTruthy();
			expect(getByText("Note 2 Normal")).toBeTruthy();
		});

		// Test Điều hướng vào Note
		fireEvent.press(getByTestId("note-card-1"));
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
});

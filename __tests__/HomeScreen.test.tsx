// __tests__/screens/HomeScreen.test.tsx
import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Animated, Alert } from "react-native";
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
	batchApi: { getBatches: jest.fn(), updateBatch: jest.fn() },
}));
jest.mock("@expo/vector-icons", () => ({
	Feather: "Feather",
	Ionicons: "Ionicons",
}));

// --- MOCK SAFE AREA CONTEXT (Cần thiết cho việc hiển thị linh động bottom Toast) ---
jest.mock("react-native-safe-area-context", () => {
	const inset = { top: 0, right: 0, bottom: 20, left: 0 }; // Giả lập bottom insets = 20
	const React = require("react");
	const { View } = require("react-native");
	return {
		SafeAreaProvider: ({ children }: any) => <View>{children}</View>,
		SafeAreaConsumer: ({ children }: any) => children(inset),
		useSafeAreaInsets: () => inset,
		SafeAreaView: ({ children, style }: any) => (
			<View style={style}>{children}</View>
		),
	};
});

// Mock FolderSelectModal
jest.mock("../src/components/common/FolderSelectModal", () => {
	const { View, TouchableOpacity, Text } = require("react-native");
	return {
		FolderSelectModal: ({ visible, onSelect }: any) => {
			if (!visible) return null;
			return (
				<View testID="mock-folder-modal">
					<TouchableOpacity
						testID="mock-select-folder"
						onPress={() => onSelect({ id: "f1", name: "Work Docs" })}
					>
						<Text>Select Work Docs</Text>
					</TouchableOpacity>
				</View>
			);
		},
	};
});

// Mock Alert
jest.spyOn(Alert, "alert");

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
			expect(getByText("Hello, John Doe")).toBeTruthy();
			expect(noteApi.getNotes).toHaveBeenCalledWith({ limit: 10 });
			expect(dashboardApi.getMetrics).toHaveBeenCalled();
			expect(getByText("Note 1 Large")).toBeTruthy();
			expect(getByText("Note 2 Normal")).toBeTruthy();
		});

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
		expect(Animated.spring).toHaveBeenCalled();
	});

	it("bỏ qua khởi tạo Animation Toast nếu hệ thống không hỗ trợ (Fallback)", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({ showToast: "true" });

		// Cố tình làm mất hàm timing để giả lập môi trường thiếu thư viện
		const originalTiming = Animated.timing;
		(Animated as any).timing = undefined;

		render(<DashboardScreen />);

		// Không gọi spring do bị return sớm
		expect(Animated.spring).not.toHaveBeenCalled();

		// Trả lại hàm gốc cho các test khác
		(Animated as any).timing = originalTiming;
	});

	it("hiển thị Avatar dạng Image khi user có avatarUrl", async () => {
		(useSelector as unknown as jest.Mock).mockReturnValue({
			user: { ...mockUser, avatarUrl: "https://example.com/avatar.jpg" },
		});
		(noteApi.getNotes as jest.Mock).mockResolvedValue({ data: { notes: [] } });
		(dashboardApi.getMetrics as jest.Mock).mockResolvedValue({ data: null });

		const { queryByText } = render(<DashboardScreen />);
		await waitFor(() => {
			expect(queryByText("JO")).toBeNull();
			expect(queryByText("JD")).toBeNull();
		});
	});

	it('hiển thị Avatar mặc định "JD" khi user bị null', async () => {
		(useSelector as unknown as jest.Mock).mockReturnValue({ user: null });
		(noteApi.getNotes as jest.Mock).mockResolvedValue({ data: { notes: [] } });
		(dashboardApi.getMetrics as jest.Mock).mockResolvedValue({ data: null });

		const { getByText } = render(<DashboardScreen />);
		await waitFor(() => expect(getByText("JD")).toBeTruthy());
	});

	it("hiển thị danh sách PDF và điều hướng sang trang PDF Details", async () => {
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
		await waitFor(() => expect(getByText("My PDF")).toBeTruthy());

		fireEvent.press(getByTestId("card-batch-1"));
		expect(mockPush).toHaveBeenCalledWith({
			pathname: "/pdf-details",
			params: { pdfUrl: "https://pdf.com", title: "My PDF" },
		});
	});

	it("không crash và ghi log console.error nếu API bị lỗi mạng", async () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation();
		(noteApi.getNotes as jest.Mock).mockRejectedValue(
			new Error("Network Error"),
		);
		(dashboardApi.getMetrics as jest.Mock).mockRejectedValue(
			new Error("Network Error"),
		);

		const { getByText } = render(<DashboardScreen />);
		await waitFor(() => {
			expect(getByText("Hello, John Doe")).toBeTruthy();
			expect(consoleSpy).toHaveBeenCalledWith(
				"Lỗi tải Dashboard:",
				expect.any(Error),
			);
		});
		consoleSpy.mockRestore();
	});

	it("xử lý tương tác chọn Move Folder thành công từ Toast", async () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			showToast: "true",
			batchId: "batch-123",
			batchTitle: "New Scan",
		});
		(batchApi.updateBatch as jest.Mock).mockResolvedValue({ data: "success" });

		const { getByText, getByTestId } = render(<DashboardScreen />);

		// Toast xuất hiện, bấm nút Move
		expect(getByText("New Scan")).toBeTruthy();
		fireEvent.press(getByText("Move"));

		// Modal hiện lên, bấm chọn thư mục "Work Docs"
		await waitFor(() => expect(getByTestId("mock-folder-modal")).toBeTruthy());
		fireEvent.press(getByTestId("mock-select-folder"));

		// Xác minh API được gọi chuẩn và Alert hiện lên
		await waitFor(() => {
			expect(batchApi.updateBatch).toHaveBeenCalledWith("batch-123", {
				folderId: "f1",
			});
			expect(Alert.alert).toHaveBeenCalledWith(
				"Success",
				"Document moved to Work Docs",
			);
		});
	});

	it("xử lý lỗi khi chọn Folder từ Toast thất bại", async () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			showToast: "true",
			batchId: "batch-123",
		});
		(batchApi.updateBatch as jest.Mock).mockRejectedValue(
			new Error("Move error"),
		);

		const { getByText, getByTestId } = render(<DashboardScreen />);

		fireEvent.press(getByText("Move"));
		await waitFor(() => expect(getByTestId("mock-folder-modal")).toBeTruthy());

		fireEvent.press(getByTestId("mock-select-folder"));

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Failed to move the document.",
			);
		});
	});

	it("xử lý mượt mà khi danh sách note trả về bị undefined", async () => {
		(noteApi.getNotes as jest.Mock).mockResolvedValue({ data: {} });
		(dashboardApi.getMetrics as jest.Mock).mockResolvedValue({ data: {} });

		const { queryByTestId } = render(<DashboardScreen />);
		await waitFor(() => expect(queryByTestId("card-1")).toBeNull());
	});
});

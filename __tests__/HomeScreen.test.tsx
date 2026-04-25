import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import DashboardScreen from "../app/(tabs)/dashboard";

// --- 1. MOCK EXPO ROUTER ---
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
	useRouter: jest.fn(() => ({ push: mockPush })),
	useLocalSearchParams: jest.fn(() => ({ showToast: "false" })),
	// THAY ĐỔI Ở ĐÂY: Dùng require('react') trực tiếp để lách luật Jest
	useFocusEffect: jest.fn((cb) => require("react").useEffect(cb, [])),
}));

// --- 2. MOCK VECTOR ICONS ---
jest.mock("@expo/vector-icons", () => ({
	Feather: "Feather",
	Ionicons: "Ionicons",
}));

// --- 3. MOCK REDUX ---
jest.mock("react-redux", () => ({
	useDispatch: () => jest.fn(),
	useSelector: jest.fn((callback) => {
		const fakeState = {
			auth: {
				user: { id: "1", displayName: "John Doe", email: "test@example.com" },
			},
		};
		return callback(fakeState);
	}),
}));

// --- 4. MOCK API CỦA DASHBOARD ---
jest.mock("../src/api/noteApi", () => ({
	noteApi: {
		getNotes: jest.fn().mockResolvedValue({
			data: {
				notes: [
					{
						id: "note-123",
						title: "Calculus Formula",
						content: "Derivative definition...",
						status: "PROCESSED",
					},
				],
			},
		}),
	},
}));

jest.mock("../src/api/dashboardApi", () => ({
	dashboardApi: {
		getMetrics: jest.fn().mockResolvedValue({
			data: { totalNotes: 10, studyNotes: 5 },
		}),
	},
}));

describe("HomeScreen (Dashboard) - Deep Tests", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	// Kịch bản 1: Render các text tĩnh và dữ liệu Redux (Tên User)
	it("renders greeting and logo correctly", async () => {
		const { getByText, getByPlaceholderText } = render(<DashboardScreen />);

		// FIX LỖI ACT(...): Bọc trong waitFor để Jest chờ dữ liệu API load xong
		await waitFor(() => {
			expect(getByText("Snapify")).toBeTruthy();
			expect(getByText("Hello, John Doe")).toBeTruthy();
			expect(getByText("JO")).toBeTruthy();
			expect(getByPlaceholderText("Search notes, folders...")).toBeTruthy();
		});
	});

	// Kịch bản 2: Render dữ liệu từ API (Ghi chú gần đây)
	it("fetches and renders recent notes from API", async () => {
		const { getByText } = render(<DashboardScreen />);

		await waitFor(() => {
			expect(getByText("Calculus Formula")).toBeTruthy();
			expect(getByText("PROCESSED")).toBeTruthy();
		});
	});

	// Kịch bản 3: Tương tác chuyển trang (Navigation)
	it("navigates to specific routes when elements are pressed", async () => {
		const { getByText } = render(<DashboardScreen />);

		// Đợi API load xong giao diện rồi mới tiến hành bấm
		await waitFor(() => {
			expect(getByText("View All")).toBeTruthy();
		});

		// Bấm vào nút "View All"
		const viewAllBtn = getByText("View All");
		fireEvent.press(viewAllBtn);
		expect(mockPush).toHaveBeenCalledWith("/all-notes");

		// Bấm vào Avatar
		const avatarBtn = getByText("JO");
		fireEvent.press(avatarBtn);
		expect(mockPush).toHaveBeenCalledWith("/profile");

		// Bấm vào Ghi chú
		const noteCard = getByText("Calculus Formula");
		fireEvent.press(noteCard);
		expect(mockPush).toHaveBeenCalledWith("/note/note-123");
	});
});

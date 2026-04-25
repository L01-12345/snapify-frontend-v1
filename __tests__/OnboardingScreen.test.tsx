import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import OnboardingScreen from "../app/onboarding";
import { useRouter } from "expo-router";

// --- MOCK CÁC THÀNH PHẦN NATIVE ---
jest.mock("@expo/vector-icons", () => ({
	Feather: "Feather",
}));

jest.mock("expo-linear-gradient", () => ({
	LinearGradient: "LinearGradient",
}));

// --- MOCK EXPO ROUTER ---
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
	useRouter: jest.fn(() => ({ replace: mockReplace })),
}));

describe("OnboardingScreen - Deep Tests", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	// Kịch bản 1: Đảm bảo giao diện render đầy đủ (Không crash)
	it("renders correctly without crashing", () => {
		const { toJSON } = render(<OnboardingScreen />);
		expect(toJSON()).toBeDefined();
	});

	// Kịch bản 2: Render chính xác Text của Slide đầu tiên
	it("renders the first slide texts correctly", () => {
		const { getByText } = render(<OnboardingScreen />);

		// Tìm chính xác Title của slide 1
		expect(getByText("Snap it...\nthen lose it?")).toBeTruthy();

		// Tìm chính xác Subtitle của slide 1
		expect(
			getByText(
				"You take hundreds of photos of lecture slides, whiteboards, and documents, but can never find them when needed.",
			),
		).toBeTruthy();
	});

	// Kịch bản 3: Tương tác với nút Skip
	it("navigates to login when Skip is pressed", () => {
		const { getByText } = render(<OnboardingScreen />);

		// Tìm nút Skip và giả lập thao tác bấm
		const skipButton = getByText("Skip");
		fireEvent.press(skipButton);

		// Kiểm tra xem hàm router.replace có được gọi với đúng đường dẫn không
		expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
	});

	// Kịch bản 4: Render Button Get Started (Của slide cuối)
	it("renders Get Started button correctly", () => {
		const { getByText } = render(<OnboardingScreen />);

		// Dù nằm ở slide cuối (trong FlatList), Jest vẫn render Text này ra DOM ảo
		expect(getByText("Ready to\nNote Smarter?")).toBeTruthy();
		expect(getByText("Get Started")).toBeTruthy();
	});
});

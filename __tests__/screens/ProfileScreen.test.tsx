import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";

import ProfileScreen from "../../app/(tabs)/profile";
import { userApi } from "../../src/api/userApi";
import { authApi } from "../../src/api/authApi";
import { updateUserInfo } from "../../src/store/slices/authSlice";

// --- MOCK MODULES ---
jest.mock("expo-router", () => ({
	useRouter: jest.fn(() => ({ back: jest.fn() })),
	Tabs: { Screen: () => null },
}));

jest.mock("react-redux", () => ({
	useSelector: jest.fn(),
	useDispatch: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
	launchImageLibraryAsync: jest.fn(),
}));

jest.mock("../../src/api/userApi", () => ({
	userApi: { updateProfile: jest.fn(), uploadAvatar: jest.fn() },
}));

jest.mock("../../src/api/authApi", () => ({
	authApi: { forgotPassword: jest.fn(), resetPassword: jest.fn() },
}));

jest.mock("@expo/vector-icons", () => ({ Feather: "Feather" }));
jest.spyOn(Alert, "alert");
jest.mock("../../src/store/slices/authSlice", () => ({
	// Giả lập hàm action creator của Redux trả về 1 object đơn giản
	updateUserInfo: jest.fn((payload) => ({
		type: "auth/updateUserInfo",
		payload,
	})),
}));

describe("ProfileScreen - Quản lý trang cá nhân", () => {
	const mockDispatch = jest.fn();
	const mockUser = { email: "test@abc.com", displayName: "John", bio: "Dev" };

	beforeEach(() => {
		jest.clearAllMocks();
		(useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
		(useSelector as unknown as jest.Mock).mockReturnValue({ user: mockUser });
	});

	it("lưu thông tin Profile thành công và dispatch Redux", async () => {
		(userApi.updateProfile as jest.Mock).mockResolvedValue({
			status: "success",
		});

		const { getByTestId } = render(<ProfileScreen />);

		fireEvent.changeText(getByTestId("profile-name-input"), "John Updated");
		fireEvent.changeText(getByTestId("profile-bio-input"), "Senior Dev");

		await act(async () => {
			fireEvent.press(getByTestId("save-profile-btn"));
		});

		await waitFor(() => {
			expect(userApi.updateProfile).toHaveBeenCalledWith({
				displayName: "John Updated",
				bio: "Senior Dev",
			});
			// Đảm bảo Redux được gọi để update state toàn cục
			expect(mockDispatch).toHaveBeenCalledWith(
				updateUserInfo({
					displayName: "John Updated",
					bio: "Senior Dev",
				}),
			);
			expect(Alert.alert).toHaveBeenCalledWith(
				"Success",
				"Profile updated successfully.",
			);
		});
	});

	it("luồng Đổi Mật Khẩu (Change Password Flow)", async () => {
		(authApi.forgotPassword as jest.Mock).mockResolvedValue({});
		(authApi.resetPassword as jest.Mock).mockResolvedValue({});

		const { getByTestId, getByText } = render(<ProfileScreen />);

		// 1. Nhập mật khẩu mới ngắn -> Báo lỗi
		fireEvent.changeText(getByTestId("new-password-input"), "123");
		fireEvent.press(getByTestId("change-pass-btn"));
		expect(Alert.alert).toHaveBeenCalledWith(
			"Notice",
			"Please enter a new password (at least 6 characters).",
		);

		// 2. Nhập mật khẩu mới hợp lệ -> Mở Modal OTP
		fireEvent.changeText(getByTestId("new-password-input"), "newpass123");
		await act(async () => {
			fireEvent.press(getByTestId("change-pass-btn"));
		});

		await waitFor(() => {
			expect(authApi.forgotPassword).toHaveBeenCalledWith({
				email: "test@abc.com",
			});
			expect(getByText("Verify OTP")).toBeTruthy(); // Modal OTP đã mở
		});

		// 3. Nhập mã OTP và Xác nhận
		fireEvent.changeText(getByTestId("otp-input"), "654321");
		await act(async () => {
			fireEvent.press(getByTestId("confirm-otp-btn"));
		});

		await waitFor(() => {
			expect(authApi.resetPassword).toHaveBeenCalledWith({
				email: "test@abc.com",
				otp: "654321",
				newPassword: "newpass123",
			});
			expect(Alert.alert).toHaveBeenCalledWith(
				"Success",
				"Your password has been changed successfully.",
			);
		});
	});

	it("chọn và upload Avatar thành công", async () => {
		(ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
			canceled: false,
			assets: [{ uri: "file://new-avatar.jpg" }],
		});
		(userApi.uploadAvatar as jest.Mock).mockResolvedValue({
			status: "success",
		});

		const { getByTestId } = render(<ProfileScreen />);

		await act(async () => {
			fireEvent.press(getByTestId("avatar-picker"));
		});

		await waitFor(() => {
			expect(userApi.uploadAvatar).toHaveBeenCalledWith(
				"file://new-avatar.jpg",
				"avatar.jpg",
				"image/jpeg",
			);
			expect(mockDispatch).toHaveBeenCalledWith(
				updateUserInfo({
					avatarUrl: "file://new-avatar.jpg",
				}),
			);
		});
	});
	it("không gọi API upload nếu người dùng hủy chọn ảnh từ thư viện", async () => {
		// Giả lập người dùng mở thư viện nhưng bấm Cancel (Cover line 113)
		(ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
			canceled: true,
		});

		const { getByTestId } = render(<ProfileScreen />);

		await act(async () => {
			fireEvent.press(getByTestId("avatar-picker"));
		});

		// Đảm bảo API uploadAvatar không bị gọi
		expect(userApi.uploadAvatar).not.toHaveBeenCalled();
	});

	it("báo lỗi nếu xác nhận OTP nhưng để trống", async () => {
		const { getByTestId } = render(<ProfileScreen />);

		// Gọi hàm trigger để mở modal OTP
		fireEvent.changeText(getByTestId("new-password-input"), "newpass123");
		await act(async () => {
			fireEvent.press(getByTestId("change-pass-btn"));
		});

		// Cố tình bỏ trống Input OTP và bấm Confirm (Cover line 87)
		fireEvent.changeText(getByTestId("otp-input"), "");
		await act(async () => {
			fireEvent.press(getByTestId("confirm-otp-btn"));
		});

		expect(Alert.alert).toHaveBeenCalledWith("Error", "Please enter the OTP.");
	});

	it("hoạt động đúng các nút Đóng/Hủy Modal", async () => {
		const { getByTestId, queryByText } = render(<ProfileScreen />);

		// 1. Test mở và đóng Settings Modal (Cover line 142+)
		fireEvent.press(getByTestId("settings-btn"));
		// Giả lập Component SettingsModal đã mock gọi hàm onClose()
		// Lưu ý: Nếu bạn chưa mock onClose cho SettingsModal, hãy đảm bảo nút close hoạt động.

		// 2. Test nút Cancel trong Modal OTP (Cover hàm onPress của cancelBtn)
		fireEvent.changeText(getByTestId("new-password-input"), "newpass123");
		await act(async () => {
			fireEvent.press(getByTestId("change-pass-btn"));
		});

		// Bấm nút Cancel trên Modal OTP (Yêu cầu bạn phải có testID="cancel-otp-btn" ở dòng 237 của profile.tsx)
		// Code ở profile.tsx: <TouchableOpacity style={styles.cancelBtn} onPress={() => setOtpModalVisible(false)} testID="cancel-otp-btn">
		const cancelOtpBtn = getByTestId("cancel-otp-btn");
		fireEvent.press(cancelOtpBtn);

		// Đảm bảo Modal đã bị tắt (Không còn nút verify nữa)
		await waitFor(() => {
			expect(queryByText("Verify OTP")).toBeNull();
		});
	});
	it("báo lỗi khi API Cập nhật Profile thất bại (Cover line 60)", async () => {
		(userApi.updateProfile as jest.Mock).mockRejectedValue(
			new Error("Update failed"),
		);
		const { getByTestId } = render(<ProfileScreen />);

		await act(async () => {
			fireEvent.press(getByTestId("save-profile-btn"));
		});

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith("Error", "Update failed");
		});
	});

	it("báo lỗi khi API Gửi OTP thất bại (Cover line 87)", async () => {
		(authApi.forgotPassword as jest.Mock).mockRejectedValue(
			new Error("OTP send failed"),
		);
		const { getByTestId } = render(<ProfileScreen />);

		fireEvent.changeText(getByTestId("new-password-input"), "newpass123");

		await act(async () => {
			fireEvent.press(getByTestId("change-pass-btn"));
		});

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Failed to send OTP. Please try again.",
			);
		});
	});

	it("báo lỗi khi API Xác nhận Đổi mật khẩu thất bại do sai OTP (Cover line 113)", async () => {
		(authApi.forgotPassword as jest.Mock).mockResolvedValue({});
		(authApi.resetPassword as jest.Mock).mockRejectedValue(
			new Error("Wrong OTP"),
		);

		const { getByTestId } = render(<ProfileScreen />);

		// 1. Mở Modal OTP
		fireEvent.changeText(getByTestId("new-password-input"), "newpass123");
		await act(async () => {
			fireEvent.press(getByTestId("change-pass-btn"));
		});

		// 2. Nhập OTP và xác nhận
		fireEvent.changeText(getByTestId("otp-input"), "111111");
		await act(async () => {
			fireEvent.press(getByTestId("confirm-otp-btn"));
		});

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Invalid or expired OTP.",
			);
		});
	});

	it("báo lỗi khi API Upload Avatar thất bại (Cover line 142)", async () => {
		(ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
			canceled: false,
			assets: [{ uri: "file://new-avatar.jpg" }],
		});
		(userApi.uploadAvatar as jest.Mock).mockRejectedValue(
			new Error("Upload error"),
		);

		const { getByTestId } = render(<ProfileScreen />);

		await act(async () => {
			fireEvent.press(getByTestId("avatar-picker"));
		});

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Failed to upload image.",
			);
		});
	});

	it("hiển thị Avatar mặc định (JD) nếu user không có displayName và avatarUrl (Cover line 154)", () => {
		// Ép Redux trả về user rỗng (không tên, không ảnh)
		(useSelector as unknown as jest.Mock).mockReturnValue({
			user: { email: "test@abc.com" },
		});

		const { getByText } = render(<ProfileScreen />);

		// Phải hiển thị được chữ JD (Fallback)
		expect(getByText("JD")).toBeTruthy();
	});
});

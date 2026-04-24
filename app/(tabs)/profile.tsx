// app/(tabs)/profile.tsx
import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
	Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, Tabs } from "expo-router"; // Import Tabs để can thiệp Tab Bar
import { COLORS } from "../../src/constants/theme";
import { Input } from "../../src/components/common/Input";
import { Button } from "../../src/components/common/Button";
import { SettingsModal } from "../../src/components/common/SettingsModal"; // Import Modal

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../src/store";
import { userApi } from "../../src/api/userApi";
import { authApi } from "../../src/api/authApi";
import { updateUserInfo } from "../../src/store/slices/authSlice";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {
	const router = useRouter();
	const [modalVisible, setModalVisible] = useState(false);

	const dispatch = useDispatch();
	const { user } = useSelector((state: RootState) => state.auth);
	console.log(user);

	// Local state cho form chỉnh sửa
	const [displayName, setDisplayName] = useState(user?.displayName || "");
	const [isUpdating, setIsUpdating] = useState(false);
	const [bio, setBio] = useState(user?.bio || "");
	const [loading, setLoading] = useState(false);

	// State cho luồng OTP Change Password
	const [otpModalVisible, setOtpModalVisible] = useState(false);
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [isRequestingOtp, setIsRequestingOtp] = useState(false);

	const handleSaveChanges = async () => {
		try {
			setLoading(true);
			// Gọi API cập nhật thông tin
			const response = await userApi.updateProfile({ displayName, bio });

			if (response.status === "success") {
				// Cập nhật lại Redux Store để Dashboard và các màn hình khác nhận diện thay đổi
				dispatch(updateUserInfo({ displayName, bio }));
				Alert.alert("Thành công", "Thông tin hồ sơ đã được cập nhật.");
			}
		} catch (error: any) {
			Alert.alert("Lỗi", error.message || "Không thể cập nhật hồ sơ.");
		} finally {
			setLoading(false);
		}
	};

	// 1. Xử lý Upload Avatar
	const handlePickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.5, // Nén ảnh để upload nhanh hơn
		});

		if (!result.canceled && result.assets[0]) {
			const image = result.assets[0];
			try {
				setIsUpdating(true);
				// Gọi API upload avatar
				const response = await userApi.uploadAvatar(
					image.uri,
					"avatar.jpg",
					"image/jpeg",
				);
				if (response.status === "success") {
					// Giả sử API trả về URL ảnh mới trong message hoặc data
					dispatch(updateUserInfo({ avatarUrl: image.uri }));
					Alert.alert("Thành công", "Ảnh đại diện đã được thay đổi.");
				}
			} catch (error: any) {
				Alert.alert("Lỗi", error.message || "Không thể upload ảnh.");
			} finally {
				setIsUpdating(false);
			}
		}
	};

	// 2. Yêu cầu OTP để đổi mật khẩu
	const handleRequestOtp = async () => {
		if (!user?.email) return;
		try {
			setIsRequestingOtp(true);
			// Gọi API forgot-password để nhận OTP qua email
			await authApi.forgotPassword({ email: user.email });
			setOtpModalVisible(true);
			Alert.alert("OTP Sent", "Vui lòng kiểm tra email để lấy mã xác thực.");
		} catch (error: any) {
			Alert.alert("Lỗi", error.message || "Không thể gửi yêu cầu.");
		} finally {
			setIsRequestingOtp(false);
		}
	};

	// 3. Xác nhận đổi mật khẩu với OTP
	const handleConfirmReset = async () => {
		if (!otp || !newPassword) {
			Alert.alert("Lỗi", "Vui lòng nhập đầy đủ OTP và mật khẩu mới.");
			return;
		}
		try {
			setIsUpdating(true);
			// Gọi API reset-password kèm mã OTP
			await authApi.resetPassword({
				email: user?.email || "",
				otp,
				newPassword,
			});
			setOtpModalVisible(false);
			setOtp("");
			setNewPassword("");
			Alert.alert("Thành công", "Mật khẩu đã được thay đổi.");
		} catch (error: any) {
			Alert.alert("Lỗi", error.message || "Mã OTP không chính xác.");
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			{/* Thủ thuật ẩn Tab Bar chỉ riêng ở màn hình Profile này */}
			<Tabs.Screen options={{ tabBarStyle: { display: "none" } }} />

			{/* Header mới với nút Back và 3 chấm */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
					<Feather name="arrow-left" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>My Profile</Text>
				<TouchableOpacity
					onPress={() => setModalVisible(true)}
					style={styles.iconBtn}
				>
					<Feather name="more-vertical" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					{/* Avatar Section */}
					<View style={styles.avatarContainer}>
						<TouchableOpacity
							style={styles.avatarBox}
							onPress={handlePickImage}
						>
							{isUpdating ? (
								<ActivityIndicator color={COLORS.primary} />
							) : (
								<Text style={styles.avatarText}>
									{user?.displayName?.substring(0, 2).toUpperCase() || "JD"}
								</Text>
							)}
							<View style={styles.editBadge}>
								<Feather name="camera" size={14} color={COLORS.white} />
							</View>
						</TouchableOpacity>
					</View>

					{/* Personal Info */}
					{/* <View style={styles.formSection}>
						<Input label="Display Name" value="John Doe" />
						<Input
							label="Email Address (Read-only)"
							value="john.doe@example.com"
							editable={false}
						/>
					</View> */}
					<View style={styles.formSection}>
						<Input
							label="Display Name"
							value={displayName}
							onChangeText={setDisplayName}
						/>
						<Input
							label="Email Address (Read-only)"
							value={user?.email || ""}
							editable={false}
						/>
						<Input
							label="Bio"
							value={bio}
							onChangeText={setBio}
							placeholder="Tell me about your story..."
						/>
					</View>

					<View style={styles.divider} />

					{/* Change Password */}
					<View style={styles.formSection}>
						<Text style={styles.sectionTitle}>Change Password</Text>
						{/* <Input label="Current Password" value="password123" isPassword />
						<Input
							label="New Password"
							placeholder="Enter new password"
							isPassword
						/> */}
						<Button
							title={isRequestingOtp ? "Sending OTP..." : "Change Password"}
							type="secondary"
							onPress={handleRequestOtp}
							disabled={isRequestingOtp}
						/>
					</View>
				</ScrollView>

				{/* Save Button (Được đưa xuống dưới cùng do Tab Bar đã ẩn) */}
				<View style={styles.footer}>
					<Button
						title={loading ? "Đang lưu..." : "Save Changes"}
						onPress={handleSaveChanges}
						disabled={loading}
					/>
				</View>
			</KeyboardAvoidingView>

			{/* Tích hợp Option Modal */}
			<SettingsModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
			/>
			{/* Modal Nhập OTP & Mật Khẩu Mới */}
			<Modal visible={otpModalVisible} transparent animationType="fade">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Xác thực đổi mật khẩu</Text>
						<Text style={styles.modalDesc}>
							Mã OTP đã được gửi tới {user?.email}
						</Text>

						<Input
							label="Mã OTP"
							placeholder="123456"
							value={otp}
							onChangeText={setOtp}
						/>
						<Input
							label="Mật khẩu mới"
							isPassword
							value={newPassword}
							onChangeText={setNewPassword}
						/>

						<View style={styles.modalActions}>
							<TouchableOpacity
								onPress={() => setOtpModalVisible(false)}
								style={styles.cancelBtn}
							>
								<Text style={styles.cancelBtnText}>Hủy</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleConfirmReset}
								style={styles.confirmBtn}
							>
								<Text style={styles.confirmBtnText}>Xác nhận</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.white },
	header: {
		height: 60,
		flexDirection: "row", // Dàn hàng ngang
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		backgroundColor: COLORS.white,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate100,
	},
	iconBtn: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.slate900 },
	scrollContent: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
	avatarContainer: { alignItems: "center", marginBottom: 32 },
	avatarBox: {
		width: 96,
		height: 96,
		borderRadius: 48,
		backgroundColor: "#EEF2FF",
		borderWidth: 4,
		borderColor: COLORS.white,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.5,
		shadowRadius: 8,
		elevation: 5,
	},
	avatarText: { fontSize: 32, fontWeight: "bold", color: COLORS.primary },
	editBadge: {
		position: "absolute",
		bottom: 0,
		right: 0,
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: COLORS.primaryEnd,
		borderWidth: 2,
		borderColor: COLORS.white,
		alignItems: "center",
		justifyContent: "center",
	},
	formSection: { gap: 8 },
	divider: { height: 1, backgroundColor: COLORS.slate200, marginVertical: 24 },
	sectionTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.slate900,
		marginBottom: 16,
	},
	footer: {
		paddingHorizontal: 24,
		paddingVertical: 16,
		backgroundColor: COLORS.white,
		borderTopWidth: 1,
		borderTopColor: COLORS.slate100,
		// Thêm padding cho các thiết bị không có phím home vật lý
		paddingBottom: Platform.OS === "ios" ? 32 : 24,
	},
	// Modal Styles
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		padding: 24,
	},
	modalContent: {
		backgroundColor: "white",
		borderRadius: 24,
		padding: 24,
		gap: 16,
	},
	modalTitle: { fontSize: 20, fontWeight: "800", color: COLORS.slate900 },
	modalDesc: { fontSize: 14, color: COLORS.slate500 },
	modalActions: { flexDirection: "row", gap: 12, marginTop: 12 },
	cancelBtn: { flex: 1, padding: 16, alignItems: "center" },
	cancelBtnText: { color: COLORS.slate400, fontWeight: "700" },
	confirmBtn: {
		flex: 1,
		backgroundColor: COLORS.primary,
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	confirmBtnText: { color: "white", fontWeight: "700" },
});

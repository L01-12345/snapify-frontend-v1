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
	Alert,
	Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, Tabs } from "expo-router";
import { COLORS } from "../../src/constants/theme";
import { Input } from "../../src/components/common/Input";
import { Button } from "../../src/components/common/Button";
import { SettingsModal } from "../../src/components/common/SettingsModal";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../src/store";
import { userApi } from "../../src/api/userApi";
import { authApi } from "../../src/api/authApi";
import { updateUserInfo } from "../../src/store/slices/authSlice";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {
	const router = useRouter();
	const [modalVisible, setModalVisible] = useState(false);
	const dispatch = useDispatch();
	const { user } = useSelector((state: RootState) => state.auth);

	// Personal Info State
	const [displayName, setDisplayName] = useState(user?.displayName || "");
	const [bio, setBio] = useState(user?.bio || "");
	const [loadingProfile, setLoadingProfile] = useState(false);

	// Password & OTP State
	const [newPassword, setNewPassword] = useState("");
	const [otpModalVisible, setOtpModalVisible] = useState(false);
	const [otp, setOtp] = useState("");
	const [isRequestingOtp, setIsRequestingOtp] = useState(false);
	const [isConfirmingPassword, setIsConfirmingPassword] = useState(false);
	const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

	// 1. Update Profile (Name & Bio)
	const handleSaveProfile = async () => {
		try {
			setLoadingProfile(true);
			const response = await userApi.updateProfile({ displayName, bio });
			if (response.status === "success") {
				dispatch(updateUserInfo({ displayName, bio }));
				Alert.alert("Success", "Profile updated successfully.");
			}
		} catch (error: any) {
			Alert.alert("Error", error.message || "Failed to update profile.");
		} finally {
			setLoadingProfile(false);
		}
	};

	// 2. Trigger OTP for Password Change
	const handleTriggerChangePassword = async () => {
		if (!newPassword || newPassword.length < 6) {
			Alert.alert(
				"Notice",
				"Please enter a new password (at least 6 characters).",
			);
			return;
		}

		try {
			setIsRequestingOtp(true);
			await authApi.forgotPassword({ email: user?.email || "" });

			// SHOW OTP MODAL
			setOtpModalVisible(true);
			Alert.alert(
				"OTP Sent",
				"A verification code has been sent to your email.",
			);
		} catch (error: any) {
			Alert.alert("Error", "Failed to send OTP. Please try again.");
		} finally {
			setIsRequestingOtp(false);
		}
	};

	// 3. Verify OTP and finalize change
	const handleVerifyAndChangePassword = async () => {
		if (!otp) {
			Alert.alert("Error", "Please enter the OTP.");
			return;
		}

		try {
			setIsConfirmingPassword(true);
			await authApi.resetPassword({
				email: user?.email || "",
				otp,
				newPassword,
			});

			setOtpModalVisible(false);
			setOtp("");
			setNewPassword("");
			Alert.alert("Success", "Your password has been changed successfully.");
		} catch (error: any) {
			Alert.alert("Error", "Invalid or expired OTP.");
		} finally {
			setIsConfirmingPassword(false);
		}
	};

	// 4. Avatar Upload
	const handlePickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.5,
		});

		if (!result.canceled && result.assets[0]) {
			const image = result.assets[0];
			try {
				setIsUpdatingAvatar(true);
				const response = await userApi.uploadAvatar(
					image.uri,
					"avatar.jpg",
					"image/jpeg",
				);
				if (response.status === "success") {
					dispatch(updateUserInfo({ avatarUrl: image.uri }));
					Alert.alert("Success", "Profile picture updated.");
				}
			} catch (error: any) {
				Alert.alert("Error", "Failed to upload image.");
			} finally {
				setIsUpdatingAvatar(false);
			}
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<Tabs.Screen options={{ tabBarStyle: { display: "none" } }} />

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
				<ScrollView contentContainerStyle={styles.scrollContent}>
					{/* Avatar */}
					<View style={styles.avatarContainer}>
						<TouchableOpacity
							style={styles.avatarBox}
							onPress={handlePickImage}
						>
							{isUpdatingAvatar ? (
								<ActivityIndicator color={COLORS.primary} />
							) : user?.avatarUrl ? (
								<Image
									source={{ uri: user.avatarUrl }}
									style={styles.avatarImage}
								/>
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
					<View style={styles.formSection}>
						<Input
							label="Display Name"
							value={displayName}
							onChangeText={setDisplayName}
						/>
						<Input
							label="Email (Read-only)"
							value={user?.email || ""}
							editable={false}
						/>
						<Input
							label="Bio"
							value={bio}
							onChangeText={setBio}
							multiline
							placeholder="Tell me about yourself..."
						/>
					</View>

					<View style={styles.divider} />

					{/* Password Section */}
					<View style={styles.formSection}>
						<Text style={styles.sectionTitle}>Security</Text>
						<Input
							label="New Password"
							placeholder="Enter new password"
							isPassword
							value={newPassword}
							onChangeText={setNewPassword}
						/>

						{/* SỬ DỤNG TOUCHABLE OPACITY THAY VÌ BUTTON COMPONENT ĐỂ ĐẢM BẢO HIỂN THỊ */}
						<TouchableOpacity
							style={styles.changePasswordBtn}
							onPress={handleTriggerChangePassword}
							disabled={isRequestingOtp}
						>
							{isRequestingOtp ? (
								<ActivityIndicator color={COLORS.primary} />
							) : (
								<Text style={styles.changePasswordBtnText}>
									Change Password
								</Text>
							)}
						</TouchableOpacity>

						<Text style={styles.hintText}>
							* Verification OTP will be sent to your email.
						</Text>
					</View>
					<View style={{ height: 40 }} />
				</ScrollView>

				{/* Footer Button - Always visible at bottom */}
				<View style={styles.footer}>
					<Button
						title={loadingProfile ? "Saving..." : "Save Profile"}
						onPress={handleSaveProfile}
						disabled={loadingProfile}
					/>
				</View>
			</KeyboardAvoidingView>

			<SettingsModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
			/>

			{/* OTP MODAL */}
			<Modal visible={otpModalVisible} transparent animationType="slide">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Verify OTP</Text>
						<Text style={styles.modalDesc}>
							Enter the 6-digit code sent to {user?.email}
						</Text>

						<Input
							label="OTP Code"
							placeholder="123456"
							value={otp}
							onChangeText={setOtp}
							keyboardType="number-pad"
						/>

						<View style={styles.modalActions}>
							<TouchableOpacity
								style={styles.cancelBtn}
								onPress={() => setOtpModalVisible(false)}
							>
								<Text style={styles.cancelBtnText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.confirmBtn}
								onPress={handleVerifyAndChangePassword}
								disabled={isConfirmingPassword}
							>
								{isConfirmingPassword ? (
									<ActivityIndicator color="white" />
								) : (
									<Text style={styles.confirmBtnText}>Confirm</Text>
								)}
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
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
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
	scrollContent: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 20 },
	avatarContainer: { alignItems: "center", marginBottom: 32 },
	avatarBox: {
		width: 96,
		height: 96,
		borderRadius: 48,
		backgroundColor: "#EEF2FF",
		alignItems: "center",
		justifyContent: "center",
	},
	avatarImage: { width: 96, height: 96, borderRadius: 48 },
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
	formSection: { gap: 12 },
	divider: { height: 1, backgroundColor: COLORS.slate200, marginVertical: 24 },
	sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.slate900 },
	hintText: { fontSize: 12, color: COLORS.slate400, marginTop: 4 },
	footer: {
		padding: 24,
		borderTopWidth: 1,
		borderTopColor: COLORS.slate100,
		paddingBottom: Platform.OS === "ios" ? 40 : 24,
	},
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
	modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
	cancelBtn: { flex: 1, padding: 16, alignItems: "center" },
	cancelBtnText: { color: COLORS.slate400, fontWeight: "700" },
	confirmBtn: {
		flex: 1,
		backgroundColor: COLORS.primary,
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	confirmBtnText: { color: "white", fontWeight: "700" },
	changePasswordBtn: {
		backgroundColor: "#EEF2FF", // Nền màu xanh nhạt
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "#C7D2FE",
		marginTop: 4,
	},
	changePasswordBtnText: {
		color: COLORS.primary,
		fontSize: 14,
		fontWeight: "700",
	},
});

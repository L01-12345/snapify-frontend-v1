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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, Tabs } from "expo-router"; // Import Tabs để can thiệp Tab Bar
import { COLORS } from "../../src/constants/theme";
import { Input } from "../../src/components/common/Input";
import { Button } from "../../src/components/common/Button";
import { SettingsModal } from "../../src/components/common/SettingsModal"; // Import Modal

export default function ProfileScreen() {
	const router = useRouter();
	const [modalVisible, setModalVisible] = useState(false);

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
						<View style={styles.avatarBox}>
							<Text style={styles.avatarText}>JD</Text>
							<TouchableOpacity style={styles.editBadge}>
								<Feather name="edit-2" size={14} color={COLORS.white} />
							</TouchableOpacity>
						</View>
					</View>

					{/* Personal Info */}
					<View style={styles.formSection}>
						<Input label="Display Name" value="John Doe" />
						<Input
							label="Email Address (Read-only)"
							value="john.doe@example.com"
							editable={false}
						/>
					</View>

					<View style={styles.divider} />

					{/* Change Password */}
					<View style={styles.formSection}>
						<Text style={styles.sectionTitle}>Change Password</Text>
						<Input label="Current Password" value="password123" isPassword />
						<Input
							label="New Password"
							placeholder="Enter new password"
							isPassword
						/>
					</View>
				</ScrollView>

				{/* Save Button (Được đưa xuống dưới cùng do Tab Bar đã ẩn) */}
				<View style={styles.footer}>
					<Button
						title="Save Changes"
						onPress={() => console.log("Save Profile")}
					/>
				</View>
			</KeyboardAvoidingView>

			{/* Tích hợp Option Modal */}
			<SettingsModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
			/>
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
});

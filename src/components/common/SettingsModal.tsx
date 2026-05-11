// src/components/common/SettingsModal.tsx
import React from "react";
import {
	Modal,
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/theme";
import { logout } from "../../store/slices/authSlice";
import * as SecureStore from "expo-secure-store";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../src/store";

import {
	ResponsiveFontSize,
	ResponsiveSpacing,
	ResponsiveDimensions,
	ResponsiveBorderRadius,
	scale,
	getResponsiveShadow,
} from "../../utils/responsive";

interface SettingsModalProps {
	visible: boolean;
	onClose: () => void;
}

export const SettingsModal = ({ visible, onClose }: SettingsModalProps) => {
	const router = useRouter();
	const dispatch = useDispatch();
	const { user } = useSelector((state: RootState) => state.auth);

	const handleLogout = async () => {
		try {
			await SecureStore.deleteItemAsync("access_token");

			dispatch(logout());

			onClose();
			router.replace("/(auth)/login");
		} catch (error) {
			console.error("Lỗi khi đăng xuất:", error);
			onClose();
			router.replace("/(auth)/login");
		}
	};

	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType="slide"
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				{/* Nhấn ra ngoài để đóng Modal */}
				<TouchableWithoutFeedback onPress={onClose} testID="settings-backdrop">
					<View style={styles.backdrop} />
				</TouchableWithoutFeedback>

				{/* Nội dung Modal (Slide up) */}
				<View style={styles.modalContent}>
					<View style={styles.dragHandle} />

					<Text style={styles.sectionTitle}>APP SETTINGS</Text>

					<View style={styles.menuContainer}>
						<TouchableOpacity style={styles.menuItem}>
							<View style={styles.menuLeft}>
								<View style={styles.iconBox}>
									<Text style={styles.icon}>🎨</Text>
								</View>
								<View>
									<Text style={styles.menuTitle}>Appearance</Text>
									<Text style={styles.menuSubtitle}>Light Mode</Text>
								</View>
							</View>
							<Text style={styles.arrow}>❯</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.menuItem}>
							<View style={styles.menuLeft}>
								<View style={styles.iconBox}>
									<Text style={styles.icon}>🌐</Text>
								</View>
								<View>
									<Text style={styles.menuTitle}>Language</Text>
									<Text style={styles.menuSubtitle}>English (US)</Text>
								</View>
							</View>
							<Text style={styles.arrow}>❯</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.menuItem}>
							<View style={styles.menuLeft}>
								<View style={styles.iconBox}>
									<Text style={styles.icon}>👤</Text>
								</View>
								<View>
									<Text style={styles.menuTitle}>Account Profile</Text>
									<Text style={styles.menuSubtitle}>
										{user?.displayName || "john Doe"}
									</Text>
								</View>
							</View>
							<Text style={styles.arrow}>❯</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.divider} />

					<TouchableOpacity
						style={styles.logoutBtn}
						onPress={handleLogout}
						testID="logout-btn"
					>
						<View style={styles.menuLeft}>
							<View style={styles.logoutIconBox}>
								<Text style={styles.icon}>🚪</Text>
							</View>
							<Text style={styles.logoutText}>Log Out</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: { flex: 1, justifyContent: "flex-end" },
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(15, 23, 42, 0.4)",
	},
	modalContent: {
		backgroundColor: COLORS.white,
		borderTopLeftRadius: 36,
		borderTopRightRadius: 36,
		padding: 24,
		paddingBottom: Platform.OS === "ios" ? 40 : 24,
		shadowColor: COLORS.slate900,
		shadowOffset: { width: 0, height: -10 },
		shadowOpacity: 0.15,
		shadowRadius: 20,
		elevation: 10,
	},
	dragHandle: {
		width: 48,
		height: 6,
		backgroundColor: COLORS.slate200,
		borderRadius: 3,
		alignSelf: "center",
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: ResponsiveFontSize["sm"],
		fontWeight: "800",
		color: COLORS.slate400,
		letterSpacing: 1,
		marginBottom: 8,
		paddingHorizontal: 16,
	},
	menuContainer: { gap: 8 },
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: COLORS.white,
		padding: 16,
		borderRadius: 16,
	},
	menuLeft: { flexDirection: "row", alignItems: "center", gap: 16 },
	iconBox: {
		width: 40,
		height: 40,
		backgroundColor: COLORS.slate100,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	icon: { fontSize: ResponsiveFontSize["xl"] },
	menuTitle: {
		fontSize: ResponsiveFontSize["base"],
		fontWeight: "700",
		color: COLORS.slate900,
	},
	menuSubtitle: {
		fontSize: ResponsiveFontSize["sm"],
		fontWeight: "500",
		color: COLORS.slate500,
		marginTop: 2,
	},
	arrow: {
		color: COLORS.slate400,
		fontSize: ResponsiveFontSize["base"],
		fontWeight: "bold",
	},
	divider: { height: 1, backgroundColor: COLORS.slate100, marginVertical: 12 },
	logoutBtn: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FEF2F2",
		padding: 16,
		borderRadius: 16,
	},
	logoutIconBox: {
		width: 40,
		height: 40,
		backgroundColor: "#FEE2E2",
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	logoutText: {
		fontSize: ResponsiveFontSize["base"],
		fontWeight: "700",
		color: "#DC2626",
	},
});

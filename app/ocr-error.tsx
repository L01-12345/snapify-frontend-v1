import React from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../src/constants/theme";

export default function OcrErrorScreen() {
	const router = useRouter();
	const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
					<Feather name="x" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
			</View>

			<View style={styles.content}>
				<View style={styles.circleOuter}>
					<View style={styles.circleInner}>
						<Feather name="file-minus" size={40} color={COLORS.error} />
					</View>
				</View>

				<Text style={styles.errorTitle}>No Text Detected</Text>
				<Text style={styles.errorSubtitle}>
					We couldn't extract any readable text from this image. The document
					might be too blurry or poorly lit.
				</Text>

				<View style={styles.tipsBox}>
					<Text style={styles.tipsTitle}>TIPS FOR BETTER SCAN</Text>
					<View style={styles.tipRow}>
						<Feather name="check" size={16} color={COLORS.slate700} />
						<Text style={styles.tipText}>Ensure good lighting</Text>
					</View>
					<View style={styles.tipRow}>
						<Feather name="check" size={16} color={COLORS.slate700} />
						<Text style={styles.tipText}>Keep the camera steady</Text>
					</View>
				</View>
			</View>

			<View style={styles.footer}>
				<TouchableOpacity
					style={styles.primaryBtn}
					onPress={() => router.push("/snap")}
				>
					<Text style={styles.primaryBtnText}>Retake Photo</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.secondaryBtn}
					onPress={() =>
						router.push({
							pathname: "/note/new",
							params: { imageUri: imageUri },
						})
					}
				>
					<Text style={styles.secondaryBtnText}>Enter Manually</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.white },
	header: { height: 60, paddingHorizontal: 24, justifyContent: "center" },
	iconBtn: { width: 40, height: 40, justifyContent: "center" },

	content: {
		flex: 1,
		alignItems: "center",
		paddingHorizontal: 32,
		paddingTop: 20,
	},
	circleOuter: {
		width: 140,
		height: 140,
		borderRadius: 70,
		backgroundColor: COLORS.errorLight,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 24,
		opacity: 0.8,
	},
	circleInner: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "#FEE2E2",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: COLORS.error,
	},
	errorTitle: {
		fontSize: 24,
		fontWeight: "800",
		color: COLORS.slate900,
		marginBottom: 12,
	},
	errorSubtitle: {
		fontSize: 14,
		fontWeight: "500",
		color: COLORS.slate500,
		textAlign: "center",
		lineHeight: 22,
		marginBottom: 32,
	},

	tipsBox: {
		width: "100%",
		backgroundColor: COLORS.white,
		borderRadius: 16,
		padding: 20,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 2,
	},
	tipsTitle: {
		fontSize: 11,
		fontWeight: "800",
		color: COLORS.slate700,
		letterSpacing: 1,
		marginBottom: 16,
	},
	tipRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginBottom: 12,
	},
	tipText: { fontSize: 14, fontWeight: "500", color: COLORS.slate600 },

	footer: { padding: 24, gap: 16 },
	primaryBtn: {
		width: "100%",
		paddingVertical: 18,
		backgroundColor: "#7C3AED",
		borderRadius: 16,
		alignItems: "center",
		shadowColor: "#7C3AED",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	primaryBtnText: { fontSize: 16, fontWeight: "700", color: COLORS.white },
	secondaryBtn: {
		width: "100%",
		paddingVertical: 18,
		backgroundColor: COLORS.white,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: COLORS.slate200,
		alignItems: "center",
	},
	secondaryBtnText: { fontSize: 16, fontWeight: "700", color: COLORS.slate800 },
});

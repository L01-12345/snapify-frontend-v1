// app/snap-preview.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../src/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SnapPreviewScreen() {
	const router = useRouter();

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Camera Preview</Text>
			</View>

			<View style={styles.imageContainer}>
				{/* Giả lập vùng hiển thị ảnh thật */}
				<View style={styles.imageMockup}>
					<Text style={styles.mockupText}>Captured Image</Text>
				</View>
				<View style={styles.noteOverlay}>
					<Text style={styles.noteTitle}>Note Title</Text>
					<Text style={styles.noteSubtitle}>(phone photo preview area)</Text>
				</View>
			</View>

			<View style={styles.bottomBar}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.retakeBtn}
				>
					<Text style={styles.retakeText}>Retake</Text>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => router.push("/ocr-processing")}>
					<LinearGradient
						colors={[COLORS.primary, COLORS.primaryEnd]}
						style={styles.continueBtn}
					>
						<Text style={styles.continueText}>Continue</Text>
					</LinearGradient>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.white },
	header: {
		height: 50,
		justifyContent: "center",
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate100,
	},
	headerTitle: { fontSize: 18, fontWeight: "600", color: COLORS.slate900 },
	imageContainer: {
		flex: 1,
		backgroundColor: COLORS.slate200,
		position: "relative",
	},
	imageMockup: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(148, 163, 184, 0.2)",
	},
	mockupText: { fontSize: 20, fontWeight: "700", color: COLORS.slate500 },
	noteOverlay: {
		position: "absolute",
		bottom: 24,
		left: 24,
		right: 24,
		backgroundColor: "rgba(15, 23, 42, 0.7)",
		padding: 16,
		borderRadius: 16,
	},
	noteTitle: {
		color: COLORS.white,
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4,
	},
	noteSubtitle: {
		color: COLORS.slate300,
		fontSize: 12,
		fontWeight: "500",
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	bottomBar: {
		height: 90,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 24,
		borderTopWidth: 1,
		borderTopColor: COLORS.slate100,
	},
	retakeBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
	retakeText: { color: COLORS.primary, fontSize: 16, fontWeight: "600" },
	continueBtn: {
		paddingHorizontal: 32,
		paddingVertical: 14,
		borderRadius: 16,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
	},
	continueText: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
});

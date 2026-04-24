import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	TextInput,
	ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../src/constants/theme";

export default function PdfPreviewScreen() {
	const router = useRouter();
	const [fileName, setFileName] = useState("Calculus_Lec04.pdf");

	const handleSave = () => {
		// Điều hướng về tab dashboard và gửi parameter showToast
		router.replace("/(tabs)/dashboard?showToast=true");
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<Feather name="arrow-left" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>PDF Document</Text>
				<TouchableOpacity>
					<Feather name="more-vertical" size={24} color={COLORS.slate400} />
				</TouchableOpacity>
			</View>

			<View style={styles.nameSection}>
				<Text style={styles.nameLabel}>FILE NAME</Text>
				<View style={styles.nameInputBox}>
					<TextInput
						style={styles.nameInput}
						value={fileName}
						onChangeText={setFileName}
					/>
					<Feather name="edit-2" size={16} color={COLORS.slate400} />
				</View>
			</View>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				{/* Render PDF Pages (Mockup) */}
				<View style={styles.pdfPage}>
					<View style={styles.pageNumberBadge}>
						<Text style={styles.pageNumberText}>1</Text>
					</View>
					<Text style={styles.pdfTitle}>Calculus: Derivatives</Text>
					<Text style={styles.pdfText}>
						The fundamental theorem of calculus links the concept of
						differentiating a function with the concept of integrating a
						function.
					</Text>
				</View>
			</ScrollView>

			<View style={styles.footer}>
				<TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
					<Text style={styles.saveBtnText}>Save PDF to Snapify</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: "#E2E8F0" }, // Nền xám cho PDF viewer
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		height: 60,
		paddingHorizontal: 24,
		backgroundColor: COLORS.white,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate200,
	},
	headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.slate900 },
	nameSection: {
		backgroundColor: COLORS.white,
		paddingHorizontal: 24,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate200,
	},
	nameLabel: {
		fontSize: 12,
		fontWeight: "700",
		color: COLORS.slate400,
		marginBottom: 8,
	},
	nameInputBox: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.slate50,
		borderWidth: 2,
		borderColor: COLORS.slate200,
		borderRadius: 12,
		paddingHorizontal: 16,
		height: 48,
	},
	nameInput: {
		flex: 1,
		fontSize: 16,
		fontWeight: "600",
		color: COLORS.slate900,
	},
	scrollContent: { padding: 24, paddingBottom: 40 },
	pdfPage: {
		backgroundColor: COLORS.white,
		borderRadius: 12,
		padding: 24,
		marginBottom: 24,
		shadowColor: COLORS.slate400,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 3,
	},
	pageNumberBadge: {
		position: "absolute",
		top: -12,
		right: -12,
		width: 32,
		height: 32,
		backgroundColor: COLORS.slate800,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: COLORS.white,
	},
	pageNumberText: { color: COLORS.white, fontWeight: "bold", fontSize: 12 },
	pdfTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: COLORS.slate900,
		borderBottomWidth: 2,
		borderBottomColor: COLORS.slate200,
		paddingBottom: 12,
		marginBottom: 16,
	},
	pdfText: { fontSize: 14, color: COLORS.slate700, lineHeight: 24 },
	footer: {
		backgroundColor: COLORS.white,
		padding: 24,
		borderTopWidth: 1,
		borderTopColor: COLORS.slate200,
	},
	saveBtn: {
		backgroundColor: COLORS.slate900,
		paddingVertical: 16,
		borderRadius: 16,
		alignItems: "center",
		shadowColor: COLORS.slate900,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
	},
	saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});

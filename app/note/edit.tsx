import React from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	TextInput,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/theme";

export default function EditNoteScreen() {
	const router = useRouter();

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
					<Feather name="arrow-left" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Edit Note</Text>
				<TouchableOpacity>
					<Text style={styles.saveBtn}>Save</Text>
				</TouchableOpacity>
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
			>
				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					<TextInput
						style={styles.titleInput}
						defaultValue="Calculus Formula"
						placeholder="Note Title..."
						placeholderTextColor={COLORS.slate300}
					/>

					{/* AI Suggested Folder Card */}
					<View style={styles.aiCard}>
						<View style={styles.aiInfo}>
							<View style={styles.aiTagRow}>
								<View style={styles.sparkleIcon}>
									<Text style={{ fontSize: 8, color: "white" }}>✨</Text>
								</View>
								<Text style={styles.aiTagText}>AI SUGGESTED FOLDER</Text>
							</View>
							<Text style={styles.aiFolderName}>📚 Study</Text>
						</View>
						<TouchableOpacity style={styles.changeBtn}>
							<Text style={styles.changeBtnText}>Change</Text>
						</TouchableOpacity>
					</View>

					{/* Original Image */}
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Original Image</Text>
						<TouchableOpacity>
							<Text style={styles.linkText}>View</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.imageBox}>
						<Text style={styles.imageText}>📷 IMG_20251020.jpg</Text>
					</View>

					{/* Extracted Text */}
					<Text style={[styles.sectionTitle, { marginBottom: 8 }]}>
						Extracted Text
					</Text>
					<TextInput
						style={styles.textArea}
						multiline
						textAlignVertical="top"
						defaultValue={
							"f'(x) = lim (h->0) [f(x+h) - f(x)] / h\n\nThe fundamental theorem of calculus links the concept of differentiating a function with the concept of integrating a function..."
						}
					/>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.white },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 24,
		height: 60,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate100,
	},
	iconBtn: {
		width: 40,
		height: 40,
		alignItems: "flex-start",
		justifyContent: "center",
	},
	headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.slate900 },
	saveBtn: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
	content: { padding: 24, gap: 24 },
	titleInput: { fontSize: 24, fontWeight: "800", color: COLORS.slate900 },
	aiCard: {
		backgroundColor: "#F5F3FF",
		borderWidth: 1,
		borderColor: "#EDE9FE",
		borderRadius: 16,
		padding: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	aiInfo: { gap: 4 },
	aiTagRow: { flexDirection: "row", alignItems: "center", gap: 6 },
	sparkleIcon: {
		width: 16,
		height: 16,
		backgroundColor: "#7C3AED",
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	aiTagText: {
		fontSize: 10,
		fontWeight: "700",
		color: "#7C3AED",
		letterSpacing: 1,
	},
	aiFolderName: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.slate900,
		marginTop: 4,
	},
	changeBtn: {
		backgroundColor: COLORS.white,
		borderWidth: 1,
		borderColor: "#EDE9FE",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 12,
	},
	changeBtnText: { fontSize: 12, fontWeight: "700", color: "#7C3AED" },
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	sectionTitle: { fontSize: 14, fontWeight: "700", color: COLORS.slate900 },
	linkText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },
	imageBox: {
		height: 96,
		backgroundColor: COLORS.slate50,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	imageText: { fontSize: 14, fontWeight: "500", color: COLORS.slate400 },
	textArea: {
		flex: 1,
		minHeight: 250,
		backgroundColor: COLORS.slate50,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		borderRadius: 24,
		padding: 20,
		fontSize: 14,
		color: COLORS.slate700,
		fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
	},
});

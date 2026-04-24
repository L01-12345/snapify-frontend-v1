// app/note/[id].tsx
import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../src/constants/theme";
import { SettingsModal } from "../../src/components/common/SettingsModal";

export default function NoteDetailScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams(); // Lấy ID note từ URL
	const [modalVisible, setModalVisible] = useState(false);

	return (
		<SafeAreaView style={styles.safeArea}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
					<Feather name="arrow-left" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
				<Text style={styles.dateText}>OCT 20, 2025</Text>
				<TouchableOpacity
					onPress={() => setModalVisible(true)}
					style={styles.iconBtn}
				>
					<Feather name="more-vertical" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Original Image Box */}
				<TouchableOpacity style={styles.imageBox}>
					<Text style={styles.cameraIcon}>📷</Text>
					<Text style={styles.viewImageText}>View Original Image</Text>
				</TouchableOpacity>

				{/* Badges */}
				<View style={styles.badgeRow}>
					<View style={styles.folderBadge}>
						<Text style={styles.folderBadgeText}>📚 STUDY</Text>
					</View>
					<View style={styles.statusBadge}>
						<Text style={styles.statusBadgeText}>PROCESSED</Text>
					</View>
				</View>

				{/* Title */}
				<Text style={styles.title}>Calculus Lecture 04: Derivatives</Text>

				<View style={styles.divider} />

				{/* Note Content (Rich Text Simulation) */}
				<View style={styles.bodyContent}>
					<Text style={styles.paragraph}>
						The fundamental theorem of calculus links the concept of
						differentiating a function with the concept of integrating a
						function.
					</Text>

					<View style={styles.bulletList}>
						<Text style={styles.bulletItem}>
							<Text style={styles.boldText}>Part 1:</Text> Guarantees that the
							definite integral of a continuous function is differentiable.
						</Text>
						<Text style={styles.bulletItem}>
							<Text style={styles.boldText}>Part 2:</Text> Provides a method for
							evaluating definite integrals.
						</Text>
					</View>

					<View style={styles.codeBlock}>
						<Text style={styles.codeText}>
							f'(x) = lim (h→0) [f(x+h) - f(x)] / h
						</Text>
					</View>

					<Text style={styles.paragraph}>
						Review these formulas before the midterm exam next Tuesday. Also,
						check the assignment uploaded on the portal.
					</Text>
				</View>
			</ScrollView>

			{/* Floating Edit Button */}
			<View style={styles.fabContainer}>
				<TouchableOpacity onPress={() => router.push("/note/edit")}>
					<LinearGradient
						colors={[COLORS.primary, COLORS.primaryEnd]}
						style={styles.fabGradient}
					>
						<Text style={styles.fabIcon}>✏️</Text>
						<Text style={styles.fabText}>Edit Note</Text>
					</LinearGradient>
				</TouchableOpacity>
			</View>

			{/* Tích hợp Modal */}
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
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		height: 60,
		paddingHorizontal: 24,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate100,
	},
	iconBtn: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: COLORS.slate50,
		borderRadius: 20,
	},
	dateText: {
		fontSize: 12,
		fontWeight: "800",
		color: COLORS.slate400,
		letterSpacing: 1,
	},
	scrollContent: { padding: 24, paddingBottom: 100 }, // Padding bottom để không bị che bởi FAB
	imageBox: {
		height: 160,
		backgroundColor: COLORS.slate100,
		borderRadius: 24,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 24,
	},
	cameraIcon: { fontSize: 32, marginBottom: 8 },
	viewImageText: { fontSize: 12, fontWeight: "700", color: COLORS.slate400 },
	badgeRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
	folderBadge: {
		backgroundColor: "#EEF2FF",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
	},
	folderBadgeText: {
		fontSize: 10,
		fontWeight: "800",
		color: COLORS.primary,
		letterSpacing: 0.5,
	},
	statusBadge: {
		backgroundColor: "#ECFDF5",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
	},
	statusBadgeText: {
		fontSize: 10,
		fontWeight: "800",
		color: "#10B981",
		letterSpacing: 0.5,
	},
	title: {
		fontSize: 28,
		fontWeight: "800",
		color: COLORS.slate900,
		lineHeight: 36,
		marginBottom: 24,
	},
	divider: { height: 1, backgroundColor: COLORS.slate100, marginBottom: 24 },
	bodyContent: { gap: 16 },
	paragraph: {
		fontSize: 14,
		fontWeight: "500",
		color: COLORS.slate700,
		lineHeight: 24,
	},
	bulletList: { paddingLeft: 8, gap: 8 },
	bulletItem: {
		fontSize: 14,
		fontWeight: "500",
		color: COLORS.slate600,
		lineHeight: 22,
	},
	boldText: { fontWeight: "800", color: COLORS.slate800 },
	codeBlock: {
		backgroundColor: COLORS.slate50,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		padding: 16,
		borderRadius: 16,
	},
	codeText: {
		fontFamily: "monospace",
		fontSize: 12,
		color: COLORS.primaryEnd,
		fontWeight: "600",
	},
	fabContainer: {
		position: "absolute",
		bottom: 32,
		left: 0,
		right: 0,
		alignItems: "center",
	},
	fabGradient: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingVertical: 14,
		borderRadius: 30,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 8,
		gap: 8,
	},
	fabIcon: { fontSize: 16 },
	fabText: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
});

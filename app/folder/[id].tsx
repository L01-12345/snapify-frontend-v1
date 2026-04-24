import React from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../src/constants/theme";

export default function FolderDetailScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams(); // Lấy ID thư mục từ URL

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
					<Feather name="arrow-left" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
				<View style={styles.headerCenter}>
					<Text style={styles.headerIcon}>📚</Text>
					<Text style={styles.headerTitle}>Study</Text>
				</View>
				<TouchableOpacity style={styles.iconBtn}>
					<Feather name="more-vertical" size={24} color={COLORS.slate600} />
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={styles.listContainer}>
				<Text style={styles.listSubtitle}>12 Notes sorted by recent</Text>

				{/* Note Item */}
				<TouchableOpacity
					style={styles.noteCard}
					onPress={() => router.push("/note/edit")}
				>
					<View style={styles.noteHeader}>
						<Text style={styles.noteTitle}>Calculus Lecture 04</Text>
						<View style={styles.badge}>
							<Text style={styles.badgeText}>PROCESSED</Text>
						</View>
					</View>
					<Text style={styles.notePreview} numberOfLines={2}>
						Formulas for derivatives and integration by parts. Review before
						midterm...
					</Text>
					<View style={styles.noteFooter}>
						<Text style={styles.noteDate}>Oct 20, 2025</Text>
					</View>
				</TouchableOpacity>
			</ScrollView>

			{/* Floating Action Button */}
			<TouchableOpacity style={styles.fab}>
				<LinearGradient
					colors={[COLORS.primary, COLORS.primaryEnd]}
					style={styles.fabGradient}
				>
					<Feather name="plus" size={32} color={COLORS.white} />
				</LinearGradient>
			</TouchableOpacity>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.slate50 },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 24,
		height: 60,
		backgroundColor: COLORS.white,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate100,
	},
	iconBtn: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 20,
	},
	headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
	headerIcon: { fontSize: 20 },
	headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.slate900 },
	listContainer: { padding: 24, gap: 16 },
	listSubtitle: {
		fontSize: 12,
		fontWeight: "500",
		color: COLORS.slate500,
		marginBottom: 8,
	},
	noteCard: {
		backgroundColor: COLORS.white,
		borderRadius: 24,
		padding: 20,
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 1,
		borderWidth: 1,
		borderColor: COLORS.slate100,
	},
	noteHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	noteTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: COLORS.slate900,
		flex: 1,
	},
	badge: {
		backgroundColor: "#D1FAE5",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
		marginLeft: 8,
	},
	badgeText: { fontSize: 10, fontWeight: "800", color: "#065F46" },
	notePreview: {
		fontSize: 13,
		color: COLORS.slate500,
		lineHeight: 20,
		marginBottom: 16,
	},
	noteFooter: {
		borderTopWidth: 1,
		borderTopColor: COLORS.slate50,
		paddingTop: 12,
	},
	noteDate: { fontSize: 12, fontWeight: "500", color: COLORS.slate400 },
	fab: {
		position: "absolute",
		bottom: 40,
		right: 24,
		shadowColor: COLORS.primaryEnd,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.4,
		shadowRadius: 12,
		elevation: 8,
	},
	fabGradient: {
		width: 64,
		height: 64,
		borderRadius: 32,
		alignItems: "center",
		justifyContent: "center",
	},
});

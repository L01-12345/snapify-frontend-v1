import React from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/theme";

export default function EmptyFolderScreen() {
	const router = useRouter();

	return (
		<SafeAreaView style={styles.safeArea}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
					<Feather name="arrow-left" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
				<View style={styles.headerCenter}>
					<Text style={styles.headerIcon}>📚</Text>
					<Text style={styles.headerTitle}>Study</Text>
				</View>
				<TouchableOpacity style={styles.iconBtn}>
					<Feather name="more-vertical" size={24} color={COLORS.slate400} />
				</TouchableOpacity>
			</View>

			{/* Filter Pills */}
			<View style={styles.pillContainer}>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 24 }}
				>
					<TouchableOpacity style={[styles.pill, styles.pillActive]}>
						<Text style={styles.pillTextActive}>All</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.pill}>
						<Text style={styles.pillText}>Math</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.pill}>
						<Text style={styles.pillText}>Physics</Text>
					</TouchableOpacity>
				</ScrollView>
			</View>

			{/* Empty State Body */}
			<View style={styles.emptyContent}>
				<View style={styles.circleBg}>
					<Text style={styles.emoji}>🗂️</Text>
				</View>
				<Text style={styles.emptyTitle}>This folder is empty</Text>
				<Text style={styles.emptySubtitle}>
					Organize your study materials by adding notes to this folder, or let
					AI auto-categorize them for you.
				</Text>

				<TouchableOpacity style={styles.addBtn}>
					<Text style={styles.addBtnText}>+ Add Notes</Text>
				</TouchableOpacity>
			</View>
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
	},
	iconBtn: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
	headerIcon: { fontSize: 20 },
	headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.slate900 },
	pillContainer: { marginTop: 8 },
	pill: {
		paddingHorizontal: 20,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		marginRight: 8,
		backgroundColor: COLORS.white,
	},
	pillActive: {
		backgroundColor: COLORS.slate900,
		borderColor: COLORS.slate900,
	},
	pillText: { fontSize: 13, fontWeight: "700", color: COLORS.slate600 },
	pillTextActive: { fontSize: 13, fontWeight: "700", color: COLORS.white },

	emptyContent: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 32,
	},
	circleBg: {
		width: 140,
		height: 140,
		borderRadius: 70,
		backgroundColor: COLORS.slate50,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 24,
	},
	emoji: { fontSize: 60 },
	emptyTitle: {
		fontSize: 22,
		fontWeight: "800",
		color: COLORS.slate900,
		marginBottom: 12,
	},
	emptySubtitle: {
		fontSize: 14,
		fontWeight: "500",
		color: COLORS.slate500,
		textAlign: "center",
		lineHeight: 22,
		marginBottom: 32,
	},
	addBtn: {
		width: "100%",
		paddingVertical: 16,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: COLORS.slate200,
		alignItems: "center",
	},
	addBtnText: { fontSize: 15, fontWeight: "700", color: COLORS.slate800 },
});

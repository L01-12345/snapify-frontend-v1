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
import { COLORS } from "../../src/constants/theme";

export default function FoldersScreen() {
	const router = useRouter();

	// Dữ liệu giả lập
	const folders = [
		{
			id: "1",
			title: "Study",
			notes: 12,
			icon: "📚",
			bgColor: "#EEF2FF",
			iconColor: "#6366F1",
		},
		{
			id: "2",
			title: "Work",
			notes: 8,
			icon: "💼",
			bgColor: "#ECFDF5",
			iconColor: "#10B981",
		},
		{
			id: "3",
			title: "Receipts",
			notes: 24,
			icon: "🧾",
			bgColor: "#FFFBEB",
			iconColor: "#F59E0B",
		},
		{
			id: "4",
			title: "Personal",
			notes: 3,
			icon: "❤️",
			bgColor: "#FFF1F2",
			iconColor: "#F43F5E",
		},
	];

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Folders</Text>
				<TouchableOpacity style={styles.addButton}>
					<Text style={styles.addButtonText}>+</Text>
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.gridContainer}>
					{folders.map((folder) => (
						<TouchableOpacity
							key={folder.id}
							style={styles.card}
							onPress={() => router.push(`/folder/${folder.id}`)}
						>
							<View
								style={[styles.iconBox, { backgroundColor: folder.bgColor }]}
							>
								<Text style={styles.iconText}>{folder.icon}</Text>
							</View>
							<View style={styles.cardInfo}>
								<Text style={styles.cardTitle}>{folder.title}</Text>
								<Text style={styles.cardSubtitle}>{folder.notes} Notes</Text>
							</View>
						</TouchableOpacity>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.slate50 },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
		paddingHorizontal: 24,
		paddingBottom: 16,
		height: 80,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate100,
		backgroundColor: COLORS.white,
	},
	headerTitle: { fontSize: 32, fontWeight: "800", color: COLORS.slate900 },
	addButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: COLORS.slate100,
		alignItems: "center",
		justifyContent: "center",
	},
	addButtonText: {
		fontSize: 24,
		color: COLORS.slate600,
		fontWeight: "600",
		marginTop: -4,
	},
	scrollContent: { padding: 24, paddingBottom: 100 }, // Padding bottom chừa chỗ cho TabBar
	gridContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 16,
		justifyContent: "space-between",
	},
	card: {
		width: "47%",
		aspectRatio: 1,
		backgroundColor: COLORS.white,
		borderRadius: 24,
		padding: 20,
		justifyContent: "space-between",
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 2,
		borderWidth: 1,
		borderColor: COLORS.slate100,
	},
	iconBox: {
		width: 48,
		height: 48,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	iconText: { fontSize: 24 },
	cardInfo: { gap: 4 },
	cardTitle: { fontSize: 18, fontWeight: "700", color: COLORS.slate900 },
	cardSubtitle: { fontSize: 12, fontWeight: "500", color: COLORS.slate500 },
});

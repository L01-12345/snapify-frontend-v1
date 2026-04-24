import React from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../src/constants/theme";

export default function EmptyArchiveScreen() {
	const router = useRouter();

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
					<Feather name="arrow-left" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
				<View style={styles.headerCenter}>
					<Text style={styles.headerIcon}>📦</Text>
					<Text style={styles.headerTitle}>Archive</Text>
				</View>
				<View style={styles.iconBtn} />{" "}
				{/* Placeholder để cân bằng khoảng cách */}
			</View>

			<View style={styles.emptyContent}>
				<View style={styles.circleBg}>
					<Text style={styles.emoji}>📦</Text>
				</View>
				<Text style={styles.emptyTitle}>No archived notes</Text>
				<Text style={styles.emptySubtitle}>
					Keep your dashboard clean. Notes you archive will safely appear here,
					and they are still searchable.
				</Text>
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
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate50,
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

	emptyContent: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 40,
	},
	circleBg: {
		width: 140,
		height: 140,
		borderRadius: 70,
		backgroundColor: COLORS.slate50,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 32,
	},
	emoji: { fontSize: 60 },
	emptyTitle: {
		fontSize: 22,
		fontWeight: "800",
		color: COLORS.slate900,
		marginBottom: 16,
	},
	emptySubtitle: {
		fontSize: 14,
		fontWeight: "500",
		color: COLORS.slate500,
		textAlign: "center",
		lineHeight: 22,
	},
});

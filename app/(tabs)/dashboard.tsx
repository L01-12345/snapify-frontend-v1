// app/(tabs)/dashboard.tsx
import React, { useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TextInput,
	ScrollView,
	TouchableOpacity,
	Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/theme";

export default function DashboardScreen() {
	const router = useRouter();
	const { showToast } = useLocalSearchParams();
	const slideAnim = useRef(new Animated.Value(150)).current;

	useEffect(() => {
		if (showToast === "true") {
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 50,
				friction: 8,
			}).start();
			setTimeout(() => {
				Animated.timing(slideAnim, {
					toValue: 150,
					duration: 300,
					useNativeDriver: true,
				}).start();
			}, 4000);
		}
	}, [showToast]);

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView
				contentContainerStyle={styles.container}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View style={styles.header}>
					<View>
						<Text style={styles.logoText}>Snapify</Text>
						<Text style={styles.greeting}>Hello, John Doe</Text>
					</View>
					<View style={styles.avatar}>
						<Text style={styles.avatarText}>JD</Text>
					</View>
				</View>

				{/* Search Bar */}
				<View style={styles.searchContainer}>
					<Feather
						name="search"
						size={20}
						color={COLORS.slate400}
						style={styles.searchIcon}
					/>
					<TextInput
						style={styles.searchInput}
						placeholder="Search notes, folders..."
						placeholderTextColor={COLORS.slate400}
					/>
				</View>

				{/* Quick Actions */}
				<Text style={styles.sectionTitle}>Quick Actions</Text>
				<View style={styles.quickActionsRow}>
					<TouchableOpacity style={styles.actionCard}>
						<View style={styles.actionIconBg}>
							<Ionicons
								name="document-text-outline"
								size={24}
								color={COLORS.slate500}
							/>
						</View>
						<Text style={styles.actionText}>Batch</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.actionCard}>
						<View style={styles.actionIconBg}>
							<Ionicons
								name="archive-outline"
								size={24}
								color={COLORS.slate500}
							/>
						</View>
						<Text style={styles.actionText}>Archive</Text>
					</TouchableOpacity>
				</View>

				{/* Recent Notes */}
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Recent Notes</Text>
					<TouchableOpacity onPress={() => router.push("/all-notes")}>
						<Text style={styles.viewAllText}>View All</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.notesList}>
					{/* Note Item 1 (Có icon bên trái) */}
					<TouchableOpacity style={styles.noteCard1}>
						<View style={styles.noteIconBox1}>
							<Text style={{ fontSize: 24 }}>📄</Text>
						</View>
						<View style={styles.noteContent1}>
							<Text style={styles.noteTitle1}>Calculus_Lec04.pdf</Text>
							<Text style={styles.noteSubtitle1}>
								<Text style={{ color: COLORS.primary }}>📚 Study</Text> • Just
								now
							</Text>
						</View>
					</TouchableOpacity>

					{/* Note Item 2 (Dạng thẻ to có Badge) */}
					<TouchableOpacity style={styles.noteCard2}>
						<View style={styles.noteHeader2}>
							<Text style={styles.noteTitle2}>Q3 Marketing Strategy</Text>
							<View style={styles.badge2}>
								<Text style={styles.badgeText2}>PROCESSED</Text>
							</View>
						</View>
						<View style={styles.noteFooter2}>
							<Text style={styles.noteSubtitle2}>
								Folder: Work • Oct 24, 2025
							</Text>
							<Feather name="more-vertical" size={20} color={COLORS.slate400} />
						</View>
					</TouchableOpacity>
				</View>

				{/* Khoảng trống dưới cùng */}
				<View style={{ height: 100 }} />
			</ScrollView>

			{/* TOAST MODAL */}
			<Animated.View
				style={[
					styles.toastContainer,
					{ transform: [{ translateY: slideAnim }] },
				]}
			>
				<View style={styles.toastLeft}>
					<View style={styles.toastIconBox}>
						<Text style={{ fontSize: 20 }}>📂</Text>
						<Text style={styles.toastSparkle}>✨</Text>
					</View>
					<View>
						<Text style={styles.toastTitle}>Saved to Study</Text>
						<Text style={styles.toastSubtitle} numberOfLines={1}>
							Calculus_Lec04.pdf
						</Text>
					</View>
				</View>
				<TouchableOpacity style={styles.toastBtn}>
					<Text style={styles.toastBtnText}>Change</Text>
				</TouchableOpacity>
			</Animated.View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.white },
	container: { paddingHorizontal: 24, paddingTop: 20 },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 24,
	},
	logoText: {
		fontSize: 28,
		fontWeight: "900",
		color: COLORS.slate900,
		marginBottom: 4,
	},
	greeting: { fontSize: 14, color: COLORS.slate500, fontWeight: "500" },
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#E0E7FF",
		alignItems: "center",
		justifyContent: "center",
	},
	avatarText: { color: COLORS.primary, fontWeight: "bold", fontSize: 16 },
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.slate50,
		borderRadius: 20,
		paddingHorizontal: 16,
		height: 56,
		marginBottom: 32,
	},
	searchIcon: { marginRight: 12 },
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: COLORS.slate900,
		fontWeight: "500",
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
		marginBottom: 16,
		marginTop: 12,
	},
	sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.slate900 },
	viewAllText: { fontSize: 14, fontWeight: "600", color: COLORS.primary },
	quickActionsRow: { flexDirection: "row", gap: 16, marginBottom: 32 },
	actionCard: {
		backgroundColor: COLORS.white,
		borderRadius: 24,
		padding: 16,
		alignItems: "center",
		width: 100,
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.5,
		shadowRadius: 10,
		elevation: 2,
		borderWidth: 1,
		borderColor: COLORS.slate50,
	},
	actionIconBg: {
		width: 48,
		height: 48,
		borderRadius: 16,
		backgroundColor: COLORS.slate50,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 12,
	},
	actionText: { fontSize: 13, fontWeight: "700", color: COLORS.slate700 },
	notesList: { gap: 12 },

	// Style Note 1
	noteCard1: {
		backgroundColor: COLORS.white,
		borderRadius: 20,
		padding: 16,
		borderWidth: 2,
		borderColor: "#E0E7FF",
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
	},
	noteIconBox1: {
		width: 48,
		height: 48,
		backgroundColor: "#EEF2FF",
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	noteContent1: { flex: 1 },
	noteTitle1: {
		fontSize: 15,
		fontWeight: "700",
		color: COLORS.slate800,
		marginBottom: 4,
	},
	noteSubtitle1: { fontSize: 12, color: COLORS.slate500, fontWeight: "500" },

	// Style Note 2
	noteCard2: {
		backgroundColor: COLORS.white,
		borderRadius: 24,
		padding: 20,
		borderWidth: 1,
		borderColor: COLORS.slate100,
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 2,
		marginTop: 4,
	},
	noteHeader2: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	noteTitle2: {
		fontSize: 17,
		fontWeight: "800",
		color: COLORS.slate900,
		flex: 1,
		marginRight: 12,
	},
	badge2: {
		backgroundColor: "#D1FAE5",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 6,
	},
	badgeText2: {
		fontSize: 10,
		fontWeight: "800",
		color: "#065F46",
		textTransform: "uppercase",
	},
	noteFooter2: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	noteSubtitle2: { fontSize: 12, color: COLORS.slate500, fontWeight: "500" },

	toastContainer: {
		position: "absolute",
		bottom: 100,
		left: 24,
		right: 24,
		backgroundColor: COLORS.slate900,
		borderRadius: 20,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		zIndex: 50,
	},
	toastLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
	toastIconBox: {
		width: 48,
		height: 48,
		backgroundColor: "rgba(99, 102, 241, 0.2)",
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	toastSparkle: { position: "absolute", top: -4, right: -4, fontSize: 14 },
	toastTitle: {
		color: COLORS.white,
		fontSize: 15,
		fontWeight: "700",
		marginBottom: 2,
	},
	toastSubtitle: {
		color: COLORS.slate400,
		fontSize: 12,
		fontWeight: "500",
		maxWidth: 120,
	},
	toastBtn: {
		backgroundColor: "rgba(255,255,255,0.1)",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 12,
	},
	toastBtnText: { color: COLORS.white, fontSize: 14, fontWeight: "700" },
});

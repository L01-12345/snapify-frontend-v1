import React, { useState, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	TextInput,
	ScrollView,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../src/constants/theme";
import { noteApi } from "../src/api/noteApi";
import { Note, NoteStatus } from "../src/types/api.types";

export default function AllNotesScreen() {
	const router = useRouter();
	const [activeStatus, setActiveStatus] = useState("All");
	const [notes, setNotes] = useState<Note[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Lấy dữ liệu mỗi khi màn hình này được focus
	useFocusEffect(
		useCallback(() => {
			fetchNotes(activeStatus);
		}, [activeStatus]),
	);

	const fetchNotes = async (statusFilter: string) => {
		try {
			setIsLoading(true);
			// Map trạng thái UI sang trạng thái API (PENDING, ACTIONED)
			let statusParam: NoteStatus | undefined = undefined;
			if (statusFilter === "Processed") statusParam = "ACTIONED";
			if (statusFilter === "Pending") statusParam = "PENDING";

			const response = await noteApi.getNotes({ status: statusParam });

			setNotes(response.data?.notes || []);
		} catch (error) {
			console.log("Lỗi fetch notes:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// const mockNotes = [
	// 	{
	// 		id: "1",
	// 		title: "Calculus Lecture 04",
	// 		preview:
	// 			"Formulas for derivatives and integration by parts. Review before midterm...",
	// 		date: "Oct 20, 2025",
	// 		size: "2.4 MB",
	// 	},
	// 	{
	// 		id: "2",
	// 		title: "Physics Chapter 2",
	// 		preview:
	// 			"Newton’s laws of motion. Key equations for kinematics in two dimensions...",
	// 		date: "Oct 18, 2025",
	// 		size: "1.8 MB",
	// 	},
	// ];
	const confirmDelete = (noteId: string, noteTitle: string) => {
		Alert.alert("Xóa ghi chú", `Bạn có chắc chắn muốn xóa "${noteTitle}"?`, [
			{ text: "Hủy", style: "cancel" },
			{
				text: "Xóa",
				style: "destructive", // style này làm nút chuyển màu đỏ trên iOS
				onPress: async () => {
					try {
						await noteApi.deleteNote(noteId);
						// Xóa xong thì lọc bỏ note đó khỏi danh sách UI ngay lập tức
						setNotes((prevNotes) => prevNotes.filter((n) => n.id !== noteId));
					} catch (error) {
						Alert.alert("Lỗi", "Không thể xóa ghi chú này.");
					}
				},
			},
		]);
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
					<Feather name="arrow-left" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>All Notes</Text>
				<View style={styles.iconBtn} />
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
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
						placeholder="Search notes..."
						placeholderTextColor={COLORS.slate400}
					/>
				</View>

				{/* Dropdown Filters */}
				<View style={styles.dropdownRow}>
					<TouchableOpacity style={styles.dropdownBtn}>
						<Feather name="clock" size={16} color={COLORS.slate500} />
						<Text style={styles.dropdownText}>Recently Used</Text>
						<Feather name="chevron-down" size={16} color={COLORS.slate400} />
					</TouchableOpacity>
					<TouchableOpacity style={styles.dropdownBtn}>
						<Feather name="calendar" size={16} color={COLORS.slate500} />
						<Text style={styles.dropdownText}>Any Date</Text>
						<Feather name="chevron-down" size={16} color={COLORS.slate400} />
					</TouchableOpacity>
				</View>

				{/* Status Filters */}
				<View style={styles.statusRow}>
					<Text style={styles.statusLabel}>STATUS:</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						{["All", "Processed", "Pending"].map((status) => (
							<TouchableOpacity
								key={status}
								style={[
									styles.statusPill,
									activeStatus === status && styles.statusPillActive,
								]}
								onPress={() => setActiveStatus(status)}
							>
								<Text
									style={[
										styles.statusPillText,
										activeStatus === status && styles.statusPillTextActive,
									]}
								>
									{status}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>

				{/* Notes List */}
				<View style={styles.listContainer}>
					{isLoading ? (
						<ActivityIndicator size="large" color={COLORS.primary} />
					) : notes.length === 0 ? (
						<Text
							style={{
								textAlign: "center",
								color: COLORS.slate500,
								marginTop: 20,
							}}
						>
							Không có ghi chú nào.
						</Text>
					) : (
						notes.map((note) => (
							<TouchableOpacity
								key={note.id}
								style={styles.noteCard}
								onPress={() => router.push(`/note/${note.id}`)}
								onLongPress={() => confirmDelete(note.id, note.title)}
							>
								<View style={styles.noteHeader}>
									<Text style={styles.noteTitle} numberOfLines={1}>
										{note.title}
									</Text>
									<View style={styles.badge}>
										<Text style={styles.badgeText}>{note.status}</Text>
									</View>
								</View>
								<Text style={styles.notePreview} numberOfLines={2}>
									{note.content}
								</Text>
							</TouchableOpacity>
						))
					)}
				</View>
			</ScrollView>

			{/* Floating Action Button (+) */}
			<TouchableOpacity
				style={styles.fab}
				onPress={() => router.push("/note/new")}
			>
				<View style={styles.fabInner}>
					<Feather name="plus" size={32} color={COLORS.white} />
				</View>
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
		height: 60,
		paddingHorizontal: 24,
	},
	iconBtn: { width: 40, height: 40, justifyContent: "center" },
	headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.slate900 },
	scrollContent: { padding: 24, paddingBottom: 100 },

	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.white,
		borderRadius: 16,
		paddingHorizontal: 16,
		height: 56,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		marginBottom: 16,
	},
	searchIcon: { marginRight: 12 },
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: COLORS.slate900,
		fontWeight: "500",
	},

	dropdownRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
	dropdownBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: COLORS.white,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 12,
	},
	dropdownText: {
		fontSize: 13,
		fontWeight: "700",
		color: COLORS.slate700,
		flex: 1,
		marginLeft: 8,
	},

	statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
	statusLabel: {
		fontSize: 12,
		fontWeight: "800",
		color: COLORS.slate400,
		letterSpacing: 1,
		marginRight: 12,
	},
	statusPill: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		backgroundColor: COLORS.white,
		marginRight: 8,
	},
	statusPillActive: {
		backgroundColor: COLORS.slate900,
		borderColor: COLORS.slate900,
	},
	statusPillText: { fontSize: 13, fontWeight: "700", color: COLORS.slate600 },
	statusPillTextActive: { color: COLORS.white },

	listContainer: { gap: 16 },
	noteCard: {
		backgroundColor: COLORS.white,
		borderRadius: 24,
		padding: 20,
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 2,
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
		fontWeight: "800",
		color: COLORS.slate900,
		flex: 1,
		marginRight: 8,
	},
	badge: {
		backgroundColor: "#D1FAE5",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},
	badgeText: { fontSize: 10, fontWeight: "800", color: "#065F46" },
	notePreview: {
		fontSize: 14,
		color: COLORS.slate500,
		lineHeight: 22,
		marginBottom: 20,
	},
	noteFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: COLORS.slate50,
		paddingTop: 16,
	},
	noteMeta: { fontSize: 12, fontWeight: "600", color: COLORS.slate400 },
	noteMetaBold: { fontSize: 12, fontWeight: "800", color: COLORS.slate400 },

	fab: {
		position: "absolute",
		bottom: 100,
		right: 24,
		shadowColor: COLORS.primaryEnd,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.4,
		shadowRadius: 12,
		elevation: 8,
	},
	fabInner: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: "#7C3AED",
		alignItems: "center",
		justifyContent: "center",
	},
});

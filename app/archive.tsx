// app/archive.tsx
import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	ScrollView,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../src/constants/theme";

// --- MOCK DATA ---
const MOCK_ARCHIVED_NOTES = [
	{ id: "1", title: "Tax Receipt 2024", date: "Apr 15, 2025" },
	{ id: "2", title: "Old Project Ideas", date: "Feb 22, 2025" },
	{ id: "3", title: "Grocery List", date: "Jan 10, 2025" },
];

export default function ArchiveScreen() {
	const router = useRouter();

	// Đổi MOCK_ARCHIVED_NOTES thành [] để xem trạng thái Empty State
	const [notes, setNotes] = useState(MOCK_ARCHIVED_NOTES);

	// Trạng thái chọn nhiều file
	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	const toggleSelectionMode = () => {
		setIsSelectionMode(!isSelectionMode);
		setSelectedIds([]); // Reset lựa chọn khi thoát chế độ
	};

	const toggleSelectNote = (id: string) => {
		if (selectedIds.includes(id)) {
			setSelectedIds(selectedIds.filter((item) => item !== id));
		} else {
			setSelectedIds([...selectedIds, id]);
		}
	};

	const handleRestore = () => {
		Alert.alert("Restore", `Restored ${selectedIds.length} notes!`);
		toggleSelectionMode();
	};

	const handleDelete = () => {
		Alert.alert("Delete", `Deleted ${selectedIds.length} notes permanently!`);
		// Xóa khỏi UI demo
		setNotes(notes.filter((n) => !selectedIds.includes(n.id)));
		toggleSelectionMode();
	};

	// --- 1. RENDER EMPTY STATE ---
	if (notes.length === 0) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.iconBtn}
						testID="back-btn"
					>
						<Feather name="arrow-left" size={24} color={COLORS.slate800} />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>📦 Archive</Text>
					<View style={styles.iconBtn} /> {/* Giữ cân bằng layout */}
				</View>

				<View style={styles.emptyContainer}>
					<View style={styles.emptyIconWrapper}>
						<View style={styles.emptyIconBg} />
						<Text style={{ fontSize: 64, zIndex: 10 }}>📦</Text>
					</View>
					<Text style={styles.emptyTitle}>No archived notes</Text>
					<Text style={styles.emptySubtitle}>
						Keep your dashboard clean. Notes you archive will safely appear
						here, and they are still searchable.
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	// --- 2. RENDER LIST & SELECTION STATE ---
	return (
		<SafeAreaView style={styles.safeArea}>
			{/* HEADER */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.iconBtn}
					testID="back-btn"
				>
					<Feather name="arrow-left" size={24} color={COLORS.slate800} />
				</TouchableOpacity>

				{isSelectionMode ? (
					<Text style={[styles.headerTitle, { color: COLORS.primary }]}>
						{selectedIds.length} Selected
					</Text>
				) : (
					<Text style={styles.headerTitle}>Archived Notes</Text>
				)}

				{isSelectionMode ? (
					<TouchableOpacity
						onPress={toggleSelectionMode}
						testID="toggle-select-btn"
					>
						<Text style={styles.cancelBtnText}>Cancel</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						onPress={toggleSelectionMode}
						testID="toggle-select-btn"
					>
						<Text style={styles.selectBtnText}>Select</Text>
					</TouchableOpacity>
				)}
			</View>

			{/* DANH SÁCH NOTES */}
			<ScrollView contentContainerStyle={styles.scrollContent}>
				{!isSelectionMode && (
					<Text style={styles.sectionHeader}>Older than 30 days</Text>
				)}

				{notes.map((note) => {
					const isSelected = selectedIds.includes(note.id);

					return (
						<TouchableOpacity
							key={note.id}
							style={[
								styles.noteCard,
								isSelectionMode && isSelected && styles.noteCardSelected,
								isSelectionMode && !isSelected && { opacity: 0.5 },
							]}
							onPress={() => {
								if (isSelectionMode) toggleSelectNote(note.id);
							}}
							disabled={!isSelectionMode}
							activeOpacity={0.7}
							testID={`note-item-${note.id}`}
						>
							{/* Nếu đang ở chế độ chọn -> Hiển thị Checkbox, ngược lại hiển thị Icon */}
							{isSelectionMode ? (
								<View
									style={[
										styles.checkbox,
										isSelected && styles.checkboxSelected,
									]}
								>
									{isSelected && (
										<Feather name="check" size={12} color="white" />
									)}
								</View>
							) : (
								<View style={styles.noteIconBox}>
									<Text style={{ fontSize: 20 }}>🗃️</Text>
								</View>
							)}

							<View style={styles.noteInfo}>
								<Text
									style={[
										styles.noteTitle,
										!isSelectionMode && styles.noteTitleArchived,
									]}
								>
									{note.title}
								</Text>
								<Text style={styles.noteDate}>{note.date}</Text>
							</View>
						</TouchableOpacity>
					);
				})}
			</ScrollView>

			{/* BOTTOM SHEET ACTIONS (Chỉ hiện khi chọn ít nhất 1 file) */}
			{isSelectionMode && selectedIds.length > 0 && (
				<View style={styles.bottomSheet}>
					<View style={styles.dragHandle} />
					<View style={styles.sheetHeader}>
						<Text style={styles.sheetTitle}>Note Actions</Text>
						<Text style={styles.sheetSubtitle}>
							What would you like to do with {selectedIds.length} selected note
							{selectedIds.length > 1 ? "s" : ""}?
						</Text>
					</View>

					<View style={styles.actionRow}>
						<TouchableOpacity
							style={styles.restoreBtn}
							onPress={handleRestore}
							testID="restore-btn"
						>
							<Text style={styles.restoreBtnText}>Restore</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.deleteBtn}
							onPress={handleDelete}
							testID="delete-btn"
						>
							<Text style={styles.deleteBtnText}>Delete</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.slate50 },
	header: {
		height: 60,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 24,
		backgroundColor: COLORS.white,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate100,
	},
	iconBtn: { width: 40, height: 40, justifyContent: "center" },
	headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.slate900 },
	selectBtnText: { fontSize: 14, fontWeight: "600", color: COLORS.primary },
	cancelBtnText: { fontSize: 14, fontWeight: "600", color: COLORS.slate600 },

	// --- Empty State Styles ---
	emptyContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 32,
		marginTop: -40,
	},
	emptyIconWrapper: {
		position: "relative",
		width: 128,
		height: 128,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 24,
		opacity: 0.8,
	},
	emptyIconBg: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: COLORS.slate200,
		borderRadius: 64,
		transform: [{ scale: 1.1 }],
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: COLORS.slate900,
		marginBottom: 8,
	},
	emptySubtitle: {
		fontSize: 14,
		color: COLORS.slate500,
		fontWeight: "500",
		textAlign: "center",
		lineHeight: 22,
	},

	// --- List Styles ---
	scrollContent: { padding: 24, gap: 16 },
	sectionHeader: {
		fontSize: 12,
		fontWeight: "500",
		color: COLORS.slate500,
		marginBottom: 8,
	},
	noteCard: {
		backgroundColor: COLORS.white,
		padding: 16,
		borderRadius: 24,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
	},
	noteCardSelected: {
		backgroundColor: "#EEF2FF", // indigo-50
		borderColor: COLORS.primary,
		borderWidth: 2,
	},
	noteIconBox: {
		width: 48,
		height: 48,
		backgroundColor: COLORS.slate100,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: COLORS.slate300,
		backgroundColor: COLORS.white,
		alignItems: "center",
		justifyContent: "center",
	},
	checkboxSelected: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	noteInfo: { flex: 1 },
	noteTitle: { fontSize: 16, fontWeight: "700", color: COLORS.slate900 },
	noteTitleArchived: {
		textDecorationLine: "line-through",
		color: COLORS.slate500,
	},
	noteDate: {
		fontSize: 12,
		fontWeight: "500",
		color: COLORS.slate400,
		marginTop: 4,
	},

	// --- Bottom Sheet Styles ---
	bottomSheet: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: COLORS.white,
		borderTopLeftRadius: 32,
		borderTopRightRadius: 32,
		padding: 24,
		borderTopWidth: 1,
		borderTopColor: COLORS.slate100,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -10 },
		shadowOpacity: 0.08,
		shadowRadius: 20,
		elevation: 20,
	},
	dragHandle: {
		width: 48,
		height: 6,
		backgroundColor: COLORS.slate200,
		borderRadius: 3,
		alignSelf: "center",
		marginBottom: 16,
	},
	sheetHeader: { alignItems: "center", marginBottom: 24 },
	sheetTitle: { fontSize: 18, fontWeight: "700", color: COLORS.slate900 },
	sheetSubtitle: {
		fontSize: 14,
		fontWeight: "500",
		color: COLORS.slate500,
		marginTop: 4,
	},
	actionRow: { flexDirection: "row", gap: 16 },
	restoreBtn: {
		flex: 1,
		backgroundColor: COLORS.white,
		borderWidth: 2,
		borderColor: COLORS.slate200,
		paddingVertical: 16,
		borderRadius: 16,
		alignItems: "center",
	},
	restoreBtnText: { fontSize: 16, fontWeight: "600", color: COLORS.slate800 },
	deleteBtn: {
		flex: 1,
		backgroundColor: "#EF4444", // red-500
		paddingVertical: 16,
		borderRadius: 16,
		alignItems: "center",
		shadowColor: "#FECACA", // red-200
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.8,
		shadowRadius: 10,
	},
	deleteBtnText: { fontSize: 16, fontWeight: "600", color: COLORS.white },
});

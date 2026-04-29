// app/archive.tsx
import React, { useState, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	ScrollView,
	Alert,
	ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../src/constants/theme";
import { archiveApi } from "../src/api/archiveApi";
import { Note } from "../src/types/api.types"; // Import type Note của bạn

export default function ArchiveScreen() {
	const router = useRouter();

	const [notes, setNotes] = useState<Note[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isProcessing, setIsProcessing] = useState(false); // Trạng thái khi đang Restore/Delete

	// Trạng thái chọn nhiều file
	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	// Tự động fetch data khi vào màn hình
	useFocusEffect(
		useCallback(() => {
			fetchArchivedNotes();
		}, []),
	);

	const fetchArchivedNotes = async () => {
		try {
			setIsLoading(true);
			const response = await archiveApi.getArchivedNotes();
			// Chú ý: Dựa vào logic dự án của bạn (response.data.notes hay response.data)
			setNotes(response.data?.notes || response.data || []);
		} catch (error: any) {
			console.error("Error fetching archived notes:", error);
			Alert.alert("Error", "Unable to load archived notes.");
		} finally {
			setIsLoading(false);
		}
	};

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
		Alert.alert(
			"Restore Notes",
			`Are you sure you want to restore ${selectedIds.length} notes?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Restore",
					onPress: async () => {
						try {
							setIsProcessing(true);

							// Dùng vòng lặp for...of để gọi API từng cái một, an toàn cho Backend
							for (const id of selectedIds) {
								await archiveApi.restoreNote(id);
							}

							Alert.alert("Success", `Restored ${selectedIds.length} notes!`);
							toggleSelectionMode();
							fetchArchivedNotes(); // Cập nhật lại danh sách trên UI
						} catch (error: any) {
							console.error("Lỗi Restore:", error.response?.data || error);
							Alert.alert("Error", "Failed to restore some notes.");
						} finally {
							setIsProcessing(false);
						}
					},
				},
			],
		);
	};

	const handleDelete = () => {
		Alert.alert(
			"Delete Permanently",
			`Are you sure you want to delete ${selectedIds.length} notes? This action cannot be undone.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							setIsProcessing(true);
							// Gọi API delete cho từng ID đã chọn
							await Promise.all(
								selectedIds.map((id) => archiveApi.deleteNote(id)),
							);

							Alert.alert(
								"Deleted",
								`Permanently deleted ${selectedIds.length} notes.`,
							);
							toggleSelectionMode();
							fetchArchivedNotes(); // Cập nhật lại UI
						} catch (error) {
							Alert.alert("Error", "Failed to delete some notes.");
						} finally {
							setIsProcessing(false);
						}
					},
				},
			],
		);
	};

	// --- 1. RENDER LOADING STATE ---
	if (isLoading) {
		return (
			<SafeAreaView
				style={[
					styles.safeArea,
					{ justifyContent: "center", alignItems: "center" },
				]}
			>
				<ActivityIndicator size="large" color={COLORS.primary} />
			</SafeAreaView>
		);
	}

	// --- 2. RENDER EMPTY STATE ---
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
					<View style={styles.iconBtn} />
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

	// --- 3. RENDER LIST & SELECTION STATE ---
	return (
		<SafeAreaView style={styles.safeArea}>
			{/* MÀN CHẮN LOADING KHI ĐANG PROCESS XOÁ/PHỤC HỒI HÀNG LOẠT */}
			{isProcessing && (
				<View style={styles.processingOverlay}>
					<ActivityIndicator size="large" color={COLORS.primary} />
					<Text style={styles.processingText}>Processing...</Text>
				</View>
			)}

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

				<TouchableOpacity
					onPress={toggleSelectionMode}
					testID="toggle-select-btn"
				>
					<Text
						style={
							isSelectionMode ? styles.cancelBtnText : styles.selectBtnText
						}
					>
						{isSelectionMode ? "Cancel" : "Select"}
					</Text>
				</TouchableOpacity>
			</View>

			{/* DANH SÁCH NOTES */}
			<ScrollView contentContainerStyle={styles.scrollContent}>
				{!isSelectionMode && (
					<Text style={styles.sectionHeader}>Stored securely</Text>
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
								if (isSelectionMode) {
									toggleSelectNote(note.id);
								} else {
									// Xem chi tiết ngay cả khi bị Archive (Nếu muốn hỗ trợ xem)
									router.push(`/note/${note.id}`);
								}
							}}
							disabled={isProcessing} // Khoá nút khi đang load
							activeOpacity={0.7}
							testID={`note-item-${note.id}`}
						>
							{/* Checkbox / Icon */}
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
									numberOfLines={1}
								>
									{note.title}
								</Text>
								<Text style={styles.noteContentPreview} numberOfLines={1}>
									{note.content}
								</Text>
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
							disabled={isProcessing}
						>
							<Text style={styles.restoreBtnText}>Restore</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.deleteBtn}
							onPress={handleDelete}
							disabled={isProcessing}
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
	processingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(255,255,255,0.7)",
		zIndex: 999,
		alignItems: "center",
		justifyContent: "center",
	},
	processingText: { marginTop: 12, fontWeight: "600", color: COLORS.primary },
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
		backgroundColor: "#EEF2FF",
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
	noteContentPreview: {
		fontSize: 12,
		fontWeight: "500",
		color: COLORS.slate400,
		marginTop: 4,
	},

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
		backgroundColor: "#EF4444",
		paddingVertical: 16,
		borderRadius: 16,
		alignItems: "center",
		shadowColor: "#FECACA",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.8,
		shadowRadius: 10,
	},
	deleteBtnText: { fontSize: 16, fontWeight: "600", color: COLORS.white },
});

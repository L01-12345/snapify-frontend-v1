// src/components/common/NoteActionSheet.tsx
import React, { useState } from "react";
import {
	Modal,
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Platform,
	Alert,
	ActivityIndicator,
} from "react-native";
import { COLORS } from "../../constants/theme";
import { noteApi } from "../../api/noteApi";
import { batchApi } from "../../api/batchApi";

interface NoteActionSheetProps {
	visible: boolean;
	onClose: () => void;
	noteId: string;
	noteTitle?: string;
	isArchived?: boolean;
	onSuccess?: () => void;
	onMove?: () => void;
	onPin?: () => void;
	itemType?: "note" | "batch";
}

export const NoteActionSheet = ({
	visible,
	onClose,
	noteId,
	noteTitle,
	isArchived = false,
	onSuccess,
	onMove,
	onPin,
	itemType = "note",
}: NoteActionSheetProps) => {
	const [isProcessing, setIsProcessing] = useState(false);
	const isBatch = itemType === "batch";

	const handleArchive = async () => {
		try {
			setIsProcessing(true);
			// API: Update status thành ARCHIVED
			await noteApi.updateNote(noteId, { status: "ARCHIVED" });
			Alert.alert("Archived", "Note has been moved to Archive.");

			if (onSuccess) onSuccess(); // Báo cho màn hình cha cập nhật lại list
			onClose(); // Đóng Modal
		} catch (error) {
			console.error("Archive Error:", error);
			Alert.alert("Error", "Failed to archive the note.");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleDelete = () => {
		const docName = isBatch ? "PDF Document" : "Note";

		Alert.alert(
			`Delete ${docName}`,
			`Are you sure you want to permanently delete "${noteTitle || "this document"}"?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							setIsProcessing(true);

							// Phân nhánh gọi API tùy theo loại
							if (isBatch) {
								await batchApi.deleteBatch(noteId);
							} else {
								await noteApi.deleteNote(noteId);
							}

							Alert.alert("Deleted", `${docName} has been deleted.`);
							if (onSuccess) onSuccess();
							onClose();
						} catch (error) {
							console.error("Delete Error:", error);
							Alert.alert(
								"Error",
								`Failed to delete the ${docName.toLowerCase()}.`,
							);
						} finally {
							setIsProcessing(false);
						}
					},
				},
			],
		);
	};
	const handleRestore = async () => {
		try {
			setIsProcessing(true);
			// Cập nhật status về PENDING để pass qua bộ validate của Backend
			await noteApi.updateNote(noteId, { status: "PENDING" });
			Alert.alert("Restored", "Note has been restored.");

			if (onSuccess) onSuccess();
			onClose();
		} catch (error) {
			console.error("Restore Error:", error);
			Alert.alert("Error", "Failed to restore the note.");
		} finally {
			setIsProcessing(false);
		}
	};
	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType="slide"
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				{/* Nhấn ra ngoài vùng tối để đóng Modal */}
				<TouchableWithoutFeedback onPress={onClose} testID="sheet-backdrop">
					<View style={styles.backdrop} />
				</TouchableWithoutFeedback>

				<View style={styles.sheetContent}>
					{isProcessing && (
						<View style={styles.processingOverlay}>
							<ActivityIndicator size="large" color={COLORS.primary} />
							<Text style={styles.processingText}>Processing...</Text>
						</View>
					)}

					<View style={styles.dragHandle} />

					<View style={styles.header}>
						<Text style={styles.title}>
							{isBatch ? "PDF Actions" : "Note Actions"}
						</Text>
						{noteTitle && (
							<Text style={styles.subtitle} numberOfLines={1}>
								{noteTitle}
							</Text>
						)}
					</View>

					<View style={styles.actionGroup}>
						{/* CHỈ HIỂN THỊ ARCHIVE/RESTORE/PIN NẾU LÀ NOTE */}
						{!isBatch && (
							<>
								{isArchived ? (
									<TouchableOpacity
										style={styles.actionBtn}
										onPress={handleRestore}
										disabled={isProcessing}
									>
										<Text style={styles.actionIcon}>♻️</Text>
										<Text style={styles.actionText}>Restore Note</Text>
									</TouchableOpacity>
								) : (
									<TouchableOpacity
										style={styles.actionBtn}
										onPress={handleArchive}
										disabled={isProcessing}
									>
										<Text style={styles.actionIcon}>📦</Text>
										<Text style={styles.actionText}>Archive Note</Text>
									</TouchableOpacity>
								)}
							</>
						)}

						{/* Move áp dụng được cho cả hai */}
						<TouchableOpacity
							style={styles.actionBtn}
							onPress={onMove}
							testID="move-btn"
							disabled={isProcessing}
						>
							<Text style={styles.actionIcon}>📁</Text>
							<Text style={styles.actionText}>Move to Folder</Text>
						</TouchableOpacity>

						{!isBatch && (
							<TouchableOpacity
								style={styles.actionBtn}
								onPress={onPin}
								testID="pin-btn"
								disabled={isProcessing}
							>
								<Text style={styles.actionIcon}>📌</Text>
								<Text style={styles.actionText}>Pin to Top</Text>
							</TouchableOpacity>
						)}
					</View>

					<View style={styles.divider} />

					<TouchableOpacity
						style={styles.deleteBtn}
						onPress={handleDelete}
						testID="delete-btn"
						disabled={isProcessing}
					>
						<Text style={styles.deleteIcon}>🗑️</Text>
						<Text style={styles.deleteText}>
							Delete {isBatch ? "PDF" : "Note"}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.cancelBtn}
						onPress={onClose}
						disabled={isProcessing}
					>
						<Text style={styles.cancelText}>Cancel</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: { flex: 1, justifyContent: "flex-end" },
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(15, 23, 42, 0.4)", // Nền tối làm mờ
	},
	sheetContent: {
		backgroundColor: COLORS.white,
		borderTopLeftRadius: 32,
		borderTopRightRadius: 32,
		padding: 24,
		paddingBottom: Platform.OS === "ios" ? 40 : 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -10 },
		shadowOpacity: 0.1,
		shadowRadius: 20,
		elevation: 20,
	},
	dragHandle: {
		width: 48,
		height: 6,
		backgroundColor: COLORS.slate200,
		borderRadius: 3,
		alignSelf: "center",
		marginBottom: 20,
	},
	header: { marginBottom: 24, alignItems: "center" },
	title: { fontSize: 18, fontWeight: "800", color: COLORS.slate900 },
	subtitle: {
		fontSize: 14,
		fontWeight: "500",
		color: COLORS.slate500,
		marginTop: 4,
	},
	actionGroup: { gap: 8 },
	actionBtn: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.slate50,
		padding: 16,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: COLORS.slate100,
	},
	actionIcon: { fontSize: 20, marginRight: 16 },
	actionText: { fontSize: 16, fontWeight: "600", color: COLORS.slate800 },
	divider: { height: 1, backgroundColor: COLORS.slate100, marginVertical: 16 },
	deleteBtn: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FEF2F2", // red-50
		padding: 16,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#FEE2E2", // red-200
		marginBottom: 16,
	},
	deleteIcon: { fontSize: 20, marginRight: 16 },
	deleteText: { fontSize: 16, fontWeight: "700", color: "#DC2626" }, // red-600
	cancelBtn: { paddingVertical: 16, alignItems: "center" },
	cancelText: { fontSize: 16, fontWeight: "700", color: COLORS.slate500 },
	processingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(255,255,255,0.8)",
		zIndex: 999,
		alignItems: "center",
		justifyContent: "center",
	},
	processingText: {
		marginTop: 8,
		fontWeight: "600",
		color: COLORS.primary,
	},
});

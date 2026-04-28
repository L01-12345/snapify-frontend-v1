// src/components/common/NoteActionSheet.tsx
import React from "react";
import {
	Modal,
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Platform,
} from "react-native";
import { COLORS } from "../../constants/theme";

interface NoteActionSheetProps {
	visible: boolean;
	onClose: () => void;
	noteTitle?: string;
	onArchive: () => void;
	onMove: () => void;
	onPin: () => void;
	onDelete: () => void;
}

export const NoteActionSheet = ({
	visible,
	onClose,
	noteTitle,
	onArchive,
	onMove,
	onPin,
	onDelete,
}: NoteActionSheetProps) => {
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
					<View style={styles.dragHandle} />

					<View style={styles.header}>
						<Text style={styles.title}>Note Actions</Text>
						{noteTitle && (
							<Text style={styles.subtitle} numberOfLines={1}>
								{noteTitle}
							</Text>
						)}
					</View>

					<View style={styles.actionGroup}>
						<TouchableOpacity
							style={styles.actionBtn}
							onPress={onArchive}
							testID="archive-btn"
						>
							<Text style={styles.actionIcon}>📦</Text>
							<Text style={styles.actionText}>Archive Note</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.actionBtn}
							onPress={onMove}
							testID="move-btn"
						>
							<Text style={styles.actionIcon}>📁</Text>
							<Text style={styles.actionText}>Move to Folder</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.actionBtn}
							onPress={onPin}
							testID="pin-btn"
						>
							<Text style={styles.actionIcon}>📌</Text>
							<Text style={styles.actionText}>Pin to Top</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.divider} />

					<TouchableOpacity
						style={styles.deleteBtn}
						onPress={onDelete}
						testID="delete-btn"
					>
						<Text style={styles.deleteIcon}>🗑️</Text>
						<Text style={styles.deleteText}>Delete Note</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.cancelBtn}
						onPress={onClose}
						testID="cancel-btn"
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
});

// src/components/common/FolderSelectModal.tsx
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
import { Feather, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";

interface Folder {
	id: string;
	name: string;
	icon: string;
	isAiSuggested?: boolean;
}

interface FolderSelectModalProps {
	visible: boolean;
	onClose: () => void;
	selectedId?: string;
	onSelect: (id: string) => void;
}

export const FolderSelectModal = ({
	visible,
	onClose,
	selectedId,
	onSelect,
}: FolderSelectModalProps) => {
	// Mock danh sách Folder
	const folders: Folder[] = [
		{ id: "1", name: "Work", icon: "💼" },
		{ id: "2", name: "Study", icon: "📚", isAiSuggested: true },
		{ id: "3", name: "Receipts", icon: "🧾" },
	];

	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType="slide"
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<TouchableWithoutFeedback onPress={onClose}>
					<View style={styles.backdrop} />
				</TouchableWithoutFeedback>

				<View style={styles.modalContent}>
					<View style={styles.dragHandle} />

					<View style={styles.header}>
						<Text style={styles.title}>Select Folder</Text>
						<TouchableOpacity style={styles.addBtn}>
							<Feather name="plus" size={20} color={COLORS.slate500} />
						</TouchableOpacity>
					</View>

					<View style={styles.listContainer}>
						{folders.map((folder) => {
							const isSelected = folder.id === selectedId;

							return (
								<TouchableOpacity
									key={folder.id}
									style={[
										styles.itemCard,
										isSelected && styles.itemCardSelected,
									]}
									onPress={() => onSelect(folder.id)}
									activeOpacity={0.7}
								>
									<View style={styles.itemLeft}>
										<View style={styles.iconBox}>
											<Text style={styles.iconText}>{folder.icon}</Text>
										</View>
										<View>
											<Text
												style={[
													styles.folderName,
													isSelected && { color: COLORS.slate900 },
												]}
											>
												{folder.name}
											</Text>
											{isSelected ? (
												<Text style={styles.selectedLabel}>SELECTED</Text>
											) : folder.isAiSuggested ? (
												<View style={styles.aiTagRow}>
													<Text style={{ fontSize: 10 }}>✨</Text>
													<Text style={styles.aiTagText}>AI SUGGESTED</Text>
												</View>
											) : null}
										</View>
									</View>

									{/* Checkbox / Radio Circle */}
									<View
										style={[
											styles.radioCircle,
											isSelected && styles.radioCircleSelected,
										]}
									>
										{isSelected && (
											<Feather name="check" size={14} color={COLORS.white} />
										)}
									</View>
								</TouchableOpacity>
							);
						})}
					</View>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: { flex: 1, justifyContent: "flex-end" },
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(15, 23, 42, 0.4)",
	},
	modalContent: {
		backgroundColor: COLORS.white,
		borderTopLeftRadius: 36,
		borderTopRightRadius: 36,
		padding: 24,
		paddingBottom: Platform.OS === "ios" ? 40 : 24,
		shadowColor: COLORS.slate900,
		shadowOffset: { width: 0, height: -10 },
		shadowOpacity: 0.15,
		shadowRadius: 20,
		elevation: 10,
	},
	dragHandle: {
		width: 48,
		height: 6,
		backgroundColor: COLORS.slate200,
		borderRadius: 3,
		alignSelf: "center",
		marginBottom: 24,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 24,
	},
	title: { fontSize: 20, fontWeight: "800", color: COLORS.slate900 },
	addBtn: {
		width: 36,
		height: 36,
		backgroundColor: COLORS.slate100,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	listContainer: { gap: 16 },
	itemCard: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 16,
		backgroundColor: COLORS.white,
		borderWidth: 1.5,
		borderColor: COLORS.slate200,
		borderRadius: 20,
	},
	itemCardSelected: { backgroundColor: "#EEF2FF", borderColor: COLORS.primary },
	itemLeft: { flexDirection: "row", alignItems: "center", gap: 16 },
	iconBox: {
		width: 48,
		height: 48,
		backgroundColor: COLORS.slate100,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	iconText: { fontSize: 20 },
	folderName: { fontSize: 16, fontWeight: "700", color: COLORS.slate700 },
	selectedLabel: {
		fontSize: 10,
		fontWeight: "800",
		color: COLORS.primary,
		marginTop: 4,
		letterSpacing: 0.5,
	},
	aiTagRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		marginTop: 4,
	},
	aiTagText: {
		fontSize: 10,
		fontWeight: "800",
		color: COLORS.primaryEnd,
		letterSpacing: 0.5,
	},
	radioCircle: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: COLORS.slate300,
		alignItems: "center",
		justifyContent: "center",
	},
	radioCircleSelected: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
});

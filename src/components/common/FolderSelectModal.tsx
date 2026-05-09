// src/components/common/FolderSelectModal.tsx
import React, { useState, useEffect } from "react";
import {
	Modal,
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Platform,
	ActivityIndicator,
	Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";

import { folderApi } from "../../api/folderApi";

interface Folder {
	id: string;
	name: string;
	icon?: string; // Có thể API không có trường này, nên để optional
	isAiSuggested?: boolean;
}

interface FolderSelectModalProps {
	visible: boolean;
	onClose: () => void;
	selectedId?: string;
	onSelect: (folder: any) => void;
}

export const FolderSelectModal = ({
	visible,
	onClose,
	selectedId,
	onSelect,
}: FolderSelectModalProps) => {
	const [folders, setFolders] = useState<Folder[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Gọi API lấy danh sách Folder mỗi khi Modal được hiển thị
	useEffect(() => {
		if (visible) {
			fetchFolders();
		}
	}, [visible]);

	const fetchFolders = async () => {
		try {
			setIsLoading(true);
			// Gọi API lấy danh sách thư mục
			const response = await folderApi.getFolders();

			// Cập nhật danh sách từ API (giả sử dữ liệu nằm trong response.data)
			setFolders(response.data || []);
		} catch (error: any) {
			console.error("Error loading folders:", error);
			Alert.alert("Error", "Unable to load folder list.");
		} finally {
			setIsLoading(false);
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
				<TouchableWithoutFeedback
					onPress={onClose}
					testID="folder-modal-backdrop"
				>
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
						{isLoading ? (
							<ActivityIndicator
								size="large"
								color={COLORS.primary}
								style={{ marginVertical: 20 }}
							/>
						) : folders.length === 0 ? (
							<Text style={styles.emptyText}>
								You don't have any folders yet.
							</Text>
						) : (
							folders.map((folder) => {
								const isSelected = folder.id === selectedId;

								return (
									<TouchableOpacity
										key={folder.id}
										style={[
											styles.itemCard,
											isSelected && styles.itemCardSelected,
										]}
										onPress={() => onSelect(folder)}
										activeOpacity={0.7}
										testID={`folder-item-${folder.id}`}
									>
										<View style={styles.itemLeft}>
											<View style={styles.iconBox}>
												{/* Nếu API trả về icon thì dùng, không thì dùng mặc định 📂 */}
												<Text style={styles.iconText}>
													{folder.icon || "📂"}
												</Text>
											</View>
											<View style={{ flex: 1 }}>
												<Text
													style={[
														styles.folderName,
														isSelected && { color: COLORS.slate900 },
													]}
													numberOfLines={1}
													ellipsizeMode="tail"
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
							})
						)}
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
	emptyText: {
		textAlign: "center",
		color: COLORS.slate500,
		fontSize: 14,
		fontStyle: "italic",
	},
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
	itemLeft: { flexDirection: "row", alignItems: "center", gap: 16, flex: 1 },
	iconBox: {
		width: 48,
		height: 48,
		backgroundColor: COLORS.slate100,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	iconText: { fontSize: 20 },
	folderName: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.slate700,
	},
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

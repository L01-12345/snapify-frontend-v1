import React, { useRef, useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Alert,
	ActivityIndicator,
	TextInput,
	Modal,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { COLORS } from "../../src/constants/theme";
import { folderApi } from "../../src/api/folderApi";
import { Folder } from "../../src/types/api.types";
import { Icon, type IconName } from "../../src/components/common/Icon";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	ResponsiveFontSize,
	ResponsiveSpacing,
	ResponsiveDimensions,
	ResponsiveBorderRadius,
	scale,
	getResponsiveShadow,
} from "../../src/utils/responsive";

// Bộ màu và icon tĩnh để gắn cho các folder (do API không lưu màu)
const FOLDER_STYLES: { icon: IconName; bgColor: string; iconColor: string }[] =
	[
		{ icon: "folder", bgColor: "#EEF2FF", iconColor: "#6366F1" },
		{ icon: "briefcase", bgColor: "#ECFDF5", iconColor: "#10B981" },
		{ icon: "receipt", bgColor: "#FFFBEB", iconColor: "#F59E0B" },
		{ icon: "heart", bgColor: "#FFF1F2", iconColor: "#F43F5E" },
	];

export default function FoldersScreen() {
	const router = useRouter();
	const [folders, setFolders] = useState<Folder[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// State cho Modal tạo Folder mới
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	// Dùng useFocusEffect để tự động reload mỗi khi tab này được mở
	useFocusEffect(
		useCallback(() => {
			fetchFolders();
		}, []),
	);
	const fetchFolders = async () => {
		try {
			const response = await folderApi.getFolders();
			setFolders(response.data || []);
		} catch (error) {
			console.log("Lỗi tải folders:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateFolder = async () => {
		if (!newFolderName.trim()) return;
		try {
			setIsCreating(true);
			await folderApi.createFolder({ name: newFolderName });
			setNewFolderName("");
			setIsModalVisible(false);
			fetchFolders(); // Reload lại danh sách
		} catch (error: any) {
			Alert.alert("Error", error.message || "Unable to create folder.");
		} finally {
			setIsCreating(false);
		}
	};

	// Dữ liệu giả lập
	// const folders = [
	// 	{
	// 		id: "1",
	// 		title: "Study",
	// 		notes: 12,
	// 		icon: "📚",
	// 		bgColor: "#EEF2FF",
	// 		iconColor: "#6366F1",
	// 	},
	// 	{
	// 		id: "2",
	// 		title: "Work",
	// 		notes: 8,
	// 		icon: "💼",
	// 		bgColor: "#ECFDF5",
	// 		iconColor: "#10B981",
	// 	},
	// 	{
	// 		id: "3",
	// 		title: "Receipts",
	// 		notes: 24,
	// 		icon: "🧾",
	// 		bgColor: "#FFFBEB",
	// 		iconColor: "#F59E0B",
	// 	},
	// 	{
	// 		id: "4",
	// 		title: "Personal",
	// 		notes: 3,
	// 		icon: "❤️",
	// 		bgColor: "#FFF1F2",
	// 		iconColor: "#F43F5E",
	// 	},
	// ];

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Folders</Text>
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => setIsModalVisible(true)}
					testID="add-folder-btn"
				>
					<Text style={styles.addButtonText}>+</Text>
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				{isLoading ? (
					<ActivityIndicator
						size="large"
						color={COLORS.primary}
						style={{ marginTop: 40 }}
					/>
				) : folders.length === 0 ? (
					<View style={styles.emptyState}>
						<Text style={styles.emptyText}>No folders yet.</Text>
						<Text style={styles.emptySubText}>Create your first folder!</Text>
					</View>
				) : (
					<View style={styles.gridContainer}>
						{folders.map((folder, index) => {
							const style = FOLDER_STYLES[index % FOLDER_STYLES.length];
							return (
								<TouchableOpacity
									key={folder.id}
									style={styles.card}
									onPress={() => router.push(`/folder/${folder.id}`)}
									testID={`folder-card-${folder.id}`}
								>
									<View
										style={[styles.iconBox, { backgroundColor: style.bgColor }]}
									>
										<Icon
											name={style.icon}
											size={20}
											color={style.iconColor}
											style={styles.iconSvg}
										/>
									</View>
									<View style={styles.cardInfo}>
										<Text style={styles.cardTitle} numberOfLines={1}>
											{folder.name}
										</Text>
										<Text style={styles.cardSubtitle}>
											{folder.type === "SMART" ? "AUTO" : "MANUAL"}
										</Text>
									</View>
								</TouchableOpacity>
							);
						})}
					</View>
				)}
			</ScrollView>
			<Modal visible={isModalVisible} transparent animationType="fade">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Create New Folder</Text>
						<TextInput
							style={styles.input}
							placeholder="Folder name (e.g. Invoices)"
							value={newFolderName}
							onChangeText={setNewFolderName}
							autoFocus
							testID="folder-name-input"
						/>
						<View style={styles.modalActions}>
							<TouchableOpacity
								onPress={() => setIsModalVisible(false)}
								style={styles.cancelBtn}
								testID="cancel-folder-btn"
							>
								<Text style={styles.cancelText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleCreateFolder}
								style={styles.createBtn}
								disabled={isCreating}
								testID="create-folder-btn"
							>
								{isCreating ? (
									<ActivityIndicator color="white" />
								) : (
									<Text style={styles.createText}>Tạo</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
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
	headerTitle: {
		fontSize: ResponsiveFontSize["5xl"],
		fontWeight: "800",
		color: COLORS.slate900,
	},
	addButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: COLORS.slate100,
		alignItems: "center",
		justifyContent: "center",
	},
	addButtonText: {
		fontSize: ResponsiveFontSize["3xl"],
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
	iconText: { fontSize: ResponsiveFontSize["3xl"] },
	iconSvg: {
		width: 24,
		height: 24,
	},
	cardInfo: { gap: 4 },
	cardTitle: {
		fontSize: ResponsiveFontSize["xl"],
		fontWeight: "700",
		color: COLORS.slate900,
	},
	cardSubtitle: {
		fontSize: ResponsiveFontSize["sm"],
		fontWeight: "500",
		color: COLORS.slate500,
	},
	emptyState: { alignItems: "center", marginTop: 60 },
	emptyText: {
		fontSize: ResponsiveFontSize["xl"],
		fontWeight: "700",
		color: COLORS.slate700,
	},
	emptySubText: {
		fontSize: ResponsiveFontSize["base"],
		color: COLORS.slate500,
		marginTop: 8,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		padding: 24,
	},
	modalContent: {
		backgroundColor: "white",
		borderRadius: 24,
		padding: 24,
		gap: 16,
	},
	modalTitle: {
		fontSize: ResponsiveFontSize["2xl"],
		fontWeight: "800",
		color: COLORS.slate900,
	},
	input: {
		borderWidth: 1,
		borderColor: COLORS.slate200,
		borderRadius: 12,
		padding: 16,
		fontSize: ResponsiveFontSize["lg"],
	},
	modalActions: { flexDirection: "row", gap: 12, marginTop: 12 },
	cancelBtn: { flex: 1, padding: 16, alignItems: "center" },
	cancelText: { color: COLORS.slate500, fontWeight: "700" },
	createBtn: {
		flex: 1,
		backgroundColor: COLORS.primary,
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	createText: { color: "white", fontWeight: "700" },
});

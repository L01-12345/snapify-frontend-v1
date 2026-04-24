import React, { useRef, useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
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

// Bộ màu và icon tĩnh để gắn cho các folder (do API không lưu màu)
const FOLDER_STYLES = [
	{ icon: "📚", bgColor: "#EEF2FF", iconColor: "#6366F1" },
	{ icon: "💼", bgColor: "#ECFDF5", iconColor: "#10B981" },
	{ icon: "🧾", bgColor: "#FFFBEB", iconColor: "#F59E0B" },
	{ icon: "❤️", bgColor: "#FFF1F2", iconColor: "#F43F5E" },
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
			Alert.alert("Lỗi", error.message || "Không thể tạo thư mục.");
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
				<TouchableOpacity style={styles.addButton}>
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
						<Text style={styles.emptyText}>Chưa có thư mục nào.</Text>
						<Text style={styles.emptySubText}>
							Hãy tạo thư mục đầu tiên của bạn!
						</Text>
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
								>
									<View
										style={[styles.iconBox, { backgroundColor: style.bgColor }]}
									>
										<Text style={styles.iconText}>{style.icon}</Text>
									</View>
									<View style={styles.cardInfo}>
										<Text style={styles.cardTitle} numberOfLines={1}>
											{folder.name}
										</Text>
										<Text style={styles.cardSubtitle}>
											{folder.type === "SMART" ? "Tự động" : "Thủ công"}
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
						<Text style={styles.modalTitle}>Tạo thư mục mới</Text>
						<TextInput
							style={styles.input}
							placeholder="Tên thư mục (VD: Hóa đơn)"
							value={newFolderName}
							onChangeText={setNewFolderName}
							autoFocus
						/>
						<View style={styles.modalActions}>
							<TouchableOpacity
								onPress={() => setIsModalVisible(false)}
								style={styles.cancelBtn}
							>
								<Text style={styles.cancelText}>Hủy</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleCreateFolder}
								style={styles.createBtn}
								disabled={isCreating}
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
	headerTitle: { fontSize: 32, fontWeight: "800", color: COLORS.slate900 },
	addButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: COLORS.slate100,
		alignItems: "center",
		justifyContent: "center",
	},
	addButtonText: {
		fontSize: 24,
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
	iconText: { fontSize: 24 },
	cardInfo: { gap: 4 },
	cardTitle: { fontSize: 18, fontWeight: "700", color: COLORS.slate900 },
	cardSubtitle: { fontSize: 12, fontWeight: "500", color: COLORS.slate500 },
	emptyState: { alignItems: "center", marginTop: 60 },
	emptyText: { fontSize: 18, fontWeight: "700", color: COLORS.slate700 },
	emptySubText: { fontSize: 14, color: COLORS.slate500, marginTop: 8 },
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
	modalTitle: { fontSize: 20, fontWeight: "800", color: COLORS.slate900 },
	input: {
		borderWidth: 1,
		borderColor: COLORS.slate200,
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
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

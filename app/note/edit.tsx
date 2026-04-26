import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	TextInput,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Alert,
	Image,
	Modal, // Thêm Modal cho phần phóng to ảnh
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/theme";
import { noteApi } from "../../src/api/noteApi";
// Import FolderSelectModal
import { FolderSelectModal } from "../../src/components/common/FolderSelectModal";

export default function EditNoteScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// --- STATE CHO FOLDER ---
	const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
	const [selectedFolder, setSelectedFolder] = useState({
		id: "2",
		name: "Study",
		icon: "📚",
	});

	// --- STATE CHO PHÓNG TO ẢNH ---
	const [isImageZoomVisible, setIsImageZoomVisible] = useState(false);

	useEffect(() => {
		const fetchNote = async () => {
			try {
				const response = await noteApi.getNoteById(id);
				const data = response.data;
				if (data) {
					setTitle(data.title);
					setContent(data.content);
					if (data.images && data.images.length > 0) {
						setImageUrl(data.images[0].imageUrl);
					}
					// Nếu API có trả về folder, cập nhật vào selectedFolder ở đây
				}
			} catch (error) {
				Alert.alert("Error", "Unable to load content.");
			} finally {
				setIsLoading(false);
			}
		};
		fetchNote();
	}, [id]);

	const handleUpdate = async () => {
		try {
			setIsSaving(true);
			await noteApi.updateNote(id, { title, content });
			router.back();
		} catch (error: any) {
			Alert.alert("Error", error.message);
		} finally {
			setIsSaving(false);
		}
	};

	// Xử lý khi chọn folder mới từ Modal
	const handleSelectFolder = (folder: any) => {
		if (folder) {
			setSelectedFolder({
				id: folder.id,
				name: folder.name,
				icon: folder.icon || "📂",
			});
		}
		setIsFolderModalVisible(false);
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			{/* --- HEADER --- */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
					<Feather name="arrow-left" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Edit Note</Text>
				<TouchableOpacity onPress={handleUpdate}>
					<Text style={styles.saveBtn}>{isSaving ? "..." : "Save"}</Text>
				</TouchableOpacity>
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
			>
				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					<TextInput
						style={styles.titleInput}
						placeholder="Note Title..."
						value={title}
						onChangeText={setTitle}
						placeholderTextColor={COLORS.slate300}
					/>

					{/* --- ORIGINAL IMAGE --- */}
					{imageUrl && (
						<>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>Original Image</Text>
								<TouchableOpacity>
									<Text style={styles.linkText}>Retake</Text>
								</TouchableOpacity>
							</View>
							{/* Nhấn vào khung ảnh để phóng to */}
							<TouchableOpacity
								style={[styles.imageBox, { marginBottom: 24 }]}
								onPress={() => setIsImageZoomVisible(true)}
								activeOpacity={0.9}
							>
								<Image
									source={{ uri: imageUrl }}
									style={styles.actualImage}
									resizeMode="cover"
								/>
								<View style={styles.zoomOverlayIcon}>
									<Feather name="maximize-2" size={18} color="white" />
								</View>
							</TouchableOpacity>
						</>
					)}

					{/* --- AI SUGGESTED FOLDER CARD --- */}
					<View style={styles.aiCard}>
						<View style={styles.aiInfo}>
							<View style={styles.aiTagRow}>
								{/* Ẩn icon lấp lánh và đổi chữ thành "FOLDER" nếu người dùng tự chọn bằng tay */}
								<Text style={[styles.aiTagText, { color: COLORS.slate500 }]}>
									FOLDER
								</Text>
							</View>
							<Text style={styles.aiFolderName}>
								{selectedFolder.icon} {selectedFolder.name}
							</Text>
						</View>
						<TouchableOpacity
							style={styles.changeBtn}
							onPress={() => setIsFolderModalVisible(true)}
						>
							<Text style={styles.changeBtnText}>Change</Text>
						</TouchableOpacity>
					</View>

					{/* --- EXTRACTED TEXT --- */}
					<Text style={[styles.sectionTitle, { marginBottom: 8 }]}>
						Extracted Text
					</Text>
					<TextInput
						style={styles.textArea}
						multiline
						textAlignVertical="top"
						value={content}
						onChangeText={setContent}
					/>
				</ScrollView>
			</KeyboardAvoidingView>

			{/* --- MODAL CHỌN FOLDER --- */}
			<FolderSelectModal
				visible={isFolderModalVisible}
				onClose={() => setIsFolderModalVisible(false)}
				selectedId={selectedFolder.id}
				onSelect={handleSelectFolder}
			/>

			{/* --- MODAL PHÓNG TO ẢNH (IMAGE LIGHTBOX) --- */}
			<Modal
				visible={isImageZoomVisible}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setIsImageZoomVisible(false)}
			>
				<View style={styles.zoomContainer}>
					<TouchableOpacity
						style={styles.zoomCloseBtn}
						onPress={() => setIsImageZoomVisible(false)}
					>
						<Feather name="x" size={28} color="white" />
					</TouchableOpacity>

					<TouchableOpacity
						activeOpacity={1}
						style={styles.zoomBackdrop}
						onPress={() => setIsImageZoomVisible(false)}
					>
						<Image
							source={{ uri: imageUrl || "" }}
							style={styles.fullImage}
							resizeMode="contain"
						/>
					</TouchableOpacity>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.white },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 24,
		height: 60,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate100,
	},
	iconBtn: {
		width: 40,
		height: 40,
		alignItems: "flex-start",
		justifyContent: "center",
	},
	headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.slate900 },
	saveBtn: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
	content: { padding: 24, gap: 24 },
	titleInput: { fontSize: 24, fontWeight: "800", color: COLORS.slate900 },
	aiCard: {
		backgroundColor: "#F5F3FF",
		borderWidth: 1,
		borderColor: "#EDE9FE",
		borderRadius: 16,
		padding: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	aiInfo: { gap: 4 },
	aiTagRow: { flexDirection: "row", alignItems: "center", gap: 6 },
	sparkleIcon: {
		width: 16,
		height: 16,
		backgroundColor: "#7C3AED",
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	aiTagText: {
		fontSize: 10,
		fontWeight: "700",
		color: "#7C3AED",
		letterSpacing: 1,
	},
	aiFolderName: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.slate900,
		marginTop: 4,
	},
	changeBtn: {
		backgroundColor: COLORS.white,
		borderWidth: 1,
		borderColor: "#EDE9FE",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 12,
	},
	changeBtnText: { fontSize: 12, fontWeight: "700", color: "#7C3AED" },
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	sectionTitle: { fontSize: 14, fontWeight: "700", color: COLORS.slate900 },
	linkText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },
	textArea: {
		flex: 1,
		minHeight: 250,
		backgroundColor: COLORS.slate50,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		borderRadius: 24,
		padding: 20,
		fontSize: 14,
		color: COLORS.slate700,
		fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
	},
	imageBox: {
		height: 160,
		backgroundColor: COLORS.slate50,
		borderRadius: 16,
		overflow: "hidden",
		borderWidth: 1,
		borderColor: COLORS.slate200,
		position: "relative",
	},
	actualImage: {
		width: "100%",
		height: "100%",
	},
	zoomOverlayIcon: {
		position: "absolute",
		bottom: 10,
		right: 10,
		backgroundColor: "rgba(0,0,0,0.5)",
		padding: 6,
		borderRadius: 8,
	},
	// Styles cho phần Phóng to
	zoomContainer: {
		flex: 1,
		backgroundColor: "rgba(15, 23, 42, 0.95)", // Nền mờ tối
		justifyContent: "center",
		alignItems: "center",
	},
	zoomBackdrop: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	fullImage: {
		width: "90%",
		height: "80%",
	},
	zoomCloseBtn: {
		position: "absolute",
		top: Platform.OS === "ios" ? 60 : 30,
		right: 24,
		zIndex: 10,
		padding: 8,
	},
});

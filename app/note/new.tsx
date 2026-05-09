import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	Alert,
	ActivityIndicator,
	Image,
	Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/theme";

import { noteApi } from "../../src/api/noteApi";
import { folderApi } from "../../src/api/folderApi";
import { Folder } from "../../src/types/api.types";
import { FolderSelectModal } from "../../src/components/common/FolderSelectModal";
import { Icon, getIconName } from "../../src/components/common/Icon";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewNoteScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{
		folderId?: string;
		folderName?: string;
		imageUri?: string;
	}>();

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
	const [selectedFolder, setSelectedFolder] = useState({
		id: params.folderId || "",
		name: params.folderName || "Uncategorized",
		icon: "folder",
	});

	const [isImageZoomVisible, setIsImageZoomVisible] = useState(false);
	const handleSave = async () => {
		if (!title.trim()) {
			Alert.alert("Error", "Please enter a note title.");
			return;
		}
		try {
			setIsSaving(true);

			// Đẩy folderId vào payload nếu người dùng có chọn Folder
			const payload: any = { title, content };
			if (selectedFolder.id) {
				payload.folderId = selectedFolder.id;
			}
			if (params.imageUri) {
				payload.imageUri = params.imageUri;
			}

			await noteApi.createNote(payload);
			router.back();
		} catch (error: any) {
			Alert.alert("Save Error", error.message || "Unable to create note.");
		} finally {
			setIsSaving(false);
		}
	};
	const handleSelectFolder = (folder: any) => {
		if (folder) {
			setSelectedFolder({
				id: folder.id,
				name: folder.name,
				icon: folder.icon || "folder",
			});
		} else {
			setSelectedFolder({ id: "", name: "Uncategorized", icon: "folder" });
		}
		setIsFolderModalVisible(false);
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.headerBtn}
					testID="cancel-btn"
				>
					<Text style={styles.cancelText}>Cancel</Text>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>New Note</Text>
				<TouchableOpacity
					onPress={handleSave}
					style={styles.headerBtn}
					disabled={isSaving}
					testID="save-btn"
				>
					{isSaving ? (
						<ActivityIndicator size="small" color={COLORS.primary} />
					) : (
						<Text style={styles.saveText}>Save</Text>
					)}
				</TouchableOpacity>
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.container}
			>
				<View style={styles.contentPad}>
					{params.imageUri && (
						<View style={{ marginBottom: 16 }}>
							<Text style={styles.sectionTitle}>Original Image</Text>
							<TouchableOpacity
								style={styles.imageBox}
								onPress={() => setIsImageZoomVisible(true)}
								activeOpacity={0.9}
								testID="new-image-thumbnail"
							>
								<Image
									source={{ uri: params.imageUri }}
									style={styles.actualImage}
									resizeMode="cover"
								/>
								<View style={styles.zoomOverlayIcon}>
									<Feather name="maximize-2" size={18} color="white" />
								</View>
							</TouchableOpacity>
						</View>
					)}

					{/* Title Input Box */}
					<View style={styles.titleBox}>
						<TextInput
							style={styles.titleInput}
							value={title}
							onChangeText={setTitle}
							placeholder="Note Title"
							placeholderTextColor={COLORS.slate300}
							testID="title-input"
						/>
					</View>

					{/* Folder Select Badge */}
					<TouchableOpacity
						style={styles.folderBadge}
						onPress={() => setIsFolderModalVisible(true)}
					>
						<Icon
							name={getIconName(selectedFolder.icon) || "folder"}
							size={16}
							color={COLORS.slate800}
							style={{ marginRight: 6 }}
						/>
						<Text style={styles.folderBadgeText}>{selectedFolder.name}</Text>
					</TouchableOpacity>

					{/* Body Text Area */}
					<TextInput
						style={styles.bodyInput}
						value={content}
						onChangeText={setContent}
						placeholder="Start typing your note manually here or tap the camera to add text..."
						placeholderTextColor={COLORS.slate300}
						multiline
						textAlignVertical="top"
						testID="content-input"
					/>
				</View>

				{/* Bottom Toolbar */}
				<View style={styles.bottomToolbar}>
					<TouchableOpacity style={styles.toolBtn}>
						<Text style={styles.textToolIcon}>aA</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.toolBtn}>
						<Feather name="camera" size={20} color={COLORS.slate800} />
					</TouchableOpacity>
					<TouchableOpacity style={styles.toolBtn}>
						<Feather name="mic" size={20} color={COLORS.slate800} />
					</TouchableOpacity>
					<TouchableOpacity style={styles.toolBtn}>
						<Feather name="list" size={20} color={COLORS.slate800} />
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
			<FolderSelectModal
				visible={isFolderModalVisible}
				onClose={() => setIsFolderModalVisible(false)}
				selectedId={selectedFolder.id}
				onSelect={handleSelectFolder}
			/>
			{params.imageUri && (
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
							testID="zoom-close-btn"
						>
							<Feather name="x" size={28} color="white" />
						</TouchableOpacity>
						<TouchableOpacity
							activeOpacity={1}
							style={styles.zoomBackdrop}
							onPress={() => setIsImageZoomVisible(false)}
						>
							<Image
								source={{ uri: params.imageUri }}
								style={styles.fullImage}
								resizeMode="contain"
							/>
						</TouchableOpacity>
					</View>
				</Modal>
			)}
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
		backgroundColor: COLORS.white,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate100,
	},
	headerBtn: { paddingVertical: 8 },
	cancelText: { fontSize: 15, fontWeight: "700", color: COLORS.slate500 },
	saveText: { fontSize: 15, fontWeight: "700", color: COLORS.primary },
	headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.slate900 },

	container: { flex: 1 },
	contentPad: { flex: 1, padding: 24 },

	titleBox: {
		backgroundColor: COLORS.white,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		borderRadius: 16,
		paddingHorizontal: 20,
		paddingVertical: 16,
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 1,
		marginBottom: 16,
	},
	titleInput: { fontSize: 20, fontWeight: "700", color: COLORS.slate900 },

	folderBadge: {
		alignSelf: "flex-start",
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.white,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 12,
		marginBottom: 24,
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 1,
	},
	folderBadgeIcon: { fontSize: 14, marginRight: 6 },
	folderBadgeText: { fontSize: 14, fontWeight: "700", color: COLORS.slate800 },

	bodyInput: {
		flex: 1,
		fontSize: 15,
		lineHeight: 24,
		color: COLORS.slate700,
		fontWeight: "500",
	},

	bottomToolbar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 32,
		height: 60,
		backgroundColor: "#F8FAFC",
		borderTopWidth: 1,
		borderTopColor: COLORS.slate200,
	},
	toolBtn: { padding: 8 },
	textToolIcon: {
		fontSize: 18,
		fontWeight: "500",
		color: COLORS.primary,
		letterSpacing: -0.5,
	},
	// Bổ sung cho Khung phóng to Image
	sectionTitle: {
		fontSize: 14,
		fontWeight: "700",
		color: COLORS.slate900,
		marginBottom: 8,
	},
	imageBox: {
		height: 140,
		backgroundColor: COLORS.slate50,
		borderRadius: 16,
		overflow: "hidden",
		borderWidth: 1,
		borderColor: COLORS.slate200,
	},
	actualImage: { width: "100%", height: "100%" },
	zoomOverlayIcon: {
		position: "absolute",
		bottom: 10,
		right: 10,
		backgroundColor: "rgba(0,0,0,0.5)",
		padding: 6,
		borderRadius: 8,
	},
	zoomContainer: {
		flex: 1,
		backgroundColor: "rgba(15, 23, 42, 0.95)",
		justifyContent: "center",
		alignItems: "center",
	},
	zoomBackdrop: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	fullImage: { width: "90%", height: "80%" },
	zoomCloseBtn: {
		position: "absolute",
		top: Platform.OS === "ios" ? 60 : 30,
		right: 24,
		zIndex: 10,
		padding: 8,
	},
});

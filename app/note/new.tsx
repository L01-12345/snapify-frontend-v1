import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	Alert,
	ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/theme";

import { noteApi } from "../../src/api/noteApi";
import { folderApi } from "../../src/api/folderApi";
import { Folder } from "../../src/types/api.types";

export default function NewNoteScreen() {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		if (!title.trim()) {
			Alert.alert("Error", "Please enter a note title.");
			return;
		}
		try {
			setIsSaving(true);
			await noteApi.createNote({
				title,
				content,
				folderId: null, // Mặc định chưa gán thư mục (Unassigned)
			});
			// Tạo xong thì quay về trang trước đó
			router.back();
		} catch (error: any) {
			Alert.alert("Save Error", error.message || "Unable to create note.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.headerBtn}
				>
					<Text style={styles.cancelText}>Cancel</Text>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>New Note</Text>
				<TouchableOpacity
					onPress={handleSave}
					style={styles.headerBtn}
					disabled={isSaving}
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
					{/* Title Input Box */}
					<View style={styles.titleBox}>
						<TextInput
							style={styles.titleInput}
							value={title}
							onChangeText={setTitle}
							placeholder="Note Title"
							placeholderTextColor={COLORS.slate300}
						/>
					</View>

					{/* Folder Select Badge */}
					<TouchableOpacity style={styles.folderBadge}>
						<Text style={styles.folderBadgeIcon}>📚</Text>
						<Text style={styles.folderBadgeText}>Study</Text>
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
});

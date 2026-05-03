// app/note/[id].tsx
import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	Image,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../src/constants/theme";
import { SettingsModal } from "../../src/components/common/SettingsModal";
import { NoteActionSheet } from "../../src/components/common/NoteActionSheet";

import { noteApi } from "../../src/api/noteApi";
import { Note } from "../../src/types/api.types";
import { folderApi } from "../../src/api/folderApi";

import { Icon } from "../../src/components/common/Icon";
import { formatDate } from "../../src/utils/formatters";
export default function NoteDetailScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const [note, setNote] = useState<Note | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);
	const [folderName, setFolderName] = useState<string>("UNCATEGORIZED");

	const firstImage =
		note?.images && note.images.length > 0 ? note.images[0].imageUrl : null;
	// if (isLoading) return <ActivityIndicator style={{ flex: 1 }} />;
	const fetchNote = async () => {
		try {
			const response = await noteApi.getNoteById(id);
			const noteData = response.data || null;
			setNote(noteData);
			if (noteData && noteData.folderId) {
				try {
					const foldersRes = await folderApi.getFolders();
					const folders = foldersRes.data || [];
					const matchedFolder = folders.find((f) => f.id === noteData.folderId);
					if (matchedFolder) {
						setFolderName(
							`${matchedFolder.icon || "📂"} ${matchedFolder.name}`.toUpperCase(),
						);
					}
				} catch (err) {
					console.warn("Lỗi không lấy được tên folder:", err);
				}
			}
		} catch (error) {
			// Nếu Note đã bị xóa, API trả lỗi 404 -> Alert và Back về list
			Alert.alert("Notice", "Note not found or has been deleted.");
			router.back();
		} finally {
			setIsLoading(false);
		}
	};
	useFocusEffect(
		useCallback(() => {
			if (id) {
				fetchNote();
			} else {
				console.warn("Không tìm thấy ID trong params");
				setIsLoading(false);
			}
		}, [id]),
	);

	const handleDelete = () => {
		Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					await noteApi.deleteNote(id);
					router.replace("/all-notes");
				},
			},
		]);
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.iconBtn}
					testID="back-btn"
				>
					<Feather name="arrow-left" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
				<Text style={styles.dateText}>{formatDate(note?.createdAt)}</Text>
				<TouchableOpacity
					onPress={() => setModalVisible(true)}
					style={styles.iconBtn}
				>
					<Feather name="more-vertical" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
			</View>

			{isLoading ? (
				<View
					style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
				>
					<ActivityIndicator size="large" color={COLORS.primary} />
					<Text style={{ marginTop: 12, color: COLORS.slate400 }}>
						Loading notes...
					</Text>
				</View>
			) : (
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					{/* Original Image Box */}
					{firstImage && (
						<View style={styles.imageBox}>
							<Image
								source={{ uri: firstImage }}
								style={styles.actualImage}
								resizeMode="cover"
							/>
							<TouchableOpacity style={styles.expandImgBtn}>
								<Feather name="maximize-2" size={16} color={COLORS.slate700} />
							</TouchableOpacity>
						</View>
					)}

					{/* Badges */}
					<View style={styles.badgeRow}>
						<View style={styles.folderBadge}>
							<Text style={styles.folderBadgeText} numberOfLines={1}>
								{folderName}
							</Text>
						</View>
						<View style={styles.statusBadge}>
							<Text style={styles.statusBadgeText}>{note?.status}</Text>
						</View>
					</View>

					{/* Title */}
					<Text style={styles.title}>{note?.title}</Text>

					<View style={styles.divider} />

					{/* Note Content (Rich Text Simulation) */}
					<View style={styles.bodyContent}>
						<Text style={styles.paragraph}>{note?.content}</Text>
					</View>
				</ScrollView>
			)}

			{/* Floating Edit Button */}
			{!isLoading && (
				<View style={styles.fabContainer}>
					<TouchableOpacity
						onPress={() =>
							router.push({ pathname: "/note/edit", params: { id: id } })
						}
						testID="edit-fab"
					>
						<LinearGradient
							colors={[COLORS.primary, COLORS.primaryEnd]}
							style={styles.fabGradient}
						>
							<Icon
								name="edit-2"
								size={16}
								style={styles.fabIcon}
								color={COLORS.white}
							/>
							<Text style={styles.fabText}>Edit Note</Text>
						</LinearGradient>
					</TouchableOpacity>
				</View>
			)}

			{/* Tích hợp Modal */}
			{/* <SettingsModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
			/> */}
			<NoteActionSheet
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				noteId={id}
				noteTitle={note?.title}
				isArchived={note?.status === "ARCHIVED"}
				onSuccess={() => fetchNote()}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.white },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		height: 60,
		paddingHorizontal: 24,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate100,
	},
	iconBtn: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: COLORS.slate50,
		borderRadius: 20,
	},
	dateText: {
		fontSize: 12,
		fontWeight: "800",
		color: COLORS.slate400,
		letterSpacing: 1,
	},
	scrollContent: { padding: 24, paddingBottom: 100 }, // Padding bottom để không bị che bởi FAB
	imageBox: {
		height: 200,
		backgroundColor: COLORS.slate100,
		borderRadius: 24,
		overflow: "hidden",
		position: "relative",
	},
	cameraIcon: { fontSize: 32, marginBottom: 8 },
	viewImageText: { fontSize: 12, fontWeight: "700", color: COLORS.slate400 },
	badgeRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
	folderBadge: {
		backgroundColor: "#EEF2FF",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
	},
	folderBadgeText: {
		fontSize: 10,
		fontWeight: "800",
		color: COLORS.primary,
		letterSpacing: 0.5,
	},
	statusBadge: {
		backgroundColor: "#ECFDF5",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
	},
	statusBadgeText: {
		fontSize: 10,
		fontWeight: "800",
		color: "#10B981",
		letterSpacing: 0.5,
	},
	title: {
		fontSize: 28,
		fontWeight: "800",
		color: COLORS.slate900,
		lineHeight: 36,
		marginBottom: 24,
	},
	divider: { height: 1, backgroundColor: COLORS.slate100, marginBottom: 24 },
	bodyContent: { gap: 16 },
	paragraph: {
		fontSize: 14,
		fontWeight: "500",
		color: COLORS.slate700,
		lineHeight: 24,
	},
	bulletList: { paddingLeft: 8, gap: 8 },
	bulletItem: {
		fontSize: 14,
		fontWeight: "500",
		color: COLORS.slate600,
		lineHeight: 22,
	},
	boldText: { fontWeight: "800", color: COLORS.slate800 },
	codeBlock: {
		backgroundColor: COLORS.slate50,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		padding: 16,
		borderRadius: 16,
	},
	codeText: {
		fontFamily: "monospace",
		fontSize: 12,
		color: COLORS.primaryEnd,
		fontWeight: "600",
	},
	fabContainer: {
		position: "absolute",
		bottom: 32,
		left: 0,
		right: 0,
		alignItems: "center",
	},
	fabGradient: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingVertical: 14,
		borderRadius: 30,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 8,
		gap: 8,
	},
	fabIcon: { fontSize: 16, color: COLORS.white },
	fabText: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
	actualImage: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
	},
	expandImgBtn: {
		position: "absolute",
		top: 12,
		right: 12,
		width: 32,
		height: 32,
		backgroundColor: "rgba(255,255,255,0.8)",
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
});

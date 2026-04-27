import React, { useState, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	ScrollView,
	Alert,
	ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../src/constants/theme";

import { folderApi } from "../../src/api/folderApi";
import { FolderDetail } from "../../src/types/api.types";

export default function FolderDetailScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const [folder, setFolder] = useState<FolderDetail | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useFocusEffect(
		useCallback(() => {
			if (id) fetchFolderDetail();
		}, [id]),
	);

	const fetchFolderDetail = async () => {
		try {
			const response = await folderApi.getFolderById(id);
			setFolder(response.data || null);
		} catch (error) {
			Alert.alert("Error", "Unable to load folder data.");
			router.back();
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteFolder = () => {
		Alert.alert(
			"Delete Folder",
			"Are you sure you want to delete this folder? Notes inside will not be deleted, only removed from this folder.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await folderApi.deleteFolder(id);
							router.back();
						} catch (error: any) {
							Alert.alert("Error", error.message);
						}
					},
				},
			],
		);
	};

	if (isLoading || !folder) {
		return (
			<SafeAreaView
				style={[
					styles.safeArea,
					{ justifyContent: "center", alignItems: "center" },
				]}
			>
				<ActivityIndicator size="large" color={COLORS.primary} />
			</SafeAreaView>
		);
	}

	const isEmpty = !folder.notes || folder.notes.length === 0;

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.iconBtn}
					testID="back-btn"
				>
					<Feather name="arrow-left" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
				<View style={styles.headerCenter}>
					<Text style={styles.headerIcon}>📚</Text>
					<Text style={styles.headerTitle}>{folder.name}</Text>
				</View>
				<TouchableOpacity
					onPress={handleDeleteFolder}
					style={styles.iconBtn}
					testID="delete-folder-btn"
				>
					<Feather name="trash-2" size={20} color={COLORS.slate400} />
				</TouchableOpacity>
			</View>

			{isEmpty ? (
				// GIAO DIỆN EMPTY (Mang từ empty.tsx qua)
				<View style={styles.emptyContent}>
					<View style={styles.circleBg}>
						<Text style={styles.emoji}>🗂️</Text>
					</View>
					<Text style={styles.emptyTitle}>This folder is empty</Text>
					<Text style={styles.emptySubtitle}>
						Organize your study materials by adding notes to this folder, or let
						AI auto-categorize them for you.
					</Text>
					<TouchableOpacity
						style={styles.addBtn}
						onPress={() => router.push("/note/new")}
						testID="add-note-empty-btn"
					>
						<Text style={styles.addBtnText}>+ Add Notes</Text>
					</TouchableOpacity>
				</View>
			) : (
				// GIAO DIỆN CÓ DATA
				<ScrollView contentContainerStyle={styles.listContainer}>
					<Text style={styles.listSubtitle}>
						{folder.notes.length} Notes in this folder
					</Text>

					{folder.notes.map((note) => (
						<TouchableOpacity
							key={note.id}
							style={styles.noteCard}
							onPress={() => router.push(`/note/${note.id}`)}
							testID={`note-card-${note.id}`}
						>
							<View style={styles.noteHeader}>
								<Text style={styles.noteTitle}>{note.title}</Text>
								<View style={styles.badge}>
									<Text style={styles.badgeText}>{note.status}</Text>
								</View>
							</View>
							<Text style={styles.notePreview} numberOfLines={2}>
								{note.content}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			)}
			{/* Floating Action Button */}
			{!isEmpty && (
				<TouchableOpacity
					style={styles.fab}
					onPress={() => router.push("/note/new")}
					testID="add-note-fab"
				>
					<LinearGradient
						colors={[COLORS.primary, COLORS.primaryEnd]}
						style={styles.fabGradient}
					>
						<Feather name="plus" size={32} color={COLORS.white} />
					</LinearGradient>
				</TouchableOpacity>
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
		paddingHorizontal: 24,
		height: 60,
		backgroundColor: COLORS.white,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate100,
	},
	iconBtn: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 20,
	},
	headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
	headerIcon: { fontSize: 20 },
	headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.slate900 },
	listContainer: { padding: 24, gap: 16 },
	listSubtitle: {
		fontSize: 12,
		fontWeight: "500",
		color: COLORS.slate500,
		marginBottom: 8,
	},
	noteCard: {
		backgroundColor: COLORS.white,
		borderRadius: 24,
		padding: 20,
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 1,
		borderWidth: 1,
		borderColor: COLORS.slate100,
	},
	noteHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	noteTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: COLORS.slate900,
		flex: 1,
	},
	badge: {
		backgroundColor: "#D1FAE5",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
		marginLeft: 8,
	},
	badgeText: { fontSize: 10, fontWeight: "800", color: "#065F46" },
	notePreview: {
		fontSize: 13,
		color: COLORS.slate500,
		lineHeight: 20,
		marginBottom: 16,
	},
	noteFooter: {
		borderTopWidth: 1,
		borderTopColor: COLORS.slate50,
		paddingTop: 12,
	},
	noteDate: { fontSize: 12, fontWeight: "500", color: COLORS.slate400 },
	fab: {
		position: "absolute",
		bottom: 40,
		right: 24,
		shadowColor: COLORS.primaryEnd,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.4,
		shadowRadius: 12,
		elevation: 8,
	},
	fabGradient: {
		width: 64,
		height: 64,
		borderRadius: 32,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyContent: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 32,
	},
	circleBg: {
		width: 140,
		height: 140,
		borderRadius: 70,
		backgroundColor: COLORS.slate50,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 24,
	},
	emoji: { fontSize: 60 },
	emptyTitle: {
		fontSize: 22,
		fontWeight: "800",
		color: COLORS.slate900,
		marginBottom: 12,
	},
	emptySubtitle: {
		fontSize: 14,
		fontWeight: "500",
		color: COLORS.slate500,
		textAlign: "center",
		lineHeight: 22,
		marginBottom: 32,
	},
	addBtn: {
		width: "100%",
		paddingVertical: 16,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: COLORS.slate200,
		alignItems: "center",
	},
	addBtnText: { fontSize: 15, fontWeight: "700", color: COLORS.slate800 },
});

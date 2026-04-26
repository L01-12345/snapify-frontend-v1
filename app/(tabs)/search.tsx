// app/(tabs)/search.tsx
import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TextInput,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../../src/constants/theme";

// Import API và Type
import { noteApi } from "../../src/api/noteApi";
import { Note } from "../../src/types/api.types";

// --- COMPONENT HIGHLIGHT TEXT ---
const HighlightedText = ({
	text,
	keyword,
}: {
	text: string;
	keyword: string;
}) => {
	if (!text) return null;
	if (!keyword.trim()) return <Text>{text}</Text>;

	const regex = new RegExp(`(${keyword})`, "gi");
	const parts = text.split(regex);

	return (
		<Text>
			{parts.map((part, index) =>
				part.toLowerCase() === keyword.toLowerCase() ? (
					<Text key={index} style={styles.highlight}>
						{part}
					</Text>
				) : (
					<Text key={index}>{part}</Text>
				),
			)}
		</Text>
	);
};

// Hàm hỗ trợ format ngày tháng đơn giản
const formatDate = (dateString?: string) => {
	if (!dateString) return "Just now";
	const d = new Date(dateString);
	return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

export default function SearchScreen() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [results, setResults] = useState<Note[]>([]);

	// Tích hợp API Fetching với Debounce
	useEffect(() => {
		if (query.trim().length === 0) {
			setResults([]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		// Đợi người dùng ngừng gõ 500ms rồi mới gọi API
		const timeout = setTimeout(async () => {
			try {
				const res = await noteApi.searchNotes(query.trim());
				// API trả về mảng trong res.data
				setResults(res.data || []);
			} catch (error) {
				console.error("Lỗi tìm kiếm ghi chú:", error);
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		}, 500);

		return () => clearTimeout(timeout);
	}, [query]);

	// --- RENDER FUNCTIONS ---
	const renderInitialState = () => (
		<View style={styles.contentPad}>
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Recent Searches</Text>
					<TouchableOpacity>
						<Text style={styles.clearText}>Clear All</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.tagWrap}>
					<TouchableOpacity
						style={styles.tag}
						onPress={() => setQuery("Calculus")}
					>
						<Text style={styles.tagText}>🕒 Calculus</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.tag}
						onPress={() => setQuery("Marketing")}
					>
						<Text style={styles.tagText}>🕒 Marketing Q3</Text>
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Suggested Folders</Text>
				<View style={styles.folderGrid}>
					<TouchableOpacity style={styles.folderCard}>
						<View style={[styles.folderIconBg, { backgroundColor: "#EEF2FF" }]}>
							<Text>📚</Text>
						</View>
						<Text style={styles.folderText}>Study</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.folderCard}>
						<View style={[styles.folderIconBg, { backgroundColor: "#ECFDF5" }]}>
							<Text>💼</Text>
						</View>
						<Text style={styles.folderText}>Work</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);

	const renderLoading = () => (
		<View style={styles.contentPad}>
			<View style={styles.skeletonLine} />
			{[1, 2, 3].map((i) => (
				<View key={i} style={styles.skeletonCard}>
					<View style={styles.skeletonTitle} />
					<View style={styles.skeletonText} />
					<View style={[styles.skeletonText, { width: "80%" }]} />
					<View style={styles.skeletonBadge} />
				</View>
			))}
		</View>
	);

	const renderEmptyState = () => (
		<View style={styles.emptyContainer}>
			<View style={styles.emptyBox}>
				<View style={styles.emptyIconBox}>
					<Text style={{ fontSize: 40 }}>🔍</Text>
					<View style={styles.emptyQuestionMark}>
						<Text style={{ fontSize: 12 }}>❓</Text>
					</View>
				</View>
				<Text style={styles.emptyTitle}>No results found</Text>
				<Text style={styles.emptySubtitle}>
					We couldn't find anything matching "
					<Text style={{ fontWeight: "bold", color: COLORS.slate700 }}>
						{query}
					</Text>
					".
				</Text>
				<TouchableOpacity style={styles.clearBtn} onPress={() => setQuery("")}>
					<Text style={styles.clearBtnText}>Clear Search</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	const renderResults = () => (
		<View style={styles.contentPad}>
			<Text style={styles.resultCountText}>{results.length} Results Found</Text>
			<View style={styles.resultList}>
				{results.map((note) => (
					<TouchableOpacity
						key={note.id}
						style={styles.resultCard}
						onPress={() => router.push(`/note/${note.id}`)}
					>
						<View style={styles.resultHeader}>
							<Text style={styles.resultTitle}>
								<HighlightedText
									text={note.title || "Untitled Note"}
									keyword={query}
								/>
							</Text>
							<Text style={styles.resultDate}>
								{formatDate(note.createdAt)}
							</Text>
						</View>
						<Text style={styles.resultText} numberOfLines={2}>
							<HighlightedText text={note.content || ""} keyword={query} />
						</Text>
						<View style={styles.resultFooter}>
							<View style={styles.resultBadge}>
								<Text style={styles.resultBadgeText}>
									{/* Nếu có folder thì lấy folder.name, không thì để Uncategorized */}
									📄 {note.folder?.name || "Uncategorized"}
								</Text>
							</View>
						</View>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.headerContainer}>
				<View style={styles.searchRow}>
					<Feather
						name="search"
						size={20}
						color={COLORS.primary}
						style={styles.searchIcon}
					/>
					<TextInput
						style={[
							styles.searchInput,
							query.length > 0 && styles.searchInputActive,
						]}
						placeholder="Search notes, text, folders..."
						value={query}
						onChangeText={setQuery}
						autoFocus
					/>
					{query.length > 0 && (
						<TouchableOpacity
							style={styles.clearIcon}
							onPress={() => setQuery("")}
						>
							<Feather name="x" size={16} color={COLORS.slate400} />
						</TouchableOpacity>
					)}
				</View>

				{/* Filter Pills (Hiện khi có kết quả) */}
				{!isLoading && results.length > 0 && (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.pillScroll}
					>
						<TouchableOpacity style={[styles.pill, styles.pillActive]}>
							<Text style={styles.pillTextActive}>All</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.pill}>
							<Text style={styles.pillText}>In Title</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.pill}>
							<Text style={styles.pillText}>In Text</Text>
						</TouchableOpacity>
					</ScrollView>
				)}
			</View>

			<ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
				{query.length === 0 && renderInitialState()}
				{query.length > 0 && isLoading && renderLoading()}
				{query.length > 0 &&
					!isLoading &&
					results.length > 0 &&
					renderResults()}
				{query.length > 0 &&
					!isLoading &&
					results.length === 0 &&
					renderEmptyState()}
				<View style={{ height: 100 }} />
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.slate50 },
	headerContainer: {
		backgroundColor: COLORS.white,
		paddingHorizontal: 24,
		paddingTop: 16,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate100,
	},
	searchRow: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#EEF2FF",
		borderRadius: 16,
		borderWidth: 2,
		borderColor: "#C7D2FE",
		paddingHorizontal: 16,
		height: 50,
	},
	searchInputActive: {
		backgroundColor: COLORS.white,
		borderColor: COLORS.primary,
	},
	searchIcon: { marginRight: 8 },
	searchInput: {
		flex: 1,
		fontSize: 16,
		fontWeight: "500",
		color: COLORS.slate900,
	},
	clearIcon: { padding: 4 },
	pillScroll: { marginTop: 16, flexDirection: "row" },
	pill: {
		paddingHorizontal: 16,
		paddingVertical: 6,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		marginRight: 8,
		backgroundColor: COLORS.white,
	},
	pillActive: {
		backgroundColor: COLORS.slate900,
		borderColor: COLORS.slate900,
	},
	pillText: { fontSize: 12, fontWeight: "700", color: COLORS.slate600 },
	pillTextActive: { fontSize: 12, fontWeight: "700", color: COLORS.white },

	contentPad: { padding: 24 },
	section: { marginBottom: 32 },
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
		marginBottom: 12,
	},
	sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.slate900 },
	clearText: { fontSize: 12, fontWeight: "700", color: COLORS.primary },
	tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	tag: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: COLORS.white,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		borderRadius: 12,
	},
	tagText: { fontSize: 14, fontWeight: "500", color: COLORS.slate600 },
	folderGrid: { flexDirection: "row", gap: 12 },
	folderCard: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.white,
		padding: 16,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		gap: 12,
	},
	folderIconBg: {
		width: 40,
		height: 40,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	folderText: { fontSize: 14, fontWeight: "700", color: COLORS.slate700 },

	// Kết quả
	resultCountText: {
		fontSize: 12,
		fontWeight: "800",
		color: COLORS.slate500,
		textTransform: "uppercase",
		letterSpacing: 1,
		marginBottom: 16,
	},
	resultList: { gap: 16 },
	resultCard: {
		backgroundColor: COLORS.white,
		padding: 20,
		borderRadius: 24,
		borderWidth: 1,
		borderColor: COLORS.slate200,
	},
	resultHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 8,
	},
	resultTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: COLORS.slate900,
		flex: 1,
		marginRight: 16,
	},
	resultDate: { fontSize: 12, fontWeight: "500", color: COLORS.slate400 },
	resultText: {
		fontSize: 12,
		fontWeight: "500",
		color: COLORS.slate500,
		lineHeight: 20,
	},
	resultFooter: { marginTop: 12 },
	resultBadge: {
		alignSelf: "flex-start",
		backgroundColor: "#EEF2FF",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 6,
	},
	resultBadgeText: {
		fontSize: 10,
		fontWeight: "800",
		color: COLORS.primary,
		textTransform: "uppercase",
	},
	highlight: {
		backgroundColor: "#E0E7FF",
		color: COLORS.primary,
		overflow: "hidden",
	},

	// Empty
	emptyContainer: {
		flex: 1,
		padding: 24,
		justifyContent: "center",
		marginTop: 40,
	},
	emptyBox: {
		backgroundColor: COLORS.white,
		borderWidth: 2,
		borderStyle: "dashed",
		borderColor: COLORS.slate200,
		borderRadius: 24,
		padding: 32,
		alignItems: "center",
		gap: 16,
	},
	emptyIconBox: {
		width: 80,
		height: 80,
		backgroundColor: COLORS.slate50,
		borderRadius: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyQuestionMark: {
		position: "absolute",
		bottom: -4,
		right: -4,
		width: 28,
		height: 28,
		backgroundColor: COLORS.slate300,
		borderRadius: 14,
		borderWidth: 2,
		borderColor: COLORS.white,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyTitle: { fontSize: 18, fontWeight: "700", color: COLORS.slate900 },
	emptySubtitle: {
		fontSize: 14,
		fontWeight: "500",
		color: COLORS.slate500,
		textAlign: "center",
	},
	clearBtn: {
		paddingHorizontal: 24,
		paddingVertical: 12,
		backgroundColor: COLORS.white,
		borderWidth: 2,
		borderColor: COLORS.slate200,
		borderRadius: 12,
		marginTop: 8,
	},
	clearBtnText: { fontSize: 14, fontWeight: "700", color: COLORS.slate700 },

	// Loading (Skeleton)
	skeletonLine: {
		width: 120,
		height: 16,
		backgroundColor: COLORS.slate200,
		borderRadius: 8,
		marginBottom: 16,
		opacity: 0.5,
	},
	skeletonCard: {
		backgroundColor: COLORS.white,
		padding: 20,
		borderRadius: 24,
		borderWidth: 1,
		borderColor: COLORS.slate100,
		marginBottom: 16,
	},
	skeletonTitle: {
		width: "60%",
		height: 20,
		backgroundColor: COLORS.slate200,
		borderRadius: 10,
		marginBottom: 12,
		opacity: 0.5,
	},
	skeletonText: {
		width: "100%",
		height: 12,
		backgroundColor: COLORS.slate100,
		borderRadius: 6,
		marginBottom: 8,
		opacity: 0.5,
	},
	skeletonBadge: {
		width: 80,
		height: 16,
		backgroundColor: COLORS.slate200,
		borderRadius: 8,
		marginTop: 8,
		opacity: 0.5,
	},
});

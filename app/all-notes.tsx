import React, { useState, useCallback, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	ScrollView,
	ActivityIndicator,
	Alert,
	Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../src/constants/theme";
import { noteApi } from "../src/api/noteApi";
import { Note, NoteStatus } from "../src/types/api.types";

import { NoteActionSheet } from "../src/components/common/NoteActionSheet";

import { batchApi } from "../src/api/batchApi";

import { stripMarkdown } from "../src/utils/strip-markdown";
import {
	ResponsiveFontSize,
	ResponsiveSpacing,
	ResponsiveDimensions,
	ResponsiveBorderRadius,
	scale,
	getResponsiveShadow,
} from "../src/utils/responsive";

export default function AllNotesScreen() {
	const router = useRouter();
	const [activeStatus, setActiveStatus] = useState("All");
	// const [notes, setNotes] = useState<Note[]>([]);
	const [items, setItems] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const [selectedNoteForAction, setSelectedNoteForAction] = useState<
		any | null
	>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
	const [dateRange, setDateRange] = useState<
		"all" | "today" | "week" | "month"
	>("all");
	const [rawItems, setRawItems] = useState<any[]>([]);
	const [activeFilterModal, setActiveFilterModal] = useState<
		"sort" | "date" | null
	>(null);

	// Lấy dữ liệu mỗi khi màn hình này được focus
	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (searchQuery.trim().length > 0) {
				searchItems(searchQuery); // Nếu có nhập, gọi Search
			} else {
				fetchItems(activeStatus); // Nếu xóa trắng, load lại list hiện tại theo filter
			}
		}, 500); // 500ms debounce

		return () => clearTimeout(delayDebounceFn);
	}, [searchQuery, activeStatus]);

	useFocusEffect(
		useCallback(() => {
			if (searchQuery.trim().length === 0) {
				fetchItems(activeStatus);
			}
		}, [activeStatus]),
	);
	// Xử lý filter
	useEffect(() => {
		let result = [...rawItems];

		// Xử lý lọc theo khoảng thời gian (Date Filter)
		if (dateRange !== "all") {
			const now = new Date();
			let startDate = new Date();

			if (dateRange === "today") {
				startDate.setHours(0, 0, 0, 0); // Đầu ngày hôm nay
			} else if (dateRange === "week") {
				startDate.setDate(now.getDate() - 7); // 7 ngày trước
			} else if (dateRange === "month") {
				startDate.setDate(now.getDate() - 30); // 30 ngày trước
			}

			result = result.filter((item) => {
				const itemDate = new Date(item.createdAt || 0);
				return itemDate >= startDate;
			});
		}

		// Xử lý sắp xếp (Sort)
		result.sort((a, b) => {
			const timeA = new Date(a.createdAt || 0).getTime();
			const timeB = new Date(b.createdAt || 0).getTime();
			return sortBy === "newest" ? timeB - timeA : timeA - timeB;
		});

		// Render ra giao diện
		setItems(result);
	}, [rawItems, sortBy, dateRange]);

	// const fetchNotes = async (statusFilter: string) => {
	// 	try {
	// 		setIsLoading(true);
	// 		// Map trạng thái UI sang trạng thái API (PENDING, ACTIONED)
	// 		let statusParam: NoteStatus | undefined = undefined;
	// 		if (statusFilter === "Processed") statusParam = "ACTIONED";
	// 		if (statusFilter === "Pending") statusParam = "PENDING";

	// 		const response = await noteApi.getNotes({ status: statusParam });

	// 		setNotes(response.data?.notes || []);
	// 	} catch (error) {
	// 		console.log("Lỗi fetch notes:", error);
	// 	} finally {
	// 		setIsLoading(false);
	// 	}
	// };
	const fetchItems = async (statusFilter: string) => {
		try {
			setIsLoading(true);
			let statusParam: NoteStatus | undefined = undefined;
			if (statusFilter === "Processed") statusParam = "ACTIONED";
			if (statusFilter === "Pending") statusParam = "PENDING";

			const [notesRes, batchesRes] = await Promise.all([
				noteApi.getNotes({ status: statusParam }),
				batchApi.getBatches(),
			]);
			const notes = notesRes.data?.notes || [];
			let combined = [
				...notes.map((n: any) => ({
					...n,
					itemType: "note",
				})),
				...(batchesRes.data || []).map((b: any) => ({
					...b,
					itemType: "batch",
				})),
			];

			if (statusFilter === "Pending") {
				combined = combined.filter((item) => item.itemType === "note");
			}
			setRawItems(combined); // <-- ĐỔI THÀNH setRawItems
		} catch (error) {
			console.log("Lỗi fetch items:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Hàm gọi API search notes
	const searchItems = async (keyword: string) => {
		try {
			setIsLoading(true);
			const response = await noteApi.searchNotes(keyword);
			const formattedResults = (response.data || []).map((n: any) => ({
				...n,
				itemType: "note",
			}));
			setRawItems(formattedResults);
		} catch (error) {
			console.log("Lỗi search items:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const renderHighlightedText = (
		text: string | undefined,
		highlight: string,
	) => {
		if (!text) return null;
		if (!highlight.trim()) return <Text>{text}</Text>;

		// Tách chuỗi theo từ khóa, không phân biệt hoa thường
		const regex = new RegExp(`(${highlight})`, "gi");
		const parts = text.split(regex);

		return (
			<Text>
				{parts.map((part, index) =>
					part.toLowerCase() === highlight.toLowerCase() ? (
						<Text
							key={index}
							style={{
								backgroundColor: "#FEF08A",
								color: "#854D0E",
								fontWeight: "bold",
							}}
						>
							{part}
						</Text>
					) : (
						<Text key={index}>{part}</Text>
					),
				)}
			</Text>
		);
	};
	// Các hàm mở Dropdown filter
	const handleSortPress = () => {
		setActiveFilterModal("sort");
	};

	const handleDatePress = () => {
		setActiveFilterModal("date");
	};

	const closeFilterModal = () => {
		setActiveFilterModal(null);
	};

	const selectFilterOption = (option: string) => {
		if (activeFilterModal === "sort") {
			setSortBy(option as "newest" | "oldest");
		} else if (activeFilterModal === "date") {
			setDateRange(option as "all" | "today" | "week" | "month");
		}
		closeFilterModal();
	};

	// const mockNotes = [
	// 	{
	// 		id: "1",
	// 		title: "Calculus Lecture 04",
	// 		preview:
	// 			"Formulas for derivatives and integration by parts. Review before midterm...",
	// 		date: "Oct 20, 2025",
	// 		size: "2.4 MB",
	// 	},
	// 	{
	// 		id: "2",
	// 		title: "Physics Chapter 2",
	// 		preview:
	// 			"Newton’s laws of motion. Key equations for kinematics in two dimensions...",
	// 		date: "Oct 18, 2025",
	// 		size: "1.8 MB",
	// 	},
	// ];
	// const confirmDelete = (noteId: string, noteTitle: string) => {
	// 	Alert.alert(
	// 		"Delete Note",
	// 		`Are you sure you want to delete "${noteTitle}"?`,
	// 		[
	// 			{ text: "Cancel", style: "cancel" },
	// 			{
	// 				text: "Delete",
	// 				style: "destructive", // style này làm nút chuyển màu đỏ trên iOS
	// 				onPress: async () => {
	// 					try {
	// 						await noteApi.deleteNote(noteId);
	// 						// Xóa xong thì lọc bỏ note đó khỏi danh sách UI ngay lập tức
	// 						setNotes((prevNotes) => prevNotes.filter((n) => n.id !== noteId));
	// 					} catch (error) {
	// 						Alert.alert("Error", "Unable to delete this note.");
	// 					}
	// 				},
	// 			},
	// 		],
	// 	);
	// };
	// --- CÁC HÀM XỬ LÝ ACTION CHO NOTE ---
	// const handleDelete = async () => {
	// 	if (!selectedNoteForAction) return;
	// 	try {
	// 		await noteApi.deleteNote(selectedNoteForAction.id);
	// 		setNotes((prevNotes) =>
	// 			prevNotes.filter((n) => n.id !== selectedNoteForAction.id),
	// 		);
	// 		setSelectedNoteForAction(null); // Đóng modal
	// 	} catch (error) {
	// 		Alert.alert("Error", "Unable to delete this note.");
	// 	}
	// };

	// const handleArchive = async () => {
	// 	if (!selectedNoteForAction) return;
	// 	// Giả lập đưa vào Archive (Xóa khỏi UI hiện tại và hiện thông báo)
	// 	Alert.alert(
	// 		"Archived",
	// 		`"${selectedNoteForAction.title}" has been moved to Archive.`,
	// 	);
	// 	setNotes((prevNotes) =>
	// 		prevNotes.filter((n) => n.id !== selectedNoteForAction.id),
	// 	);
	// 	setSelectedNoteForAction(null); // Đóng modal
	// };

	const handleMove = () => {
		Alert.alert("Tính năng đang phát triển", "Mở Folder Modal ở đây.");
		setSelectedNoteForAction(null);
	};

	const handlePin = () => {
		Alert.alert("Pinned", `"${selectedNoteForAction?.title}" pinned to top.`);
		setSelectedNoteForAction(null);
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
				<Text style={styles.headerTitle}>All Notes</Text>
				<View style={styles.iconBtn} />
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Search Bar */}
				<View style={styles.searchContainer}>
					<Feather
						name="search"
						size={20}
						color={COLORS.slate400}
						style={styles.searchIcon}
					/>
					<TextInput
						style={styles.searchInput}
						placeholder="Search notes..."
						placeholderTextColor={COLORS.slate400}
						value={searchQuery}
						onChangeText={setSearchQuery}
					/>
				</View>

				{/* Dropdown Filters */}
				<View style={styles.dropdownRow}>
					<TouchableOpacity
						style={styles.dropdownBtn}
						onPress={handleSortPress}
					>
						<Feather name="clock" size={16} color={COLORS.slate500} />
						<Text style={styles.dropdownText}>
							{sortBy === "newest" ? "Newest First" : "Oldest First"}
						</Text>
						<Feather name="chevron-down" size={16} color={COLORS.slate400} />
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.dropdownBtn}
						onPress={handleDatePress}
					>
						<Feather name="calendar" size={16} color={COLORS.slate500} />
						<Text style={styles.dropdownText}>
							{dateRange === "all"
								? "Any Date"
								: dateRange === "today"
									? "Today"
									: dateRange === "week"
										? "Past 7 Days"
										: "Past 30 Days"}
						</Text>
						<Feather name="chevron-down" size={16} color={COLORS.slate400} />
					</TouchableOpacity>
				</View>

				{/* Status Filters */}
				<View style={styles.statusRow}>
					<Text style={styles.statusLabel}>STATUS:</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.statusScroll}
						contentContainerStyle={styles.statusScrollContent}
					>
						{["All", "Processed", "Pending"].map((status) => (
							<TouchableOpacity
								key={status}
								style={[
									styles.statusPill,
									activeStatus === status && styles.statusPillActive,
								]}
								onPress={() => setActiveStatus(status)}
							>
								<Text
									style={[
										styles.statusPillText,
										activeStatus === status && styles.statusPillTextActive,
									]}
								>
									{status}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>

				{/* Notes List */}
				<View style={styles.listContainer}>
					{isLoading ? (
						<ActivityIndicator size="large" color={COLORS.primary} />
					) : items.length === 0 ? (
						<Text
							style={{
								textAlign: "center",
								color: COLORS.slate500,
								marginTop: 20,
							}}
						>
							There are no documents here.
						</Text>
					) : (
						items.map((item) => {
							const isNote = item.itemType === "note";

							// Phân luồng điều hướng
							const handlePress = () => {
								if (isNote) {
									router.push(`/note/${item.id}`);
								} else {
									router.push({
										pathname: "/pdf-details",
										params: { pdfUrl: item.pdfUrl, title: item.title },
									});
								}
							};

							return (
								<TouchableOpacity
									key={item.id}
									style={styles.noteCard}
									onPress={handlePress}
									onLongPress={() => setSelectedNoteForAction(item)}
									testID={`card-${item.id}`}
								>
									<View style={styles.noteHeader}>
										<Text style={styles.noteTitle} numberOfLines={1}>
											{/* Highlight Title */}
											{renderHighlightedText(item.title, searchQuery)}
										</Text>
										<View
											style={[
												styles.badge,
												!isNote && { backgroundColor: "#FEE2E2" },
											]}
										>
											<Text
												style={[
													styles.badgeText,
													!isNote && { color: "#B91C1C" },
												]}
											>
												{isNote ? item.status : "PDF DOC"}
											</Text>
										</View>
									</View>

									<Text style={styles.notePreview} numberOfLines={2}>
										{isNote
											? renderHighlightedText(
													stripMarkdown(item.content),
													searchQuery,
												)
											: `Scanned PDF • Saved on ${new Date(item.createdAt).toLocaleDateString()}`}
									</Text>
								</TouchableOpacity>
							);
						})
					)}
				</View>
			</ScrollView>

			<Modal
				visible={!!activeFilterModal}
				transparent
				animationType="fade"
				onRequestClose={closeFilterModal}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>
							{activeFilterModal === "sort" ? "Sort By" : "Filter by Date"}
						</Text>
						{activeFilterModal === "sort" ? (
							<>
								<TouchableOpacity
									style={styles.modalOption}
									onPress={() => selectFilterOption("newest")}
								>
									<Text style={styles.modalOptionText}>Newest First</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.modalOption}
									onPress={() => selectFilterOption("oldest")}
								>
									<Text style={styles.modalOptionText}>Oldest First</Text>
								</TouchableOpacity>
							</>
						) : (
							<>
								<TouchableOpacity
									style={styles.modalOption}
									onPress={() => selectFilterOption("all")}
								>
									<Text style={styles.modalOptionText}>Any Date</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.modalOption}
									onPress={() => selectFilterOption("today")}
								>
									<Text style={styles.modalOptionText}>Today</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.modalOption}
									onPress={() => selectFilterOption("week")}
								>
									<Text style={styles.modalOptionText}>Past 7 Days</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.modalOption}
									onPress={() => selectFilterOption("month")}
								>
									<Text style={styles.modalOptionText}>Past 30 Days</Text>
								</TouchableOpacity>
							</>
						)}
						<TouchableOpacity
							style={[styles.modalOption, styles.modalCancelButton]}
							onPress={closeFilterModal}
						>
							<Text style={styles.modalOptionText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Floating Action Button (+) */}
			<TouchableOpacity
				style={styles.fab}
				onPress={() => router.push("/note/new")}
				testID="fab-btn"
			>
				<View style={styles.fabInner}>
					<Feather name="plus" size={32} color={COLORS.white} />
				</View>
			</TouchableOpacity>

			<NoteActionSheet
				visible={!!selectedNoteForAction}
				noteTitle={selectedNoteForAction?.title}
				noteId={selectedNoteForAction?.id || ""}
				onClose={() => setSelectedNoteForAction(null)}
				onSuccess={() => fetchItems(activeStatus)}
				onMove={handleMove}
				onPin={handlePin}
				itemType={selectedNoteForAction?.itemType}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.slate50 },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		height: scale(64),
		paddingHorizontal: ResponsiveSpacing.l,
	},
	iconBtn: {
		width: scale(40),
		height: scale(40),
		justifyContent: "center",
	},
	headerTitle: {
		fontSize: ResponsiveFontSize["xl"],
		fontWeight: "800",
		color: COLORS.slate900,
	},
	scrollContent: { padding: ResponsiveSpacing.l, paddingBottom: scale(100) },

	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.white,
		borderRadius: ResponsiveBorderRadius.xl,
		paddingHorizontal: ResponsiveSpacing.m,
		height: ResponsiveDimensions.inputHeight,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		marginBottom: ResponsiveSpacing.l,
	},
	searchIcon: { marginRight: ResponsiveSpacing.m },
	searchInput: {
		flex: 1,
		fontSize: ResponsiveFontSize["lg"],
		color: COLORS.slate900,
		fontWeight: "500",
	},

	dropdownRow: {
		flexDirection: "row",
		gap: ResponsiveSpacing.s,
		marginBottom: ResponsiveSpacing.l,
	},
	dropdownBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: COLORS.white,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		borderRadius: ResponsiveBorderRadius.base,
		paddingHorizontal: ResponsiveSpacing.m,
		paddingVertical: ResponsiveSpacing.s,
	},
	dropdownText: {
		fontSize: ResponsiveFontSize["base"],
		fontWeight: "700",
		color: COLORS.slate700,
		flex: 1,
		marginLeft: ResponsiveSpacing.s,
	},

	statusRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: ResponsiveSpacing.l,
	},
	statusScroll: {
		flex: 1,
	},
	statusScrollContent: {
		alignItems: "center",
	},
	statusLabel: {
		fontSize: ResponsiveFontSize["sm"],
		fontWeight: "800",
		color: COLORS.slate400,
		letterSpacing: 1,
		marginRight: ResponsiveSpacing.m,
	},
	statusPill: {
		paddingHorizontal: ResponsiveSpacing.l,
		paddingVertical: ResponsiveSpacing.s,
		borderRadius: ResponsiveBorderRadius.xl,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		backgroundColor: COLORS.white,
		marginRight: ResponsiveSpacing.s,
	},
	statusPillActive: {
		backgroundColor: COLORS.slate900,
		borderColor: COLORS.slate900,
	},
	statusPillText: {
		fontSize: ResponsiveFontSize["base"],
		fontWeight: "700",
		color: COLORS.slate600,
	},
	statusPillTextActive: { color: COLORS.white },

	listContainer: { gap: ResponsiveSpacing.l },
	noteCard: {
		backgroundColor: COLORS.white,
		borderRadius: ResponsiveBorderRadius.xl,
		padding: ResponsiveSpacing.l,
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: scale(4) },
		shadowOpacity: 0.3,
		shadowRadius: scale(8),
		elevation: 2,
		borderWidth: 1,
		borderColor: COLORS.slate100,
	},
	noteHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: ResponsiveSpacing.m,
	},
	noteTitle: {
		fontSize: ResponsiveFontSize["xl"],
		fontWeight: "800",
		color: COLORS.slate900,
		flex: 1,
		marginRight: ResponsiveSpacing.s,
	},
	badge: {
		backgroundColor: "#D1FAE5",
		paddingHorizontal: ResponsiveSpacing.s,
		paddingVertical: ResponsiveSpacing.xs,
		borderRadius: ResponsiveBorderRadius.base,
	},
	badgeText: {
		fontSize: ResponsiveFontSize.xs,
		fontWeight: "800",
		color: "#065F46",
	},
	notePreview: {
		fontSize: ResponsiveFontSize["base"],
		color: COLORS.slate500,
		lineHeight: 22,
		marginBottom: ResponsiveSpacing.l,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(15, 23, 42, 0.5)",
		justifyContent: "center",
		alignItems: "center",
		padding: ResponsiveSpacing.l,
	},
	modalContent: {
		width: "100%",
		backgroundColor: COLORS.white,
		borderRadius: ResponsiveBorderRadius.xl,
		padding: ResponsiveSpacing.l,
	},
	modalTitle: {
		fontSize: ResponsiveFontSize.lg,
		fontWeight: "800",
		color: COLORS.slate900,
		marginBottom: ResponsiveSpacing.m,
	},
	modalOption: {
		paddingVertical: ResponsiveSpacing.s,
		paddingHorizontal: ResponsiveSpacing.m,
		borderRadius: ResponsiveBorderRadius.base,
		backgroundColor: COLORS.slate50,
		marginBottom: ResponsiveSpacing.s,
	},
	modalOptionText: {
		fontSize: ResponsiveFontSize["base"],
		fontWeight: "700",
		color: COLORS.slate700,
	},
	modalCancelButton: {
		backgroundColor: COLORS.white,
	},

	noteFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: COLORS.slate50,
		paddingTop: ResponsiveSpacing.m,
	},
	noteMeta: {
		fontSize: ResponsiveFontSize["sm"],
		fontWeight: "600",
		color: COLORS.slate400,
	},
	noteMetaBold: {
		fontSize: ResponsiveFontSize["sm"],
		fontWeight: "800",
		color: COLORS.slate400,
	},

	fab: {
		position: "absolute",
		bottom: scale(100),
		right: ResponsiveSpacing.l,
		shadowColor: COLORS.primaryEnd,
		shadowOffset: { width: 0, height: scale(8) },
		shadowOpacity: 0.4,
		shadowRadius: scale(12),
		elevation: 8,
	},
	fabInner: {
		width: scale(64),
		height: scale(64),
		borderRadius: scale(32),
		backgroundColor: "#7C3AED",
		alignItems: "center",
		justifyContent: "center",
	},
});

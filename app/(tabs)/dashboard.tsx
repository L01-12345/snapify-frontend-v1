// app/(tabs)/dashboard.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TextInput,
	ScrollView,
	TouchableOpacity,
	Animated,
	Image,
	Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Icon } from "../../src/components/common/Icon";
import { COLORS } from "../../src/constants/theme";

import { noteApi } from "../../src/api/noteApi";
import { batchApi } from "../../src/api/batchApi";
import { dashboardApi, DashboardMetrics } from "../../src/api/dashboardApi";
import { Note } from "../../src/types/api.types";
import { useFocusEffect } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../src/store";
import { FolderSelectModal } from "../../src/components/common/FolderSelectModal";

export default function DashboardScreen() {
	const router = useRouter();
	const { showToast, batchId, batchTitle } = useLocalSearchParams();
	const slideAnim = useRef(new Animated.Value(150)).current;

	// const [notes, setNotes] = useState<Note[]>([]);
	const [recentItems, setRecentItems] = useState<any[]>([]);
	const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
	const [loading, setLoading] = useState(true);
	const { user } = useSelector((state: RootState) => state.auth);

	// Trạng thái cho Modal chuyển thư mục
	const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
	const [targetBatchId, setTargetBatchId] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			// Gọi song song 3 API để tối ưu tốc độ
			const [notesRes, metricsRes, batchesRes] = await Promise.all([
				noteApi.getNotes({ limit: 10 }),
				dashboardApi.getMetrics(),
				batchApi.getBatches(), // Lấy danh sách PDF
			]);

			// Format dữ liệu an toàn
			const fetchedNotes = Array.isArray(notesRes.data)
				? notesRes.data
				: notesRes.data?.notes || [];
			const fetchedBatches = Array.isArray(batchesRes.data)
				? batchesRes.data
				: [];

			// Trộn 2 mảng lại và thêm trường itemType để phân biệt khi render
			const combined = [
				...fetchedNotes.map((n: any) => ({ ...n, itemType: "note" })),
				...fetchedBatches.map((b: any) => ({ ...b, itemType: "batch" })),
			];

			// Sắp xếp mới nhất lên đầu dựa vào createdAt
			combined.sort(
				(a, b) =>
					new Date(b.createdAt || 0).getTime() -
					new Date(a.createdAt || 0).getTime(),
			);

			// Lấy 5 items gần nhất hiển thị ra Dashboard
			setRecentItems(combined.slice(0, 5));
			setMetrics(metricsRes.data || null);
		} catch (error) {
			console.error("Lỗi tải Dashboard:", error);
		} finally {
			setLoading(false);
		}
	};

	// Tự động load lại dữ liệu mỗi khi người dùng quay lại tab Dashboard
	useFocusEffect(
		useCallback(() => {
			fetchData();
		}, []),
	);

	useEffect(() => {
		if (showToast !== "true") {
			return;
		}

		const hasAnimatedTiming = typeof Animated?.timing === "function";
		const hasAnimatedSpring = typeof Animated?.spring === "function";
		if (!hasAnimatedTiming || !hasAnimatedSpring) {
			return;
		}

		Animated.spring(slideAnim, {
			toValue: 0,
			useNativeDriver: true,
			tension: 50,
			friction: 8,
		}).start();

		const timer = setTimeout(() => {
			Animated.timing(slideAnim, {
				toValue: 150,
				duration: 300,
				useNativeDriver: true,
			}).start();
		}, 6000);

		return () => clearTimeout(timer);
	}, [showToast]);

	// Xử lý khi user bấm nút "Change" trên Toast
	const handleChangeFolder = () => {
		if (batchId) {
			setTargetBatchId(batchId as string);
			setIsFolderModalVisible(true);
		}
	};

	// Xử lý khi user chọn một thư mục trong Modal
	const onFolderSelect = async (folder: any) => {
		if (!targetBatchId) return;
		try {
			// Gọi API cập nhật folderId cho Batch PDF
			await batchApi.updateBatch(targetBatchId, { folderId: folder.id });
			Alert.alert("Success", `Document moved to ${folder.name}`);
			setIsFolderModalVisible(false);
			fetchData(); // Load lại list ở dưới

			// Ẩn Toast luôn
			Animated.timing(slideAnim, {
				toValue: 150,
				duration: 300,
				useNativeDriver: true,
			}).start();
		} catch (error) {
			Alert.alert("Error", "Failed to move the document.");
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView
				contentContainerStyle={styles.container}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View style={styles.header}>
					<View>
						<Text style={styles.logoText}>Snapify</Text>
						<Text style={styles.greeting}>Hello, {user?.displayName} 👋</Text>
					</View>
					<View style={styles.avatar}>
						<TouchableOpacity style={styles.avatarBox}>
							{user?.avatarUrl ? (
								<Image
									source={{ uri: user.avatarUrl }}
									style={styles.avatarImage}
								/>
							) : (
								<Text style={styles.avatarText}>
									{user?.displayName?.substring(0, 2).toUpperCase() || "JD"}
								</Text>
							)}
						</TouchableOpacity>
					</View>
				</View>

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
						placeholder="Search notes, folders..."
						onPress={() => router.push("/search")}
						placeholderTextColor={COLORS.slate400}
						testID="search-input"
					/>
				</View>

				{/* Quick Actions */}
				<Text style={styles.sectionTitle}>Quick Actions</Text>
				<View style={styles.quickActionsRow}>
					<TouchableOpacity
						style={styles.actionCard}
						onPress={() => router.push("/camera-batch")}
						testID="action-batch"
					>
						<View style={styles.actionIconBg}>
							<Ionicons
								name="document-text-outline"
								size={24}
								color={COLORS.slate500}
							/>
						</View>
						<Text style={styles.actionText}>Batch</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.actionCard}
						onPress={() => router.push("/archive")}
						testID="action-archive"
					>
						<View style={styles.actionIconBg}>
							<Ionicons
								name="archive-outline"
								size={24}
								color={COLORS.slate500}
							/>
						</View>
						<Text style={styles.actionText}>Archive</Text>
					</TouchableOpacity>
				</View>

				{/* Recent Notes */}
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Recent Notes</Text>
					<TouchableOpacity
						onPress={() => router.push("/all-notes")}
						testID="view-all-notes"
					>
						<Text style={styles.viewAllText}>View All</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.notesList}>
					{recentItems?.map((item, index) => {
						const isNote = item.itemType === "note";

						// Route chuyển hướng: Nếu là note thì vào /note/[id], nếu là batch thì mở link pdf hoặc màn batch
						const handlePress = () => {
							if (isNote) router.push(`/note/${item.id}`);
							else {
								// Alert.alert("PDF Document", `Viewing: ${item.pdfUrl}`);
								router.push({
									pathname: "/pdf-details",
									params: {
										pdfUrl: item.pdfUrl,
										title: item.title,
									},
								});
							}
						};

						// Ghi chú đầu tiên (index === 0) dùng style Large
						if (index === 0) {
							return (
								<TouchableOpacity
									key={item.id}
									style={styles.noteCardLarge}
									onPress={handlePress}
									testID={`card-${item.id}`}
								>
									<View style={styles.noteHeaderLarge}>
										<Text style={styles.noteTitleLarge}>{item.title}</Text>
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
									<Text style={styles.noteSubtitle} numberOfLines={2}>
										{isNote
											? item.content
											: `Scanned PDF • ${new Date(item.createdAt).toLocaleDateString()}`}
									</Text>
								</TouchableOpacity>
							);
						}

						// Các ghi chú còn lại dùng style bình thường
						return (
							<TouchableOpacity
								key={item.id}
								style={styles.noteCard}
								onPress={handlePress}
								testID={`card-${item.id}`}
							>
								<View
									style={[
										styles.noteIconBox,
										!isNote && { backgroundColor: "#FEF2F2" },
									]}
								>
									{isNote ? (
										<Feather
											name="file-text"
											size={20}
											color={COLORS.primary}
										/>
									) : (
										<Ionicons
											name="document-attach"
											size={20}
											color="#DC2626"
										/>
									)}
								</View>
								<View style={styles.noteContent}>
									<Text style={styles.noteTitle}>{item.title}</Text>
									<Text style={styles.noteSubtitle} numberOfLines={1}>
										{isNote
											? item.content
											: `Saved on ${new Date(item.createdAt).toLocaleDateString()}`}
									</Text>
								</View>
							</TouchableOpacity>
						);
					})}
				</View>

				{/* Khoảng trống dưới cùng */}
				<View style={{ height: 100 }} />
			</ScrollView>

			{/* TOAST MODAL */}
			<Animated.View
				style={[
					styles.toastContainer,
					{ transform: [{ translateY: slideAnim }] },
				]}
			>
				<View style={styles.toastLeft}>
					<View style={styles.toastIconBox}>
						<Icon name="pdf" size={20} color={COLORS.primary} />
						<Icon
							name="sparkle"
							size={14}
							color={COLORS.primary}
							style={styles.toastSparkle}
						/>
					</View>
					<View>
						<Text style={styles.toastTitle}>PDF Created</Text>
						<Text style={styles.toastSubtitle} numberOfLines={1}>
							{batchTitle || "Scanned_Document.pdf"}
						</Text>
					</View>
				</View>
				<TouchableOpacity style={styles.toastBtn} onPress={handleChangeFolder}>
					<Text style={styles.toastBtnText}>Move</Text>
				</TouchableOpacity>
			</Animated.View>

			{/* MODAL CHỌN THƯ MỤC */}
			<FolderSelectModal
				visible={isFolderModalVisible}
				onClose={() => setIsFolderModalVisible(false)}
				onSelect={onFolderSelect}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.white },
	container: { paddingHorizontal: 24, paddingTop: 20 },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 24,
	},
	logoText: {
		fontSize: 28,
		fontWeight: "900",
		color: COLORS.slate900,
		marginBottom: 4,
	},
	greeting: { fontSize: 14, color: COLORS.slate500, fontWeight: "500" },
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#E0E7FF",
		alignItems: "center",
		justifyContent: "center",
	},
	avatarText: { color: COLORS.primary, fontWeight: "bold", fontSize: 16 },
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.slate50,
		borderRadius: 20,
		paddingHorizontal: 16,
		height: 56,
		marginBottom: 32,
	},
	searchIcon: { marginRight: 12 },
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: COLORS.slate900,
		fontWeight: "500",
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
		marginBottom: 16,
		marginTop: 12,
	},
	sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.slate900 },
	viewAllText: { fontSize: 14, fontWeight: "600", color: COLORS.primary },
	quickActionsRow: { flexDirection: "row", gap: 16, marginBottom: 32 },
	actionCard: {
		backgroundColor: COLORS.white,
		borderRadius: 24,
		padding: 16,
		alignItems: "center",
		width: 100,
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.5,
		shadowRadius: 10,
		elevation: 2,
		borderWidth: 1,
		borderColor: COLORS.slate50,
	},
	actionIconBg: {
		width: 48,
		height: 48,
		borderRadius: 16,
		backgroundColor: COLORS.slate50,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 12,
	},
	actionText: { fontSize: 13, fontWeight: "700", color: COLORS.slate700 },
	notesList: { gap: 12 },

	// Style Note 1
	noteCard1: {
		backgroundColor: COLORS.white,
		borderRadius: 20,
		padding: 16,
		borderWidth: 2,
		borderColor: "#E0E7FF",
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
	},
	noteIconBox1: {
		width: 48,
		height: 48,
		backgroundColor: "#EEF2FF",
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	noteContent1: { flex: 1 },
	noteTitle1: {
		fontSize: 15,
		fontWeight: "700",
		color: COLORS.slate800,
		marginBottom: 4,
	},
	noteSubtitle1: { fontSize: 12, color: COLORS.slate500, fontWeight: "500" },

	// Style Note 2
	noteCard2: {
		backgroundColor: COLORS.white,
		borderRadius: 24,
		padding: 20,
		borderWidth: 1,
		borderColor: COLORS.slate100,
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 2,
		marginTop: 4,
	},
	noteHeader2: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	noteTitle2: {
		fontSize: 17,
		fontWeight: "800",
		color: COLORS.slate900,
		flex: 1,
		marginRight: 12,
	},
	badge2: {
		backgroundColor: "#D1FAE5",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 6,
	},
	badgeText2: {
		fontSize: 10,
		fontWeight: "800",
		color: "#065F46",
		textTransform: "uppercase",
	},
	noteFooter2: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	noteSubtitle2: { fontSize: 12, color: COLORS.slate500, fontWeight: "500" },

	toastContainer: {
		position: "absolute",
		bottom: 100,
		left: 24,
		right: 24,
		backgroundColor: COLORS.slate900,
		borderRadius: 20,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		zIndex: 50,
	},
	toastLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
	toastIconBox: {
		width: 48,
		height: 48,
		backgroundColor: "rgba(99, 102, 241, 0.2)",
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	toastSparkle: { position: "absolute", top: -4, right: -4, fontSize: 14 },
	toastTitle: {
		color: COLORS.white,
		fontSize: 15,
		fontWeight: "700",
		marginBottom: 2,
	},
	toastSubtitle: {
		color: COLORS.slate400,
		fontSize: 12,
		fontWeight: "500",
		maxWidth: 120,
	},
	toastBtn: {
		backgroundColor: "rgba(255,255,255,0.1)",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 12,
	},
	toastBtnText: { color: COLORS.white, fontSize: 14, fontWeight: "700" },
	// Kiểu 1: Note đơn giản (có icon bên trái)
	noteCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.white,
		borderRadius: 20,
		padding: 16,
		borderWidth: 1,
		borderColor: COLORS.slate100,
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 2,
	},
	noteIconBox: {
		width: 48,
		height: 48,
		backgroundColor: "#EEF2FF", // Màu nền Indigo nhạt
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
	noteContent: {
		flex: 1,
	},
	noteTitle: {
		fontSize: 15,
		fontWeight: "700",
		color: COLORS.slate900,
		marginBottom: 4,
	},
	noteSubtitle: {
		fontSize: 12,
		color: COLORS.slate500,
		fontWeight: "500",
	},

	// Kiểu 2: Note chi tiết (Dạng Q3 Marketing Strategy)
	noteCardLarge: {
		backgroundColor: COLORS.white,
		borderRadius: 24,
		padding: 20,
		borderWidth: 1,
		borderColor: COLORS.slate100,
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 2,
	},
	noteHeaderLarge: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	noteTitleLarge: {
		fontSize: 17,
		fontWeight: "800",
		color: COLORS.slate900,
		flex: 1,
		marginRight: 12,
	},
	badge: {
		backgroundColor: "#D1FAE5", // Màu xanh lá nhạt cho PROCESSED
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 6,
	},
	badgeText: {
		fontSize: 10,
		fontWeight: "800",
		color: "#065F46",
		textTransform: "uppercase",
	},
	noteFooterLarge: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	avatarBox: {
		width: 70,
		height: 70,
		borderRadius: 48,
		backgroundColor: "#EEF2FF",
		alignItems: "center",
		justifyContent: "center",
	},
	avatarImage: { width: 70, height: 70, borderRadius: 48 },
});

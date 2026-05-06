// app/ocr-processing.tsx
import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	Animated,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS } from "../src/constants/theme";
import { noteApi } from "../src/api/noteApi";
import { Note, NoteStatus } from "../src/types/api.types";

export default function OcrProcessingScreen() {
	const router = useRouter();
	const scanAnim = useRef(new Animated.Value(0)).current;

	const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
	const [noteId, setNoteId] = useState<String>("");
	const [statusText, setStatusText] = useState("Uploading document...");
	const [isPolling, setIsPolling] = useState(false);

	// Lưu ID của note đang xử lý
	const draftNoteIdRef = useRef<string | null>(null);
	// Lưu ID của interval để dọn dẹp
	const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const isPollingRef = useRef(false);

	useEffect(() => {
		// Animation giữ nguyên
		Animated.loop(
			Animated.sequence([
				Animated.timing(scanAnim, {
					toValue: 200,
					duration: 1500,
					useNativeDriver: true,
				}),
				Animated.timing(scanAnim, {
					toValue: 0,
					duration: 1500,
					useNativeDriver: true,
				}),
			]),
		).start();

		// const processImage = async () => {
		// 	if (!imageUri) return;

		// 	try {
		// 		// Gọi API gửi ảnh lên Backend để OCR và Phân loại
		// 		const newNote = await noteApi.snapAndAutoCategorize(
		// 			imageUri,
		// 			"scanned_document.jpg",
		// 			"image/jpeg",
		// 		);

		// 		// OCR thành công, điều hướng sang trang Edit (hoặc xem chi tiết) kèm theo ID của Note mới tạo
		// 		router.replace(`/note/${newNote.id}`);
		// 	} catch (error: any) {
		// 		console.log("OCR Error:", error);
		// 		Alert.alert(
		// 			"Processing Error",
		// 			"Unable to extract text from the image.",
		// 		);
		// 		// Hoặc router.replace("/ocr-error");
		// 		// router.back();
		// 		router.replace("ocr-error");
		// 	}
		// };
		const startProcess = async () => {
			if (!imageUri) return;

			try {
				const fileName = imageUri.split("/").pop() || "scanned_document.jpg";
				const mimeType = "image/jpeg";

				const draftNote = await noteApi.snapAndAutoCategorize(
					imageUri,
					fileName,
					mimeType,
				);

				if (draftNote?.id) {
					startPolling(draftNote.id);
				}
			} catch (error: any) {
				console.log("Upload Error:", error);
				stopPolling();
				router.replace({
					pathname: "/ocr-error",
					params: { imageUri: imageUri },
				});
			}
		};

		startProcess();

		// processImage();
		return () => {
			stopPolling();
		};
	}, [imageUri]); // Hook phụ thuộc vào imageUri

	const startPolling = (id: string) => {
		if (isPollingRef.current) return;
		isPollingRef.current = true;

		// Cứ 3 giây gọi API 1 lần
		intervalIdRef.current = setInterval(async () => {
			try {
				console.log("Checking status for ID:", id);
				const res = await noteApi.getNoteStatus(id);
				const currentNote = res.data;

				// Kiểm tra nếu currentNote undefined thì bỏ qua lượt này
				if (!currentNote) return;

				if (currentNote.status === "ACTIONED") {
					stopPolling();
					try {
						setStatusText("Categorizing note...");

						await noteApi.autoCategorize(currentNote.id);

						import("@sentry/react-native").then((Sentry) => {
							Sentry.captureMessage("User utilized Smart OCR successfully", {
								level: "info",
								tags: { feature: "ocr_scanner", status: "success" },
							});
						});
					} catch (catErr) {
						console.log("Auto categorize warning:", catErr);
						// Dù phân loại lỗi (vd: AI timeout) thì vẫn cho người dùng vào xem Note bình thường
					}
					router.replace(`/note/${currentNote.id}`);
				} else if (currentNote.status === "ARCHIVED") {
					stopPolling();
					router.replace({
						pathname: "/ocr-error",
						params: { imageUri: imageUri },
					});
				}
			} catch (error) {
				console.log("Polling Error:", error);
				router.replace({
					pathname: "/ocr-error",
					params: { imageUri: imageUri },
				});
			}
		}, 3000);
	};

	const stopPolling = () => {
		if (intervalIdRef.current) {
			clearInterval(intervalIdRef.current);
			intervalIdRef.current = null;
		}
		isPollingRef.current = false;
	};

	// useEffect(() => {
	// 	// Tạo animation thanh quét chạy lên xuống
	// 	Animated.loop(
	// 		Animated.sequence([
	// 			Animated.timing(scanAnim, {
	// 				toValue: 200, // Chiều cao của khối document mockup
	// 				duration: 1500,
	// 				useNativeDriver: true,
	// 			}),
	// 			Animated.timing(scanAnim, {
	// 				toValue: 0,
	// 				duration: 1500,
	// 				useNativeDriver: true,
	// 			}),
	// 		]),
	// 	).start();

	// 	// Giả lập OCR xong sau 3 giây, chuyển sang màn Edit Note
	// 	const timer = setTimeout(() => {
	// 		router.push("/note/edit");
	// 	}, 3000);

	// 	return () => clearTimeout(timer);
	// }, []);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Smart OCR</Text>
			</View>

			<View style={styles.content}>
				{/* Document Scanner Animation */}
				<View style={styles.docBox}>
					{/* Những dòng chữ mờ */}
					<View style={styles.linesContainer}>
						<View style={[styles.line, { width: "75%" }]} />
						<View style={[styles.line, { width: "100%" }]} />
						<View style={[styles.line, { width: "85%" }]} />
						<View style={[styles.line, { width: "50%", marginTop: 16 }]} />
					</View>

					<View style={styles.overlayColor} />

					{/* Thanh quét màu tím */}
					<Animated.View
						style={[
							styles.scannerLine,
							{ transform: [{ translateY: scanAnim }] },
						]}
					/>
				</View>

				<View style={styles.textContainer}>
					<Text style={styles.processingText}>{statusText}</Text>
					<ActivityIndicator
						size="large"
						color={COLORS.primaryEnd}
						style={{ marginVertical: 16 }}
					/>
					<Text style={styles.subText}>Extracting text from image</Text>
				</View>
			</View>

			<View style={styles.footer}>
				<TouchableOpacity
					style={styles.cancelBtn}
					onPress={() => router.push("/(tabs)/dashboard")}
					testID="cancel-btn"
				>
					<Text style={styles.cancelBtnText}>Cancel</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.slate50 },
	header: { height: 60, justifyContent: "center", alignItems: "center" },
	headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.slate900 },
	content: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 32,
	},
	docBox: {
		width: 200,
		height: 260,
		backgroundColor: COLORS.slate800,
		borderRadius: 24,
		borderWidth: 4,
		borderColor: COLORS.white,
		overflow: "hidden",
		shadowColor: COLORS.primaryEnd,
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.3,
		shadowRadius: 20,
		elevation: 10,
		marginBottom: 40,
	},
	linesContainer: {
		...StyleSheet.absoluteFillObject,
		padding: 20,
		gap: 12,
		opacity: 0.5,
	},
	line: { height: 8, backgroundColor: COLORS.slate500, borderRadius: 4 },
	overlayColor: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(124, 58, 237, 0.1)",
	},
	scannerLine: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 4,
		backgroundColor: "#A78BFA",
		shadowColor: "#8B5CF6",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 1,
		shadowRadius: 10,
	},
	textContainer: { alignItems: "center" },
	processingText: { fontSize: 24, fontWeight: "800", color: COLORS.slate900 },
	subText: { fontSize: 14, fontWeight: "500", color: COLORS.slate500 },
	footer: {
		padding: 24,
		borderTopWidth: 1,
		borderTopColor: COLORS.slate100,
		backgroundColor: COLORS.white,
	},
	cancelBtn: { paddingVertical: 16, alignItems: "center", borderRadius: 16 },
	cancelBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: "600" },
});

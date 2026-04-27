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

		// THAY THẾ SETTIMEOUT BẰNG LOGIC GỌI API THỰC TẾ
		const processImage = async () => {
			if (!imageUri) return;

			try {
				// Gọi API gửi ảnh lên Backend để OCR và Phân loại
				const newNote = await noteApi.snapAndAutoCategorize(
					imageUri,
					"scanned_document.jpg",
					"image/jpeg",
				);

				// OCR thành công, điều hướng sang trang Edit (hoặc xem chi tiết) kèm theo ID của Note mới tạo
				console.log(newNote);
				router.replace(`/note/${newNote.id}`);
			} catch (error: any) {
				console.log("OCR Error:", error);
				Alert.alert(
					"Processing Error",
					"Unable to extract text from the image.",
				);
				// Hoặc router.replace("/ocr-error");
				// router.back();
				router.replace("ocr-error");
			}
		};

		processImage();
	}, [imageUri]); // Hook phụ thuộc vào imageUri

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
					<Text style={styles.processingText}>Processing...</Text>
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

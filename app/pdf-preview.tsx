// app/pdf-preview.tsx
import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	ScrollView,
	Image,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../src/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

// Import API
import { batchApi } from "../src/api/batchApi";

export default function PdfPreviewScreen() {
	const router = useRouter();
	const { images } = useLocalSearchParams();

	const [fileName, setFileName] = useState("Scanned_Document.pdf");
	const [isLoading, setIsLoading] = useState(false);

	// Parse mảng URI hình ảnh được truyền từ màn hình Batch Preview
	const imageUris: string[] = images ? JSON.parse(images as string) : [];

	const handleSave = async () => {
		if (imageUris.length === 0) {
			Alert.alert("Error", "No images available to create a PDF.");
			return;
		}

		try {
			setIsLoading(true);

			// Chuẩn bị payload theo đúng format mà batchApi yêu cầu
			const payload = {
				title: fileName,
				images: imageUris.map((uri, index) => ({
					uri: uri,
					name: `page_${index + 1}.jpg`,
					type: "image/jpeg",
				})),
			};

			// Gọi API đẩy dữ liệu lên Backend
			const res = await batchApi.scanBatch(payload);

			// Thành công -> Điều hướng về tab dashboard và gửi parameter showToast
			router.replace({
				pathname: "/(tabs)/dashboard",
				params: {
					showToast: "true",
					batchId: res.data?.id, // Đẩy ID của batch qua
					batchTitle: res.data?.title, // Đẩy tiêu đề của batch qua
				},
			});
		} catch (error) {
			console.error("Error creating PDF:", error);
			Alert.alert("Error", "Unable to create PDF. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					disabled={isLoading}
					testID="back-btn"
				>
					<Feather name="arrow-left" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>PDF Document</Text>
				<TouchableOpacity disabled={isLoading}>
					<Feather name="more-vertical" size={24} color={COLORS.slate400} />
				</TouchableOpacity>
			</View>

			<View style={styles.nameSection}>
				<Text style={styles.nameLabel}>FILE NAME</Text>
				<View style={styles.nameInputBox}>
					<TextInput
						style={styles.nameInput}
						value={fileName}
						onChangeText={setFileName}
						editable={!isLoading}
						testID="filename-input"
					/>
					<Feather name="edit-2" size={16} color={COLORS.slate400} />
				</View>
			</View>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				{imageUris.length > 0 ? (
					imageUris.map((uri, index) => (
						<View key={index} style={styles.pdfPage}>
							<View style={styles.pageNumberBadge}>
								<Text style={styles.pageNumberText}>{index + 1}</Text>
							</View>
							{/* Hiển thị hình ảnh thay vì Text */}
							<Image
								source={{ uri }}
								style={styles.previewImage}
								resizeMode="cover"
							/>
						</View>
					))
				) : (
					<View style={styles.emptyBox}>
						<Text style={styles.emptyText}>No images available.</Text>
					</View>
				)}
			</ScrollView>

			<View style={styles.footer}>
				<TouchableOpacity
					style={[styles.saveBtn, isLoading && { opacity: 0.7 }]}
					onPress={handleSave}
					disabled={isLoading}
				>
					{isLoading ? (
						<ActivityIndicator color={COLORS.white} />
					) : (
						<Text style={styles.saveBtnText}>Save PDF to Snapify</Text>
					)}
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: "#E2E8F0" },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		height: 60,
		paddingHorizontal: 24,
		backgroundColor: COLORS.white,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate200,
	},
	headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.slate900 },
	nameSection: {
		backgroundColor: COLORS.white,
		paddingHorizontal: 24,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate200,
	},
	nameLabel: {
		fontSize: 12,
		fontWeight: "700",
		color: COLORS.slate400,
		marginBottom: 8,
	},
	nameInputBox: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.slate50,
		borderWidth: 2,
		borderColor: COLORS.slate200,
		borderRadius: 12,
		paddingHorizontal: 16,
		height: 48,
	},
	nameInput: {
		flex: 1,
		fontSize: 16,
		fontWeight: "600",
		color: COLORS.slate900,
	},
	scrollContent: { padding: 24, paddingBottom: 40 },
	pdfPage: {
		backgroundColor: COLORS.white,
		borderRadius: 12,
		padding: 8, // Giảm padding để ảnh to hơn
		marginBottom: 24,
		shadowColor: COLORS.slate400,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 3,
	},
	previewImage: {
		width: "100%",
		aspectRatio: 0.75, // Giữ tỷ lệ khổ giấy A4/Letter
		borderRadius: 8,
	},
	pageNumberBadge: {
		position: "absolute",
		top: -12,
		right: -12,
		width: 32,
		height: 32,
		backgroundColor: COLORS.slate800,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: COLORS.white,
		zIndex: 10,
	},
	pageNumberText: { color: COLORS.white, fontWeight: "bold", fontSize: 12 },
	emptyBox: { alignItems: "center", marginTop: 40 },
	emptyText: { color: COLORS.slate500, fontSize: 16 },
	footer: {
		backgroundColor: COLORS.white,
		padding: 24,
		borderTopWidth: 1,
		borderTopColor: COLORS.slate200,
	},
	saveBtn: {
		backgroundColor: COLORS.slate900,
		paddingVertical: 16,
		borderRadius: 16,
		alignItems: "center",
		shadowColor: COLORS.slate900,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
	},
	saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});

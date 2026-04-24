// app/snap.tsx
import React, { useRef, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../src/constants/theme";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Button } from "../src/components/common/Button";

export default function SnapToNoteScreen() {
	const router = useRouter();
	const [permission, requestPermission] = useCameraPermissions();
	// Tạo ref để điều khiển camera
	const cameraRef = useRef<CameraView>(null);
	const [isTakingPhoto, setIsTakingPhoto] = useState(false);

	if (!permission?.granted) {
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: "#0B0F19",
					justifyContent: "center",
					alignItems: "center",
					padding: 24,
				}}
			>
				<Text
					style={{
						color: "white",
						fontSize: 18,
						textAlign: "center",
						marginBottom: 20,
					}}
				>
					Snapify cần quyền truy cập Camera để có thể quét tài liệu.
				</Text>
				<Button title="Cấp quyền Camera" onPress={requestPermission} />
			</View>
		);
	}

	// ĐÂY LÀ HÀM BẠN CẦN THÊM VÀO
	const takePicture = async () => {
		if (cameraRef.current && !isTakingPhoto) {
			setIsTakingPhoto(true);
			try {
				// Thực hiện chụp ảnh
				const photo = await cameraRef.current.takePictureAsync({
					quality: 0.7, // Nén ảnh để gửi API nhanh hơn
					base64: false,
				});

				// Chụp xong, truyền URI của ảnh sang trang OCR Processing
				if (photo) {
					router.push({
						pathname: "/ocr-processing",
						params: { imageUri: photo.uri },
					});
				}
			} catch (error) {
				console.log("Lỗi chụp ảnh:", error);
			} finally {
				setIsTakingPhoto(false);
			}
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="light-content" />

			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
					<Feather name="x" size={24} color={COLORS.white} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconBtn}>
					<Feather name="more-horizontal" size={24} color={COLORS.white} />
				</TouchableOpacity>
			</View>

			{/* Viewfinder */}
			<View style={{ flex: 1, overflow: "hidden" }}>
				<CameraView
					ref={cameraRef}
					style={StyleSheet.absoluteFillObject}
					facing="back"
				/>
				<View style={styles.viewfinder}>
					{/* Khung viền (Brackets) */}
					<View style={[styles.corner, styles.topLeft]} />
					<View style={[styles.corner, styles.topRight]} />
					<View style={[styles.corner, styles.bottomLeft]} />
					<View style={[styles.corner, styles.bottomRight]} />

					<Text style={styles.focusTitle}>Focus on Document</Text>
					<Text style={styles.focusSubtitle}>(Align within brackets)</Text>
				</View>
			</View>

			{/* Bottom Controls */}
			<View style={styles.bottomBar}>
				{/* Flash Button */}
				<TouchableOpacity style={styles.sideBtn}>
					<View style={styles.iconCircle}>
						<Ionicons name="flash" size={20} color="#FBBF24" />
					</View>
					<Text style={styles.sideBtnText}>Flash</Text>
				</TouchableOpacity>

				{/* Shutter Button (Nút chụp) */}
				<TouchableOpacity
					style={styles.shutterBtn}
					onPress={takePicture}
					disabled={isTakingPhoto}
				>
					<View style={styles.shutterInner} />
				</TouchableOpacity>

				{/* Gallery Button */}
				<TouchableOpacity style={styles.sideBtn}>
					<View style={styles.iconCircle}>
						<Ionicons name="image-outline" size={20} color="#34D399" />
					</View>
					<Text style={styles.sideBtnText}>Gallery</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: "#0B0F19" }, // Màu xanh đen đậm chuẩn hình
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 24,
		paddingTop: 16,
	},
	iconBtn: { padding: 8 },
	viewfinder: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
		marginHorizontal: 32,
		marginVertical: 60,
	},
	corner: {
		position: "absolute",
		width: 40,
		height: 40,
		borderColor: COLORS.white,
	},
	topLeft: {
		top: 0,
		left: 0,
		borderTopWidth: 3,
		borderLeftWidth: 3,
		borderTopLeftRadius: 16,
	},
	topRight: {
		top: 0,
		right: 0,
		borderTopWidth: 3,
		borderRightWidth: 3,
		borderTopRightRadius: 16,
	},
	bottomLeft: {
		bottom: 0,
		left: 0,
		borderBottomWidth: 3,
		borderLeftWidth: 3,
		borderBottomLeftRadius: 16,
	},
	bottomRight: {
		bottom: 0,
		right: 0,
		borderBottomWidth: 3,
		borderRightWidth: 3,
		borderBottomRightRadius: 16,
	},
	focusTitle: {
		color: COLORS.white,
		fontSize: 20,
		fontWeight: "700",
		marginBottom: 8,
	},
	focusSubtitle: { color: COLORS.slate300, fontSize: 14, fontWeight: "400" },
	bottomBar: {
		height: 140,
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: "rgba(255,255,255,0.2)",
		paddingHorizontal: 20,
	},
	sideBtn: { alignItems: "center", gap: 8 },
	iconCircle: {
		width: 50,
		height: 50,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.3)",
		alignItems: "center",
		justifyContent: "center",
	},
	sideBtnText: { color: COLORS.slate400, fontSize: 12, fontWeight: "600" },
	shutterBtn: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 6,
		borderColor: COLORS.white,
		padding: 4,
		alignItems: "center",
		justifyContent: "center",
	},
	shutterInner: {
		width: "100%",
		height: "100%",
		backgroundColor: COLORS.white,
		borderRadius: 40,
	},
});

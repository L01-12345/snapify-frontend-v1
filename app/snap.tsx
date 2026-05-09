// app/snap.tsx
import React, { useRef, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Feather, Ionicons } from "@expo/vector-icons";
import { COLORS } from "../src/constants/theme";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Button } from "../src/components/common/Button";
import {
	ResponsiveFontSize,
	ResponsiveSpacing,
	ResponsiveDimensions,
	ResponsiveBorderRadius,
	scale,
	DeviceInfo,
} from "../src/utils/responsive";
import { SafeAreaView } from "react-native-safe-area-context";

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
					padding: ResponsiveSpacing.l,
				}}
			>
				<Text
					style={{
						color: "white",
						fontSize: ResponsiveFontSize.lg,
						textAlign: "center",
						marginBottom: ResponsiveSpacing.xl,
					}}
				>
					Snapify needs camera access to scan documents.
				</Text>
				<Button title="Grant Camera Access" onPress={requestPermission} />
			</View>
		);
	}

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
	const pickImage = async () => {
		try {
			// Yêu cầu quyền truy cập thư viện (tùy chọn nhưng an toàn trên iOS)
			const permissionResult =
				await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (permissionResult.granted === false) {
				Alert.alert("Permission to access camera roll is required!");
				return;
			}

			// Mở trình chọn ảnh
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images, // Chỉ cho phép chọn ảnh
				quality: 0.7, // Giữ nguyên chuẩn nén giống lúc chụp bằng camera
			});

			if (!result.canceled && result.assets && result.assets.length > 0) {
				// Truyền URI ảnh được chọn sang màn hình OCR Processing
				router.push({
					pathname: "/ocr-processing",
					params: { imageUri: result.assets[0].uri },
				});
			}
		} catch (error) {
			console.log("Lỗi chọn ảnh từ thư viện:", error);
			Alert.alert("Lỗi", "Không thể mở thư viện ảnh.");
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="light-content" />

			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.iconBtn}
					testID="back-btn"
				>
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
					testID="shutter-btn"
				>
					<View style={styles.shutterInner} />
				</TouchableOpacity>

				{/* Gallery Button */}
				<TouchableOpacity
					style={styles.sideBtn}
					onPress={pickImage}
					testID="gallery-btn"
				>
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
	safeArea: { flex: 1, backgroundColor: "#0B0F19" },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: ResponsiveSpacing.l,
		paddingTop: ResponsiveSpacing.m,
	},
	iconBtn: {
		padding: ResponsiveSpacing.m,
	},
	viewfinder: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
		marginHorizontal: scale(32),
		marginVertical: scale(60),
	},
	corner: {
		position: "absolute",
		width: scale(40),
		height: scale(40),
		borderColor: COLORS.white,
	},
	topLeft: {
		top: 0,
		left: 0,
		borderTopWidth: scale(3),
		borderLeftWidth: scale(3),
		borderTopLeftRadius: ResponsiveBorderRadius.lg,
	},
	topRight: {
		top: 0,
		right: 0,
		borderTopWidth: scale(3),
		borderRightWidth: scale(3),
		borderTopRightRadius: ResponsiveBorderRadius.lg,
	},
	bottomLeft: {
		bottom: 0,
		left: 0,
		borderBottomWidth: scale(3),
		borderLeftWidth: scale(3),
		borderBottomLeftRadius: ResponsiveBorderRadius.lg,
	},
	bottomRight: {
		bottom: 0,
		right: 0,
		borderBottomWidth: scale(3),
		borderRightWidth: scale(3),
		borderBottomRightRadius: ResponsiveBorderRadius.lg,
	},
	focusTitle: {
		color: COLORS.white,
		fontSize: ResponsiveFontSize["2xl"],
		fontWeight: "700",
		marginBottom: ResponsiveSpacing.m,
	},
	focusSubtitle: {
		color: COLORS.slate300,
		fontSize: ResponsiveFontSize.base,
		fontWeight: "400",
	},
	bottomBar: {
		height: ResponsiveDimensions.shutterButtonSize * 1.75,
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: "rgba(255,255,255,0.2)",
		paddingHorizontal: ResponsiveSpacing.m,
	},
	sideBtn: {
		alignItems: "center",
		gap: ResponsiveSpacing.m,
	},
	iconCircle: {
		width: scale(50),
		height: scale(50),
		borderRadius: ResponsiveBorderRadius.md,
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.3)",
		alignItems: "center",
		justifyContent: "center",
	},
	sideBtnText: {
		color: COLORS.slate400,
		fontSize: ResponsiveFontSize.xs,
		fontWeight: "600",
	},
	shutterBtn: {
		width: ResponsiveDimensions.shutterButtonSize,
		height: ResponsiveDimensions.shutterButtonSize,
		borderRadius: ResponsiveDimensions.shutterButtonSize / 2,
		borderWidth: scale(6),
		borderColor: COLORS.white,
		padding: ResponsiveSpacing.s,
		alignItems: "center",
		justifyContent: "center",
	},
	shutterInner: {
		width: "100%",
		height: "100%",
		backgroundColor: COLORS.white,
		borderRadius: ResponsiveDimensions.shutterButtonSize / 2,
	},
});

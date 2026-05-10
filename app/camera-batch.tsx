// app/camera-batch.tsx
import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Animated,
	Alert,
} from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS } from "../src/constants/theme";
import { Icon } from "../src/components/common/Icon";
import {
	ResponsiveFontSize,
	ResponsiveSpacing,
	ResponsiveDimensions,
	ResponsiveBorderRadius,
	scale,
	getResponsiveHeight,
	getResponsiveShadow,
} from "../src/utils/responsive";

export default function CameraBatchScreen() {
	const router = useRouter();
	const [permission, requestPermission] = useCameraPermissions();
	const cameraRef = useRef<CameraView>(null);

	// State lưu danh sách các ảnh đã chụp
	const [capturedImages, setCapturedImages] = useState<string[]>([]);

	// Animation cho tia quét Scanner
	const scanAnim = useRef(new Animated.Value(0)).current;

	const { updatedImages } = useLocalSearchParams();

	const insets = useSafeAreaInsets();

	useEffect(() => {
		if (updatedImages) {
			try {
				setCapturedImages(JSON.parse(updatedImages as string));
			} catch (e) {
				console.error("Lỗi parse images:", e);
			}
		}
	}, [updatedImages]);

	useEffect(() => {
		// Hiệu ứng tia sáng chạy lên xuống
		Animated.loop(
			Animated.sequence([
				Animated.timing(scanAnim, {
					toValue: 1,
					duration: 2000,
					useNativeDriver: true,
				}),
				Animated.timing(scanAnim, {
					toValue: 0,
					duration: 2000,
					useNativeDriver: true,
				}),
			]),
		).start();
	}, []);

	if (!permission) return <View />;
	if (!permission.granted) {
		return (
			<View style={styles.permissionContainer}>
				<Text style={styles.permissionText}>
					We need your permission to show the camera
				</Text>
				<TouchableOpacity
					style={styles.permissionBtn}
					onPress={requestPermission}
				>
					<Text style={styles.permissionBtnText}>Grant Permission</Text>
				</TouchableOpacity>
			</View>
		);
	}

	// Hàm chụp và NÉN ẢNH (< 5MB)
	const takePicture = async () => {
		if (cameraRef.current) {
			try {
				// Chụp ảnh chất lượng gốc
				const photo = await cameraRef.current.takePictureAsync({
					quality: 1,
				});

				if (photo) {
					// XỬ LÝ ẢNH: Resize width về 1080px và giảm chất lượng xuống 70% (JPEG)
					// Điều này đảm bảo ảnh luôn nhẹ hơn 5MB nhưng vẫn đủ nét để OCR
					const compressedImage = await ImageManipulator.manipulateAsync(
						photo.uri,
						[{ resize: { width: 1080 } }],
						{ compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
					);

					// Thêm ảnh đã nén vào mảng
					setCapturedImages((prev) => [...prev, compressedImage.uri]);
				}
			} catch (error) {
				Alert.alert("Error", "Failed to capture image.");
			}
		}
	};

	// Xong và chuyển qua màn hình Preview
	const handleDone = () => {
		if (capturedImages.length === 0) {
			Alert.alert("Notice", "Please capture at least one image.");
			return;
		}
		// Chuyển sang trang batch-preview, truyền mảng URI qua tham số
		router.push({
			pathname: "/batch-preview",
			params: { images: JSON.stringify(capturedImages) },
		});
	};

	const scannerHeight = getResponsiveHeight(50);

	const scanTranslateY = scanAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [
			-scannerHeight / 2 + scale(20),
			scannerHeight / 2 - scale(20),
		],
	});

	return (
		<View style={styles.container}>
			<CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef} />

			{/* Nền tối phủ mờ xung quanh vùng quét */}
			<View
				style={[
					StyleSheet.absoluteFillObject,
					{ flex: 1, flexDirection: "column" },
				]}
			>
				{/* Top Bar */}
				<SafeAreaView style={{ flexShrink: 0 }}>
					<View style={styles.topBar}>
						<TouchableOpacity
							style={styles.iconBtn}
							onPress={() => router.replace("/dashboard")}
							testID="back-btn"
						>
							<Icon name="x" size={24} color={COLORS.slate800} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.flashBtn}>
							<Icon
								name="flash"
								size={20}
								color={COLORS.white}
								style={styles.flashText}
							/>
						</TouchableOpacity>
					</View>
				</SafeAreaView>

				{/* Vùng Scanner Center */}
				<View style={styles.scannerWrapper}>
					<View style={[styles.scannerFrame, { height: scannerHeight }]}>
						{/* 4 Góc nhọn */}
						<View style={[styles.corner, styles.topLeft]} />
						<View style={[styles.corner, styles.topRight]} />
						<View style={[styles.corner, styles.bottomLeft]} />
						<View style={[styles.corner, styles.bottomRight]} />

						<Text style={styles.mathText}>f'(x) = lim (h→0)...</Text>

						{/* Tia quét */}
						<Animated.View
							style={[
								styles.scanLine,
								{ transform: [{ translateY: scanTranslateY }] },
							]}
						/>
					</View>
				</View>

				{/* Bottom Bar */}
				<View
					style={[
						styles.bottomBar,
						// Ghi đè padding đáy: Bằng độ cao thanh điều hướng + padding gốc (khoảng 16px)
						{ paddingBottom: insets.bottom + ResponsiveSpacing.m },
					]}
				>
					{/* Thumbnail / Counter */}
					<TouchableOpacity style={styles.galleryBtn}>
						<Icon name="document" size={24} color="rgba(255,255,255,0.8)" />
						{capturedImages.length > 0 && (
							<View style={styles.badge}>
								<Text style={styles.badgeText}>{capturedImages.length}</Text>
							</View>
						)}
					</TouchableOpacity>

					{/* Nút chụp */}
					<TouchableOpacity
						style={styles.captureOuter}
						onPress={takePicture}
						testID="capture-btn"
					>
						<View style={styles.captureInner} />
					</TouchableOpacity>

					{/* Nút Done */}
					<TouchableOpacity
						style={styles.doneBtn}
						onPress={handleDone}
						testID="done-btn"
					>
						<Icon name="check" size={20} color={COLORS.white} />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#020617" },
	permissionContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#020617",
	},
	permissionText: { color: "white", marginBottom: ResponsiveSpacing.l },
	permissionBtn: {
		backgroundColor: "#4f46e5",
		padding: ResponsiveSpacing.s,
		borderRadius: ResponsiveBorderRadius.base,
	},
	permissionBtnText: { color: "white", fontWeight: "bold" },

	topBar: {
		height: scale(64),
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: ResponsiveSpacing.l,
		zIndex: 10,
		flexShrink: 0,
	},
	iconBtn: {
		width: scale(44),
		height: scale(44),
		backgroundColor: "rgba(255,255,255,0.1)",
		borderRadius: scale(22),
		alignItems: "center",
		justifyContent: "center",
	},
	iconText: { color: "white", fontSize: ResponsiveFontSize["xl"] },
	flashBtn: {
		width: scale(44),
		height: scale(44),
		backgroundColor: "rgba(251, 191, 36, 0.1)",
		borderColor: "#fbbf24",
		borderWidth: scale(1),
		borderRadius: scale(22),
		alignItems: "center",
		justifyContent: "center",
	},
	flashText: { color: "#fbbf24", fontSize: ResponsiveFontSize["xl"] },

	scannerWrapper: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: ResponsiveSpacing.l,
		paddingVertical: ResponsiveSpacing.m,
	},
	scannerFrame: {
		width: "100%",
		flex: 1,
		maxHeight: getResponsiveHeight(55),
		borderWidth: scale(2),
		borderColor: "rgba(99, 102, 241, 0.5)",
		borderRadius: ResponsiveBorderRadius.xl,
		backgroundColor: "rgba(255,255,255,0.05)",
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	corner: {
		position: "absolute",
		width: scale(32),
		height: scale(32),
		borderColor: "#818cf8", // indigo-400
	},
	topLeft: {
		top: 0,
		left: 0,
		borderTopWidth: scale(4),
		borderLeftWidth: scale(4),
		borderTopLeftRadius: ResponsiveBorderRadius.lg,
	},
	topRight: {
		top: 0,
		right: 0,
		borderTopWidth: scale(4),
		borderRightWidth: scale(4),
		borderTopRightRadius: ResponsiveBorderRadius.lg,
	},
	bottomLeft: {
		bottom: 0,
		left: 0,
		borderBottomWidth: scale(4),
		borderLeftWidth: scale(4),
		borderBottomLeftRadius: ResponsiveBorderRadius.lg,
	},
	bottomRight: {
		bottom: 0,
		right: 0,
		borderBottomWidth: scale(4),
		borderRightWidth: scale(4),
		borderBottomRightRadius: ResponsiveBorderRadius.lg,
	},
	mathText: {
		color: "rgba(255,255,255,0.4)",
		fontWeight: "600",
		fontSize: ResponsiveFontSize["xl"],
		transform: [{ rotate: "-2deg" }],
	},
	scanLine: {
		position: "absolute",
		width: "100%",
		height: scale(2),
		backgroundColor: "#818cf8",
		shadowColor: "#818cf8",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 1,
		shadowRadius: scale(15),
		elevation: 10,
	},

	bottomBar: {
		backgroundColor: "rgba(15, 23, 42, 0.9)",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: ResponsiveSpacing.xl,
		borderTopWidth: scale(1),
		borderTopColor: "rgba(255,255,255,0.1)",
		paddingVertical: ResponsiveSpacing.m,
		flexShrink: 0,
	},
	galleryBtn: {
		width: scale(56),
		height: scale(56),
		backgroundColor: "#1e293b",
		borderColor: "#475569",
		borderWidth: scale(1),
		borderRadius: ResponsiveBorderRadius.base,
		alignItems: "center",
		justifyContent: "center",
	},
	badge: {
		position: "absolute",
		top: scale(-12),
		right: scale(-12),
		width: scale(28),
		height: scale(28),
		backgroundColor: "#4f46e5", // indigo-600
		borderRadius: scale(14),
		alignItems: "center",
		justifyContent: "center",
		borderWidth: scale(3),
		borderColor: "#0f172a",
	},
	badgeText: {
		color: "white",
		fontSize: ResponsiveFontSize["sm"],
		fontWeight: "bold",
	},
	captureOuter: {
		width: ResponsiveDimensions.shutterButtonSize,
		height: ResponsiveDimensions.shutterButtonSize,
		borderRadius: ResponsiveDimensions.shutterButtonSize / 2,
		borderWidth: scale(6),
		borderColor: "white",
		alignItems: "center",
		justifyContent: "center",
		padding: ResponsiveSpacing.xs,
	},
	captureInner: {
		width: "100%",
		height: "100%",
		backgroundColor: "white",
		borderRadius: ResponsiveDimensions.shutterButtonSize / 2,
	},
	doneBtn: {
		width: scale(56),
		height: scale(56),
		backgroundColor: "#4f46e5",
		borderRadius: scale(28),
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#4f46e5",
		shadowOffset: { width: 0, height: scale(4) },
		shadowOpacity: 0.4,
		shadowRadius: scale(10),
	},
	doneBtnText: {
		color: "white",
		fontSize: ResponsiveFontSize["3xl"],
		fontWeight: "bold",
	},
});

// app/camera-batch.tsx
import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Animated,
	SafeAreaView,
	Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter } from "expo-router";

export default function CameraBatchScreen() {
	const router = useRouter();
	const [permission, requestPermission] = useCameraPermissions();
	const cameraRef = useRef<CameraView>(null);

	// State lưu danh sách các ảnh đã chụp
	const [capturedImages, setCapturedImages] = useState<string[]>([]);

	// Animation cho tia quét Scanner
	const scanAnim = useRef(new Animated.Value(0)).current;

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

	const scanTranslateY = scanAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [-240, 240], // Giới hạn di chuyển trong vùng khung 480px
	});

	return (
		<View style={styles.container}>
			<CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef} />

			{/* Nền tối phủ mờ xung quanh vùng quét */}
			<View style={StyleSheet.absoluteFillObject}>
				{/* Top Bar */}
				<SafeAreaView>
					<View style={styles.topBar}>
						<TouchableOpacity
							style={styles.iconBtn}
							onPress={() => router.back()}
							testID="back-btn"
						>
							<Text style={styles.iconText}>✕</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.flashBtn}>
							<Text style={styles.flashText}>⚡</Text>
						</TouchableOpacity>
					</View>
				</SafeAreaView>

				{/* Vùng Scanner Center */}
				<View style={styles.scannerWrapper}>
					<View style={styles.scannerFrame}>
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
				<View style={styles.bottomBar}>
					{/* Thumbnail / Counter */}
					<TouchableOpacity style={styles.galleryBtn}>
						<Text style={{ fontSize: 24, opacity: 0.8 }}>📄</Text>
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
						<Text style={styles.doneBtnText}>✓</Text>
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
	permissionText: { color: "white", marginBottom: 20 },
	permissionBtn: { backgroundColor: "#4f46e5", padding: 12, borderRadius: 8 },
	permissionBtnText: { color: "white", fontWeight: "bold" },

	topBar: {
		height: 64,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 24,
		zIndex: 10,
	},
	iconBtn: {
		width: 40,
		height: 40,
		backgroundColor: "rgba(255,255,255,0.1)",
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	iconText: { color: "white", fontSize: 18 },
	flashBtn: {
		width: 40,
		height: 40,
		backgroundColor: "rgba(251, 191, 36, 0.1)",
		borderColor: "#fbbf24",
		borderWidth: 1,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	flashText: { color: "#fbbf24", fontSize: 18 },

	scannerWrapper: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	scannerFrame: {
		width: "100%",
		height: 480,
		borderWidth: 2,
		borderColor: "rgba(99, 102, 241, 0.5)", // indigo-500/50
		borderRadius: 24,
		backgroundColor: "rgba(255,255,255,0.05)",
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	corner: {
		position: "absolute",
		width: 32,
		height: 32,
		borderColor: "#818cf8", // indigo-400
	},
	topLeft: {
		top: 0,
		left: 0,
		borderTopWidth: 4,
		borderLeftWidth: 4,
		borderTopLeftRadius: 20,
	},
	topRight: {
		top: 0,
		right: 0,
		borderTopWidth: 4,
		borderRightWidth: 4,
		borderTopRightRadius: 20,
	},
	bottomLeft: {
		bottom: 0,
		left: 0,
		borderBottomWidth: 4,
		borderLeftWidth: 4,
		borderBottomLeftRadius: 20,
	},
	bottomRight: {
		bottom: 0,
		right: 0,
		borderBottomWidth: 4,
		borderRightWidth: 4,
		borderBottomRightRadius: 20,
	},
	mathText: {
		color: "rgba(255,255,255,0.4)",
		fontWeight: "600",
		fontSize: 18,
		transform: [{ rotate: "-2deg" }],
	},
	scanLine: {
		position: "absolute",
		width: "100%",
		height: 2,
		backgroundColor: "#818cf8",
		shadowColor: "#818cf8",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 1,
		shadowRadius: 15,
		elevation: 10,
	},

	bottomBar: {
		height: 160,
		backgroundColor: "rgba(15, 23, 42, 0.9)", // slate-900
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 32,
		borderTopWidth: 1,
		borderTopColor: "rgba(255,255,255,0.1)",
		paddingBottom: 20,
	},
	galleryBtn: {
		width: 56,
		height: 56,
		backgroundColor: "#1e293b",
		borderColor: "#475569",
		borderWidth: 1,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	badge: {
		position: "absolute",
		top: -12,
		right: -12,
		width: 28,
		height: 28,
		backgroundColor: "#4f46e5", // indigo-600
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 3,
		borderColor: "#0f172a",
	},
	badgeText: { color: "white", fontSize: 12, fontWeight: "bold" },
	captureOuter: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 6,
		borderColor: "white",
		alignItems: "center",
		justifyContent: "center",
		padding: 4,
	},
	captureInner: {
		width: "100%",
		height: "100%",
		backgroundColor: "white",
		borderRadius: 40,
	},
	doneBtn: {
		width: 56,
		height: 56,
		backgroundColor: "#4f46e5",
		borderRadius: 28,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#4f46e5",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.4,
		shadowRadius: 10,
	},
	doneBtnText: { color: "white", fontSize: 24, fontWeight: "bold" },
});

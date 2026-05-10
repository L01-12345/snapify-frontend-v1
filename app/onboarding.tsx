// app/onboarding.tsx
import React, { useState, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	FlatList,
	Animated,
	Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Icon } from "../src/components/common/Icon";
import { COLORS } from "../src/constants/theme";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
	ResponsiveFontSize,
	ResponsiveSpacing,
	ResponsiveBorderRadius,
	scale,
	DeviceInfo,
	getResponsiveHeight,
} from "../src/utils/responsive";
import { Logo } from "../src/components/common/Logo";

const layoutWidth = DeviceInfo.windowWidth;
const layoutHeight = DeviceInfo.windowHeight;

// Dữ liệu nội dung
const SLIDES = [
	{
		id: "1",
		title: "Snap it...\nthen lose it?",
		subtitle:
			"You take hundreds of photos of lecture slides, whiteboards, and documents, but can never find them when needed.",
	},
	{
		id: "2",
		title: "Turn Photos Into\nNotes Instantly",
		subtitle:
			"Snap, scan, and let Snapify do the magic. Advanced OCR technology converts images into editable and actionable text instantly.",
	},
	{
		id: "3",
		title: "Smart Organization,\nEasy Search",
		subtitle:
			"Snapify's AI automatically categorizes your notes into Smart Folders. Find anything in seconds with the Global Search tool.",
	},
	{
		id: "4",
		title: "Ready to\nNote Smarter?",
		subtitle:
			"Start turning document photos into actionable notes. Snapify helps you save 80% of the time spent on manual note-taking.",
	},
];

export default function OnboardingScreen() {
	const router = useRouter();
	const [currentIndex, setCurrentIndex] = useState(0);
	const scrollX = useRef(new Animated.Value(0)).current;
	const slidesRef = useRef<FlatList>(null);
	const insets = useSafeAreaInsets();

	const handleNext = () => {
		if (currentIndex < SLIDES.length - 1) {
			slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
		} else {
			router.replace("/(auth)/login");
		}
	};

	const handleSkip = () => {
		router.replace("/(auth)/login");
	};

	// === CÁC COMPONENT ĐỒ HỌA CHO TỪNG TRANG (Dịch từ HTML sang) ===

	const GraphicSlide1 = () => (
		<View style={[styles.graphicContainer, { backgroundColor: "#f1f5f9" }]}>
			{/* Fake Pattern overlay có thể dùng Image, ở đây dùng background màu */}
			<View style={styles.g1Card1}>
				<Icon
					name="file-text"
					size={40}
					color="#0f172a"
					style={{ opacity: 0.7 }}
				/>
			</View>
			<View style={styles.g1Card2}>
				<Icon
					name="camera"
					size={40}
					color="#0f172a"
					style={{ opacity: 0.8 }}
				/>
			</View>
			<View style={styles.g1Card3}>
				<Icon name="help" size={50} color="#0f172a" />
			</View>
		</View>
	);

	const GraphicSlide2 = () => (
		<LinearGradient
			colors={["#4f46e5", "#8b5cf6"]}
			style={styles.graphicContainer}
		>
			<View style={styles.g2Container}>
				<View style={styles.g2Box1}>
					<Icon name="camera" size={40} color="#ffffff" />
					<View
						style={{
							width: "75%",
							height: 8,
							backgroundColor: "rgba(255,255,255,0.2)",
							borderRadius: 4,
							marginTop: 4,
						}}
					/>
					<View
						style={{
							width: "50%",
							height: 8,
							backgroundColor: "rgba(255,255,255,0.2)",
							borderRadius: 4,
							marginTop: 4,
						}}
					/>
				</View>
				<Icon
					name="sparkle"
					size={40}
					color="#ffffff"
					style={{ marginVertical: 12 }}
				/>
				<View style={styles.g2Box2}>
					<Text
						style={{
							fontSize: 12,
							fontWeight: "700",
							color: "#0f172a",
							marginBottom: 8,
						}}
					>
						f'(x) = lim (h→0)...
					</Text>
					<View
						style={{
							width: "100%",
							height: 6,
							backgroundColor: "#e2e8f0",
							borderRadius: 3,
							marginBottom: 4,
						}}
					/>
					<View
						style={{
							width: "100%",
							height: 6,
							backgroundColor: "#e2e8f0",
							borderRadius: 3,
							marginBottom: 4,
						}}
					/>
					<View
						style={{
							width: "75%",
							height: 6,
							backgroundColor: "#e2e8f0",
							borderRadius: 3,
						}}
					/>
				</View>
			</View>
		</LinearGradient>
	);

	const GraphicSlide3 = () => (
		<View
			style={[
				styles.graphicContainer,
				{ backgroundColor: "#f5f3ff", overflow: "hidden" },
			]}
		>
			{/* Blurred circles */}
			<View style={styles.g3Blur1} />
			<View style={styles.g3Blur2} />

			<View style={styles.g3Folder1}>
				<View style={styles.g3FolderIcon1}>
					<Icon name="folder" size={24} color="#0f172a" />
				</View>
				<Text style={styles.g3FolderText}>Study</Text>
			</View>
			<View style={styles.g3Folder2}>
				<View style={styles.g3FolderIcon2}>
					<Icon name="briefcase" size={24} color="#0f172a" />
				</View>
				<Text style={styles.g3FolderText}>Work</Text>
			</View>
			<LinearGradient
				colors={["#4f46e5", "#8b5cf6"]}
				style={styles.g3SearchIcon}
			>
				<Icon name="search" size={32} color="#ffffff" />
			</LinearGradient>
		</View>
	);

	// ==============================================================

	const renderItem = ({ item, index }: { item: any; index: number }) => {
		// TRANG 4: FULL GRADIENT SCREEN
		if (index === 3) {
			return (
				<LinearGradient
					colors={["#4f46e5", "#8b5cf6"]}
					style={[
						styles.slideFull,
						{
							paddingTop: insets.top + 50,
							paddingBottom: insets.bottom + 30,
							justifyContent: "center",
						},
					]}
				>
					<View style={styles.s4Content}>
						<View style={styles.s4LogoBox}>
							<Logo width={64} height={64} />
						</View>
						<Text style={styles.s4Title}>{item.title}</Text>
						<Text style={styles.s4Subtitle}>{item.subtitle}</Text>
					</View>

					<View style={styles.dotsRow}>
						{SLIDES.map((_, i) => (
							<View
								key={i}
								style={[
									styles.dot,
									i === 3 ? styles.dotWhiteActive : styles.dotWhiteInactive,
								]}
							/>
						))}
					</View>

					<TouchableOpacity
						style={[
							styles.getStartedBtn,
							{
								// Chuyển sang vị trí tương đối để nút tuân thủ paddingBottom của cha
								position: "relative",
								bottom: 0,
								marginTop: 20,
							},
						]}
						onPress={handleNext}
					>
						<Text style={styles.getStartedText}>Get Started</Text>
					</TouchableOpacity>
				</LinearGradient>
			);
		}

		// TRANG 1, 2, 3: CHIA HAI NỬA (GRAPHIC + BOTTOM CARD)
		return (
			<SafeAreaView style={styles.slide}>
				{/* Top Graphic */}
				<View style={{ flex: 1 }}>
					{index === 0 && <GraphicSlide1 />}
					{index === 1 && <GraphicSlide2 />}
					{index === 2 && <GraphicSlide3 />}
				</View>

				{/* Bottom Card */}
				<View style={styles.bottomCard}>
					<Text style={styles.title}>{item.title}</Text>
					<Text style={styles.subtitle}>{item.subtitle}</Text>

					<View style={styles.footerRow}>
						{/* Dots */}
						<View style={styles.dotsRowCard}>
							{SLIDES.map((_, i) => (
								<View
									key={i}
									style={[
										styles.dot,
										i === index ? styles.dotActive : styles.dotInactive,
									]}
								/>
							))}
						</View>

						{/* Arrow Button */}
						<TouchableOpacity style={styles.arrowBtn} onPress={handleNext}>
							<Feather name="arrow-right" size={24} color="#475569" />
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Skip Button (chỉ hiện ở trang 1, 2, 3) */}
			{currentIndex < 3 && (
				<TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
					<Text style={styles.skipText}>Skip</Text>
				</TouchableOpacity>
			)}

			<FlatList
				data={SLIDES}
				renderItem={renderItem}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				bounces={false}
				keyExtractor={(item) => item.id}
				onScroll={Animated.event(
					[{ nativeEvent: { contentOffset: { x: scrollX } } }],
					{
						useNativeDriver: false,
					},
				)}
				onMomentumScrollEnd={(e) => {
					setCurrentIndex(
						Math.round(e.nativeEvent.contentOffset.x / layoutWidth),
					);
				}}
				ref={slidesRef}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#f8fafc" },
	slide: {
		width: layoutWidth,
		height: layoutHeight,
		flex: 1,
		flexDirection: "column",
	},
	slideFull: {
		width: layoutWidth,
		height: layoutHeight,
		padding: ResponsiveSpacing.xxxl,
		justifyContent: "center",
		alignItems: "center",
	},

	skipBtn: {
		position: "absolute",
		top: Platform.OS === "ios" ? ResponsiveSpacing.xxxl : ResponsiveSpacing.xl,
		right: ResponsiveSpacing.xl,
		zIndex: 10,
	},
	skipText: {
		fontSize: ResponsiveFontSize.base,
		fontWeight: "600",
		color: "#94a3b8",
	},

	// --- Bố cục cho trang 1, 2, 3 ---
	graphicContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	bottomCard: {
		backgroundColor: "white",
		borderTopLeftRadius: ResponsiveBorderRadius.xl,
		borderTopRightRadius: ResponsiveBorderRadius.xl,
		padding: ResponsiveSpacing.xl,
		paddingTop: ResponsiveSpacing.xxl,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -10 },
		shadowOpacity: 0.03,
		shadowRadius: 30,
		elevation: 10,
		flexDirection: "column",
		justifyContent: "space-between",
		minHeight: getResponsiveHeight(0.35),
	},
	title: {
		fontSize: ResponsiveFontSize["4xl"],
		fontWeight: "800",
		color: "#0f172a",
		lineHeight: ResponsiveFontSize["4xl"] * 1.2,
		marginBottom: ResponsiveSpacing.m,
		flex: 0,
	},
	subtitle: {
		fontSize: ResponsiveFontSize.base,
		fontWeight: "500",
		color: "#64748b",
		lineHeight: ResponsiveFontSize.base * 1.5,
		flex: 0,
	},
	footerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: ResponsiveSpacing.l,
	},

	// --- Dots ---
	dotsRowCard: {
		flexDirection: "row",
		alignItems: "center",
	},
	dotsRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: ResponsiveSpacing.xxxl,
	},
	dot: { height: scale(8), borderRadius: scale(4), marginHorizontal: scale(4) },
	dotActive: { width: scale(24), backgroundColor: "#4f46e5" }, // gradient giả lập bằng màu solid
	dotInactive: { width: scale(8), backgroundColor: "#e2e8f0" },
	dotWhiteActive: { width: scale(24), backgroundColor: "white" },
	dotWhiteInactive: {
		width: scale(8),
		backgroundColor: "rgba(199, 210, 254, 0.5)",
	}, // indigo-200

	// --- Buttons ---
	arrowBtn: {
		width: scale(56),
		height: scale(56),
		backgroundColor: "white",
		borderWidth: scale(2),
		borderColor: "#e2e8f0",
		borderRadius: scale(28),
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: scale(4) },
		shadowOpacity: 0.1,
		shadowRadius: scale(6),
		elevation: 4,
		flexShrink: 0,
		marginBottom: ResponsiveSpacing.xl,
	},
	getStartedBtn: {
		width: "100%",
		backgroundColor: "white",
		paddingVertical: ResponsiveSpacing.l,
		borderRadius: ResponsiveBorderRadius.lg,
		alignItems: "center",
		shadowColor: "#312e81",
		shadowOffset: { width: 0, height: scale(10) },
		shadowOpacity: 0.3,
		shadowRadius: scale(20),
		elevation: 10,
		marginBottom: ResponsiveSpacing.l,
	},
	getStartedText: {
		color: "#4338ca",
		fontSize: ResponsiveFontSize.xl,
		fontWeight: "800",
	},

	// === STYLES CHO GRAPHICS ===
	g1Card1: {
		position: "absolute",
		width: scale(160),
		height: scale(208),
		backgroundColor: "white",
		borderWidth: scale(4),
		borderColor: "#cbd5e1",
		borderRadius: ResponsiveBorderRadius.base,
		transform: [{ rotate: "-15deg" }, { scale: 1.1 }],
		alignItems: "center",
		justifyContent: "center",
		shadowOpacity: 0.1,
	},
	g1Card2: {
		position: "absolute",
		width: scale(160),
		height: scale(208),
		backgroundColor: "white",
		borderWidth: scale(4),
		borderColor: "#cbd5e1",
		borderRadius: ResponsiveBorderRadius.base,
		transform: [
			{ translateX: scale(48) },
			{ translateY: scale(24) },
			{ rotate: "10deg" },
			{ scale: 1.1 },
		],
		alignItems: "center",
		justifyContent: "center",
		shadowOpacity: 0.1,
	},
	g1Card3: {
		position: "absolute",
		width: scale(160),
		height: scale(208),
		backgroundColor: "white",
		borderWidth: scale(4),
		borderColor: "#0f172a",
		borderRadius: ResponsiveBorderRadius.base,
		transform: [{ rotate: "-2deg" }, { scale: 1.1 }],
		alignItems: "center",
		justifyContent: "center",
		shadowOpacity: 0.2,
		shadowOffset: { width: 0, height: scale(10) },
		shadowRadius: scale(20),
		elevation: 10,
	},

	// Graphic 2
	g2Container: { alignItems: "center", justifyContent: "center" },
	g2Box1: {
		width: scale(208),
		height: scale(128),
		backgroundColor: "rgba(255,255,255,0.1)",
		borderRadius: ResponsiveBorderRadius.xl,
		borderWidth: scale(2),
		borderColor: "rgba(255,255,255,0.2)",
		alignItems: "center",
		justifyContent: "center",
		padding: ResponsiveSpacing.m,
	},
	g2Box2: {
		width: scale(208),
		height: scale(128),
		backgroundColor: "white",
		borderRadius: ResponsiveBorderRadius.xl,
		borderWidth: scale(1),
		borderColor: "#e2e8f0",
		padding: ResponsiveSpacing.m,
		justifyContent: "center",
	},

	// Graphic 3
	g3Blur1: {
		position: "absolute",
		top: scale(-80),
		right: scale(-80),
		width: scale(320),
		height: scale(320),
		backgroundColor: "#ede9fe",
		borderRadius: scale(160),
		opacity: 0.6,
	},
	g3Blur2: {
		position: "absolute",
		bottom: scale(-80),
		left: scale(-80),
		width: scale(320),
		height: scale(320),
		backgroundColor: "#e0e7ff",
		borderRadius: scale(160),
		opacity: 0.6,
	},
	g3Folder1: {
		position: "absolute",
		width: scale(144),
		height: scale(144),
		backgroundColor: "white",
		borderWidth: scale(1),
		borderColor: "#e2e8f0",
		borderRadius: ResponsiveBorderRadius.xl,
		padding: ResponsiveSpacing.m,
		transform: [
			{ translateX: scale(-64) },
			{ translateY: scale(-32) },
			{ rotate: "-5deg" },
		],
		shadowOpacity: 0.1,
		elevation: 5,
	},
	g3FolderIcon1: {
		width: scale(40),
		height: scale(40),
		backgroundColor: "#eef2ff",
		borderRadius: ResponsiveBorderRadius.sm,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: ResponsiveSpacing.xl,
	},
	g3Folder2: {
		position: "absolute",
		width: scale(144),
		height: scale(144),
		backgroundColor: "white",
		borderWidth: scale(1),
		borderColor: "#e2e8f0",
		borderRadius: ResponsiveBorderRadius.xl,
		padding: ResponsiveSpacing.m,
		transform: [
			{ translateX: scale(64) },
			{ translateY: scale(32) },
			{ rotate: "5deg" },
		],
		shadowOpacity: 0.1,
		elevation: 5,
	},
	g3FolderIcon2: {
		width: scale(40),
		height: scale(40),
		backgroundColor: "#ecfdf5",
		borderRadius: ResponsiveBorderRadius.sm,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: ResponsiveSpacing.xl,
	},
	g3FolderText: { fontWeight: "700", color: "#0f172a" },
	g3SearchIcon: {
		width: scale(80),
		height: scale(80),
		borderRadius: scale(40),
		borderWidth: scale(4),
		borderColor: "white",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#8b5cf6",
		shadowOpacity: 0.4,
		shadowOffset: { width: 0, height: scale(10) },
		shadowRadius: scale(20),
		elevation: 10,
	},

	// Graphic 4 (Full Screen)
	s4Content: { alignItems: "center", marginBottom: ResponsiveSpacing.xxxl },
	s4LogoBox: {
		width: scale(96),
		height: scale(96),
		backgroundColor: "white",
		borderRadius: ResponsiveBorderRadius.xl,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#312e81",
		shadowOpacity: 0.2,
		shadowOffset: { width: 0, height: scale(10) },
		shadowRadius: scale(20),
		marginBottom: ResponsiveSpacing.xl,
	},
	s4LogoInner: {
		width: scale(80),
		height: scale(80),
		borderRadius: ResponsiveBorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	s4LogoText: {
		fontSize: ResponsiveFontSize["5xl"],
		fontWeight: "800",
		color: "white",
	},
	s4Title: {
		fontSize: ResponsiveFontSize["6xl"],
		fontWeight: "800",
		color: "white",
		textAlign: "center",
		lineHeight: ResponsiveFontSize["6xl"] * 1.1,
		marginBottom: ResponsiveSpacing.s,
	},
	s4Subtitle: {
		fontSize: ResponsiveFontSize.lg,
		fontWeight: "600",
		color: "#e0e7ff",
		textAlign: "center",
		lineHeight: ResponsiveFontSize.lg * 1.5,
		paddingHorizontal: ResponsiveSpacing.m,
	},
});

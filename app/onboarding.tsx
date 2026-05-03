// app/onboarding.tsx
import React, { useState, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	FlatList,
	Dimensions,
	Animated,
	Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Icon } from "../src/components/common/Icon";
import { COLORS } from "../src/constants/theme";

const { width, height } = Dimensions.get("window");

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
					style={styles.slideFull}
				>
					<View style={styles.s4Content}>
						<View style={styles.s4LogoBox}>
							<LinearGradient
								colors={["#4f46e5", "#8b5cf6"]}
								style={styles.s4LogoInner}
							>
								<Text style={styles.s4LogoText}>S</Text>
							</LinearGradient>
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

					<TouchableOpacity style={styles.getStartedBtn} onPress={handleNext}>
						<Text style={styles.getStartedText}>Get Started</Text>
					</TouchableOpacity>
				</LinearGradient>
			);
		}

		// TRANG 1, 2, 3: CHIA HAI NỬA (GRAPHIC + BOTTOM CARD)
		return (
			<View style={styles.slide}>
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
			</View>
		);
	};

	return (
		<View style={styles.container}>
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
					setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
				}}
				ref={slidesRef}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#f8fafc" },
	slide: { width, height },
	slideFull: {
		width,
		height,
		padding: 32,
		justifyContent: "center",
		alignItems: "center",
	},

	skipBtn: {
		position: "absolute",
		top: Platform.OS === "ios" ? 60 : 40,
		right: 32,
		zIndex: 10,
	},
	skipText: { fontSize: 14, fontWeight: "600", color: "#94a3b8" },

	// --- Bố cục cho trang 1, 2, 3 ---
	graphicContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	bottomCard: {
		height: 320,
		backgroundColor: "white",
		borderTopLeftRadius: 32,
		borderTopRightRadius: 32,
		padding: 32,
		paddingTop: 40,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -10 },
		shadowOpacity: 0.03,
		shadowRadius: 30,
		elevation: 10,
	},
	title: {
		fontSize: 24,
		fontWeight: "800",
		color: "#0f172a",
		lineHeight: 32,
		marginBottom: 16,
	},
	subtitle: {
		fontSize: 14,
		fontWeight: "500",
		color: "#64748b",
		lineHeight: 22,
		maxWidth: "90%",
	},
	footerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
		flex: 1,
	},

	// --- Dots ---
	dotsRowCard: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
	dotsRow: { flexDirection: "row", alignItems: "center", marginBottom: 48 },
	dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
	dotActive: { width: 24, backgroundColor: "#4f46e5" }, // gradient giả lập bằng màu solid
	dotInactive: { width: 8, backgroundColor: "#e2e8f0" },
	dotWhiteActive: { width: 24, backgroundColor: "white" },
	dotWhiteInactive: { width: 8, backgroundColor: "rgba(199, 210, 254, 0.5)" }, // indigo-200

	// --- Buttons ---
	arrowBtn: {
		width: 56,
		height: 56,
		backgroundColor: "white",
		borderWidth: 2,
		borderColor: "#e2e8f0",
		borderRadius: 28,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 4,
	},
	getStartedBtn: {
		width: "100%",
		backgroundColor: "white",
		paddingVertical: 18,
		borderRadius: 16,
		alignItems: "center",
		shadowColor: "#312e81",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.3,
		shadowRadius: 20,
		elevation: 10,
	},
	getStartedText: { color: "#4338ca", fontSize: 18, fontWeight: "800" },

	// === STYLES CHO GRAPHICS ===

	// Graphic 1
	g1Card1: {
		position: "absolute",
		width: 160,
		height: 208,
		backgroundColor: "white",
		borderWidth: 4,
		borderColor: "#cbd5e1",
		borderRadius: 12,
		transform: [{ rotate: "-15deg" }, { scale: 1.1 }],
		alignItems: "center",
		justifyContent: "center",
		shadowOpacity: 0.1,
	},
	g1Card2: {
		position: "absolute",
		width: 160,
		height: 208,
		backgroundColor: "white",
		borderWidth: 4,
		borderColor: "#cbd5e1",
		borderRadius: 12,
		transform: [
			{ translateX: 48 },
			{ translateY: 24 },
			{ rotate: "10deg" },
			{ scale: 1.1 },
		],
		alignItems: "center",
		justifyContent: "center",
		shadowOpacity: 0.1,
	},
	g1Card3: {
		position: "absolute",
		width: 160,
		height: 208,
		backgroundColor: "white",
		borderWidth: 4,
		borderColor: "#0f172a",
		borderRadius: 12,
		transform: [{ rotate: "-2deg" }, { scale: 1.1 }],
		alignItems: "center",
		justifyContent: "center",
		shadowOpacity: 0.2,
		shadowOffset: { width: 0, height: 10 },
		shadowRadius: 20,
		elevation: 10,
	},

	// Graphic 2
	g2Container: { alignItems: "center", justifyContent: "center" },
	g2Box1: {
		width: 208,
		height: 128,
		backgroundColor: "rgba(255,255,255,0.1)",
		borderRadius: 24,
		borderWidth: 2,
		borderColor: "rgba(255,255,255,0.2)",
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
	},
	g2Box2: {
		width: 208,
		height: 128,
		backgroundColor: "white",
		borderRadius: 24,
		borderWidth: 1,
		borderColor: "#e2e8f0",
		padding: 16,
		justifyContent: "center",
	},

	// Graphic 3
	g3Blur1: {
		position: "absolute",
		top: -80,
		right: -80,
		width: 320,
		height: 320,
		backgroundColor: "#ede9fe",
		borderRadius: 160,
		opacity: 0.6,
	},
	g3Blur2: {
		position: "absolute",
		bottom: -80,
		left: -80,
		width: 320,
		height: 320,
		backgroundColor: "#e0e7ff",
		borderRadius: 160,
		opacity: 0.6,
	},
	g3Folder1: {
		position: "absolute",
		width: 144,
		height: 144,
		backgroundColor: "white",
		borderWidth: 1,
		borderColor: "#e2e8f0",
		borderRadius: 24,
		padding: 16,
		transform: [{ translateX: -64 }, { translateY: -32 }, { rotate: "-5deg" }],
		shadowOpacity: 0.1,
		elevation: 5,
	},
	g3FolderIcon1: {
		width: 40,
		height: 40,
		backgroundColor: "#eef2ff",
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 32,
	},
	g3Folder2: {
		position: "absolute",
		width: 144,
		height: 144,
		backgroundColor: "white",
		borderWidth: 1,
		borderColor: "#e2e8f0",
		borderRadius: 24,
		padding: 16,
		transform: [{ translateX: 64 }, { translateY: 32 }, { rotate: "5deg" }],
		shadowOpacity: 0.1,
		elevation: 5,
	},
	g3FolderIcon2: {
		width: 40,
		height: 40,
		backgroundColor: "#ecfdf5",
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 32,
	},
	g3FolderText: { fontWeight: "700", color: "#0f172a" },
	g3SearchIcon: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 4,
		borderColor: "white",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#8b5cf6",
		shadowOpacity: 0.4,
		shadowOffset: { width: 0, height: 10 },
		shadowRadius: 20,
		elevation: 10,
	},

	// Graphic 4 (Full Screen)
	s4Content: { alignItems: "center", marginBottom: 64 },
	s4LogoBox: {
		width: 96,
		height: 96,
		backgroundColor: "white",
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#312e81",
		shadowOpacity: 0.2,
		shadowOffset: { width: 0, height: 10 },
		shadowRadius: 20,
		marginBottom: 40,
	},
	s4LogoInner: {
		width: 80,
		height: 80,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	s4LogoText: { fontSize: 40, fontWeight: "800", color: "white" },
	s4Title: {
		fontSize: 36,
		fontWeight: "800",
		color: "white",
		textAlign: "center",
		lineHeight: 44,
		marginBottom: 16,
	},
	s4Subtitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#e0e7ff",
		textAlign: "center",
		lineHeight: 24,
		paddingHorizontal: 16,
	},
});

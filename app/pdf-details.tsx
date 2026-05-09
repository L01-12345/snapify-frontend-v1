// app/pdf-preview.tsx
import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { COLORS } from "../src/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PdfDetailsScreen() {
	const router = useRouter();
	const { pdfUrl, title } = useLocalSearchParams<{
		pdfUrl: string;
		title: string;
	}>();
	const [isLoading, setIsLoading] = useState(true);

	// Hàm xử lý URL hiển thị PDF
	const getViewerUrl = (url: string) => {
		if (!url) return "";
		if (Platform.OS === "ios") {
			return url;
		}
		// Bọc URL PDF qua Google Docs Viewer cho Android
		return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
					<Feather name="arrow-left" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
				<Text style={styles.headerTitle} numberOfLines={1}>
					{title || "PDF Document"}
				</Text>
				<View style={styles.placeholder} />
			</View>

			{/* Nội dung PDF */}
			<View style={styles.content}>
				{isLoading && (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color={COLORS.primary} />
						<Text style={styles.loadingText}>Loading document...</Text>
					</View>
				)}

				{pdfUrl ? (
					<WebView
						source={{ uri: getViewerUrl(pdfUrl) }}
						style={styles.webview}
						onLoadEnd={() => setIsLoading(false)}
						scalesPageToFit={true}
					/>
				) : (
					<View style={styles.errorContainer}>
						<Feather name="alert-circle" size={48} color={COLORS.slate400} />
						<Text style={styles.errorText}>No PDF URL provided</Text>
					</View>
				)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.white },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		height: 60,
		paddingHorizontal: 24,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate100,
	},
	iconBtn: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: COLORS.slate50,
		borderRadius: 20,
	},
	headerTitle: {
		flex: 1,
		textAlign: "center",
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.slate900,
		marginHorizontal: 16,
	},
	placeholder: { width: 40 },
	content: { flex: 1, backgroundColor: COLORS.slate50 },
	webview: { flex: 1, backgroundColor: "transparent" },
	loadingContainer: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 1,
		backgroundColor: COLORS.slate50,
	},
	loadingText: {
		marginTop: 12,
		color: COLORS.slate500,
		fontWeight: "500",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		marginTop: 16,
		color: COLORS.slate500,
		fontSize: 16,
		fontWeight: "500",
	},
});

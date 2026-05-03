import React from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	ScrollView,
	Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../src/constants/theme";
import { Icon } from "../src/components/common/Icon";
import { useLocalSearchParams } from "expo-router";

// import * as ImagePicker from "expo-image-picker";
// import * as FileSystem from "expo-file-system";
// import * as ImageManipulator from "expo-image-manipulator";
import { batchApi } from "../src/api/batchApi";

export default function BatchPreviewScreen() {
	const router = useRouter();
	const { images } = useLocalSearchParams();
	const imageUris: string[] = images ? JSON.parse(images as string) : [];
	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<Feather name="arrow-left" size={24} color={COLORS.slate800} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Batch Preview</Text>
				<TouchableOpacity style={styles.editBtn}>
					<Text style={styles.editBtnText}>Edit</Text>
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={styles.gridContainer}>
				{imageUris.map((uri, index) => (
					<View key={index} style={styles.pageCard}>
						<LinearGradient
							colors={[COLORS.primary, COLORS.primaryEnd]}
							style={styles.pageNumber}
						>
							<Text style={styles.pageNumberText}>{index + 1}</Text>
						</LinearGradient>
						{/* Hiển thị ảnh thay vì Text giả */}
						<Image
							source={{ uri }}
							style={{ width: "100%", height: "100%", borderRadius: 8 }}
							resizeMode="cover"
						/>
					</View>
				))}

				{/* Add Page Button */}
				<TouchableOpacity
					style={styles.addPageCard}
					onPress={() => router.back()}
				>
					<Text style={styles.addPagePlus}>+</Text>
					<Text style={styles.addPageText}>Add Page</Text>
				</TouchableOpacity>
			</ScrollView>

			{/* Bottom Actions */}
			<View style={styles.bottomBar}>
				<View style={styles.rowActions}>
					<TouchableOpacity style={styles.secondaryBtn}>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Icon
								name="refresh-ccw"
								size={16}
								color={COLORS.slate700}
								style={{ marginRight: 8 }}
							/>
							<Text style={styles.secondaryBtnText}>Reorder</Text>
						</View>
					</TouchableOpacity>
					<TouchableOpacity style={styles.dangerBtn}>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Icon
								name="trash-2"
								size={16}
								color="#DC2626"
								style={{ marginRight: 8 }}
							/>
							<Text style={styles.dangerBtnText}>Delete</Text>
						</View>
					</TouchableOpacity>
				</View>
				<TouchableOpacity
					style={styles.primaryBtn}
					onPress={() =>
						router.push({
							pathname: "/pdf-preview",
							params: { images: JSON.stringify(imageUris) },
						})
					}
				>
					<LinearGradient
						colors={[COLORS.primary, COLORS.primaryEnd]}
						style={styles.primaryBtnGradient}
					>
						<Text style={styles.primaryBtnText}>Generate PDF</Text>
					</LinearGradient>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.slate50 },
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
	editBtn: {
		backgroundColor: "#EEF2FF",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
	},
	editBtnText: { color: COLORS.primary, fontWeight: "600", fontSize: 14 },
	gridContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 16,
		padding: 24,
	},
	pageCard: {
		width: "47%",
		aspectRatio: 0.75,
		backgroundColor: COLORS.white,
		borderRadius: 16,
		padding: 12,
		borderWidth: 1,
		borderColor: COLORS.slate200,
		shadowColor: COLORS.slate200,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.5,
		shadowRadius: 4,
		elevation: 2,
	},
	pageNumber: {
		position: "absolute",
		top: -8,
		right: -8,
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: COLORS.white,
		zIndex: 10,
	},
	pageNumberText: { color: COLORS.white, fontSize: 12, fontWeight: "bold" },
	docTitle: {
		fontSize: 14,
		fontWeight: "700",
		color: COLORS.slate900,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.slate100,
		paddingBottom: 4,
		marginBottom: 8,
	},
	docPreview: { fontSize: 10, color: COLORS.slate600, lineHeight: 16 },
	addPageCard: {
		width: "47%",
		aspectRatio: 0.75,
		backgroundColor: "#EEF2FF",
		borderRadius: 16,
		borderWidth: 2,
		borderStyle: "dashed",
		borderColor: "#C7D2FE",
		alignItems: "center",
		justifyContent: "center",
	},
	addPagePlus: {
		fontSize: 36,
		fontWeight: "300",
		color: COLORS.primary,
		marginBottom: 4,
	},
	addPageText: { fontSize: 12, fontWeight: "700", color: COLORS.primary },
	bottomBar: {
		backgroundColor: COLORS.white,
		padding: 24,
		borderTopWidth: 1,
		borderTopColor: COLORS.slate200,
		gap: 16,
	},
	rowActions: { flexDirection: "row", gap: 16 },
	secondaryBtn: {
		flex: 1,
		paddingVertical: 12,
		borderWidth: 2,
		borderColor: COLORS.slate200,
		borderRadius: 12,
		alignItems: "center",
	},
	secondaryBtnText: { color: COLORS.slate700, fontWeight: "600", fontSize: 14 },
	dangerBtn: {
		flex: 1,
		paddingVertical: 12,
		backgroundColor: "#FEF2F2",
		borderWidth: 1,
		borderColor: "#FEE2E2",
		borderRadius: 12,
		alignItems: "center",
	},
	dangerBtnText: { color: "#DC2626", fontWeight: "600", fontSize: 14 },
	primaryBtn: {
		borderRadius: 16,
		overflow: "hidden",
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 10,
	},
	primaryBtnGradient: { paddingVertical: 16, alignItems: "center" },
	primaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});

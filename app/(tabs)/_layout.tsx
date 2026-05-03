// app/(tabs)/_layout.tsx
import React from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Icon } from "../../src/components/common/Icon";
import { COLORS } from "../../src/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function TabLayout() {
	const router = useRouter();
	const insets = useSafeAreaInsets(); // Lấy thông số vùng an toàn của màn hình

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false, // Ẩn chữ dưới icon
				tabBarStyle: {
					position: "absolute",
					bottom: 0,
					left: 0,
					right: 0,
					backgroundColor: COLORS.white,
					borderTopWidth: 1,
					borderTopColor: "#F1F5F9", // Viền trên mỏng và nhạt giống thiết kế
					// Cộng thêm insets.bottom để thanh menu không bị thanh điều hướng ảo của máy che mất
					height: 65 + insets.bottom,
					paddingBottom: insets.bottom,
					elevation: 10,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: -4 },
					shadowOpacity: 0.05,
					shadowRadius: 10,
				},
			}}
		>
			{/* 1. Tab Home (Dashboard) */}
			<Tabs.Screen
				name="dashboard"
				options={{
					tabBarIcon: ({ focused }) => (
						<View style={styles.iconContainer}>
							<Icon
								name="home"
								size={24}
								color={focused ? COLORS.primary : COLORS.slate400}
								style={{ opacity: focused ? 1 : 0.4 }}
							/>
						</View>
					),
				}}
			/>

			{/* 2. Tab Search */}
			<Tabs.Screen
				name="search"
				options={{
					tabBarIcon: ({ focused }) => (
						<View style={styles.iconContainer}>
							<Icon
								name="search"
								size={24}
								color={focused ? COLORS.primary : COLORS.slate400}
								style={{ opacity: focused ? 1 : 0.4 }}
							/>
						</View>
					),
				}}
			/>

			{/* 3. Nút Camera Nổi (Floating Action Button) ở giữa */}
			<Tabs.Screen
				name="camera-button"
				options={{
					tabBarIcon: () => (
						<View style={styles.cameraWrapper}>
							<LinearGradient
								colors={[COLORS.primary, COLORS.primaryEnd]} // Chuyển sắc từ Indigo sang Violet
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.cameraButton}
							>
								<Feather name="camera" size={28} color={COLORS.white} />
							</LinearGradient>
						</View>
					),
				}}
				listeners={() => ({
					tabPress: (e) => {
						e.preventDefault(); // Chặn hành vi chuyển tab mặc định

						router.push("/snap");
					},
				})}
			/>

			{/* 4. Tab Folders */}
			<Tabs.Screen
				name="folders"
				options={{
					tabBarIcon: ({ focused }) => (
						<View style={styles.iconContainer}>
							<Icon
								name="folder"
								size={24}
								color={focused ? COLORS.primary : COLORS.slate400}
								style={{ opacity: focused ? 1 : 0.4 }}
							/>
						</View>
					),
				}}
			/>

			{/* 5. Tab Profile */}
			<Tabs.Screen
				name="profile"
				options={{
					tabBarIcon: ({ focused }) => (
						<View style={styles.iconContainer}>
							<Icon
								name="profile"
								size={24}
								color={focused ? COLORS.primary : COLORS.slate400}
								style={{ opacity: focused ? 1 : 0.4 }}
							/>
						</View>
					),
				}}
			/>
		</Tabs>
	);
}

const styles = StyleSheet.create({
	iconContainer: {
		alignItems: "center",
		justifyContent: "center",
		width: 50,
		height: 50,
		// Đẩy icon lên một chút xíu để căn giữa cân đối hơn
		marginTop: Platform.OS === "android" ? 4 : 8,
	},
	emojiIcon: {
		fontSize: 24, // Kích thước emoji vừa vặn
	},
	cameraWrapper: {
		top: Platform.OS === "ios" ? -20 : -24,
		justifyContent: "center",
		alignItems: "center",
		// Bóng đổ cho vùng bao ngoài nút (Shadow cho iOS)
		shadowColor: "#4F46E5",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.4,
		shadowRadius: 10,
		elevation: 8, // Bóng đổ cho Android
	},
	cameraButton: {
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: "center",
		alignItems: "center",
		// borderWidth: 4,
		// borderColor: COLORS.white,
	},
});

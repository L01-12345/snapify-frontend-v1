import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	SafeAreaView,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../src/constants/theme";
import { Input } from "../../src/components/common/Input";
import { Button } from "../../src/components/common/Button";

export default function LoginScreen() {
	const router = useRouter();

	return (
		<SafeAreaView style={styles.safeArea}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.container}
			>
				<View style={styles.content}>
					{/* Header & Logo */}
					<View style={styles.header}>
						<LinearGradient
							colors={[COLORS.primary, COLORS.primaryEnd]}
							style={styles.logoBox}
						>
							<Text style={styles.logoText}>S</Text>
						</LinearGradient>
						<Text style={styles.title}>Welcome back</Text>
						<Text style={styles.subtitle}>Log in to your Snapify account</Text>
					</View>

					{/* Form */}
					<Input
						label="Email Address"
						placeholder="hello@example.com"
						keyboardType="email-address"
						autoCapitalize="none"
					/>
					<Input label="Password" placeholder="••••••••" isPassword />

					<TouchableOpacity style={styles.forgotPass}>
						<Text style={styles.forgotPassText}>Forgot password?</Text>
					</TouchableOpacity>

					<Button
						title="Log In"
						onPress={() => console.log("Đăng nhập")}
						style={{ marginTop: 8 }}
					/>

					{/* Divider */}
					<View style={styles.dividerContainer}>
						<View style={styles.dividerLine} />
						<Text style={styles.dividerText}>OR CONTINUE WITH</Text>
						<View style={styles.dividerLine} />
					</View>

					{/* Social Buttons (Làm đơn giản dạng View) */}
					<View style={styles.socialContainer}>
						<TouchableOpacity style={styles.socialBtn}>
							<Text style={styles.socialIcon}>G</Text>
							<Text style={styles.socialText}>Google</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.socialBtn}>
							<Text style={styles.socialIcon}></Text>
							<Text style={styles.socialText}>Apple</Text>
						</TouchableOpacity>
					</View>

					{/* Footer */}
					<View style={styles.footer}>
						<Text style={styles.footerText}>Don't have an account? </Text>
						<TouchableOpacity onPress={() => router.push("/register")}>
							<Text style={styles.footerLink}>Sign up</Text>
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.white },
	container: { flex: 1 },
	content: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
	header: { alignItems: "center", marginBottom: 40 },
	logoBox: {
		width: 64,
		height: 64,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 24,
	},
	logoText: { color: COLORS.white, fontSize: 32, fontWeight: "bold" },
	title: { fontSize: 28, fontWeight: "800", color: COLORS.slate900 },
	subtitle: {
		fontSize: 14,
		color: COLORS.slate500,
		marginTop: 8,
		fontWeight: "500",
	},
	forgotPass: { alignItems: "flex-end", marginBottom: 24, marginTop: 4 },
	forgotPassText: { fontSize: 12, fontWeight: "700", color: COLORS.primary },
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 32,
	},
	dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.slate200 },
	dividerText: {
		fontSize: 12,
		fontWeight: "600",
		color: COLORS.slate400,
		paddingHorizontal: 12,
	},
	socialContainer: { flexDirection: "row", gap: 16 },
	socialBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: COLORS.white,
		borderWidth: 2,
		borderColor: COLORS.slate200,
		paddingVertical: 14,
		borderRadius: 16,
		gap: 8,
	},
	socialIcon: { fontSize: 18 },
	socialText: { fontSize: 14, fontWeight: "700", color: COLORS.slate700 },
	footer: { flexDirection: "row", justifyContent: "center", marginTop: 40 },
	footerText: { fontSize: 14, color: COLORS.slate500, fontWeight: "500" },
	footerLink: { fontSize: 14, color: COLORS.primary, fontWeight: "700" },
});

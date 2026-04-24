import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	SafeAreaView,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../../src/constants/theme";
import { Input } from "../../src/components/common/Input";
import { Button } from "../../src/components/common/Button";

export default function RegisterScreen() {
	const router = useRouter();

	return (
		<SafeAreaView style={styles.safeArea}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.header}>
						<Text style={styles.title}>Create account</Text>
						<Text style={styles.subtitle}>Start your journey with Snapify</Text>
					</View>

					<Input label="Full Name" placeholder="John Doe" />
					<Input
						label="Email Address"
						placeholder="hello@example.com"
						keyboardType="email-address"
					/>
					<Input label="Password" placeholder="Min. 8 characters" isPassword />

					<Button
						title="Sign Up"
						onPress={() => console.log("Đăng ký")}
						style={{ marginTop: 32 }}
					/>

					<Text style={styles.termsText}>
						By signing up, you agree to our{" "}
						<Text style={styles.termsLink}>Terms</Text> and{" "}
						<Text style={styles.termsLink}>Privacy Policy</Text>.
					</Text>

					<View style={styles.footer}>
						<Text style={styles.footerText}>Already have an account? </Text>
						<TouchableOpacity onPress={() => router.back()}>
							<Text style={styles.footerLink}>Log in</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.white },
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 24,
		paddingTop: 48,
		paddingBottom: 24,
	},
	header: { marginBottom: 32 },
	title: { fontSize: 32, fontWeight: "800", color: COLORS.slate900 },
	subtitle: {
		fontSize: 14,
		color: COLORS.slate500,
		marginTop: 8,
		fontWeight: "500",
	},
	termsText: {
		fontSize: 12,
		textAlign: "center",
		color: COLORS.slate400,
		marginTop: 16,
		lineHeight: 20,
		paddingHorizontal: 16,
	},
	termsLink: {
		fontWeight: "bold",
		color: COLORS.slate700,
		textDecorationLine: "underline",
	},
	footer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: "auto",
		paddingTop: 32,
	},
	footerText: { fontSize: 14, color: COLORS.slate500, fontWeight: "500" },
	footerLink: { fontSize: 14, color: COLORS.primary, fontWeight: "700" },
});

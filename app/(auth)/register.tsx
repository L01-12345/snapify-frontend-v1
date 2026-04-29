import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	SafeAreaView,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TouchableWithoutFeedback,
	Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../../src/constants/theme";
import { Input } from "../../src/components/common/Input";
import { Button } from "../../src/components/common/Button";

import { Alert, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { authApi } from "../../src/api/authApi";

export default function RegisterScreen() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [displayName, setDisplayName] = useState("");

	const handleRegister = async () => {
		try {
			setLoading(true);
			const response = await authApi.register({ email, password, displayName }); //

			Alert.alert("Success", "Your account has been created.", [
				{ text: "Log in now", onPress: () => router.back() },
			]);
		} catch (error: any) {
			Alert.alert(
				"Registration Error",
				error.message || "Unable to create account.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<ScrollView
						contentContainerStyle={styles.scrollContent}
						showsVerticalScrollIndicator={false}
					>
						<View style={styles.header}>
							<Text style={styles.title}>Create account</Text>
							<Text style={styles.subtitle}>
								Start your journey with Snapify
							</Text>
						</View>

						<Input
							label="Full Name"
							placeholder="John Doe"
							value={displayName}
							onChangeText={setDisplayName}
							testID="reg-name"
						/>
						<Input
							label="Email Address"
							placeholder="hello@example.com"
							keyboardType="email-address"
							value={email}
							onChangeText={setEmail}
							testID="reg-email"
						/>
						<Input
							label="Password"
							placeholder="Min. 6 characters"
							value={password}
							onChangeText={setPassword}
							isPassword
							testID="reg-password"
						/>

						<Button
							title="Sign Up"
							onPress={handleRegister}
							style={{ marginTop: 32 }}
							disabled={loading}
							testID="reg-btn"
						>
							{loading && <ActivityIndicator color="white" />}
						</Button>

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
				</TouchableWithoutFeedback>
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

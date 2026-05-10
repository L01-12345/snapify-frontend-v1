import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	// SafeAreaView,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
	ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../src/constants/theme";
import { Input } from "../../src/components/common/Input";
import { Button } from "../../src/components/common/Button";
import {
	ResponsiveFontSize,
	ResponsiveSpacing,
	ResponsiveDimensions,
	ResponsiveBorderRadius,
	scale,
} from "../../src/utils/responsive";

import { Alert, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { authApi } from "../../src/api/authApi";

import { useDispatch } from "react-redux";
import { setCredentials } from "../../src/store/slices/authSlice";
import { Logo } from "../../src/components/common/Logo";

import * as Sentry from "@sentry/react-native";
import { AntDesign } from "@expo/vector-icons";

export default function LoginScreen() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please enter all required information.");
			return;
		}

		try {
			setLoading(true);
			const response = await authApi.login({ email, password });

			// API login trả về { status, message, data: { token, user } }
			if (response.data?.token && response.data?.user) {
				// 1. Lưu token vào bộ nhớ vật lý của máy
				await SecureStore.setItemAsync("access_token", response.data.token);

				// 2. LƯU THÔNG TIN VÀO REDUX STORE
				dispatch(
					setCredentials({
						user: response.data.user,
						token: response.data.token,
					}),
				);

				Sentry.setUser({
					id: response.data.user.id,
					email: response.data.user.email,
					username: response.data.user.displayName,
				});
				// 3. Chuyển hướng
				router.replace("/(tabs)/dashboard");
			}
		} catch (error: any) {
			Alert.alert(
				"Login Failed",
				error.message || "Please check your account credentials.",
			);
		} finally {
			setLoading(false);
		}
	};
	return (
		<SafeAreaView style={styles.safeArea}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.container}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<ScrollView contentContainerStyle={styles.content}>
						{/* Header & Logo */}
						<View style={styles.header}>
							{/* <LinearGradient
								colors={[COLORS.primary, COLORS.primaryEnd]}
								style={styles.logoBox}
							>
								<Text style={styles.logoText}>S</Text>
							</LinearGradient> */}
							<Logo width={64} height={64} />
							<Text style={styles.title}>Welcome back</Text>
							<Text style={styles.subtitle}>
								Log in to your Snapify account
							</Text>
						</View>

						{/* Form */}
						<Input
							label="Email Address"
							value={email}
							onChangeText={setEmail}
							autoCapitalize="none"
							testID="login-email"
						/>
						<Input
							label="Password"
							value={password}
							onChangeText={setPassword}
							isPassword
							testID="login-password"
						/>

						<TouchableOpacity style={styles.forgotPass}>
							<Text style={styles.forgotPassText}>Forgot password?</Text>
						</TouchableOpacity>

						<Button
							title={loading ? "" : "Log In"}
							onPress={handleLogin}
							disabled={loading}
							testID="login-btn"
						>
							{loading && <ActivityIndicator color="white" />}
						</Button>

						{/* Divider */}
						<View style={styles.dividerContainer}>
							<View style={styles.dividerLine} />
							<Text style={styles.dividerText}>OR CONTINUE WITH</Text>
							<View style={styles.dividerLine} />
						</View>

						{/* Social Buttons (Làm đơn giản dạng View) */}
						<View style={styles.socialContainer}>
							<TouchableOpacity style={styles.socialBtn}>
								<AntDesign style={styles.socialIcon} name="google" />
								<Text style={styles.socialText}>Google</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.socialBtn}>
								<AntDesign style={styles.socialIcon} name="apple" />
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
					</ScrollView>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.white },
	container: { flex: 1 },
	content: {
		flexGrow: 1,
		justifyContent: "center",
		paddingHorizontal: ResponsiveSpacing.l,
		paddingVertical: ResponsiveSpacing.xl,
	},
	header: { alignItems: "center", marginBottom: 40 },
	logoBox: {
		width: 64,
		height: 64,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 24,
	},
	logoText: {
		color: COLORS.white,
		fontSize: ResponsiveFontSize["5xl"],
		fontWeight: "bold",
	},
	title: {
		fontSize: ResponsiveFontSize["4xl"],
		fontWeight: "800",
		color: COLORS.slate900,
	},
	subtitle: {
		fontSize: ResponsiveFontSize["base"],
		color: COLORS.slate500,
		marginTop: 8,
		fontWeight: "500",
	},
	forgotPass: { alignItems: "flex-end", marginBottom: 24, marginTop: 4 },
	forgotPassText: {
		fontSize: ResponsiveFontSize["sm"],
		fontWeight: "700",
		color: COLORS.primary,
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 32,
	},
	dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.slate200 },
	dividerText: {
		fontSize: ResponsiveFontSize["sm"],
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
	socialIcon: { fontSize: ResponsiveFontSize["xl"] },
	socialText: {
		fontSize: ResponsiveFontSize["base"],
		fontWeight: "700",
		color: COLORS.slate700,
	},
	footer: { flexDirection: "row", justifyContent: "center", marginTop: 40 },
	footerText: {
		fontSize: ResponsiveFontSize["base"],
		color: COLORS.slate500,
		fontWeight: "500",
	},
	footerLink: {
		fontSize: ResponsiveFontSize["base"],
		color: COLORS.primary,
		fontWeight: "700",
	},
});

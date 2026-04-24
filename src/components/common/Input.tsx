import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	TextInputProps,
} from "react-native";
import { COLORS } from "../../constants/theme";

interface InputProps extends TextInputProps {
	label: string;
	error?: string;
	isPassword?: boolean;
}

export const Input = ({ label, error, isPassword, ...props }: InputProps) => {
	const [isFocused, setIsFocused] = useState(false);
	const [showPassword, setShowPassword] = useState(!isPassword);

	return (
		<View style={styles.container}>
			<Text style={[styles.label, error && styles.labelError]}>{label}</Text>
			<View
				style={[
					styles.inputContainer,
					isFocused && styles.inputFocused,
					error && styles.inputErrorBg,
				]}
			>
				<TextInput
					style={[styles.input, error && styles.inputTextError]}
					placeholderTextColor={COLORS.slate400}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					secureTextEntry={!showPassword}
					{...props}
				/>
				{isPassword && (
					<TouchableOpacity
						onPress={() => setShowPassword(!showPassword)}
						style={styles.eyeIcon}
					>
						<Text style={{ fontSize: 16 }}>{showPassword ? "🙈" : "👁️"}</Text>
					</TouchableOpacity>
				)}
			</View>
			{error && <Text style={styles.errorText}>{error}</Text>}
		</View>
	);
};

const styles = StyleSheet.create({
	container: { marginBottom: 16 },
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.slate700,
		marginBottom: 6,
	},
	labelError: { color: COLORS.error },
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.slate50,
		borderWidth: 2,
		borderColor: COLORS.slate200,
		borderRadius: 16,
		paddingHorizontal: 20,
		height: 54,
	},
	inputFocused: { borderColor: COLORS.primary },
	inputErrorBg: {
		backgroundColor: COLORS.errorLight,
		borderColor: COLORS.error,
	},
	input: { flex: 1, fontSize: 15, color: COLORS.slate900, fontWeight: "500" },
	inputTextError: { color: COLORS.errorDark },
	eyeIcon: { paddingLeft: 10 },
	errorText: {
		fontSize: 12,
		fontWeight: "600",
		color: COLORS.error,
		marginTop: 4,
		paddingLeft: 4,
	},
});

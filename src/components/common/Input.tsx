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
import {
	ResponsiveFontSize,
	ResponsiveSpacing,
	ResponsiveBorderRadius,
	ResponsiveDimensions,
	scale,
} from "../../utils/responsive";

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
						testID="eye-icon"
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
	container: { marginBottom: ResponsiveSpacing.m },
	label: {
		fontSize: ResponsiveFontSize.base,
		fontWeight: "600",
		color: COLORS.slate700,
		marginBottom: ResponsiveSpacing.s,
	},
	labelError: { color: COLORS.error },
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.slate50,
		borderWidth: 2,
		borderColor: COLORS.slate200,
		borderRadius: ResponsiveBorderRadius.md,
		paddingHorizontal: ResponsiveSpacing.l,
		height: ResponsiveDimensions.inputHeight,
	},
	inputFocused: { borderColor: COLORS.primary },
	inputErrorBg: {
		backgroundColor: COLORS.errorLight,
		borderColor: COLORS.error,
	},
	input: {
		flex: 1,
		fontSize: ResponsiveFontSize.base,
		color: COLORS.slate900,
		fontWeight: "500",
	},
	inputTextError: { color: COLORS.errorDark },
	eyeIcon: { paddingLeft: ResponsiveSpacing.m },
	errorText: {
		fontSize: ResponsiveFontSize.xs,
		fontWeight: "600",
		color: COLORS.error,
		marginTop: ResponsiveSpacing.s,
		paddingLeft: ResponsiveSpacing.s,
	},
});

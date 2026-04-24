import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../constants/theme";

interface ButtonProps {
	title: string;
	onPress: () => void;
	type?: "primary" | "secondary" | "ghost";
	style?: ViewStyle;
}

export const Button = ({
	title,
	onPress,
	type = "primary",
	style,
}: ButtonProps) => {
	if (type === "primary") {
		return (
			<TouchableOpacity
				onPress={onPress}
				activeOpacity={0.8}
				style={[styles.container, style]}
			>
				<LinearGradient
					colors={[COLORS.primary, COLORS.primaryEnd]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.primaryBg}
				>
					<Text style={styles.primaryText}>{title}</Text>
				</LinearGradient>
			</TouchableOpacity>
		);
	}

	// Bạn có thể tự thêm style cho 'secondary' và 'ghost' tương tự UI kit sau
	return null;
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 5, // Dành cho Android
	},
	primaryBg: {
		paddingVertical: 16,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	primaryText: {
		color: COLORS.white,
		fontSize: 16,
		fontWeight: "700",
	},
});

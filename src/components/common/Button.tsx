import React from "react";
import {
	TouchableOpacity,
	Text,
	StyleSheet,
	ViewStyle,
	View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../constants/theme";
import {
	ResponsiveFontSize,
	ResponsiveSpacing,
	ResponsiveBorderRadius,
	scale,
} from "../../utils/responsive";

interface ButtonProps {
	title?: string; // Đổi thành optional để khi loading có thể ẩn chữ
	onPress: () => void;
	type?: "primary" | "secondary" | "ghost";
	style?: ViewStyle;
	disabled?: boolean; // Bổ sung prop disabled
	children?: React.ReactNode; // Bổ sung prop children
	testID?: string;
}

export const Button = ({
	title,
	onPress,
	type = "primary",
	style,
	disabled = false,
	children,
	testID,
}: ButtonProps) => {
	if (type === "primary") {
		return (
			<TouchableOpacity
				onPress={onPress}
				activeOpacity={0.8}
				disabled={disabled} // Khóa nút khi đang loading
				testID={testID}
				style={[
					styles.container,
					style,
					disabled && styles.disabledContainer, // Áp dụng hiệu ứng mờ khi disabled
				]}
			>
				<LinearGradient
					colors={[COLORS.primary, COLORS.primaryEnd]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.primaryBg}
				>
					<View style={styles.contentRow}>
						{children}

						{title ? <Text style={styles.primaryText}>{title}</Text> : null}
					</View>
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
		shadowOffset: { width: 0, height: scale(4) },
		shadowOpacity: 0.3,
		shadowRadius: scale(8),
		elevation: 5,
	},
	disabledContainer: {
		opacity: 0.7,
		shadowOpacity: 0,
		elevation: 0,
	},
	primaryBg: {
		paddingVertical: ResponsiveSpacing.m,
		borderRadius: ResponsiveBorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	contentRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: ResponsiveSpacing.m,
	},
	primaryText: {
		color: COLORS.white,
		fontSize: ResponsiveFontSize.base,
		fontWeight: "700",
	},
});

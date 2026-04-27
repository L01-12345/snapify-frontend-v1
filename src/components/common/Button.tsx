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
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 5,
	},
	disabledContainer: {
		opacity: 0.7, // Làm mờ nút một chút khi đang xử lý
		shadowOpacity: 0, // Tắt bóng đổ khi disabled
		elevation: 0,
	},
	primaryBg: {
		paddingVertical: 16,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	contentRow: {
		flexDirection: "row", // Dàn hàng ngang cho Spinner và Text
		alignItems: "center",
		justifyContent: "center",
		gap: 8, // Khoảng cách giữa Spinner và Text
	},
	primaryText: {
		color: COLORS.white,
		fontSize: 16,
		fontWeight: "700",
	},
});

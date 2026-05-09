import { Dimensions, Platform, PixelRatio } from "react-native";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

// Responsive scale factor based on screen width
// iPhone 11 is ~414px wide, so we use that as baseline
const baseWidth = 414;
const responsiveScale = windowWidth / baseWidth;

export const scaleFont = (size: number) => {
	const scaledSize = moderateScale(size, 0.3);
	return (
		Math.round(PixelRatio.roundToNearestPixel(scaledSize)) /
		PixelRatio.getFontScale()
	);
};

/**
 * Scale any value based on screen width
 */
export const scale = (size: number) => size * responsiveScale;

export const moderateScale = (size: number, factor = 0.5) =>
	size + (scale(size) - size) * factor;

/**
 * Responsive Font Sizes
 * Scales font size based on screen width
 */
export const ResponsiveFontSize = {
	xs: scaleFont(10),
	sm: scaleFont(12),
	base: scaleFont(14),
	lg: scaleFont(16),
	xl: scaleFont(18),
	"2xl": scaleFont(20),
	"3xl": scaleFont(24),
	"4xl": scaleFont(28),
	"5xl": scaleFont(32),
	"6xl": scaleFont(36),
};

/**
 * Responsive Spacing
 * Consistent spacing that scales with screen size
 */
export const ResponsiveSpacing = {
	xs: 2 * responsiveScale,
	sm: 4 * responsiveScale,
	s: 8 * responsiveScale,
	m: 16 * responsiveScale,
	l: 24 * responsiveScale,
	xl: 32 * responsiveScale,
	xxl: 48 * responsiveScale,
	xxxl: 64 * responsiveScale,
};

/**
 * Responsive Dimensions
 * Width and height values that adapt to screen size
 */
export const ResponsiveDimensions = {
	// Common component sizes
	buttonHeight: 48 * responsiveScale,
	buttonSmallHeight: 40 * responsiveScale,
	inputHeight: moderateScale(56, 0.3),
	iconSize: 24 * responsiveScale,
	iconSmall: 16 * responsiveScale,
	iconLarge: 32 * responsiveScale,
	iconXLarge: 40 * responsiveScale,

	// Card sizes
	cardBorderRadius: 12 * responsiveScale,
	cardSmallBorderRadius: 8 * responsiveScale,
	cardLargeBorderRadius: 16 * responsiveScale,

	// Special dimensions
	shutterButtonSize: 80 * responsiveScale,
	avatarSize: 48 * responsiveScale,
	avatarLarge: 64 * responsiveScale,
};

/**
 * Responsive Line Heights
 */
export const ResponsiveLineHeight = {
	tight: 1.2,
	snug: 1.375,
	normal: 1.5,
	relaxed: 1.625,
	loose: 2,
};

/**
 * Device Information
 */
export const DeviceInfo = {
	windowWidth,
	windowHeight,
	screenWidth,
	screenHeight,
	isSmallDevice: windowWidth < 375,
	isMediumDevice: windowWidth >= 375 && windowWidth < 430,
	isLargeDevice: windowWidth >= 430 && windowWidth < 520,
	isXLargeDevice: windowWidth >= 520,
	isPortrait: windowHeight > windowWidth,
	isLandscape: windowWidth > windowHeight,
	isIOS: Platform.OS === "ios",
	isAndroid: Platform.OS === "android",
};

/**
 * Responsive Padding based on device size
 */
export const getResponsivePadding = () => {
	if (DeviceInfo.isSmallDevice) return ResponsiveSpacing.m; // 8 base
	if (DeviceInfo.isMediumDevice) return ResponsiveSpacing.m;
	if (DeviceInfo.isLargeDevice) return ResponsiveSpacing.l;
	return ResponsiveSpacing.xl;
};

/**
 * Responsive Font Size with line height
 */
export const getResponsiveFont = (
	fontSize: number,
	lineHeight: number = 1.5,
) => ({
	fontSize: fontSize * responsiveScale,
	lineHeight: fontSize * lineHeight * responsiveScale,
});

/**
 * Responsive Width percentage
 */
export const getResponsiveWidth = (percentage: number) => {
	return (windowWidth * percentage) / 100;
};

/**
 * Responsive Height percentage
 */
export const getResponsiveHeight = (percentage: number) => {
	return (windowHeight * percentage) / 100;
};

/**
 * Get max width for content to maintain readability on large screens
 */
export const getContentMaxWidth = () => {
	if (DeviceInfo.isXLargeDevice) return 500;
	if (DeviceInfo.isLargeDevice) return 450;
	return undefined;
};

/**
 * Responsive Border Radius
 */
export const ResponsiveBorderRadius = {
	none: 0,
	sm: 4 * responsiveScale,
	base: 8 * responsiveScale,
	md: 12 * responsiveScale,
	lg: 16 * responsiveScale,
	xl: 20 * responsiveScale,
	full: 999,
};

/**
 * Get responsive shadow style
 */
export const getResponsiveShadow = (elevation: number = 4) => ({
	shadowColor: "#000",
	shadowOffset: {
		width: 0,
		height: 2 * responsiveScale,
	},
	shadowOpacity: 0.23,
	shadowRadius: elevation * responsiveScale,
	elevation: elevation,
});

/**
 * Responsive layout spacing for list items
 */
export const getListItemSpacing = () => {
	if (DeviceInfo.isSmallDevice) return ResponsiveSpacing.s;
	return ResponsiveSpacing.m;
};

/**
 * Get responsive grid column count
 */
export const getGridColumnCount = () => {
	if (DeviceInfo.isSmallDevice) return 2;
	if (DeviceInfo.isMediumDevice) return 2;
	if (DeviceInfo.isLargeDevice) return 3;
	return 4;
};

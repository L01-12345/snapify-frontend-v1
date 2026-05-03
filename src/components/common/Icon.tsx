import React from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import Svg, { Circle, Line, Path, Polygon, Rect } from "react-native-svg";

export type IconName =
	| "arrow-left"
	| "arrow-right"
	| "more-horizontal"
	| "more-vertical"
	| "camera"
	| "search"
	| "plus"
	| "x"
	| "check"
	| "file-text"
	| "document-attach"
	| "document-text-outline"
	| "archive-outline"
	| "file-minus"
	| "alert-circle"
	| "edit-2"
	| "flash"
	| "image-outline"
	| "clock"
	| "chevron-down"
	| "calendar"
	| "mic"
	| "list"
	| "trash-2"
	| "refresh-ccw"
	| "pin"
	| "eye"
	| "eye-off"
	| "maximize-2"
	| "folder"
	| "profile"
	| "home"
	| "pdf"
	| "sparkle"
	| "document"
	| "briefcase"
	| "receipt"
	| "heart"
	| "help"
	| "archive"
	| "folder-open";

interface IconProps {
	name: IconName;
	size?: number;
	color?: string;
	style?: StyleProp<ViewStyle | TextStyle>;
}

const createStroke = (color: string) => ({
	stroke: color,
	strokeWidth: 2,
	strokeLinecap: "round" as const,
	strokeLinejoin: "round" as const,
});

export const Icon = ({ name, size = 24, color = "#000", style }: IconProps) => {
	const strokeProps = createStroke(color);

	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			style={style}
			accessible
			accessibilityRole="image"
			accessibilityLabel={name}
		>
			{(() => {
				switch (name) {
					case "arrow-left":
						return <Path d="M15 18l-6-6 6-6" {...strokeProps} />;
					case "arrow-right":
						return <Path d="M9 6l6 6-6 6" {...strokeProps} />;
					case "more-horizontal":
						return (
							<>
								<Circle cx="6" cy="12" r="1.5" fill={color} />
								<Circle cx="12" cy="12" r="1.5" fill={color} />
								<Circle cx="18" cy="12" r="1.5" fill={color} />
							</>
						);
					case "more-vertical":
						return (
							<>
								<Circle cx="12" cy="6" r="1.5" fill={color} />
								<Circle cx="12" cy="12" r="1.5" fill={color} />
								<Circle cx="12" cy="18" r="1.5" fill={color} />
							</>
						);
					case "camera":
						return (
							<>
								<Path
									d="M4 7h4l2-2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"
									{...strokeProps}
								/>
								<Circle cx="12" cy="13" r="3" {...strokeProps} />
								<Circle cx="17" cy="8" r="1" fill={color} />
							</>
						);
					case "search":
						return (
							<>
								<Circle cx="11" cy="11" r="6" {...strokeProps} />
								<Line x1="16.5" y1="16.5" x2="21" y2="21" {...strokeProps} />
							</>
						);
					case "plus":
						return (
							<>
								<Line x1="12" y1="5" x2="12" y2="19" {...strokeProps} />
								<Line x1="5" y1="12" x2="19" y2="12" {...strokeProps} />
							</>
						);
					case "x":
						return <Path d="M6 6l12 12M18 6L6 18" {...strokeProps} />;
					case "check":
						return <Path d="M5 13l4 4L19 7" {...strokeProps} />;
					case "file-text":
						return (
							<>
								<Path
									d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
									{...strokeProps}
								/>
								<Path d="M14 2v6h6" {...strokeProps} />
								<Line x1="10" y1="14" x2="14" y2="14" {...strokeProps} />
								<Line x1="10" y1="18" x2="14" y2="18" {...strokeProps} />
								<Line x1="8" y1="10" x2="10" y2="10" {...strokeProps} />
							</>
						);
					case "document-attach":
						return (
							<>
								<Path
									d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
									{...strokeProps}
								/>
								<Path d="M14 2v6h6" {...strokeProps} />
								<Path d="M8 15l4 4 6-6" {...strokeProps} />
							</>
						);
					case "document-text-outline":
						return (
							<>
								<Path
									d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
									{...strokeProps}
								/>
								<Path d="M14 2v6h6" {...strokeProps} />
								<Line x1="9" y1="13" x2="15" y2="13" {...strokeProps} />
								<Line x1="9" y1="17" x2="15" y2="17" {...strokeProps} />
							</>
						);
					case "archive-outline":
						return (
							<>
								<Path d="M3 7h18v4H3V7z" {...strokeProps} />
								<Path
									d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"
									{...strokeProps}
								/>
								<Path d="M9 11V7" {...strokeProps} />
							</>
						);
					case "file-minus":
						return (
							<>
								<Path
									d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
									{...strokeProps}
								/>
								<Line x1="9" y1="14" x2="15" y2="14" {...strokeProps} />
							</>
						);
					case "alert-circle":
						return (
							<>
								<Circle cx="12" cy="12" r="9" {...strokeProps} />
								<Line x1="12" y1="8" x2="12" y2="12" {...strokeProps} />
								<Circle cx="12" cy="17" r="1" fill={color} />
							</>
						);
					case "edit-2":
						return (
							<>
								<Path d="M12 20h7" {...strokeProps} />
								<Path
									d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
									{...strokeProps}
								/>
							</>
						);
					case "flash":
						return <Path d="M11 21l1-7h5l-6-9 1 7H6l5 9z" {...strokeProps} />;
					case "image-outline":
						return (
							<>
								<Rect
									x="4"
									y="4"
									width="16"
									height="16"
									rx="2"
									{...strokeProps}
								/>
								<Path d="M4 15l4-4 4 4 4-5 4 5" {...strokeProps} />
								<Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
							</>
						);
					case "clock":
						return (
							<>
								<Circle cx="12" cy="12" r="9" {...strokeProps} />
								<Line x1="12" y1="7" x2="12" y2="12" {...strokeProps} />
								<Line x1="12" y1="12" x2="15" y2="14" {...strokeProps} />
							</>
						);
					case "chevron-down":
						return <Path d="M6 9l6 6 6-6" {...strokeProps} />;
					case "calendar":
						return (
							<>
								<Path d="M4 5h16v15H4z" {...strokeProps} />
								<Line x1="16" y1="3" x2="16" y2="7" {...strokeProps} />
								<Line x1="8" y1="3" x2="8" y2="7" {...strokeProps} />
								<Line x1="4" y1="11" x2="20" y2="11" {...strokeProps} />
							</>
						);
					case "mic":
						return (
							<>
								<Path
									d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z"
									{...strokeProps}
								/>
								<Path d="M8 11a4 4 0 0 0 8 0" {...strokeProps} />
								<Line x1="12" y1="17" x2="12" y2="22" {...strokeProps} />
								<Line x1="8" y1="22" x2="16" y2="22" {...strokeProps} />
							</>
						);
					case "list":
						return (
							<>
								<Line x1="8" y1="6" x2="20" y2="6" {...strokeProps} />
								<Line x1="8" y1="12" x2="20" y2="12" {...strokeProps} />
								<Line x1="8" y1="18" x2="20" y2="18" {...strokeProps} />
								<Circle cx="4" cy="6" r="1.5" fill={color} />
								<Circle cx="4" cy="12" r="1.5" fill={color} />
								<Circle cx="4" cy="18" r="1.5" fill={color} />
							</>
						);
					case "trash-2":
						return (
							<>
								<Path d="M3 7h18" {...strokeProps} />
								<Path
									d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
									{...strokeProps}
								/>
								<Path
									d="M19 7l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7"
									{...strokeProps}
								/>
								<Line x1="10" y1="11" x2="10" y2="17" {...strokeProps} />
								<Line x1="14" y1="11" x2="14" y2="17" {...strokeProps} />
							</>
						);
					case "refresh-ccw":
						return (
							<>
								<Path d="M5 7V3H1" {...strokeProps} />
								<Path d="M5 3L1 7" {...strokeProps} />
								<Path d="M4 11A7 7 0 0 0 12 19" {...strokeProps} />
								<Path d="M12 19A7 7 0 0 0 20 11" {...strokeProps} />
							</>
						);
					case "pin":
						return (
							<>
								<Path d="M12 2l-4 5v7a4 4 0 0 0 8 0V7l-4-5z" {...strokeProps} />
								<Path d="M12 15v7" {...strokeProps} />
							</>
						);
					case "eye":
						return (
							<>
								<Path
									d="M1 12s4-8 11-8 11 8-4 8-11 8S1 12 1 12z"
									{...strokeProps}
								/>
								<Circle cx="12" cy="12" r="3" fill={color} />
							</>
						);
					case "eye-off":
						return (
							<>
								<Path d="M1 12s4-8 11-8 11 8-4 8-11 8" {...strokeProps} />
								<Path d="M4 4l16 16" {...strokeProps} />
								<Circle cx="12" cy="12" r="3" fill={color} />
							</>
						);
					case "maximize-2":
						return (
							<>
								<Path d="M16 3h5v5" {...strokeProps} />
								<Path d="M8 21H3v-5" {...strokeProps} />
								<Path d="M16 21h5v-5" {...strokeProps} />
								<Path d="M8 3H3v5" {...strokeProps} />
							</>
						);
					case "folder":
						return (
							<>
								<Path
									d="M3 7a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
									{...strokeProps}
								/>
							</>
						);
					case "profile":
						return (
							<>
								<Circle cx="12" cy="8" r="3.5" {...strokeProps} />
								<Path d="M5 21c0-3.5 2.5-6 7-6s7 2.5 7 6" {...strokeProps} />
							</>
						);
					case "home":
						return (
							<>
								<Path
									d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
									{...strokeProps}
								/>
								<Path d="M9 21V12h6v9" {...strokeProps} />
							</>
						);
					case "pdf":
						return (
							<>
								<Path
									d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
									{...strokeProps}
								/>
								<Path d="M14 2v6h6" {...strokeProps} />
								<Path d="M8 14h8" {...strokeProps} />
								<Path d="M8 18h5" {...strokeProps} />
								<Path d="M15 18h3" {...strokeProps} />
							</>
						);
					case "sparkle":
						return (
							<>
								<Polygon
									points="12 2 13.5 8 20 9 14 13 15.5 19 12 15 8.5 19 10 13 4 9 10.5 8"
									fill={color}
								/>
								<Circle cx="18" cy="5" r="1.25" fill={color} />
								<Circle cx="5" cy="17" r="1.25" fill={color} />
							</>
						);
					case "document":
						return (
							<>
								<Path
									d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
									{...strokeProps}
								/>
								<Path d="M14 2v6h6" {...strokeProps} />
							</>
						);
					case "briefcase":
						return (
							<>
								<Rect
									x="3"
									y="8"
									width="18"
									height="11"
									rx="2"
									{...strokeProps}
								/>
								<Path
									d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
									{...strokeProps}
								/>
							</>
						);
					case "receipt":
						return (
							<>
								<Path
									d="M5 3h14v18l-2-2-2 2-2-2-2 2-2-2-2 2V3z"
									{...strokeProps}
								/>
								<Line x1="8" y1="8" x2="16" y2="8" {...strokeProps} />
								<Line x1="8" y1="12" x2="16" y2="12" {...strokeProps} />
								<Line x1="8" y1="16" x2="12" y2="16" {...strokeProps} />
							</>
						);
					case "heart":
						return (
							<Path
								d="M12 21C12 21 4 14.5 4 9.5 4 6.4 6.4 4 9.5 4c1.7 0 3.3.9 4.5 2.3C15.2 4.9 16.8 4 18.5 4 21.6 4 24 6.4 24 9.5 24 14.5 16 21 16 21H12z"
								fill={color}
							/>
						);
					case "help":
						return (
							<>
								<Circle cx="12" cy="12" r="9" {...strokeProps} />
								<Path d="M11 16h2" {...strokeProps} />
								<Path d="M12 8a2 2 0 1 1 0 4c0 2-2 2-2 4" {...strokeProps} />
							</>
						);
					case "archive":
						return (
							<>
								<Path d="M3 7h18v4H3V7z" {...strokeProps} />
								<Path
									d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"
									{...strokeProps}
								/>
							</>
						);
					case "folder-open":
						return (
							<>
								<Path
									d="M4 8a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z"
									{...strokeProps}
								/>
								<Path d="M4 10h16" {...strokeProps} />
							</>
						);
					default:
						return null;
				}
			})()}
		</Svg>
	);
};

const aliasMap: Record<string, IconName> = {
	"📚": "folder",
	"💼": "briefcase",
	"🧾": "receipt",
	"❤️": "heart",
	"📁": "folder",
	"📂": "folder",
	"📄": "document",
	"📑": "pdf",
	"✨": "sparkle",
	"🔍": "search",
	"📷": "camera",
	"🗂️": "folder-open",
	"📌": "pin",
	"🔃": "refresh-ccw",
	"👁️": "eye",
	"🙈": "eye-off",
	"🗑️": "trash-2",
	"❓": "help",
	"📦": "archive",
	"🗃️": "archive",
	"⚡": "flash",
	"✕": "x",
	"✓": "check",
};

export const getIconName = (value?: string): IconName | undefined => {
	if (!value) return undefined;
	if (aliasMap[value]) return aliasMap[value];
	return value as IconName;
};

import React from "react";
import { render } from "@testing-library/react-native";
import { Icon, getIconName, IconName } from "../../src/components/common/Icon";

// Mock react-native-svg
jest.mock("react-native-svg", () => {
	const { View } = require("react-native");
	return {
		__esModule: true,
		default: ({ children, accessibilityLabel, ...props }: any) => (
			<View testID={`svg-${accessibilityLabel}`} {...props}>
				{children}
			</View>
		),
		Circle: "Circle",
		Line: "Line",
		Path: "Path",
		Polygon: "Polygon",
		Rect: "Rect",
	};
});

describe("Component: Icon", () => {
	it("vẫn render thẻ Svg rỗng nếu truyền vào tên icon không tồn tại", () => {
		const { getByTestId } = render(<Icon name={"not-exist" as any} />);

		const svgElement = getByTestId("svg-not-exist");
		expect(svgElement).toBeTruthy();
		// Đã fix: Sử dụng toBeNull() thay vì toBeUndefined()
		expect(svgElement.props.children).toBeNull();
	});

	it("render thành công TẤT CẢ các icon để đạt 100% Coverage", () => {
		// Mảng chứa toàn bộ các icon trong file Icon.tsx
		const allIcons: IconName[] = [
			"arrow-left",
			"arrow-right",
			"more-horizontal",
			"more-vertical",
			"camera",
			"search",
			"plus",
			"x",
			"check",
			"file-text",
			"document-attach",
			"document-text-outline",
			"archive-outline",
			"file-minus",
			"alert-circle",
			"edit-2",
			"flash",
			"image-outline",
			"clock",
			"chevron-down",
			"calendar",
			"mic",
			"list",
			"trash-2",
			"refresh-ccw",
			"pin",
			"eye",
			"eye-off",
			"maximize-2",
			"folder",
			"profile",
			"home",
			"pdf",
			"sparkle",
			"document",
			"briefcase",
			"receipt",
			"heart",
			"help",
			"archive",
			"folder-open",
		];

		// Lặp qua để render toàn bộ, ép Jest đọc qua tất cả các nhánh case
		allIcons.forEach((iconName) => {
			const { getByTestId } = render(
				<Icon name={iconName} size={24} color="black" />,
			);
			expect(getByTestId(`svg-${iconName}`)).toBeTruthy();
		});
	});

	describe("Hàm getIconName", () => {
		it("trả về undefined nếu không truyền giá trị", () => {
			expect(getIconName()).toBeUndefined();
			expect(getIconName("")).toBeUndefined();
		});

		it("chuyển đổi chuẩn xác từ Emoji (Alias) sang tên Icon", () => {
			expect(getIconName("📚")).toBe("folder");
			expect(getIconName("🗑️")).toBe("trash-2");
			expect(getIconName("✕")).toBe("x");
		});

		it("giữ nguyên tên nếu truyền vào chuỗi không phải alias", () => {
			expect(getIconName("arrow-left")).toBe("arrow-left");
			expect(getIconName("custom-name" as any)).toBe("custom-name" as any);
		});
	});
});

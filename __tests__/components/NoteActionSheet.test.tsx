import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NoteActionSheet } from "../../src/components/common/NoteActionSheet";

describe("Component: NoteActionSheet", () => {
	const mockProps = {
		visible: true,
		onClose: jest.fn(),
		onArchive: jest.fn(),
		onMove: jest.fn(),
		onPin: jest.fn(),
		onDelete: jest.fn(),
		noteTitle: "Math Homework",
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("render chính xác title và danh sách các nút", () => {
		const { getByText } = render(<NoteActionSheet {...mockProps} />);

		expect(getByText("Note Actions")).toBeTruthy();
		expect(getByText("Math Homework")).toBeTruthy(); // Render noteTitle
		expect(getByText("Archive Note")).toBeTruthy();
	});

	it("gọi đúng callback khi bấm vào từng Action", () => {
		const { getByTestId } = render(<NoteActionSheet {...mockProps} />);

		fireEvent.press(getByTestId("archive-btn"));
		expect(mockProps.onArchive).toHaveBeenCalledTimes(1);

		fireEvent.press(getByTestId("move-btn"));
		expect(mockProps.onMove).toHaveBeenCalledTimes(1);

		fireEvent.press(getByTestId("pin-btn"));
		expect(mockProps.onPin).toHaveBeenCalledTimes(1);

		fireEvent.press(getByTestId("delete-btn"));
		expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
	});

	it("gọi onClose khi bấm nút Cancel hoặc bấm ra ngoài Backdrop", () => {
		const { getByTestId } = render(<NoteActionSheet {...mockProps} />);

		// Bấm Cancel
		fireEvent.press(getByTestId("cancel-btn"));
		expect(mockProps.onClose).toHaveBeenCalledTimes(1);

		// Bấm Backdrop
		fireEvent.press(getByTestId("sheet-backdrop"));
		expect(mockProps.onClose).toHaveBeenCalledTimes(2);
	});
	it("không hiển thị subtitle nếu không truyền noteTitle (Branch NoteTitle)", () => {
		// Không truyền noteTitle vào
		const { queryByText } = render(
			<NoteActionSheet
				visible={true}
				onClose={jest.fn()}
				onArchive={jest.fn()}
				onMove={jest.fn()}
				onPin={jest.fn()}
				onDelete={jest.fn()}
			/>,
		);

		// Đảm bảo chữ Math Homework không xuất hiện, bao phủ nhánh !noteTitle
		expect(queryByText("Math Homework")).toBeNull();
	});
});

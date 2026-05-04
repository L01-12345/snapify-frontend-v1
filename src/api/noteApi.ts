// src/api/noteApi.ts
import axiosClient from "./axiosClient";
import {
	SuccessResponse,
	Note,
	GetNotesParams,
	CreateNotePayload,
	UpdateNotePayload,
	SmartAction,
} from "../types/api.types";

import * as Sentry from "@sentry/react-native";

class NoteApi {
	// --------------------------------------------------------
	// 1. UPLOAD & AI PROCESSING
	// --------------------------------------------------------

	// POST /notes/snap
	snapToNote(
		imageUri: string,
		fileName: string,
		mimeType: string,
	): Promise<SuccessResponse<Note>> {
		const formData = new FormData();
		formData.append("image", {
			uri: imageUri,
			name: fileName,
			type: mimeType,
		} as any);

		return axiosClient.post("/notes/snap", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
			timeout: 60000,
		});
	}

	// POST /notes/{id}/categorize
	autoCategorize(id: string): Promise<SuccessResponse<Note>> {
		return axiosClient.post(`/notes/${id}/categorize`, undefined, {
			timeout: 30000,
		});
	}

	// Hàm tiện ích: Thực hiện chuỗi hành động Chụp -> Trích xuất -> Phân loại
	async snapAndAutoCategorize(
		imageUri: string,
		fileName: string,
		mimeType: string,
	): Promise<Note> {
		return await Sentry.startSpan(
			{ name: "OCR_and_Auto_Categorize", op: "ai.processing" },
			async (span) => {
				try {
					// Bước 1: Upload ảnh và lấy kết quả
					const snapRes = await this.snapToNote(imageUri, fileName, mimeType);
					const newNote = snapRes.data;

					if (!newNote || !newNote.id) {
						throw new Error("Unable to create a note from the image.");
					}

					// Bước 2: Gọi AI phân loại
					const categoryRes = await this.autoCategorize(newNote.id);

					Sentry.captureMessage("User utilized Smart OCR successfully", {
						level: "info",
						tags: { feature: "ocr_scanner", status: "success" },
					}); //

					// Ghi nhận thành công
					span?.setStatus({ code: 1 });
					return categoryRes.data || newNote;
				} catch (err) {
					// Ghi nhận hiệu suất bị lỗi nếu có
					span?.setStatus({ code: 2, message: "Auto categorize failed" });
					console.warn("Auto categorize failed:", err);
					throw err;
				}
			},
		);
	}

	// GET /notes/{id}/actions
	getSmartActions(id: string): Promise<SuccessResponse<SmartAction[]>> {
		return axiosClient.get(`/notes/${id}/actions`);
	}

	// --------------------------------------------------------
	// 2. CRUD & SEARCH
	// --------------------------------------------------------

	// GET /notes/search?q={keyword}
	searchNotes(keyword: string): Promise<SuccessResponse<Note[]>> {
		return axiosClient.get("/notes/search", { params: { q: keyword } });
	}

	// GET /notes (Hỗ trợ phân trang và lọc theo status)
	getNotes(params?: GetNotesParams): Promise<SuccessResponse<Note[]>> {
		return axiosClient.get("/notes", { params });
	}

	// POST /notes
	createNote(data: CreateNotePayload): Promise<SuccessResponse<Note>> {
		return axiosClient.post("/notes", data);
	}

	// GET /notes/{id}
	getNoteById(id: string): Promise<SuccessResponse<Note>> {
		return axiosClient.get(`/notes/${id}`);
	}

	// PUT /notes/{id}
	updateNote(
		id: string,
		data: UpdateNotePayload,
	): Promise<SuccessResponse<Note>> {
		return axiosClient.put(`/notes/${id}`, data);
	}

	// DELETE /notes/{id}
	deleteNote(id: string): Promise<SuccessResponse> {
		return axiosClient.delete(`/notes/${id}`);
	}
}

export const noteApi = new NoteApi();

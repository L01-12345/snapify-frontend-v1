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
		});
	}

	// POST /notes/{id}/categorize
	autoCategorize(id: string): Promise<SuccessResponse<Note>> {
		return axiosClient.post(`/notes/${id}/categorize`);
	}

	// Hàm tiện ích: Thực hiện chuỗi hành động Chụp -> Trích xuất -> Phân loại
	async snapAndAutoCategorize(
		imageUri: string,
		fileName: string,
		mimeType: string,
	): Promise<Note> {
		// Bước 1: Upload ảnh và lấy kết quả Note (đã OCR)
		const snapRes = await this.snapToNote(imageUri, fileName, mimeType);
		const newNote = snapRes.data;

		if (!newNote || !newNote.id) {
			throw new Error("Không thể tạo ghi chú từ ảnh.");
		}

		// Bước 2: Gọi AI tự động phân loại dựa trên ID vừa tạo
		const categoryRes = await this.autoCategorize(newNote.id);

		// Trả về Note đã được gắn folderId
		return categoryRes.data || newNote;
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

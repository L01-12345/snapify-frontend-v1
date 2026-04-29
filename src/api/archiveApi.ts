// src/api/archiveApi.ts
import axiosClient from "./axiosClient";
import { SuccessResponse, Note, GetNotesParams } from "../types/api.types";

class ArchiveApi {
	// GET /notes?status=ARCHIVED
	// Kế thừa GetNotesParams nhưng ghi đè status mặc định là ARCHIVED
	getArchivedNotes(
		params?: Omit<GetNotesParams, "status">,
	): Promise<SuccessResponse<Note[]>> {
		return axiosClient.get("/notes", {
			params: {
				...params,
				status: "ARCHIVED",
			},
		});
	}

	// PUT /notes/{id}
	// Phục hồi Note bằng cách chuyển status từ ARCHIVED sang ACTIONED (hoặc PENDING)
	restoreNote(id: string): Promise<SuccessResponse<Note>> {
		return axiosClient.put(`/notes/${id}`, { status: "PENDING" });
	}

	// DELETE /notes/{id}
	// Xóa vĩnh viễn Note (API Delete của backend)
	deleteNote(id: string): Promise<SuccessResponse> {
		return axiosClient.delete(`/notes/${id}`);
	}
}

export const archiveApi = new ArchiveApi();

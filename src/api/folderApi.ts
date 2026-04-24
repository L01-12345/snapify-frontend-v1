// src/api/folderApi.ts
import axiosClient from "./axiosClient";
import {
	Folder,
	FolderDetail,
	SuccessResponse,
	CreateFolderPayload,
	UpdateFolderPayload,
} from "../types/api.types";

class FolderApi {
	/**
	 * Lấy danh sách tất cả thư mục của người dùng
	 * GET /folders
	 */
	getFolders(): Promise<SuccessResponse<Folder[]>> {
		return axiosClient.get("/folders");
	}

	/**
	 * Tạo một thư mục mới
	 * POST /folders
	 */
	createFolder(data: CreateFolderPayload): Promise<SuccessResponse<Folder>> {
		return axiosClient.post("/folders", data);
	}

	/**
	 * Lấy chi tiết một thư mục (bao gồm danh sách các ghi chú bên trong)
	 * GET /folders/{id}
	 */
	getFolderById(id: string): Promise<SuccessResponse<FolderDetail>> {
		return axiosClient.get(`/folders/${id}`);
	}

	/**
	 * Cập nhật thông tin thư mục (Đổi tên hoặc mô tả)
	 * PUT /folders/{id}
	 */
	updateFolder(
		id: string,
		data: UpdateFolderPayload,
	): Promise<SuccessResponse<Folder>> {
		return axiosClient.put(`/folders/${id}`, data);
	}

	/**
	 * Xóa thư mục (Các ghi chú bên trong sẽ được chuyển về trạng thái không được gán thư mục)
	 * DELETE /folders/{id}
	 */
	deleteFolder(id: string): Promise<SuccessResponse> {
		return axiosClient.delete(`/folders/${id}`);
	}
}

// Export instance duy nhất
export const folderApi = new FolderApi();

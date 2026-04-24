// src/api/batchApi.ts
import axiosClient from "./axiosClient";
import {
	BatchDocument,
	SuccessResponse,
	ScanBatchPayload,
	UpdateBatchPayload,
} from "../types/api.types";

class BatchApi {
	/**
	 * Tổng hợp và gửi nhiều ảnh để tạo 1 file PDF duy nhất
	 * POST /batches/scan
	 */
	async scanBatch(
		payload: ScanBatchPayload,
	): Promise<SuccessResponse<BatchDocument>> {
		const formData = new FormData();
		formData.append("title", payload.title);

		payload.images.forEach((image, index) => {
			// @ts-ignore: FormData in React Native requires this structure
			formData.append("images", {
				uri: image.uri,
				name: image.name || `page_${index + 1}.jpg`,
				type: image.type || "image/jpeg",
			});
		});

		return axiosClient.post("/batches/scan", formData, {
			headers: { "Content-Type": "multipart/form-data" },
			timeout: 60000, // Tăng timeout vì xử lý PDF có thể lâu
		});
	}

	/**
	 * Lấy danh sách tất cả các file PDF đã tạo
	 * GET /batches
	 */
	getBatches(): Promise<SuccessResponse<BatchDocument[]>> {
		return axiosClient.get("/batches");
	}

	/**
	 * Đổi tên PDF hoặc di chuyển vào Folder
	 * PUT /batches/{id}
	 */
	updateBatch(
		id: string,
		data: UpdateBatchPayload,
	): Promise<SuccessResponse<BatchDocument>> {
		return axiosClient.put(`/batches/${id}`, data);
	}

	/**
	 * Xóa tài liệu PDF
	 * DELETE /batches/{id}
	 */
	deleteBatch(id: string): Promise<SuccessResponse> {
		return axiosClient.delete(`/batches/${id}`);
	}
}

export const batchApi = new BatchApi();

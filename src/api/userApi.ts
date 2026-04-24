// src/api/userApi.ts
import axiosClient from "./axiosClient";
import {
	User,
	UpdateProfilePayload,
	SuccessResponse,
} from "../types/api.types";

class UserApi {
	// GET /users/me
	getProfile(): Promise<SuccessResponse<User>> {
		return axiosClient.get("/users/me");
	}

	// PUT /users/me
	updateProfile(data: UpdateProfilePayload): Promise<SuccessResponse> {
		return axiosClient.put("/users/me", data);
	}

	// POST /users/avatar
	// Trong React Native, file ảnh cần được bọc trong FormData với cấu trúc { uri, name, type }
	uploadAvatar(
		imageUri: string,
		fileName: string,
		mimeType: string,
	): Promise<SuccessResponse> {
		const formData = new FormData();

		// Ép kiểu (any) do TypeScript của React Native thỉnh thoảng báo lỗi với thuộc tính uri của FormData
		formData.append("image", {
			uri: imageUri,
			name: fileName,
			type: mimeType,
		} as any);

		return axiosClient.post("/users/avatar", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
				// Axios mặc định gửi JSON, ta phải overide lại Header cho endpoint này
			},
		});
	}
}

export const userApi = new UserApi();

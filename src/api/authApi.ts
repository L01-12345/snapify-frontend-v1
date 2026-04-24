// src/api/authApi.ts
import axiosClient from "./axiosClient";
import {
	LoginPayload,
	RegisterPayload,
	ForgotPasswordPayload,
	ResetPasswordPayload,
	SuccessResponse,
	LoginResponse,
} from "../types/api.types";

class AuthApi {
	// POST /auth/register
	register(data: RegisterPayload): Promise<SuccessResponse> {
		return axiosClient.post("/auth/register", data);
	}

	// POST /auth/login
	login(data: LoginPayload): Promise<SuccessResponse<LoginResponse>> {
		return axiosClient.post("/auth/login", data);
	}

	// POST /auth/forgot-password
	forgotPassword(data: ForgotPasswordPayload): Promise<SuccessResponse> {
		return axiosClient.post("/auth/forgot-password", data);
	}

	// POST /auth/reset-password
	resetPassword(data: ResetPasswordPayload): Promise<SuccessResponse> {
		return axiosClient.post("/auth/reset-password", data);
	}
}

export const authApi = new AuthApi();

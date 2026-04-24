// src/api/axiosClient.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Lấy base URL từ biến môi trường
const baseURL = process.env.EXPO_PUBLIC_API_URL;

const axiosClient = axios.create({
	baseURL: baseURL,
	headers: {
		"Content-Type": "application/json",
	},

	timeout: 10000,
});

// ---------------------------------------------------
// INTERCEPTOR CHO REQUEST (Gửi đi)
// ---------------------------------------------------
axiosClient.interceptors.request.use(
	async (config) => {
		// Lấy token từ SecureStore đã được lưu khi login thành công
		const token = await SecureStore.getItemAsync("access_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// ---------------------------------------------------
// INTERCEPTOR CHO RESPONSE (Nhận về)
// ---------------------------------------------------
axiosClient.interceptors.response.use(
	(response) => {
		if (response && response.data) {
			return response.data;
		}
		return response;
	},
	async (error) => {
		if (error.response) {
			const status = error.response.status;
			if (status === 401) {
				// Xử lý khi Token hết hạn: Xóa token và điều hướng về Login
				await SecureStore.deleteItemAsync("access_token");
				console.log("Phiên đăng nhập hết hạn. Cần đăng nhập lại.");
				// dùng một sự kiện hoặc context để redirect tại đây
			}
		}
		return Promise.reject(error.response?.data || error.message);
	},
);

export default axiosClient;

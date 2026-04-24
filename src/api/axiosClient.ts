// src/api/axiosClient.ts
import axios from "axios";

// Lấy base URL từ biến môi trường
const baseURL = process.env.EXPO_PUBLIC_API_URL;

const axiosClient = axios.create({
	baseURL: baseURL,
	headers: {
		"Content-Type": "application/json",
	},
	// Thêm timeout nếu server trên Render mất thời gian "thức dậy" (cold start)
	timeout: 10000,
});

// ---------------------------------------------------
// INTERCEPTOR CHO REQUEST (Gửi đi)
// ---------------------------------------------------
axiosClient.interceptors.request.use(
	async (config) => {
		// TODO: Nơi này sau này sẽ lấy Token từ AsyncStorage hoặc Redux State
		// const token = await AsyncStorage.getItem('access_token');
		// if (token) {
		//   config.headers.Authorization = `Bearer ${token}`;
		// }
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
		// Chỉ lấy phần data của response, bỏ qua các thông tin config thừa của axios
		if (response && response.data) {
			return response.data;
		}
		return response;
	},
	(error) => {
		// Xử lý các mã lỗi HTTP chung tại đây
		if (error.response) {
			const status = error.response.status;
			if (status === 401) {
				// TODO: Xử lý khi Token hết hạn (VD: Tự động gọi API refresh token hoặc Logout)
				console.log("Unauthorized! Cần đăng nhập lại.");
			} else if (status === 500) {
				console.log("Lỗi Server backend!");
			}
		}
		// Trả về lỗi để các hàm gọi API ở component có thể try/catch
		return Promise.reject(error.response?.data || error.message);
	},
);

export default axiosClient;

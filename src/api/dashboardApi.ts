// src/api/dashboardApi.ts
import axiosClient from "./axiosClient";
import { SuccessResponse } from "../types/api.types";

export interface DashboardMetrics {
	total: number;
	pending: number;
	actioned: number;
	archived: number;
}

class DashboardApi {
	/**
	 * Lấy thống kê số lượng Note theo trạng thái cho Dashboard
	 * GET /dashboard/metrics
	 */
	getMetrics(): Promise<SuccessResponse<DashboardMetrics>> {
		return axiosClient.get("/dashboard/metrics");
	}
}

export const dashboardApi = new DashboardApi();

// src/components/AuthWrapper.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import * as SecureStore from "expo-secure-store";
import { userApi } from "../api/userApi";
import { setCredentials, logout } from "../store/slices/authSlice";

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
	const dispatch = useDispatch();
	const [isBootstrapping, setIsBootstrapping] = useState(true);

	useEffect(() => {
		const bootstrapAsync = async () => {
			try {
				const token = await SecureStore.getItemAsync("access_token");

				if (token) {
					// Lấy thông tin user bằng token hiện có
					const response = await userApi.getProfile();
					if (response.status === "success" && response.data) {
						dispatch(setCredentials({ user: response.data, token }));
					}
				} else {
					dispatch(logout());
				}
			} catch (e) {
				// Token lỗi hoặc hết hạn
				console.log("Lỗi khôi phục session:", e);
				dispatch(logout());
				await SecureStore.deleteItemAsync("access_token");
			} finally {
				setIsBootstrapping(false);
			}
		};

		bootstrapAsync();
	}, []);

	if (isBootstrapping) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" color="#4f46e5" />
			</View>
		);
	}

	return <>{children}</>;
};

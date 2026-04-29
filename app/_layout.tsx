// app/_layout.tsx
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../src/store";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthWrapper } from "../src/components/AuthWrapper";
import * as Sentry from "@sentry/react-native";

Sentry.init({
	dsn: "https://e5071411037cbb8b9045c8efe3f9f3ef@o4511302997114880.ingest.us.sentry.io/4511303003406336",
	debug: true, // Hiển thị log của Sentry ở Terminal Local (Nhớ tắt khi build ra APK thật)
	tracesSampleRate: 1.0, // Ghi nhận 100% các chỉ số hiệu năng (Performance metrics)
});

export default function RootLayout() {
	return (
		<Provider store={store}>
			<SafeAreaProvider>
				<AuthWrapper>
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="onboarding" />
						<Stack.Screen name="(auth)" />
						<Stack.Screen name="(tabs)" />
					</Stack>
				</AuthWrapper>
			</SafeAreaProvider>
		</Provider>
	);
}

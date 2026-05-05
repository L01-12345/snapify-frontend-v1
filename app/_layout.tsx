// app/_layout.tsx
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../src/store";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthWrapper } from "../src/components/AuthWrapper";
import * as Sentry from "@sentry/react-native";

Sentry.init({
	dsn: "https://3ae3aaaeac8618f4bb1c87d9a0c37324@o4511302997114880.ingest.us.sentry.io/4511303004651520",
	debug: true,
	tracesSampleRate: 1.0,
	enabled: true,
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

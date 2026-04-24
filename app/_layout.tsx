// app/_layout.tsx
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../src/store";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthWrapper } from "../src/components/AuthWrapper";

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

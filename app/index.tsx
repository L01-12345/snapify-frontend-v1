// app/index.tsx
import React from "react";
import { Redirect } from "expo-router";

export default function Index() {
	// return <Redirect href="/(auth)/login" />;
	// return <Redirect href="/(tabs)/dashboard" />;
	return <Redirect href="/onboarding" />;
}

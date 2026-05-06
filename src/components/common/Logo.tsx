// src/components/common/Logo.tsx
import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

interface LogoProps {
	width?: number | string;
	height?: number | string;
}

export const Logo = ({ width = 64, height = 64 }: LogoProps) => {
	return (
		<Svg width={width} height={height} viewBox="0 0 100 100" fill="none">
			<Path
				d="M70 10C80 10 90 20 90 30V40C90 45 85 50 80 50C75 50 70 45 70 40V30C70 25 65 20 60 20H40C35 20 30 25 30 30V40C30 45 35 50 40 50C45 50 50 45 50 40"
				stroke="#4F46E5"
				strokeWidth="8"
				strokeLinecap="round"
			/>
			<Path
				d="M50 40V50C50 55 45 60 40 60H30C25 60 20 55 20 50V30C20 20 30 10 40 10"
				stroke="#A5B4FC"
				strokeWidth="8"
				strokeLinecap="round"
			/>
			<Path
				d="M20 50V70C20 80 30 90 40 90H60C65 90 70 85 70 80C70 75 75 70 80 70H90C95 70 100 75 100 80"
				stroke="#4F46E5"
				strokeWidth="8"
				strokeLinecap="round"
			/>
			<Circle cx="50" cy="50" r="6" fill="#8B5CF6" />
			<Path
				d="M15 15V8H8V15"
				stroke="#C7D2FE"
				strokeWidth="3"
				strokeLinecap="round"
			/>
			<Path
				d="M85 85V92H92V85"
				stroke="#C7D2FE"
				strokeWidth="3"
				strokeLinecap="round"
			/>
		</Svg>
	);
};

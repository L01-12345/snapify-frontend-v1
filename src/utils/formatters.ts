export const formatDate = (dateString?: string) => {
	if (!dateString) return "DATE UNKNOWN";
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return "INVALID DATE";

	const options: Intl.DateTimeFormatOptions = {
		month: "short",
		day: "numeric",
		year: "numeric",
	};
	return date.toLocaleDateString("en-US", options).toUpperCase();
};

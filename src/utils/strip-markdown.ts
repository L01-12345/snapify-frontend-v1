export const stripMarkdown = (text: string) => {
	if (!text) return "";
	return text.replace(/[#*`_>~-]/g, "").trim();
};

// src/types/api.types.ts

// --- COMMON ---
export interface SuccessResponse<T = any> {
	status: string;
	message?: string;
	data?: T;
}

// --- USER MODELS ---
export interface User {
	id: string;
	email: string;
	displayName: string;
	bio: string | null;
	avatarUrl: string | null;
	createdAt: string;
}

// --- AUTH PAYLOADS ---
export interface RegisterPayload {
	email: string;
	password: string;
	displayName: string;
}

export interface LoginPayload {
	email: string;
	password: string;
}

export interface ForgotPasswordPayload {
	email: string;
}

export interface ResetPasswordPayload {
	email: string;
	otp: string;
	newPassword: string;
}

export interface LoginResponse {
	token: string; // Token JWT trả về khi login thành công
	user: User;
}

// --- USER PAYLOADS ---
export interface UpdateProfilePayload {
	displayName?: string;
	bio?: string;
	avatarUrl?: string;
}

// --- NOTE MODELS ---
export type NoteStatus = "PENDING" | "ACTIONED" | "ARCHIVED";

export interface NoteImage {
	id: string;
	noteId: string;
	imageUrl: string;
	orderIndex: number;
}

export interface Note {
	id: string;
	title: string;
	content: string;
	folderId: string | null;
	status: NoteStatus;
	userId?: string;
	createdAt?: string;
	updatedAt?: string;
	folder?: any;
	images?: NoteImage[];
	actions?: any[];
	entities?: any[];
}

export interface SmartAction {
	type: string; // VD: 'CALL', 'EMAIL', 'URL', 'EVENT'
	label: string;
	value: string;
}

// --- NOTE PAYLOADS ---
export interface GetNotesParams {
	status?: NoteStatus;
	page?: number;
	limit?: number;
}

export interface CreateNotePayload {
	title: string;
	content: string;
	folderId?: string | null;
}

// Khi update có thể gửi một phần dữ liệu
export type UpdateNotePayload = Partial<CreateNotePayload> & {
	status?: NoteStatus;
};

// --- FOLDER MODELS ---
export type FolderType = "MANUAL" | "SMART";

export interface Folder {
	id: string;
	name: string;
	description: string;
	type: FolderType;
}

// Chi tiết thư mục bao gồm cả danh sách ghi chú bên trong
export interface FolderDetail extends Folder {
	notes: Note[]; // Danh sách note thuộc folder này
}

// --- FOLDER PAYLOADS ---
export interface CreateFolderPayload {
	name: string;
	description?: string;
}

export interface UpdateFolderPayload {
	name?: string;
	description?: string;
}

// --- BATCH MODELS ---
export interface BatchDocument {
	id: string;
	title: string;
	pdfUrl: string;
	folderId: string | null;
	createdAt: string;
}

// --- BATCH PAYLOADS ---
export interface ScanBatchPayload {
	title: string;
	images: Array<{
		uri: string;
		name: string;
		type: string;
	}>;
}

export interface UpdateBatchPayload {
	title?: string;
	folderId?: string | null;
}

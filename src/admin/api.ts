import type { Content, SectionKey } from '../../shared/schema';

export type Issue = { path: string; message: string };

export interface SectionState<K extends SectionKey = SectionKey> {
    data: Content[K];
    // 0 = not in the database yet (showing the file copy)
    version: number;
    updatedAt: string | null;
}
export type AdminSections = { [K in SectionKey]: SectionState<K> };

export class AdminApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly issues: Issue[] = [],
        readonly version?: number,
    ) {
        super(message);
    }
}

async function request<T>(method: string, action: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
        res = await fetch(`/api/admin?action=${action}`, {
            method,
            credentials: 'same-origin',
            headers: {
                ...(method === 'GET' ? {} : { 'X-Admin-Request': '1' }),
                ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
            },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new AdminApiError('Could not reach the server. Check your connection.', 0);
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
        throw new AdminApiError(json.error ?? `Request failed (${res.status})`, res.status, json.issues, json.version);
    }
    return json as T;
}

export const adminApi = {
    session: () => request<{ authenticated: boolean }>('GET', 'session').then((r) => r.authenticated),
    login: (password: string) => request('POST', 'login', { password }),
    logout: () => request('POST', 'logout'),
    content: () => request<{ sections: AdminSections }>('GET', 'content').then((r) => r.sections),
    save: <K extends SectionKey>(section: K, data: Content[K], version: number) =>
        request<{ version: number }>('PUT', 'section', { section, data, version }).then((r) => r.version),
};

export type UploadKind = 'image' | 'resume';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // Cloudinary free-plan file limit

/** Uploads straight from the browser to Cloudinary with a server-signed request; returns the file URL. */
export async function uploadFile(file: File, kind: UploadKind): Promise<string> {
    if (file.size > MAX_UPLOAD_BYTES) throw new AdminApiError('Files must be 10 MB or smaller.', 413);
    if (kind === 'image' && !file.type.startsWith('image/')) throw new AdminApiError('Choose an image file.', 415);
    if (kind === 'resume' && file.type !== 'application/pdf') throw new AdminApiError('Choose a PDF file.', 415);

    const { uploadUrl, fields } = await request<{ uploadUrl: string; fields: Record<string, string | number> }>(
        'POST',
        'upload-signature',
        { kind },
    );

    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => form.append(k, String(v)));
    form.append('file', file);

    const res = await fetch(uploadUrl, { method: 'POST', body: form }).catch(() => null);
    const json = await res?.json().catch(() => null);
    if (!res?.ok || !json?.secure_url) {
        throw new AdminApiError(json?.error?.message ?? 'Upload to Cloudinary failed.', res?.status ?? 0);
    }
    return json.secure_url as string;
}

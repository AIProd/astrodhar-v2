/**
 * Resolves the backend API URL.
 * Handles both absolute URLs (e.g. from env) and relative paths (e.g. for Vercel internal routing).
 * This fixes issues where fetch in Server Components/API Routes requires an absolute URL.
 */
export function getBackendUrl() {
    const envUrl = process.env.PYTHON_API_URL;

    // Check if we are in Vercel environment
    const isVercel = !!process.env.VERCEL_URL;

    if (isVercel) {
        // If user explicitly set a remote URL (not localhost), respect it.
        if (envUrl && envUrl.startsWith("http") && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
            return envUrl;
        }

        // Otherwise, construct self-reference URL using Vercel system var
        // This fixes the issue where user copied "http://localhost:8000" to Vercel env
        return `https://${process.env.VERCEL_URL}/api/py`;
    }

    // Local development fallback
    return envUrl || "http://localhost:8000/api/py";
}

import { NextRequest } from "next/server";

export function getForwardHeaders(request: NextRequest) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    // Forward auth/protection headers
    const keysToForward = [
        "authorization",
        "x-vercel-protection-bypass",
        "x-vercel-auth"
    ];

    keysToForward.forEach(key => {
        const val = request.headers.get(key);
        if (val) {
            headers[key] = val;
        }
    });

    // Explicitly reconstruct Cookie header from request.cookies
    // This is more robust than request.headers.get("cookie") in some Next.js environments
    const cookies = request.cookies.getAll();
    if (cookies.length > 0) {
        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");
        headers["cookie"] = cookieHeader;
    } else {
        // Fallback to header if cookies API is empty (though unlikely if header exists)
        const headerCookie = request.headers.get("cookie");
        if (headerCookie) {
            headers["cookie"] = headerCookie;
        }
    }

    return headers;
}

/**
 * Resolves the backend API URL.
 * Handles both absolute URLs (e.g. from env) and relative paths (e.g. for Vercel internal routing).
 * This fixes issues where fetch in Server Components/API Routes requires an absolute URL.
 */
export function getBackendUrl() {
    // 1. Try environment variable
    const envUrl = process.env.PYTHON_API_URL;

    // If it's a full URL, use it
    if (envUrl && envUrl.startsWith("http")) {
        return envUrl;
    }

    // 2. If running on Vercel, construct URL dynamically
    // VERCEL_URL is set by Vercel system (e.g. "my-app.vercel.app")
    if (process.env.VERCEL_URL) {
        const protocol = "https"; // Vercel is always https
        const host = process.env.VERCEL_URL;
        // If envUrl provided (e.g. "/api/py"), append it. Else default to "/api/py"
        const path = envUrl || "/api/py";
        // Ensure path starts with /
        const safePath = path.startsWith("/") ? path : `/${path}`;
        return `${protocol}://${host}${safePath}`;
    }

    // 3. Fallback for local development
    return envUrl || "http://localhost:8000/api/py";
}

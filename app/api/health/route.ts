import { NextResponse } from 'next/server';

import { getBackendUrl } from "@/lib/config";

const PYTHON_API_URL = getBackendUrl();

export async function GET() {
    try {
        // Check Python backend health
        const response = await fetch(`${PYTHON_API_URL}/health`);

        if (response.ok) {
            const pythonHealth = await response.json();
            return NextResponse.json({
                ok: true,
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                backend: {
                    connected: true,
                    ...pythonHealth,
                },
            });
        } else {
            return NextResponse.json({
                ok: true,
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                backend: {
                    connected: false,
                    error: 'Python backend returned non-OK status',
                },
            });
        }
    } catch {
        return NextResponse.json({
            ok: true,
            version: '2.0.0',
            timestamp: new Date().toISOString(),
            backend: {
                connected: false,
                error: 'Python backend not reachable',
            },
        });
    }
}

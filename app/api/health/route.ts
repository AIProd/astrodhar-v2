import { NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

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

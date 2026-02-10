import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate input structure
        if (!body.partnerA || !body.partnerB) {
            return NextResponse.json(
                { error: 'Missing partnerA or partnerB data' },
                { status: 400 }
            );
        }

        // Forward to Python backend
        const response = await fetch(`${PYTHON_API_URL}/compatibility`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.detail || 'Backend calculation failed' },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);

    } catch (error) {
        console.error('Compatibility API error:', error);

        // Check if Python backend is not running
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json(
                {
                    error: 'Python backend is not running. Please start it with: cd backend && uvicorn main:app --reload',
                    detail: 'Connection refused to Python API'
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

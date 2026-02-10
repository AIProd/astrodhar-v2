import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${PYTHON_API_URL}/chart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || "Chart calculation failed" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Chart API error:", error);
        return NextResponse.json(
            { error: "Unable to connect to astrology backend" },
            { status: 503 }
        );
    }
}

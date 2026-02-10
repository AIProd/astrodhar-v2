import { NextRequest, NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/config";

const PYTHON_API_URL = getBackendUrl();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${PYTHON_API_URL}/chat/compatibility`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json(
                { error: `Python API error: ${error} ` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Match chat error:", error);
        return NextResponse.json(
            { error: "Failed to get chat response" },
            { status: 500 }
        );
    }
}

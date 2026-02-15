import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, getForwardHeaders } from "@/lib/config";

const PYTHON_API_URL = getBackendUrl();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${PYTHON_API_URL}/insights/chart`, {
            method: "POST",
            headers: getForwardHeaders(request),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Backend error (${response.status}): ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Chart insights API error:", error);
        return NextResponse.json(
            { error: "Unable to connect to astrology backend" },
            { status: 503 }
        );
    }
}

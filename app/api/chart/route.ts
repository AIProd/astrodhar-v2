import { NextRequest, NextResponse } from "next/server";

import { getBackendUrl, getForwardHeaders } from "@/lib/config";

const PYTHON_API_URL = getBackendUrl();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const headers = getForwardHeaders(request);
        const url = `${PYTHON_API_URL}/chart`;

        console.log(`[Proxy] Fetching ${url}`);
        console.log(`[Proxy] Headers:`, JSON.stringify(headers));

        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
            redirect: "manual", // Prevent following redirects (e.g. to login page)
        });

        console.log(`[Proxy] Response status: ${response.status}`);

        if (!response.ok) {
            // Handle redirects explicitly
            if (response.status >= 300 && response.status < 400) {
                return NextResponse.json(
                    { error: `Backend redirected to ${response.headers.get("location")}` },
                    { status: response.status }
                );
            }

            const errorText = await response.text();
            console.error(`[Proxy] Error text: ${errorText.substring(0, 200)}...`); // Log first 200 chars

            return NextResponse.json(
                { error: `Backend error (${response.status}): ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("Chart API error:", error);
        return NextResponse.json(
            { error: "Unable to connect to astrology backend" },
            { status: 503 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { VedicChart } from "@/lib/types";

import { getBackendUrl } from "@/lib/config";

const PYTHON_API_URL = getBackendUrl();

interface ChatRequest {
    chart: VedicChart;
    question: string;
    history?: Array<{ role: string; content: string }>;
}

export async function POST(request: NextRequest) {
    try {
        const { chart, question, history = [] }: ChatRequest = await request.json();

        if (!chart || !question) {
            return NextResponse.json(
                { error: "Chart and question are required" },
                { status: 400 }
            );
        }

        // Call Python backend LLM
        const response = await fetch(`${PYTHON_API_URL}/chat/chart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chart: chart,
                question: question,
                history: history,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Python API error:", error);
            return NextResponse.json(
                { error: `Failed to get AI response: ${error}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json({ response: data.response });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { error: "Failed to generate insight. Make sure OPENAI_API_KEY is set and backend is running." },
            { status: 500 }
        );
    }
}

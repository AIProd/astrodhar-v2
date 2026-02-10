import { NextRequest, NextResponse } from "next/server";
import { AdviceRequest, AdviceResponse } from "@/lib/types";
import { generateAdvice } from "@/lib/mock";
import { checkSafety } from "@/lib/safety";

const DISCLAIMERS = [
    "This is for entertainment and spiritual guidance purposes only.",
    "Not a substitute for professional counseling or medical advice.",
    "Consult qualified professionals for important life decisions.",
];

export async function POST(request: NextRequest) {
    try {
        const body: AdviceRequest = await request.json();

        // Validate required fields
        if (!body.partnerA || !body.partnerB || !body.question) {
            return NextResponse.json(
                { error: "partnerA, partnerB, and question are required" },
                { status: 400 }
            );
        }

        // Check for safety concerns
        const safetyCheck = checkSafety(body.question);
        if (!safetyCheck.isSafe && safetyCheck.response) {
            return NextResponse.json({
                advice: safetyCheck.response.message,
                disclaimers: [
                    ...safetyCheck.response.resources,
                    "Please contact professional support services.",
                ],
            } as AdviceResponse);
        }

        // Generate templated advice
        const advice = generateAdvice(body.partnerA, body.partnerB, body.question);

        return NextResponse.json({
            advice,
            disclaimers: DISCLAIMERS,
        } as AdviceResponse);
    } catch (error) {
        console.error("Advice API error:", error);
        return NextResponse.json(
            { error: "Failed to process advice request" },
            { status: 500 }
        );
    }
}

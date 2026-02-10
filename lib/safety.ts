// Safety router for detecting harmful content
import { SafetyResult } from "./types";

// Keywords that trigger safety responses
const SAFETY_KEYWORDS = [
    "suicide",
    "kill",
    "murder",
    "harm",
    "hurt",
    "abuse",
    "violent",
    "violence",
    "self-harm",
    "self harm",
    "die",
    "death threat",
    "beat",
    "hit",
    "assault",
    "coercion",
    "force",
    "threatening",
    "weapon",
];

// Resources to provide for safety concerns
const SAFETY_RESOURCES = [
    "National Crisis Helpline (India): iCall - 9152987821",
    "Vandrevala Foundation: 1860-2662-345",
    "NIMHANS Helpline: 080-46110007",
    "International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/",
];

const SAFETY_MESSAGE = `We noticed your message may relate to a difficult situation. 
Your wellbeing is our priority. Please reach out to professional support services 
who can provide the help you deserve. Astrology cannot address matters of safety 
or mental health - please contact the resources below.`;

/**
 * Checks if the provided text contains any safety-related keywords
 * that require routing to professional resources instead of astrology advice.
 */
export function checkSafety(text: string): SafetyResult {
    if (!text || typeof text !== "string") {
        return { isSafe: true };
    }

    const lowerText = text.toLowerCase();

    for (const keyword of SAFETY_KEYWORDS) {
        if (lowerText.includes(keyword)) {
            return {
                isSafe: false,
                response: {
                    message: SAFETY_MESSAGE,
                    resources: SAFETY_RESOURCES,
                },
            };
        }
    }

    return { isSafe: true };
}

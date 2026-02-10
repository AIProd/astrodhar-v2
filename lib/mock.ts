// Mock scoring and remedies for Phase 1
// Uses deterministic calculations based on birth data patterns

import { BirthInput, BreakdownItem } from "./types";

// Vedic remedies pool
const REMEDIES = {
    excellent: [
        "Light a ghee lamp together on Fridays to honor Venus and strengthen love.",
        "Wear matching gold jewelry blessed on an auspicious day.",
        "Plant a Tulsi (Holy Basil) together for divine blessings.",
    ],
    good: [
        "Recite the Ganesha mantra on Tuesdays to remove obstacles.",
        "Donate yellow grains for Jupiter's blessing on partnerships.",
        "Offer milk to a Shiva Lingam on Mondays for harmony.",
        "Keep a pair of Mandarin ducks in your home for relationship luck.",
    ],
    moderate: [
        "Perform the Navagraha Shanti puja to balance planetary energies.",
        "Wear a 7-mukhi Rudraksha for relationship harmony.",
        "Donate clothes to the needy on Saturdays to appease Saturn.",
        "Chant 'Om Shukraya Namaha' 108 times on Fridays.",
        "Keep a crystal rose quartz in your bedroom.",
    ],
    challenging: [
        "Consult a qualified Vedic astrologer for personalized remedies.",
        "Perform Kumbh Vivah ritual if Manglik dosha is present.",
        "Chant Hanuman Chalisa daily for Mars-related issues.",
        "Donate red lentils on Tuesdays to pacify Mars.",
        "Wear a coral gemstone after proper consultation.",
        "Fast on Tuesdays for Mangal Shanti.",
    ],
};

const INSIGHTS = {
    mental: {
        high: "Excellent emotional and intellectual connection. Your Moon signs create a natural understanding and empathy between you.",
        medium:
            "Good mental compatibility with room for deeper connection. Communication will be your key to bridging differences.",
        low: "Different emotional wavelengths require patience. Practice active listening and validate each other's feelings.",
    },
    commitment: {
        high: "Strong foundation for long-term partnership. Saturn blesses this union with stability and mutual respect.",
        medium:
            "Moderate alignment in life goals. Regular discussions about shared vision will strengthen your bond.",
        low: "Different life paths may create tension. Focus on finding common ground and respecting individual aspirations.",
    },
    physical: {
        high: "Excellent physical and energetic compatibility. Mars and Venus are harmoniously aligned.",
        medium:
            "Good physical chemistry with natural attraction. Keep the spark alive through shared activities.",
        low: "Physical connection may need nurturing. Focus on building emotional intimacy first.",
    },
};

/**
 * Generate a deterministic hash from birth data for consistent scoring
 */
function generateHash(input: BirthInput): number {
    const dateNum = input.date.split("-").reduce((a, b) => a + parseInt(b), 0);
    const timeNum = input.time.split(":").reduce((a, b) => a + parseInt(b), 0);
    const cityHash = (input.city || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return (dateNum + timeNum + cityHash) % 100;
}

/**
 * Calculate compatibility between two partners
 * Uses deterministic algorithm based on birth data patterns
 */
export function calculateCompatibility(
    partnerA: BirthInput,
    partnerB: BirthInput
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
    const hashA = generateHash(partnerA);
    const hashB = generateHash(partnerB);

    // Calculate base score from hash combination
    const combinedHash = (hashA + hashB) % 100;

    // Map to 36-point scale (Ashta Koota)
    // Ensure minimum of 12 and maximum of 34 for realistic range
    const rawScore = Math.floor((combinedHash / 100) * 22) + 12;
    const score36 = Math.min(34, Math.max(12, rawScore));

    // Determine label based on score
    let label: string;
    let remedyCategory: keyof typeof REMEDIES;

    if (score36 >= 28) {
        label = "Excellent Match";
        remedyCategory = "excellent";
    } else if (score36 >= 22) {
        label = "Good Compatibility";
        remedyCategory = "good";
    } else if (score36 >= 17) {
        label = "Moderate Match";
        remedyCategory = "moderate";
    } else {
        label = "Challenging - Remedies Recommended";
        remedyCategory = "challenging";
    }

    // Calculate breakdown scores
    const mentalBase = ((hashA * 7 + hashB * 3) % 100) / 100;
    const commitmentBase = ((hashA * 5 + hashB * 5) % 100) / 100;
    const physicalBase = ((hashA * 3 + hashB * 7) % 100) / 100;

    const getInsightLevel = (score: number): "high" | "medium" | "low" => {
        if (score >= 0.7) return "high";
        if (score >= 0.4) return "medium";
        return "low";
    };

    const mental: BreakdownItem = {
        score: Math.round(mentalBase * 12),
        maxScore: 12,
        label: "Mental Rapport",
        insight: INSIGHTS.mental[getInsightLevel(mentalBase)],
    };

    const commitment: BreakdownItem = {
        score: Math.round(commitmentBase * 12),
        maxScore: 12,
        label: "Commitment & Trust",
        insight: INSIGHTS.commitment[getInsightLevel(commitmentBase)],
    };

    const physical: BreakdownItem = {
        score: Math.round(physicalBase * 12),
        maxScore: 12,
        label: "Physical Harmony",
        insight: INSIGHTS.physical[getInsightLevel(physicalBase)],
    };

    // Select remedies - pick 2-3 based on score
    const remedyCount = score36 >= 28 ? 2 : score36 >= 17 ? 3 : 4;
    const selectedRemedies = REMEDIES[remedyCategory].slice(0, remedyCount);

    return {
        overall: { score36, label },
        breakdown: { mental, commitment, physical },
        remedies: selectedRemedies,
    };
}

/**
 * Generate templated advice (Phase 1 - no LLM)
 */
export function generateAdvice(
    partnerA: BirthInput,
    partnerB: BirthInput,
    question: string
): string {
    const compatibility = calculateCompatibility(partnerA, partnerB);
    const score = compatibility.overall.score36;

    // Generate advice based on score range and question keywords
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("marry") || lowerQuestion.includes("marriage")) {
        if (score >= 28) {
            return `Based on your cosmic alignment (${score}/36 Gunas), this union shows excellent promise for marriage. The stars indicate a harmonious partnership built on mutual understanding and shared values. Consider an auspicious muhurat for your wedding to maximize celestial blessings.`;
        } else if (score >= 22) {
            return `Your compatibility score of ${score}/36 suggests a good foundation for marriage. While there are areas that will require conscious effort, your combined energies can create a lasting bond. Performing the recommended remedies before marriage can strengthen your union.`;
        } else {
            return `With a score of ${score}/36, marriage requires careful consideration and the guidance of an experienced astrologer. This doesn't mean the union is impossible, but specific remedies and rituals are advisable to ensure harmony.`;
        }
    }

    if (
        lowerQuestion.includes("child") ||
        lowerQuestion.includes("children") ||
        lowerQuestion.includes("baby")
    ) {
        return `The fifth house analysis from both charts indicates potential for progeny. For ${partnerA.name} and ${partnerB.name}, Jupiter's blessings play a key role. Consider Santana Gopala mantra jaap and visiting Santoshi Mata temple for divine blessings in this matter.`;
    }

    if (lowerQuestion.includes("career") || lowerQuestion.includes("work")) {
        return `Looking at the tenth house for both partners, your professional lives can complement each other well. ${partnerA.name}'s strengths may balance ${partnerB.name}'s approach. Support each other's ambitions while maintaining work-life harmony.`;
    }

    // Default advice
    return `Based on the Vedic analysis of both charts, ${partnerA.name} and ${partnerB.name} have a compatibility score of ${score}/36. ${compatibility.overall.label}. Focus on the strengths of your union: ${compatibility.breakdown.mental.insight} The recommended remedies can help enhance harmony in areas that need attention.`;
}

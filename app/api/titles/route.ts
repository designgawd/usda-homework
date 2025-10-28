import { NextResponse } from "next/server";
import { createHash } from "crypto";

let cachedAgencies: AgencyData[] | null = null;
let lastFetched = 0;
const CACHE_TTL = 3600 * 1000;

type AgencyData = {
    title: number;
    name: string;
    agency: string;
    wordCount: number;
    checksum: string;
    sectionCount: number;
};

export async function GET() {
    console.log("GETTING TITLES")
    if (cachedAgencies && Date.now() - lastFetched < CACHE_TTL) {
        console.log("USING CACHE")
        return NextResponse.json(cachedAgencies);
    }

    try {
        const titlesRes = await fetch("https://www.ecfr.gov/api/versioner/v1/titles.json", {
            next: { revalidate: 86400 },
            headers: {
                "Content-Type": "application/json",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
            },
        });

        const titlesText = await titlesRes.text();
        const titles = JSON.parse(titlesText);
        const agencies: AgencyData[] = [];

        for (const t of titles.titles) {
            const xmlRes = await fetch(
                `https://www.ecfr.gov/api/versioner/v1/full/${t.up_to_date_as_of}/title-${t.number}.xml`,{
                    headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
                    },
                }
            );
            const xmlText = await xmlRes.text();

            const cleanText = xmlText
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim();
            const words = cleanText.split(" ").filter(Boolean);
            const wordCount = words.length;
            const checksum = createHash("sha256").update(xmlText).digest("hex");
            const sectionCount = (xmlText.match(/<DIV8[^>]*\sTYPE="SECTION"[^>]*>/gi) || []).length;

            agencies.push({
                title: t.number,
                name: t.name || "Unknown",
                agency: t.agency || "Unknown",
                wordCount,
                checksum,
                sectionCount,
            });
        }

        cachedAgencies = agencies;
        lastFetched = Date.now();

        return NextResponse.json(agencies);
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: "Failed to process eCFR data" },
            { status: 500 }
        );
    }
}

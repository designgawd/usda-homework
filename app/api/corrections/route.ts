import { NextResponse } from "next/server";
import { CorrectionsResponse } from "@/app/types/Corrections";

export async function GET() {
    try {
        const response = await fetch(
            "https://www.ecfr.gov/api/admin/v1/corrections.json",
            {
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
                },
            }
        );

        if (!response.ok) {
            console.error(
                "Failed to fetch:",
                response.status,
                response.statusText
            );
            return NextResponse.json(
                {
                    error: `Failed to fetch corrections data. Status: ${response.status}`,
                },
                { status: response.status }
            );
        }

        const text = await response.text();
        try {
            const data: CorrectionsResponse = JSON.parse(text);
            return NextResponse.json(data);
        } catch (error) {
            console.error("Failed to parse JSON:", error);
            console.error("Received text:", text);
            return NextResponse.json(
                { error: "Failed to parse JSON response from external API." },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("An unexpected error occurred:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";

interface CfrReference {
    title: number;
    chapter: string;
}

interface Agency {
    name: string;
    short_name: string;
    display_name: string;
    sortable_name: string;
    slug: string;
    children: Agency[];
    cfr_references: CfrReference[];
}

interface AgenciesResponse {
    agencies: Agency[];
}

export async function GET() {
    try {
        const response = await fetch(
            "https://www.ecfr.gov/api/admin/v1/agencies.json",
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
                    error: `Failed to fetch agency data. Status: ${response.status}`,
                },
                { status: response.status }
            );
        }

        const text = await response.text();
        try {
            const data: AgenciesResponse = JSON.parse(text);
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

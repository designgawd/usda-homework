"use client";
import { useEffect, useState, useRef } from "react";
import AgencyTable from "./components/AgencyTable";
import { useLayoutData } from "@/contexts/LayoutContext";
import { Agency, TitleDetail } from "./types/Agencies";
import { Correction } from "./types/Corrections";

export default function Home() {
    const { agencies, corrections } = useLayoutData();
    const [titles, setTitles] = useState<TitleDetail[]>();
    const effectRan = useRef(false);

    useEffect(() => {
        if (!effectRan.current) {
            effectRan.current = true;
            const getTitlesWithDetails = async () => {
                const res = await fetch("/api/titles");
                const titlesRes = await res.json();
                setTitles(titlesRes);
            };
            getTitlesWithDetails();
        }
    });

    function applyCorrections(
        agencies: Agency[],
        corrections: Correction[]
    ): Agency[] {

        const correctionMap = new Map<string, Correction[]>();

        for (const corr of corrections) {
            for (const ref of corr.cfr_references) {
                const { title, chapter } = ref.hierarchy;
                const key = `${title}-${chapter}`;

                if (!correctionMap.has(key)) {
                    correctionMap.set(key, []);
                }
                correctionMap.get(key)!.push(corr);
            }
        }

        for (const agency of agencies) {
            for (const cfr of agency.cfr_references) {

                const key = `${cfr.title}-${cfr.chapter}`;
                const matches = correctionMap.get(key) ?? [];

                cfr.corrections = matches.slice(); 
            }
        }

        return agencies;
    }

    function countCorrectionsPerAgency(agencies: Agency[]): Agency[] {
        return agencies.map((agency) => {
            const total = agency.cfr_references.reduce((sum, cfr) => {
                return sum + (cfr.corrections?.length ?? 0);
            }, 0);

            return {
                ...agency,
                correctionCount: total,
            };
        });
    }

    function addTotalWordCount(agencies: Agency[] | undefined | null) {
        if (!agencies) return;
        agencies.forEach((agency) => {
            const sum = agency.cfr_references.reduce((acc, cfr) => {
                return acc + (cfr.details?.wordCount ?? 0);
            }, 0);

            (agency as Agency).totalWordCount = sum;
        });

        return agencies as Agency[];
    }

    const result = applyCorrections(
        agencies.agencies,
        corrections.ecfr_corrections
    );

    function attachTitleDetails(
        agencies: Agency[],
        titleDetails: TitleDetail[] | undefined | null
    ) {
        if (!titleDetails) return;

        const titleMap = new Map<number, TitleDetail>();
        titleDetails.forEach((detail) => {
            titleMap.set(detail.title, detail);
        });

        agencies.forEach((agency) => {
            agency.cfr_references.forEach((cfr) => {
                const detail = titleMap.get(cfr.title);
                if (detail) {
                    cfr.details = detail;
                } else {
                    cfr.details = undefined;
                }
            });
        });

        return agencies;
    }

    function addTotalCheckSum(agencies: Agency[] | undefined) {
        if (!agencies) return;
        agencies.forEach((agency) => {
            const checksums = agency.cfr_references
                .map((cfr) => cfr.details?.checksum)
                .filter((cs): cs is string => typeof cs === "string");

            const total = checksums.sort().join("");

            (agency as Agency).totalCheckSum = total;
        });

        return agencies;
    }

    const summary = countCorrectionsPerAgency(result);
    const summaryWithDetails = attachTitleDetails(summary, titles);
    const summaryWithWordCount = addTotalWordCount(summaryWithDetails);
    const summaryWithTotalCheckSum = addTotalCheckSum(summaryWithWordCount);

    if (summaryWithWordCount) console.log("Summary", JSON.stringify(summaryWithWordCount[4].cfr_references[0].corrections));

    return (
        <main className="p-4 sm:p-6 lg:p-8">
            <AgencyTable agencies={summaryWithTotalCheckSum || summary} />
        </main>
    );
}

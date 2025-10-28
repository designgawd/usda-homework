"use client";
import AgencyTable from "./components/AgencyTable";
import { useLayoutData } from "@/contexts/LayoutContext";
import { Agency } from "./types/Agencies";
import { Correction } from "./types/Corrections";

export default function Home() {
    const { agencies, corrections, titles } = useLayoutData();

    // console.log("Agencies",agencies.agencies)
    // console.log("Correctionsn",corrections.ecfr_corrections)
    console.log("Titles", titles);

    /**
     * Mutates the `agencies` array: every `cfr_references` entry that
     * matches a correction (by title + chapter) receives a `corrections`
     * array containing the matching correction objects.
     *
     * @param agencies   Source agency list
     * @param corrections List of correction records
     * @returns The same `agencies` array (now with `corrections` fields)
     */
    function applyCorrections(
        agencies: Agency[],
        corrections: Correction[]
    ): Agency[] {
        // ---------- 1. Build a fast lookup map ----------
        // key = `${title}-${chapter}`  (both are strings)
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

        // ---------- 2. Attach corrections to agencies ----------
        for (const agency of agencies) {
            for (const cfr of agency.cfr_references) {
                // Agency `title` is a number → convert to string for the key
                const key = `${cfr.title}-${cfr.chapter}`;
                const matches = correctionMap.get(key) ?? [];

                // Always assign an array (empty if no matches)
                cfr.corrections = matches.slice(); // .slice() gives a shallow copy
            }
        }

        return agencies;
    }

    /**
     * Counts how many corrections are attached to each agency.
     *
     * @param agencies  The agencies array **after** `applyCorrections` has run.
     * @returns An array of objects: `{ agencyName: string, correctionCount: number }`
     */
    function countCorrectionsPerAgency(agencies: Agency[]): {
        agencyName: string;
        correctionCount: number;
    }[] {
        return agencies.map((agency) => {
            // Sum corrections across **all** CFR references of this agency
            const total = agency.cfr_references.reduce((sum, cfr) => {
                // `corrections` is always defined (even if empty) because applyCorrections sets it
                return sum + (cfr.corrections?.length ?? 0);
            }, 0);

            return {
                ...agency, // or use `short_name` / `display_name` if you prefer
                correctionCount: total,
            };
        });
    }

    const result = applyCorrections(
        agencies.agencies,
        corrections.ecfr_corrections
    );
    const summary = countCorrectionsPerAgency(result);

    return (
        <main className="p-4 sm:p-6 lg:p-8">
            <AgencyTable agencies={summary} />
        </main>
    );
}

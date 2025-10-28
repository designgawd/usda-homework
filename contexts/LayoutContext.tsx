"use client";
import { createContext, useContext } from "react";
import { AgenciesResponse } from "@/app/types/Agencies";
import { TitlesResponse } from "@/app/types/Titles";
import { CorrectionsResponse } from "@/app/types/Corrections";



export interface USDAdata {
    agencies: AgenciesResponse,
    titles: TitlesResponse,
    corrections: CorrectionsResponse,
}

const LayoutContext = createContext<USDAdata | null>(null);

export function useLayoutData() {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error("useLayoutData must be used within LayoutProvider");
    }
    return context;
}

export function LayoutProvider({
    children,
    data,
}: {
    children: React.ReactNode;
    data: USDAdata;
}) {
    return (
        <LayoutContext.Provider value={data}>{children}</LayoutContext.Provider>
    );
}

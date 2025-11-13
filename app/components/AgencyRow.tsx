"use client";
import React, { useState, useRef } from "react";
import { Agency } from "@/app/types/Agencies";
import ChecksumIdenticon from "./ChecksumIdenticon";
import HistoricalGraph from "./HistoricalGraph";
import { CorrectionSpeedScatter } from "./CorrectionSpeedScatter";

interface AgencyRowProps {
    agency: Agency;
    index: number;
}

export default function AgencyRow({ agency, index }: AgencyRowProps) {
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [showAll, setShowAll] = useState<number>(3);
    const topRef = useRef<HTMLDivElement | null>(null);

    const handleScrollToTop = () => {
        if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    function readingTime(charCount: number) {
        if(!charCount) return "Loading..."
        const words = Math.round(charCount / 5);
        const minutes = Math.round(words / 225);

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours === 0) {
            return `${mins} min`;
        } else if (mins === 0) {
            return <span className={`${hours > 50 ? "text-yellow-500":""}`}>{`${hours} hr`}</span>;
        } else {
            return <span className={`${hours > 100 ? "text-red-500 font-semibold": hours > 50 ? "text-orange-500":""}`}>{`${hours} hr ${mins} min`}</span>;
        }
    }


    return (
        <div>
            <div
                className={`${
                    showDetails ? "bg-blue-400 text-white font-semibold" : index % 2 === 0 ? "bg-gray-100" : ""
                } grid grid-cols-1 md:grid-cols-12 items-center hover:bg-gray-500 hover:cursor-pointer hover:text-white`}
                onClick={() => setShowDetails(!showDetails)}
            >
                <div className="py-3 px-6 text-left md:col-span-4 text-sm">
                    {agency.name} ({agency.short_name})
                </div>
                <div className="py-3 px-6 text-left md:col-span-2 text-sm">
                    {agency.cfr_references.map((ref, key) => (
                        <p key={key}>
                            Title {ref.title}, Chapter {ref.chapter}
                        </p>
                    ))}
                </div>
                <div className="py-3 px-6 text-left md:col-span-2 text-sm">
                    {readingTime(agency.totalWordCount)}
                </div>
                <div className="py-3 px-6 text-center md:col-span-1 text-sm">
                    {agency.correctionCount}
                </div>

                <div className="py-3 px-6 text-center md:col-span-1 text-sm">
                    {agency.children.length}
                </div>
                <div className="py-3 px-6 md:col-span-2 text-sm text-center">
                    {agency.totalCheckSum && <div className="flex justify-center"><ChecksumIdenticon checksum={agency.totalCheckSum} sizes={5} pixelSizes={5} /></div>}
                    {" "}
                    {agency.correctionCount >= 25 ? (<div className="font-semibold text-red-600">Over-Regulation</div>) : ""}
                </div>
            </div>
            {showDetails && (
                <div  ref={topRef} className="py-3 px-3 text-left text-sm bg-white min-h-[100px] border border-gray-100 gap-4">
                    <div className="">
                        {agency.cfr_references.map((ag, key)=>(
                            <div key={key} className="rounded-2xl border border-gray-300 shadow-sm p-4 m-2 grid grid-cols-12 gap-4">
                                {ag.details && (
                                    <div className="ml-8 col-span-3">
                                        <h3 className="text-[14px] font-semibold">Title {ag.title} - Chapter {ag.chapter}</h3>
                                        <p className="mb-2 min-h-[30px] text-[14px]">{ag.details.name}</p>
                                        <div className="mb-2">{ag.details?.checksum && <ChecksumIdenticon checksum={ag.details?.checksum} sizes={6} pixelSizes={20} />}</div>
                                        <p className="mb-2">Number of Changes: {ag.corrections?.length}</p>
                                        <p><span className="font-semibold">Reading Time:</span> {readingTime(ag.details.wordCount)}</p>
                                        <p><span className="font-semibold">Character Count:</span> {ag.details.wordCount}</p>
                                        <p><span className="font-semibold">Sections Count:</span> {ag.details.sectionCount}</p>
                                    </div>
                                )}

                                <div className="col-span-9">
                                    <h3 className="text-2xl mb-4 font-semibold">Historical Changes Over Time</h3>
                                    {ag.corrections?.length ? (
                                        <div>
                                            <HistoricalGraph data={ag.corrections} />
                                        </div>
                                        ) : ""}
                                    {ag.corrections?.length ? (
                                        <div>
                                            <CorrectionSpeedScatter data={ag.corrections} />
                                        </div>
                                        ) : ""}
                                    <div className="grid grid-cols-3 gap-4">
                                        {ag.corrections?.length ? ag.corrections.slice(0,showAll).map(
                                            (corr, key)=>(
                                                <div key={key} className="border border-gray-300 p-4 rounded-md">
                                                    <p className="font-semibold">{corr.corrective_action}</p>
                                                    <p className="">{corr.fr_citation}</p>
                                                    <p className="text-red-600">Date Occured: {corr.error_occurred}</p>
                                                    <p className="text-green-600">Date Corrected: {corr.error_corrected}</p>
                                                    <p className="text-blue-600">Last Modified: {corr.last_modified}</p>
                                                </div>
                                            )
                                        ) : (<h3 className="text-lg italic">There are no Change in History</h3>)}
                                    </div>
                                    <div className="mt-4">
                                        {ag.corrections?.length && showAll <=3 ? 
                                            <button 
                                                onClick={()=>setShowAll(999)}
                                                className="w-full bg-blue-600 rounded-2xl px-4 py-2 text-white font-semibold cursor-pointer hover:bg-blue-800 hover:scale-102 transition duration-75">
                                                    Show All ({agency.correctionCount})
                                            </button> : ""}
                                        {ag.corrections?.length && showAll === 999 ? 
                                            <button 
                                                onClick={()=>{setShowAll(3);handleScrollToTop()}}
                                                className="w-full bg-blue-600 rounded-2xl px-4 py-2 text-white font-semibold cursor-pointer hover:bg-blue-800 hover:scale-102 transition duration-75">
                                                    Show Less
                                            </button> : ""}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

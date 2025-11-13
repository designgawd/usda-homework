import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format, parseISO, differenceInDays } from "date-fns";
import { useState } from "react";

type Point = {
    id: number;
    occurred: string;
    corrected: string;
    lagDays: number;
    occurredTimestamp: number;
};

// eslint-disable-next-line
const prepScatter = (raw: any[]): Point[] => {
    return raw.map((r) => ({
        id: r.id,
        occurred: r.error_occurred,
        corrected: r.error_corrected,
        lagDays: differenceInDays(
            r.error_corrected && parseISO(r.error_corrected),
            r.error_occurred && parseISO(r.error_occurred)
        ),
        occurredTimestamp: r.error_occurred && parseISO(r.error_occurred).getTime(),
    }));
};

// eslint-disable-next-line
export const CorrectionSpeedScatter: React.FC<{ data: any[] }> = ({
    data,
}) => {
    const points = prepScatter(data);
    const [orientation, setOrientation] = useState("default");
    // console.log("Correction Speed Scatter:", points);
    // eslint-disable-next-line
    const tooltip = ({ active, payload }: any) => {
        if (!active || !payload) return null;
        const p = payload[0].payload;
        return (
            <div className="bg-white p-2 border rounded">
                <p>
                    <strong>Record {p.id}</strong>
                </p>
                <p>Occurred: {format(parseISO(p.occurred), "PPP")}</p>
                <p>Corrected: {format(parseISO(p.corrected), "PPP")}</p>
                <p>
                    Lag: <strong>{p.lagDays} days</strong>
                </p>
            </div>
        );
    };

    const dateAxisFormatter = (timestamp: number) => {
        return format(new Date(timestamp), "MMM yyyy");
    };

    return (
        <div className="">
            <div className="flex justify-start mb-4">
                <h3 className="text-2xl font-semibold italic mx-6 text-teal-500">Day to Corrections</h3>
                <select
                    className="border rounded p-2"
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value)}
                >
                    <option value="default">Days to Correct vs Record ID</option>
                    <option value="reversed">Record ID vs Days to Correct</option>
                    <option value="lagOverTime">Lag Over Time</option>
                </select>
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                    <CartesianGrid />
                    <XAxis
                        type="number"
                        dataKey={
                            orientation === "lagOverTime"
                                ? "occurredTimestamp"
                                : orientation === "default"
                                ? "lagDays"
                                : "id"
                        }
                        domain={["dataMin", "dataMax"]}
                        tickFormatter={
                            orientation === "lagOverTime"
                                ? dateAxisFormatter
                                : undefined
                        }
                        name={
                            orientation === "lagOverTime"
                                ? "Date of Occurrence"
                                : orientation === "default"
                                ? "Days to correct"
                                : "Record ID"
                        }
                        label={{
                            value:
                                orientation === "lagOverTime"
                                    ? "Date of Occurrence"
                                    : orientation === "default"
                                    ? "Days to correct"
                                    : "Record ID",
                            position: "insideBottom",
                            offset: -5,
                        }}
                    />
                    <YAxis
                        type="number"
                        dataKey={
                            orientation === "lagOverTime"
                                ? "lagDays"
                                : orientation === "default"
                                ? "id"
                                : "lagDays"
                        }
                        name={
                            orientation === "lagOverTime"
                                ? "Days to correct"
                                : orientation === "default"
                                ? "Record ID"
                                : "Days to correct"
                        }
                        label={{
                            value:
                                orientation === "lagOverTime"
                                    ? "Days to correct"
                                    : orientation === "default"
                                    ? "Record ID"
                                    : "Days to correct",
                            angle: -90,
                            position: "insideLeft",
                        }}
                    />
                    <Tooltip content={tooltip} />
                    <Scatter name="Corrections" data={points} fill="#8884d8" />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};

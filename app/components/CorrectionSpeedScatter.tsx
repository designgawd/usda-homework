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

type Point = {
    id: number;
    occurred: string;
    corrected: string;
    lagDays: number;
};

// eslint-disable-next-line
const prepScatter = (raw: any[]): Point[] => {
    return raw.map((r) => ({
        id: r.id,
        occurred: r.error_occurred,
        corrected: r.error_corrected,
        lagDays: differenceInDays(
            parseISO(r.error_corrected),
            parseISO(r.error_occurred)
        ),
    }));
};

// eslint-disable-next-line
export const CorrectionSpeedScatter: React.FC<{ data: any[] }> = ({ data }) => {
    const points = prepScatter(data);
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

    return (
        <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis
                    dataKey="lagDays"
                    name="Days to correct"
                    label={{
                        value: "Days to correct",
                        position: "insideBottom",
                        offset: -5,
                    }}
                />
                <YAxis
                    type="number"
                    dataKey="id"
                    name="Record ID"
                    label={{
                        value: "Record ID",
                        angle: -90,
                        position: "insideLeft",
                    }}
                />
                <Tooltip content={tooltip} />
                <Scatter name="Corrections" data={points} fill="#8884d8" />
            </ScatterChart>
        </ResponsiveContainer>
    );
};

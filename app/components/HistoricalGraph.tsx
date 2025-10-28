import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

type DataPoint = {
    name: string; // e.g. "Record 3560"
    occurred: number; // timestamp (ms)
    corrected: number; // timestamp (ms)
    lastModified: number; // timestamp (ms)
};
// eslint-disable-next-line
const prepareData = (raw: any[]): DataPoint[] => {
    return raw.map((item) => {
        const base = item.id ?? item.title ?? "Unknown";
        return {
            name: `Record ${base}`,
            occurred: item.error_occurred ? parseISO(item.error_occurred).getTime() : "",
            corrected: parseISO(item.error_corrected).getTime(),
            lastModified: parseISO(item.last_modified).getTime(),
        };
    });
};


// eslint-disable-next-line
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const formatDate = (ts: number) => format(ts, "PPP");
        return (
            <div
                className="bg-white p-3 border border-gray-300 rounded shadow"
                style={{ fontSize: "0.85rem" }}
            >
                <p className="font-semibold">{label}</p>
                {
                // eslint-disable-next-line
                payload.map((p: any, i: number) => (
                    <p key={i} style={{ color: p.color }}>
                        {p.name}: <strong>{formatDate(p.value)}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

type Props = {
    // eslint-disable-next-line
    data: any[];
};

export default function HistoricalGraph({ data }: Props) {
    const chartData = prepareData(data);
    const formatTick = (ts: number) => format(ts, "MMM yyyy");

    return (
        <div style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer>
                <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="occurred"
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        tickFormatter={formatTick}
                        label={{
                            value: "Timeline",
                            position: "insideBottom",
                            offset: -10,
                        }}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                        name="Occurred"
                        type="monotone"
                        dataKey="occurred"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 5 }}
                        connectNulls
                    />
                    <Line
                        name="Corrected"
                        type="monotone"
                        dataKey="corrected"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        dot={{ r: 5 }}
                        connectNulls
                    />
                    <Line
                        name="Last Modified"
                        type="monotone"
                        dataKey="lastModified"
                        stroke="#ffc658"
                        strokeWidth={2}
                        dot={{ r: 5 }}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

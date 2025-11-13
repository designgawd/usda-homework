import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import { format, parseISO, differenceInDays } from "date-fns";
import { useState } from "react";

/*
Sample Prompts to include filtering and rendering different views:

- in the component CorrectionSpeedScatter.tsx... it currently take the data and shows the record ids on the y-axis and the days to correction on the x-axis... I want to put a dropdown 
  above this chart that swithches between showing the graph with the x and y axis reversed, as an option to thhe user...

- That was great! Okay, look at the type "Point" and determine is there a third view I can add to the dropdown that might be useful information

- Okay great! I want to add a similar dropdown experience in the component HistoricalGraph.tsx... Let's take the current view and give it a name, then create 2 other potentifal views
  of the data on the chart type (if possible)... The goal is to serve the data that is helpful, but find different ways to use the data and represent it in the chart...
*/

type DataPoint = {
    name: string; // e.g. "Record 3560"
    occurred: number | null; // timestamp (ms)
    corrected: number | null; // timestamp (ms)
    lastModified: number | null; // timestamp (ms)
};

type LagDataPoint = {
    name: string;
    lagDays: number;
};

type MonthlyActivity = {
    month: string;
    occurred: number;
    corrected: number;
    lastModified: number;
};

// eslint-disable-next-line
const prepareTimelineData = (raw: any[]): DataPoint[] => {
    return raw.map((item) => {
        const base = item.id ?? item.title ?? "Unknown";
        return {
            name: `Record ${base}`,
            occurred: item.error_occurred
                ? parseISO(item.error_occurred).getTime()
                : null,
            corrected: item.error_corrected
                ? parseISO(item.error_corrected).getTime()
                : null,
            lastModified: item.last_modified
                ? parseISO(item.last_modified).getTime()
                : null,
        };
    });
};

// eslint-disable-next-line
const prepareLagData = (raw: any[]): LagDataPoint[] => {
    return raw
        .map((item) => {
            const base = item.id ?? item.title ?? "Unknown";
            if (item.error_occurred && item.error_corrected) {
                return {
                    name: `Record ${base}`,
                    lagDays: differenceInDays(
                        parseISO(item.error_corrected),
                        parseISO(item.error_occurred)
                    ),
                };
            }
            return null;
        })
        .filter((item): item is LagDataPoint => item !== null);
};

// eslint-disable-next-line
const prepareMonthlyActivity = (raw: any[]): MonthlyActivity[] => {
    const activity: { [key: string]: MonthlyActivity } = {};

    raw.forEach((item) => {
        const dates = {
            occurred: item.error_occurred,
            corrected: item.error_corrected,
            lastModified: item.last_modified,
        };

        Object.keys(dates).forEach((key) => {
            const dateStr = dates[key as keyof typeof dates];
            if (dateStr) {
                const month = format(parseISO(dateStr), "MMM yyyy");
                if (!activity[month]) {
                    activity[month] = {
                        month,
                        occurred: 0,
                        corrected: 0,
                        lastModified: 0,
                    };
                }
                activity[month][key as keyof MonthlyActivity]++;
            }
        });
    });

    return Object.values(activity);
};

// eslint-disable-next-line
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const formatDate = (ts: number | null) =>
            ts ? format(ts, "PPP") : "N/A";
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
                    ))
                }
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
    const [view, setView] = useState("timeline");

    const renderChart = () => {
        switch (view) {
            case "lag":
                const lagData = prepareLagData(data);
                return (
                    <BarChart data={lagData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                            dataKey="lagDays"
                            fill="#8884d8"
                            name="Correction Lag (Days)"
                        />
                    </BarChart>
                );
            case "activity":
                const monthlyActivityData = prepareMonthlyActivity(data);
                return (
                    <BarChart data={monthlyActivityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                            dataKey="occurred"
                            stackId="a"
                            fill="#8884d8"
                            name="Occurred"
                        />
                        <Bar
                            dataKey="corrected"
                            stackId="a"
                            fill="#82ca9d"
                            name="Corrected"
                        />
                        <Bar
                            dataKey="lastModified"
                            stackId="a"
                            fill="#ffc658"
                            name="Last Modified"
                        />
                    </BarChart>
                );
            case "timeline":
            default:
                const timelineData = prepareTimelineData(data);
                const formatTick = (ts: number | null) =>
                    ts ? format(ts, "MMM yyyy") : "";
                return (
                    <LineChart
                        data={timelineData}
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
                );
        }
    };

    return (
        <div className="mb-8 h-[450px] pb-8">
            <div className="flex justify-start mb-4">
                <h3 className="text-2xl font-semibold italic mx-6 relative top-1 text-teal-500">Historical Chart</h3>
                <select
                    className="border rounded p-2"
                    value={view}
                    onChange={(e) => setView(e.target.value)}
                >
                    <option value="timeline">Event Timeline</option>
                    <option value="lag">Correction Lag by Record</option>
                    <option value="activity">Activity by Month</option>
                </select>
            </div>
            <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
        </div>
    );
}

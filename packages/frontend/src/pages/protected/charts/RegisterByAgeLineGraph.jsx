import { format } from "date-fns";
import { useEffect, useState } from "react";
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

const COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#84cc16",
  "#fde047",
  "#a855f7",
  "#ec4899",
  "#60a5fa",
  "#6b7280",
  "#854d0e",
  "#0369a1",
  "#F44336",
  "#6b21a8",
];

const RegisterByAgeLineGraph = ({ question, answers }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const groupedData = answers.reduce((acc, item) => {
      const dateTimeFormatted = format(
        new Date(item.date_time),
        "dd/MM/yy HH:mm"
      );
      if (!acc[dateTimeFormatted]) {
        acc[dateTimeFormatted] = {
          date_time: dateTimeFormatted,
          "Menos de 18 anos": 0,
          "18-24 anos": 0,
          "25-34 anos": 0,
          "35-44 anos": 0,
          "45-54 anos": 0,
          "55-64 anos": 0,
          "65 anos ou mais": 0,
        };
      }
      if (item.answer === 5) acc[dateTimeFormatted]["Menos de 18 anos"] += item.total_answer;
      if (item.answer === 6) acc[dateTimeFormatted]["18-24 anos"] += item.total_answer;
      if (item.answer === 7) acc[dateTimeFormatted]["25-34 anos"] += item.total_answer;
      if (item.answer === 8) acc[dateTimeFormatted]["35-44 anos"] += item.total_answer;
      if (item.answer === 9) acc[dateTimeFormatted]["45-54 anos"] += item.total_answer;
      if (item.answer === 10) acc[dateTimeFormatted]["55-64 anos"] += item.total_answer;
      if (item.answer === 11) acc[dateTimeFormatted]["65 anos ou mais"] += item.total_answer;
      return acc;
    }, {});

    const graphData = Object.values(groupedData);
    setData(graphData);
  }, [answers]);

  return (
    <div className="w-full xl:w-1/2 p-4 flex flex-col items-center">
      <h2 className="text-xl text-strong my-2">{question}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date_time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Menos de 18 anos" stroke={COLORS[0]} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="18-24 anos" stroke={COLORS[1]} />
          <Line type="monotone" dataKey="25-34 anos" stroke={COLORS[2]} />
          <Line type="monotone" dataKey="35-44 anos" stroke={COLORS[3]} />
          <Line type="monotone" dataKey="45-54 anos" stroke={COLORS[4]} />
          <Line type="monotone" dataKey="55-64 anos" stroke={COLORS[5]} />
          <Line type="monotone" dataKey="65 anos ou mais" stroke={COLORS[6]} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RegisterByAgeLineGraph;

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

const RegisterByGenderLineGraph = ({ question, answers }) => {
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
          Feminino: 0,
          Masculino: 0,
          "Prefiro não dizer": 0,
          Outro: 0,
        };
      }
      if (item.answer === 1)
        acc[dateTimeFormatted].Feminino += item.total_answer;
      if (item.answer === 2)
        acc[dateTimeFormatted].Masculino += item.total_answer;
      if (item.answer === 3)
        acc[dateTimeFormatted]["Prefiro não dizer"] += item.total_answer;
      if (item.answer === 4) acc[dateTimeFormatted].Outro += item.total_answer;
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
          <Line
            type="monotone"
            dataKey="Masculino"
            stroke={COLORS[0]}
            activeDot={{ r: 8 }}
          />
          <Line type="monotone" dataKey="Feminino" stroke={COLORS[1]} />
          <Line
            type="monotone"
            dataKey="Prefiro não dizer"
            stroke={COLORS[2]}
          />
          <Line
            type="monotone"
            dataKey="Outro"
            stroke={COLORS[3]}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RegisterByGenderLineGraph;

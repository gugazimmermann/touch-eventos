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

const RegisterLineGraph = ({ question, answers }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const graphData = answers.map((item) => ({
      ...item,
      "Cadastros": parseInt(item.total_registers),
      "Confirmados": parseInt(item.total_confirmed),
      "Brindes": parseInt(item.total_gift),
      date_time: format(new Date(item.date_time), "dd/MM/yy HH:mm"),
    }));
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
            dataKey="Cadastros"
            stroke={COLORS[0]}
            activeDot={{ r: 8 }}
          />
          <Line type="monotone" dataKey="Confirmados" stroke={COLORS[1]} />
          <Line type="monotone" dataKey="Brindes" stroke={COLORS[2]} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RegisterLineGraph;

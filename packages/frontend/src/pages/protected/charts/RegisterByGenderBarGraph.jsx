import { format } from "date-fns";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
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

const RegisterByGenderBarGraph = ({ question, answers }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const groupedByDateTime = {};
    answers.forEach((item) => {
      const dateTime = format(new Date(item.date_time), "dd/MM/yy");
      const answerKey = ["Feminino", "Masculino", "Prefiro não dizer", "Outro"][
        item.answer - 1
      ];
      if (!groupedByDateTime[dateTime]) groupedByDateTime[dateTime] = { dateTime };
      groupedByDateTime[dateTime][answerKey] =
        (groupedByDateTime[dateTime][answerKey] || 0) + item.total_answer;
    });
    const dataArray = Object.values(groupedByDateTime);
    setData(dataArray);
  }, [answers]);

  return (
<div className="w-full xl:w-1/2 p-4 flex flex-col items-center">
      <h2 className="text-xl text-strong my-2">{question}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dateTime" />
          <YAxis />
          <Tooltip />
          <Legend />
          {["Feminino", "Masculino", "Prefiro não dizer", "Outro"].map((gender, index) => (
            <Bar key={gender} dataKey={gender} fill={COLORS[index]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RegisterByGenderBarGraph;

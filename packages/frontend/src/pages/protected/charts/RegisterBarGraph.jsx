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

const RegisterBarGraph = ({ question, answers }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const convertedData = answers.map((item) => ({
      ...item,
      total_registers: parseInt(item.total_registers, 10),
      total_confirmed: parseInt(item.total_confirmed, 10),
      total_gift: parseInt(item.total_gift, 10),
      day: format(new Date(item.date_time), "dd/MM/yy"),
    }));
    const dataGroupedByDay = convertedData.reduce((a, c) => {
      const day = c.day;
      if (!a[day]) {
        a[day] = { Cadastros: 0, Confirmados: 0, Brindes: 0 };
      }
      a[day].Cadastros += c.total_registers;
      a[day].Confirmados += c.total_confirmed;
      a[day].Brindes += c.total_gift;
      return a;
    }, {});
    const groupedDataArray = Object.keys(dataGroupedByDay).map((day) => ({
      day,
      ...dataGroupedByDay[day],
    }));
    setData(groupedDataArray);
  }, [answers]);

  return (
    <div className="w-full xl:w-1/2 p-4 flex flex-col items-center">
      <h2 className="text-xl text-strong my-2">{question}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Cadastros" fill={COLORS[0]} />
          <Bar dataKey="Confirmados" fill={COLORS[1]} />
          <Bar dataKey="Brindes" fill={COLORS[2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RegisterBarGraph;

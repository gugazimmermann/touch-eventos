import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

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

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {percent > 0 && `${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PieGraph = ({ question, answers }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const graphData = answers.map((a) => ({
      name: a.answer,
      value: a.quantity,
    }));
    setData(graphData);
  }, [answers]);

  return (
    <div className="w-1/2 xl:w-1/3 p-4 flex flex-col items-center">
      <h2 className="text-xl text-strong my-2">{question}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Legend />
          <Pie
            data={data}
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieGraph;

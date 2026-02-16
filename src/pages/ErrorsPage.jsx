import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function ErrorsPage(){

  const pieData={
    labels:["Critical","High","Medium","Low"],
    datasets:[{
      data:[8,18,30,44],
      backgroundColor:["#ef4444","#f59e0b","#3b82f6","#22c55e"]
    }]
  };

  const barData={
    labels:["INFO","WARNING","ERROR","CRITICAL"],
    datasets:[{
      label:"Logs",
      data:[1200,400,200,80],
      backgroundColor:["#3b82f6","#f59e0b","#ef4444","#8b5cf6"]
    }]
  };

  return(
    <div className="grid grid-cols-2 gap-6">

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="mb-4 font-semibold">Error Distribution</h3>
        <Pie data={pieData}/>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="mb-4 font-semibold">Log Levels</h3>
        <Bar data={barData}/>
      </div>

    </div>
  )
}

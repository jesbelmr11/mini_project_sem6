import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

export default function SystemMetrics(){

  const cpuData={
    labels:["00","04","08","12","16","20"],
    datasets:[{
      label:"CPU %",
      data:[40,52,65,72,60,55],
      borderColor:"#3b82f6",
      tension:0.4
    }]
  };

  const loadData={
    labels:["1m","5m","15m"],
    datasets:[{
      label:"Load",
      data:[2.2,1.8,1.4],
      backgroundColor:"#3b82f6"
    }]
  };

  const networkData={
    labels:["00","04","08","12","16","20"],
    datasets:[
      {
        label:"Incoming",
        data:[120,150,300,340,250,180],
        borderColor:"#3b82f6"
      },
      {
        label:"Outgoing",
        data:[80,90,170,215,160,110],
        borderColor:"#10b981"
      }
    ]
  };

  return(
    <div className="space-y-6">

      {/* ====== USAGE CARDS ====== */}
      <div className="grid grid-cols-5 gap-6">

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">CPU Usage</p>
          <h2 className="text-2xl font-bold">68%</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Memory Usage</p>
          <h2 className="text-2xl font-bold">5.2 GB</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Disk Usage</p>
          <h2 className="text-2xl font-bold">42%</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Processes</p>
          <h2 className="text-2xl font-bold">247</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Temperature</p>
          <h2 className="text-2xl font-bold">58°C</h2>
        </div>

      </div>

      {/* ===== CPU CHART ===== */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="mb-4 font-semibold">CPU Usage Over Time</h3>
        <Line data={cpuData}/>
      </div>

      {/* ===== OTHER CHARTS ===== */}
      <div className="grid grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="mb-4 font-semibold">Load Average</h3>
          <Bar data={loadData}/>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="mb-4 font-semibold">Network Traffic</h3>
          <Line data={networkData}/>
        </div>

      </div>

    </div>
  )
}

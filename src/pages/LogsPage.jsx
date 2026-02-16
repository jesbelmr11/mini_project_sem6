import { useState } from "react";

export default function LogsPage(){

  const [search,setSearch]=useState("");

  const logs=["Database timeout","Memory spike","Disk warning","User login"];

  const filtered=logs.filter(l=>l.toLowerCase().includes(search.toLowerCase()));

  return(
    <div className="bg-white p-6 rounded-xl shadow">

      <input
        className="border p-2 w-full mb-4"
        placeholder="Search logs..."
        onChange={e=>setSearch(e.target.value)}
      />

      {filtered.map((l,i)=>(
        <div key={i} className="border-b py-2">{l}</div>
      ))}

    </div>
  )
}

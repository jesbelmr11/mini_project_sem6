export default function Sidebar({active,setActive}){

const menu=[
 {id:"metrics",name:"System Metrics"},
 {id:"logs",name:"Log Files"},
 {id:"errors",name:"Errors & Alerts"},
 {id:"upload",name:"Upload Logs"},
 {id:"settings",name:"Settings"}
];

return(
<div className="w-64 bg-white border-r h-screen">
<div className="p-6 font-bold text-xl">AI Log Analyzer</div>

{menu.map(m=>(
<div
key={m.id}
onClick={()=>setActive(m.id)}
className={`px-6 py-3 cursor-pointer ${active===m.id?"bg-blue-100 text-blue-600":"text-gray-600"}`}
>
{m.name}
</div>
))}
</div>
)
}

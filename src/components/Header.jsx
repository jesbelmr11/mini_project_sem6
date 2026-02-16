export default function Header({title}){
return(
<div className="bg-white p-4 shadow mb-6 flex justify-between">
<h2 className="text-xl font-semibold">{title}</h2>
<input className="border px-3 py-2 rounded w-72" placeholder="Search..."/>
</div>
)
}

export default function SettingsPage(){
  return(
    <div className="grid grid-cols-2 gap-6">

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">General Settings</h3>
        <input className="border p-2 w-full mb-3" placeholder="Timezone"/>
        <input className="border p-2 w-full" placeholder="Language"/>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Notifications</h3>
        <label><input type="checkbox"/> Email Alerts</label>
      </div>

    </div>
  )
}

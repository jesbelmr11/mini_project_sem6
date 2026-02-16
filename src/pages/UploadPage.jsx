import { useState } from "react";

export default function UploadPage() {

  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState([]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFiles(prev => [...prev, { name: file.name, size: (file.size/1024/1024).toFixed(2) + " MB", status:"Uploading"}]);

    let p = 0;
    const timer = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(timer);
        setFiles(prev => prev.map(f =>
          f.name === file.name ? { ...f, status:"Completed"} : f
        ));
      }
    }, 200);
  };

  return (
    <div>

      {/* Upload Card */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Upload Log Files</h2>

        <label className="border-2 border-dashed rounded-xl p-10 text-center block cursor-pointer hover:bg-gray-50">
          <p className="text-gray-500 mb-2">Drag & drop files here</p>
          <p className="text-blue-600 font-medium">Browse Files</p>
          <input type="file" className="hidden" onChange={handleUpload}/>
        </label>

        {/* Progress */}
        {progress > 0 && (
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm mt-1 text-gray-500">{progress}% uploaded</p>
          </div>
        )}
      </div>

      {/* Recent uploads table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recently Uploaded</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">File Name</th>
              <th>Size</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {files.map((f,i) => (
              <tr key={i} className="border-b">
                <td className="py-3">{f.name}</td>
                <td>{f.size}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs ${
                    f.status==="Completed"
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                  }`}>
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

import React from 'react';

type Annotation = {
  id: string;
  position: [number, number, number];
  title: string;
  description: string;
};

interface SidebarProps {
  annotations: Annotation[];
  onEdit: (id: string, title: string, description: string) => void;
  onDelete: (id: string) => void;
  showAnnotations: boolean;
  setShowAnnotations: (show: boolean) => void;
  timeOfDay: number;
  setTimeOfDay: (t: number) => void;
  nightLightsEnabled: boolean;
  setNightLightsEnabled: (enabled: boolean) => void;
  isNight: boolean;
  onModelUpload: (file: File) => void;
  cameraMode: 'orbit' | 'firstPerson';
  setCameraMode: (mode: 'orbit' | 'firstPerson') => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  annotations,
  onEdit,
  onDelete,
  showAnnotations,
  setShowAnnotations,
  timeOfDay,
  setTimeOfDay,
  nightLightsEnabled,
  setNightLightsEnabled,
  isNight,
  onModelUpload,
  cameraMode,
  setCameraMode,
}) => {
  return (
    <aside className="w-72 bg-gray-800 text-white h-full flex flex-col p-4 space-y-6">
      <h2 className="text-xl font-bold mb-4">3D Model Viewer</h2>
      {/* Time of Day Slider */}
      <div>
        <label className="block mb-2 font-semibold">Time of Day: <span className="font-mono">{timeOfDay}:00</span></label>
        <input
          type="range"
          min={0}
          max={24}
          step={1}
          value={timeOfDay}
          onChange={e => setTimeOfDay(Number(e.target.value))}
          className="w-full"
        />
      </div>
      {/* Night lights toggle */}
      {isNight && (
        <div>
          <label className="block mb-2 font-semibold">Night Lights</label>
          <button
            className={`px-2 py-1 rounded ${nightLightsEnabled ? 'bg-blue-600' : 'bg-gray-600'} text-xs`}
            onClick={() => setNightLightsEnabled(!nightLightsEnabled)}
          >
            {nightLightsEnabled ? 'Disable' : 'Enable'} Night Lights
          </button>
        </div>
      )}
      <div>
        <label className="block mb-2 font-semibold">Upload Model</label>
        <input type="file" accept=".obj,.fbx" className="block w-full text-sm" onChange={e => {
          if (e.target.files && e.target.files[0]) {
            onModelUpload(e.target.files[0]);
          }
        }} />
      </div>
      <div>
        <label className="block mb-2 font-semibold">Camera Mode</label>
        <select className="w-full p-2 rounded bg-gray-700" value={cameraMode} onChange={e => setCameraMode(e.target.value as 'orbit' | 'firstPerson')}>
          <option value="orbit">Orbit</option>
          <option value="firstPerson">First Person</option>
        </select>
      </div>
      <div>
        <label className="block mb-2 font-semibold">Annotations</label>
        <button
          className={`mb-2 px-3 py-1 rounded-lg text-xs font-semibold transition w-full
            ${showAnnotations
              ? 'bg-blue-600 hover:bg-blue-700 text-black'
              : 'bg-gray-700 hover:bg-gray-600 text-black'
            }`}
          onClick={() => setShowAnnotations(!showAnnotations)}
        >
          {showAnnotations ? 'Hide' : 'Show'} Annotations
        </button>
        <ul className="space-y-2 max-h-40 overflow-y-auto">
          {annotations.length === 0 && <li className="text-gray-400">No annotations</li>}
          {annotations.map(ann => (
            <li key={ann.id} className="bg-gray-700 p-2 rounded flex flex-col">
              <input
                className="bg-gray-600 text-white rounded px-1 mb-1"
                value={ann.title}
                onChange={e => onEdit(ann.id, e.target.value, ann.description)}
                placeholder="Title"
              />
              <textarea
                className="bg-gray-600 text-white rounded px-1 mb-1"
                value={ann.description}
                onChange={e => onEdit(ann.id, ann.title, e.target.value)}
                placeholder="Description"
                rows={2}
              />
              <button
                className="bg-red-500 hover:bg-red-600 text-xs text-white rounded px-2 py-1 self-end"
                onClick={() => onDelete(ann.id)}
              >Delete</button>
            </li>
          ))}
        </ul>
      </div>
      <button className="mt-auto bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold w-full text-black transition">Reset Camera</button>
    </aside>
  );
};

export default Sidebar; 
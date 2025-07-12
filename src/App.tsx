import Sidebar from './components/Sidebar';
import ModelViewer from './components/ModelViewer';
import './App.css';
import React, { useState, Suspense } from 'react';

type Annotation = {
  id: string;
  position: [number, number, number];
  title: string;
  description: string;
};

function App() {
  // Central annotation state for sidebar and viewer
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState(12); // 0-24
  const [nightLightsEnabled, setNightLightsEnabled] = useState(true);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'firstPerson'>('orbit');

  // Edit annotation handler
  const handleEditAnnotation = (id: string, title: string, description: string) => {
    setAnnotations(a => a.map(ann => ann.id === id ? { ...ann, title, description } : ann));
  };
  // Delete annotation handler
  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(a => a.filter(ann => ann.id !== id));
  };

  // Night mode is active if time is between 20:00 and 6:00
  const isNight = timeOfDay >= 20 || timeOfDay < 6;

  return (
    <div className="flex h-screen w-screen bg-gray-900">
      <Sidebar
        annotations={annotations}
        onEdit={handleEditAnnotation}
        onDelete={handleDeleteAnnotation}
        showAnnotations={showAnnotations}
        setShowAnnotations={setShowAnnotations}
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        nightLightsEnabled={nightLightsEnabled}
        setNightLightsEnabled={setNightLightsEnabled}
        isNight={isNight}
        onModelUpload={setModelFile}
        cameraMode={cameraMode}
        setCameraMode={setCameraMode}
      />
      <main className="flex-1 h-full min-h-0">
        <ModelViewer
          annotations={annotations}
          setAnnotations={setAnnotations}
          showAnnotations={showAnnotations}
          onEditAnnotation={handleEditAnnotation}
          timeOfDay={timeOfDay}
          nightLightsEnabled={nightLightsEnabled}
          isNight={isNight}
          modelFile={modelFile}
          cameraMode={cameraMode}
        />
      </main>
    </div>
  );
}

export default App;

import { Canvas, useThree } from '@react-three/fiber';
import React, { Suspense, useEffect, useRef, useCallback, useState } from 'react';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import * as THREE from 'three';
import { checkWebGLSupport, getWebGLInfo } from '../utils/webglUtils';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls, PointerLockControls, Sky } from '@react-three/drei';
import { v4 as uuidv4 } from 'uuid';

// WebGL context loss handler with prevention
function useWebGLContextLossHandler() {
  const { gl } = useThree();
  const contextLostRef = useRef(false);
  const reloadAttemptsRef = useRef(0);

  useEffect(() => {
    const handleContextLost = (event: Event) => {
      console.log('WebGL Context Lost - Attempting recovery...');
      contextLostRef.current = true;
      event.preventDefault();
      
      // Only reload if we haven't tried too many times
      if (reloadAttemptsRef.current < 2) {
        reloadAttemptsRef.current++;
        console.log(`Reload attempt ${reloadAttemptsRef.current}/2`);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.log('Too many reload attempts, stopping...');
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost, false);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
    };
  }, [gl]);

  return contextLostRef.current;
}

// Error boundary for WebGL failures
class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WebGL Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  handleForceReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const webglSupported = checkWebGLSupport();
      const webglInfo = getWebGLInfo();
      
      return (
        <div style={{ 
          color: 'white', 
          padding: 32, 
          textAlign: 'center',
          background: '#333',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h2>WebGL Error</h2>
          <p>Your browser or device doesn't support WebGL properly.</p>
          <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '10px' }}>
            WebGL Support: {webglSupported ? 'Yes' : 'No'}
          </p>
          <p style={{ fontSize: '12px', opacity: 0.7 }}>
            {webglInfo}
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              onClick={this.handleRetry}
              style={{
                padding: '10px 20px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            <button 
              onClick={this.handleForceReload}
              style={{
                padding: '10px 20px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Force Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Component to handle WebGL context loss
function WebGLContextHandler() {
  useWebGLContextLossHandler();
  return null;
}

// Simplified scene without HDRI to prevent context loss
function SimpleScene() {
  return (
    <>
      <color attach="background" args={['#222']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 7.5]} intensity={0.8} />
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </>
  );
}

// Safe HDRI Scene component with error handling
function SafeHdriScene() {
  const [hdriLoaded, setHdriLoaded] = useState(false);
  const [hdriError, setHdriError] = useState(false);
  const hdriRef = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    // Load HDRI safely with timeout
    const loader = new RGBELoader();
    const timeout = setTimeout(() => {
      console.log('HDRI loading timeout, using fallback');
      setHdriError(true);
    }, 5000); // 5 second timeout

    loader.load(
      '/hdri/venice_sunset_1k.hdr',
      (texture: THREE.Texture) => {
        clearTimeout(timeout);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        hdriRef.current = texture;
        setHdriLoaded(true);
        console.log('HDRI loaded successfully');
      },
      undefined,
      (error: Error) => {
        clearTimeout(timeout);
        console.error('HDRI loading error:', error);
        setHdriError(true);
      }
    );

    return () => {
      clearTimeout(timeout);
      if (hdriRef.current) {
        hdriRef.current.dispose();
      }
    };
  }, []);

  if (hdriError) {
    return <SimpleScene />;
  }

  if (!hdriLoaded) {
    return (
      <>
        <color attach="background" args={['#222']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 7.5]} intensity={0.8} />
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </>
    );
  }

  return (
    <>
      {hdriRef.current && <primitive attach="background" object={hdriRef.current} />}
      {hdriRef.current && <primitive attach="environment" object={hdriRef.current} />}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7.5]} intensity={1} />
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </>
  );
}

// Component to load and render an uploaded OBJ or FBX model
function LoadedModel({ file }: { file: File }) {
  const groupRef = useRef<THREE.Group>(null);
  const [object, setObject] = useState<THREE.Object3D | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    let loader: OBJLoader | FBXLoader | null = null;
    let url: string | null = null;
    let disposed = false;

    // Helper: load model from file
    const loadModel = async () => {
      url = URL.createObjectURL(file);
      try {
        if (file.name.toLowerCase().endsWith('.obj')) {
          loader = new OBJLoader();
          loader.load(url, (obj: THREE.Object3D) => {
            if (!disposed) setObject(obj);
          }, undefined, (err: ErrorEvent) => {
            if (!disposed) setError('Failed to load OBJ: ' + err.message);
          });
        } else if (file.name.toLowerCase().endsWith('.fbx')) {
          loader = new FBXLoader();
          loader.load(url, (obj: THREE.Object3D) => {
            if (!disposed) setObject(obj);
          }, undefined, (err: ErrorEvent) => {
            if (!disposed) setError('Failed to load FBX: ' + err.message);
          });
        } else {
          setError('Unsupported file type');
        }
      } catch (e) {
        setError('Error loading model: ' + (e as Error).message);
      }
    };
    loadModel();
    return () => {
      disposed = true;
      if (url) URL.revokeObjectURL(url);
      setObject(null);
    };
  }, [file]);

  if (error) return <group ref={groupRef}><mesh><boxGeometry /><meshStandardMaterial color="red" /></mesh></group>;
  if (!object) return null;
  return <primitive ref={groupRef} object={object} />;
}

// 3D Annotation marker component
function AnnotationMarker({ position, title, show, onPointerDown, onPointerUp, onPointerMove, isDragging, isSelected }: {
  position: [number, number, number],
  title: string,
  show: boolean,
  onPointerDown?: (e: any) => void,
  onPointerUp?: (e: any) => void,
  onPointerMove?: (e: any) => void,
  isDragging?: boolean,
  isSelected?: boolean
}) {
  if (!show) return null;
  return (
    <mesh 
      position={position}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      // Make marker easier to click
      scale={isDragging ? 1.2 : 1}
      castShadow={false}
      receiveShadow={false}
    >
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial 
        color={isSelected ? '#f59e42' : '#fbbf24'} 
        emissive={isDragging ? '#f59e42' : '#fbbf24'} 
        emissiveIntensity={isDragging ? 1 : 0.5} 
      />
      {/* 3D text label (optional, can use Drei's Text if available) */}
    </mesh>
  );
}

// Utility: calculate sun position and color based on time of day
function getSunParams(timeOfDay: number) {
  // Sun moves in a semi-circle from east (6) to west (18)
  const t = (timeOfDay - 6) / 12; // 0 at 6:00, 1 at 18:00
  const angle = Math.PI * t; // 0 to PI
  // Sun position: higher at noon, lower at morning/evening
  const sunY = Math.max(Math.sin(angle), 0.05) * 10;
  const sunX = Math.cos(angle) * 10;
  // Sun color: warmer at sunrise/sunset, white at noon
  const color = t < 0.2 || t > 0.8 ? '#ffb347' : '#fffbe6';
  // Intensity: 0 at night, 1 at noon
  const intensity = t < 0 || t > 1 ? 0 : Math.max(Math.sin(angle), 0);
  return {
    position: [sunX, sunY, 7.5],
    color,
    intensity
  };
}

// Annotation type
type Annotation = {
  id: string;
  position: [number, number, number];
  title: string;
  description: string;
};

// Main component with stable WebGL handling
interface ModelViewerProps {
  modelFile?: File;
  cameraMode?: 'orbit' | 'firstPerson';
  annotations?: Annotation[];
  setAnnotations: React.Dispatch<React.SetStateAction<Annotation[]>>;
  showAnnotations?: boolean;
  onEditAnnotation?: (id: string, data: Partial<Annotation>) => void;
  timeOfDay?: number;
  nightLightsEnabled?: boolean;
  isNight?: boolean;
  [key: string]: any;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  modelFile,
  cameraMode = 'orbit',
  annotations = [],
  setAnnotations,
  showAnnotations = true,
  onEditAnnotation,
  timeOfDay = 12,
  nightLightsEnabled = true,
  isNight = false,
  ...props
}) => {
  const [canvasKey, setCanvasKey] = useState(0);
  const [useHdri, setUseHdri] = useState(false); // Toggle for HDRI
  const [placing, setPlacing] = useState(false); // If true, next click places annotation
  const [draggingId, setDraggingId] = useState<string|null>(null);
  const [dragOverPoint, setDragOverPoint] = useState<[number, number, number]|null>(null);

  // Add annotation at 3D point
  const handleSceneClick = useCallback((e) => {
    if (!placing) return;
    e.stopPropagation();
    // Raycast to get 3D point
    const point = e.point;
    setAnnotations((prev) => [
      ...prev,
      {
        id: uuidv4(),
        position: [point.x, point.y, point.z],
        title: 'New Annotation',
        description: ''
      }
    ]);
    setPlacing(false);
  }, [placing, setAnnotations]);

  // UI button to start placing annotation
  const startPlacing = () => setPlacing(true);

  // Check WebGL support on mount
  useEffect(() => {
    const webglSupported = checkWebGLSupport();
    const webglInfo = getWebGLInfo();
    
    console.log('WebGL Support Check:', {
      supported: webglSupported,
      info: webglInfo
    });
    
    if (!webglSupported) {
      console.error('WebGL is not supported in this browser/device');
    }
  }, []);

  // Force Canvas recreation
  const recreateCanvas = useCallback(() => {
    console.log('Recreating Canvas...');
    setCanvasKey(prev => prev + 1);
  }, []);

  // Drag handlers for annotation markers
  const handleMarkerPointerDown = useCallback((id: string) => (e: THREE.Event) => {
    e.stopPropagation();
    setDraggingId(id);
    setDragOverPoint(null);
  }, []);

  const handleMarkerPointerUp = useCallback((id: string) => (e: THREE.Event & { point: THREE.Vector3 }) => {
    e.stopPropagation();
    if (draggingId === id && dragOverPoint) {
      setAnnotations(prev => prev.map(ann => ann.id === id ? { ...ann, position: dragOverPoint } : ann));
    }
    setDraggingId(null);
    setDragOverPoint(null);
  }, [draggingId, dragOverPoint, setAnnotations]);

  const handleMarkerPointerMove = useCallback((id: string) => (e: THREE.Event & { point: THREE.Vector3 }) => {
    if (draggingId === id) {
      setDragOverPoint([e.point.x, e.point.y, e.point.z]);
    }
  }, [draggingId]);

  // Also allow dragging by moving pointer over scene while dragging
  const handleScenePointerMove = useCallback((e: THREE.Event & { point: THREE.Vector3 }) => {
    if (draggingId) {
      setDragOverPoint([e.point.x, e.point.y, e.point.z]);
    }
  }, [draggingId]);

  // Sun/ambient params
  const sunParams = getSunParams(timeOfDay);
  const ambientIntensity = isNight ? 0.15 : 0.4;
  const ambientColor = isNight ? '#222233' : '#ffffff';

  // Sky params
  // Elevation: 0 (horizon) to 90 (zenith). Noon = 90, sunrise/sunset = 10.
  const elevation = isNight ? 2 : 10 + Math.max(0, Math.sin(Math.PI * (timeOfDay - 6) / 12)) * 80;
  // Azimuth: 0 = north, 180 = south. We'll rotate sun east to west.
  const azimuth = ((timeOfDay - 6) / 12) * 180;

  return (
    <div style={{ width: '100%', height: '100%', background: '#222', position: 'relative', minHeight: 0 }}>
      {/* HDRI Toggle Button */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setUseHdri(!useHdri)}
          style={{
            padding: '10px 20px',
            background: useHdri ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {useHdri ? 'Disable HDRI' : 'Enable HDRI'}
        </button>
        {useHdri && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: 'rgba(0,0,0,0.8)',
            borderRadius: '5px',
            fontSize: '12px',
            color: '#fff'
          }}>
            ⚠️ HDRI may cause performance issues
          </div>
        )}
      </div>
      {/* Place Annotation Button */}
      <button
        onClick={startPlacing}
        className="absolute left-1/2 top-6 z-50 -translate-x-1/2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded shadow-lg transition"
        style={{ pointerEvents: 'auto' }}
        disabled={placing}
      >
        {placing ? 'Click in 3D to Place Annotation...' : 'Place Annotation'}
      </button>
      <WebGLErrorBoundary>
        <Suspense fallback={
          <div style={{ 
            color: 'white', 
            padding: 32,
            textAlign: 'center',
            background: '#333',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            Loading 3D environment...
          </div>
        }>
          <Canvas 
            key={canvasKey}
            style={{ width: '100%', height: '100%' }}
            camera={{ position: [0, 2, 5], fov: 60 }} 
            gl={{
              antialias: false,
              alpha: false,
              powerPreference: 'default',
              failIfMajorPerformanceCaveat: false,
              preserveDrawingBuffer: false,
              stencil: false,
              depth: true,
              premultipliedAlpha: false
            }}
            onCreated={({ gl }) => {
              gl.setClearColor('#222');
              gl.shadowMap.enabled = false;
              gl.toneMapping = THREE.NoToneMapping;
              gl.toneMappingExposure = 1;
              gl.outputColorSpace = THREE.SRGBColorSpace;
              
              console.log('WebGL Context Created Successfully');
            }}
            onError={(error) => {
              console.error('Canvas Error:', error);
              setTimeout(() => {
                recreateCanvas();
              }, 100);
            }}
            onClick={handleSceneClick}
            onPointerMove={handleScenePointerMove}
          >
            {/* Dynamic sky, always rendered behind objects */}
            <Sky
              distance={450000}
              sunPosition={[sunParams.position[0], sunParams.position[1], sunParams.position[2]]}
              inclination={elevation / 90}
              azimuth={azimuth / 360}
              turbidity={isNight ? 1 : 8}
              rayleigh={isNight ? 0.1 : 2}
              mieCoefficient={0.005}
              mieDirectionalG={0.8}
              exposure={isNight ? 0.2 : 0.7}
            />
            <WebGLContextHandler />
            {/* Camera Controls: Orbit (default) or First Person */}
            {cameraMode === 'orbit' && <OrbitControls enableDamping />}
            {cameraMode === 'firstPerson' && <PointerLockControls />}
            {/* Render uploaded model if present */}
            {modelFile && <LoadedModel file={modelFile} />}
            {/* Render 3D annotation markers */}
            {annotations.map(ann => (
              <AnnotationMarker 
                key={ann.id} 
                position={draggingId === ann.id && dragOverPoint ? dragOverPoint : ann.position}
                title={ann.title} 
                show={showAnnotations}
                onPointerDown={handleMarkerPointerDown(ann.id)}
                onPointerUp={handleMarkerPointerUp(ann.id)}
                onPointerMove={handleMarkerPointerMove(ann.id)}
                isDragging={draggingId === ann.id}
                isSelected={draggingId === ann.id}
              />
            ))}
            {/* Time-based lighting */}
            <ambientLight intensity={ambientIntensity} color={ambientColor} />
            {/* Sunlight (directional) */}
            <directionalLight
              position={sunParams.position}
              intensity={sunParams.intensity}
              color={sunParams.color}
              castShadow={false}
            />
            {/* Night mode: artificial lights */}
            {isNight && nightLightsEnabled && (
              <>
                <pointLight position={[0, 2, 0]} intensity={0.7} color="#aaf" distance={8} />
                <pointLight position={[2, 2, 2]} intensity={0.5} color="#fff" distance={6} />
                <pointLight position={[-2, 2, -2]} intensity={0.5} color="#fff" distance={6} />
              </>
            )}
            {useHdri ? <SafeHdriScene /> : <SimpleScene />}
          </Canvas>
        </Suspense>
      </WebGLErrorBoundary>
    </div>
  );
};

export default ModelViewer; 
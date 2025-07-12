import { Canvas, useThree } from '@react-three/fiber';
import React, { Suspense, useEffect, useRef, useCallback, useState } from 'react';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import * as THREE from 'three';
import { checkWebGLSupport, getWebGLInfo } from '../utils/webglUtils';

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

// Main component with stable WebGL handling
const ModelViewer = () => {
  const [canvasKey, setCanvasKey] = useState(0);
  const [useHdri, setUseHdri] = useState(false); // Toggle for HDRI

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
          >
            <WebGLContextHandler />
            {useHdri ? <SafeHdriScene /> : <SimpleScene />}
          </Canvas>
        </Suspense>
      </WebGLErrorBoundary>
    </div>
  );
};

export default ModelViewer; 
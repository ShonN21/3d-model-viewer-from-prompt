// WebGL utility functions for debugging and context management

export function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    console.error('WebGL not supported:', e);
    return false;
  }
}

export function getWebGLInfo(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return 'WebGL not supported';
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return `Vendor: ${vendor}, Renderer: ${renderer}`;
    }
    
    return 'WebGL supported (debug info not available)';
  } catch (e) {
    return `WebGL error: ${e}`;
  }
}

export function logWebGLContextInfo(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
  console.log('WebGL Context Info:');
  console.log('- Vendor:', gl.getParameter(gl.VENDOR));
  console.log('- Renderer:', gl.getParameter(gl.RENDERER));
  console.log('- Version:', gl.getParameter(gl.VERSION));
  console.log('- Shading Language Version:', gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
  
  // Check for important extensions
  const extensions = [
    'WEBGL_depth_texture',
    'OES_texture_float',
    'OES_texture_half_float',
    'WEBGL_compressed_texture_s3tc',
    'WEBGL_compressed_texture_pvrtc'
  ];
  
  extensions.forEach(ext => {
    const supported = gl.getExtension(ext);
    console.log(`- ${ext}:`, supported ? 'Supported' : 'Not supported');
  });
}

export function createWebGLContext(options: {
  antialias?: boolean;
  alpha?: boolean;
  depth?: boolean;
  stencil?: boolean;
  preserveDrawingBuffer?: boolean;
  powerPreference?: 'default' | 'high-performance' | 'low-power';
} = {}): WebGLRenderingContext | WebGL2RenderingContext | null {
  const canvas = document.createElement('canvas');
  const contextAttributes = {
    antialias: true,
    alpha: false,
    depth: true,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance' as const,
    ...options
  };

  // Try WebGL2 first, fallback to WebGL1
  let gl = canvas.getContext('webgl2', contextAttributes);
  if (!gl) {
    gl = canvas.getContext('webgl', contextAttributes) || 
         canvas.getContext('experimental-webgl', contextAttributes);
  }

  if (gl) {
    logWebGLContextInfo(gl);
  }

  return gl;
} 
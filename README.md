# 3D Model Viewer from Prompt

A real-time, interactive 3D model viewer web app built with React, Three.js, and Tailwind CSS. Upload OBJ/FBX models, explore with orbit/first-person controls, annotate in 3D, and experience dynamic lighting with HDRI and night mode.

---

## ✨ Features

- **Model Upload:**
  - Upload and view OBJ or FBX 3D models with full mesh/material support.
- **Camera & Controls:**
  - Orbit mode (rotate, pan, zoom)
  - First-person mode (WASD/arrow keys, mouse look, vertical look limit)
  - Toggle between modes in the UI
- **Annotations:**
  - Click to place floating 3D annotations (editable title/description)
  - Drag/reposition annotations in 3D
  - Show/hide, edit, and delete annotations in the sidebar
- **Time-of-Day Lighting:**
  - Slider to set time (0–24h)
  - Sun/ambient/skybox lighting changes with time
- **HDRI Environment:**
  - Realistic ambient light and sky using HDRI (Polyhaven Venice Sunset)
- **Night Mode:**
  - Sunlight dims at night (20:00–06:00)
  - Artificial lights activate, toggleable in UI
- **UI:**
  - Modern sidebar (Tailwind CSS)
  - Controls for upload, camera, time, night lights, annotations, and reset

---

## 🚀 Getting Started

### 1. **Clone the repository**
```bash
git clone <your-repo-url>
cd 3d-model-viewer-from-prompt
```

### 2. **Install dependencies**
```bash
npm install
```

### 3. **Add HDRI file**
- Download `venice_sunset_1k.hdr` from [Polyhaven](https://polyhaven.com/a/venice_sunset)
- Place it in `public/hdri/venice_sunset_1k.hdr`

### 4. **Run the app**
```bash
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser

---

## 🛠️ Tech Stack
- **React** (Vite)
- **Three.js** & @react-three/fiber
- **@react-three/drei** (controls, helpers)
- **Tailwind CSS**
- **OBJLoader, FBXLoader, RGBELoader** (Three.js examples)

---

## 📁 Project Structure
```
├── public/
│   └── hdri/venice_sunset_1k.hdr
├── src/
│   ├── components/
│   │   ├── ModelViewer.tsx
│   │   └── Sidebar.tsx
│   ├── utils/
│   │   └── webglUtils.ts
│   ├── App.tsx
│   └── index.css
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

## ⌲ Prompt
Build a complete real-time 3D model viewer web app using React and Threejs with the following features

MODEL UPLOAD

1. Allow users to upload 3D model files in OBJ and FBX formats.

2. Display the uploaded models in the scene using Threejs with full mesh/material support.

3. Optimize model size and rendering for smooth performance.

CAMERA & USER CONTROLS

4. Add two camera modes

a) Orbit mode default, with OrbitControls (rotate, pan, zoom).

b) First-person mode simulate walking through the model like a person inside a building or space

5. In first-person mode

Use PointerLockControls or First PersonControls from Three.js

Movement: WASD or arrow keys.

Mouse look around (360°).

Limit vertical look to avoid unnatural head flips.

Add option in the Ul to toggle between "Orbit" and "First Person"

ANNOTATIONS:

6. Let users click inside the 3D scene to place floating annotations (text boxes).

-Editable title description.

- Anchor them to 3D world coordinates

Show/hide annotations in UI.

Support drag or repositioning.

TIME-BASED LIGHTING:

7. Add a "Time of Day" system:

Slider or clock picker (0-24 hours).

Change sun direction and color based on time.

Adjust ambient light and skybox colors to match.

HDRI & ENVIRONMENT:

8. Use an HDRI environment for realistic ambient light and sky:

- Load a free HDRI (like 'venice_sunset_1k.hdr" from Polyhaven).

Apply HDRI as both scene lighting and background.

NIGHT MODE:

9 if selected time is night (eg. 20:00-06:00)

Reduce sunlight to 0.

Automatically activate artificial point lights or spotlights in the scene.
Allow user to toggle night lights on/off.

UI DESIGN

10. Use Tailwind CSS for layout and design.

Sidebar or control panel with

Upload model

-Time of day slider

Toggle Orbit/First-person view

Toggle night lighting

List and edit annotations

Reset camera

CODE & DEV:

11. Use React Vite (or Next.js if preferred).

12. Include code comments to explain all logic.

13. Project should run locally via 'npm install' and 'npm run dev.

DEPENDENCIES TO USE:

React

- Three.js

- Tailwind CSS

OBJLoader, FBXLoader

- RGBELoader (for HDRI)

- PointerLockControls or First PersonControls

- Sky shader or Sky class for dynamic sky

---

---

## 📝 Notes
- All logic is commented in code for clarity.
- Model loading, controls, and lighting are optimized for smooth performance.
- For best results, use modern browsers (Chrome, Edge, Firefox).

## 🔧 Troubleshooting

### WebGL Context Loss Issues
If you experience a white screen with "THREE.WebGLRenderer: Context Lost" in the console:

1. **Automatic Recovery**: The app now includes automatic WebGL context loss recovery
2. **Browser Compatibility**: Ensure you're using a modern browser with WebGL support
3. **Hardware Acceleration**: Enable hardware acceleration in your browser settings
4. **Memory Issues**: Close other tabs/applications to free up GPU memory
5. **Driver Updates**: Update your graphics drivers to the latest version

### Performance Tips
- Use Chrome or Edge for best WebGL performance
- Close unnecessary browser tabs to free GPU memory
- Disable browser extensions that might interfere with WebGL
- If using integrated graphics, ensure hardware acceleration is enabled

---

## 📜 License
MIT

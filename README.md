# MoveYoHead
<img width="1919" height="867" alt="image" src="https://github.com/user-attachments/assets/dbf3373d-1a9b-43fb-b1c2-3fa545b5f7da" />

A WebAI-powered immersive 3D experience that uses face tracking and eye detection to control camera movement and navigate between different 3D scenes.

## Overview

MoveYoHead is a first-person VR-like experience built entirely with web technologies. It demonstrates the power of WebAI by combining MediaPipe's face landmark detection with Three.js 3D rendering to create an interactive journey through multiple environments.

## Features

- **Eye Tracking Camera Control**: Move your head and eyes to look around the 3D environment
- **Blink Navigation**: Close your eyes for 3 seconds to teleport between different scenes
- **Multiple 3D Environments**:
  - Mangrove Greenhouse - A serene botanical space
  - Camping Campfire - A cozy outdoor scene
  - Minecraft Castle - An epic medieval structure
- **Smooth Transitions**: Fade effects between scene changes
- **Real-time Face Detection**: Powered by MediaPipe's face landmark model

## Technologies Used

- **Three.js** - 3D rendering and scene management
- **MediaPipe Tasks Vision** - Face landmark detection and eye tracking
- **Vite** - Build tool and dev server
- **Vanilla JavaScript** - No frameworks, just pure web technologies

## Project Structure

```
MoveYoHead/
├── src/
│   ├── main.js              # Main application entry point
│   ├── sceneManager.js      # Scene configuration and management
│   ├── loadingModal.js      # Initial loading screen
│   ├── blinkDetector.js     # Eye blink detection logic
│   ├── transitionController.js  # Scene transition effects
│   ├── toastNotification.js # Toast notification system
│   └── style.css            # Application styles
├── public/
│   ├── stylized_mangrove_greenhouse.glb
│   ├── campfire3.glb
│   └── minecraft_castle.glb
└── index.html
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A webcam for face tracking

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/MoveYoHead.git
cd MoveYoHead
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## How It Works

### Face Tracking

The application uses MediaPipe's Face Landmarker model to detect facial landmarks in real-time. Specifically, it tracks:

- **Eye blend shapes** for gaze direction (up, down, left, right, in, out)
- **Blink detection** for scene transitions

### Camera Control

Eye tracking data is converted into camera rotations with:
- Smoothing factor (0.05) for fluid movement
- Rotation multiplier (3x) for more dramatic camera response
- Base rotation + offset system to preserve scene-specific camera angles

### Scene Management

Scenes are configured in `sceneManager.js` with:
- Position, scale, rotation
- Camera position and look-at target
- Background color
- Model path

Each scene is loaded once and cached for smooth transitions.

### Blink Detection

The blink detector monitors both eyes and triggers a transition when:
- Both eyes are closed (blink score > 0.5)
- Sustained for 3 seconds
- Not currently transitioning

## Controls

- **Look Around**: Move your head or eyes
- **Navigate**: Close both eyes for 3 seconds
- **Credits**: Hover over the "?" button in the bottom right

## Configuration

### Adding New Scenes

Edit `src/sceneManager.js`:

```javascript
export const sceneConfig = [
  {
    id: "my-scene",
    name: "My Scene",
    path: "/my-model.glb",
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 },
    cameraPosition: { x: 0, y: 2, z: 5 },
    cameraLookAt: { x: 0, y: 0, z: 0 },
    background: "#87CEEB",
  },
  // ... more scenes
];
```

### Adjusting Eye Tracking Sensitivity

In `src/main.js`:

```javascript
const smoothingFactor = 0.05; // Lower = smoother
const rotationMultiplier = 3;  // Higher = more sensitive
```

### Changing Blink Duration

In `src/blinkDetector.js`:

```javascript
this.requiredDuration = 3000; // milliseconds
this.blinkThreshold = 0.5;    // 0-1 score
```

## Credits

### 3D Models

- ["Stylized Mangrove Greenhouse"](https://skfb.ly/ovoBo) by Bársh - Licensed under [CC Attribution](http://creativecommons.org/licenses/by/4.0/)
- ["camping buscraft ambience"](https://skfb.ly/6V9Ru) by Edgar_koh - Licensed under [CC Attribution](http://creativecommons.org/licenses/by/4.0/)
- ["Minecraft Castle"](https://skfb.ly/A6AL) by patrix - Licensed under [CC Attribution-ShareAlike](http://creativecommons.org/licenses/by-sa/4.0/)

### Inspiration

This project was inspired by Jason Mayes and the WebAI community, particularly after attending DevFest Istanbul where I discovered the possibilities of combining AI and web development.

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (limited support)

Requires:
- WebGL support
- getUserMedia API (webcam access)

## Performance Tips

- Close other webcam applications
- Use a modern browser with GPU acceleration
- Ensure good lighting for face tracking
- Close unnecessary browser tabs

## Known Issues

- Safari may have limited MediaPipe support
- First load may take time to download models
- Performance varies based on device GPU

## Future Improvements

- [ ] Add more scenes and environments
- [ ] Implement hand tracking for interactions
- [ ] Add audio/ambient sounds
- [ ] Mobile device support
- [ ] Gesture-based scene selection
- [ ] VR headset compatibility

## License

MIT License - feel free to use this project for learning and experimentation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- MediaPipe team for the incredible face tracking model
- Three.js community for the amazing 3D library
- Sketchfab artists for the beautiful 3D models
- Jason Mayes for championing WebAI

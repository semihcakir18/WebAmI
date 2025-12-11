import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("bg"),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(3);
camera.position.setX(0);
camera.position.setY(2);

// MediaPipe setup
let faceLandmarker;
let webcamRunning = false;
let lastVideoTime = -1;
let eyeData = {
  eyeLookDownLeft: 0,
  eyeLookDownRight: 0,
  eyeLookInLeft: 0,
  eyeLookInRight: 0,
  eyeLookOutLeft: 0,
  eyeLookOutRight: 0,
  eyeLookUpLeft: 0,
  eyeLookUpRight: 0,
};

// Initialize MediaPipe FaceLandmarker
async function initFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    runningMode: "VIDEO",
    numFaces: 1,
  });
  console.log("FaceLandmarker initialized");
  enableWebcam();
}

// Enable webcam
async function enableWebcam() {
  if (!faceLandmarker) {
    console.log("Wait! faceLandmarker not loaded yet.");
    return;
  }

  const video = document.getElementById("webcam");
  const constraints = { video: true };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    webcamRunning = true;
    video.addEventListener("loadeddata", predictWebcam);
    console.log("Webcam enabled");
  } catch (error) {
    console.error("Error accessing webcam:", error);
  }
}

// Predict from webcam
function predictWebcam() {
  if (!webcamRunning) return;

  const video = document.getElementById("webcam");
  let startTimeMs = performance.now();

  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    const results = faceLandmarker.detectForVideo(video, startTimeMs);

    // Extract eye blend shapes
    if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
      const blendShapes = results.faceBlendshapes[0].categories;

      // Filter only eye-related blend shapes
      blendShapes.forEach((shape) => {
        const name = shape.categoryName;
        if (eyeData.hasOwnProperty(name)) {
          eyeData[name] = shape.score;
        }
      });

      // Optional: Log eye data for debugging (uncomment to see values)
      // console.log("Eye Data:", eyeData);
    }
  }

  window.requestAnimationFrame(predictWebcam);
}

// Start face detection
initFaceLandmarker();

// Load GLB model
const loader = new GLTFLoader();
loader.load(
  "/stylized_mangrove_greenhouse.glb", // GLB file from public folder
  function (gltf) {
    // Success callback - model loaded
    scene.add(gltf.scene);

    // Optional: Position, scale, or rotate the model
    // gltf.scene.position.set(0, 0, 0);
    // gltf.scene.scale.set(1, 1, 1);
    // gltf.scene.rotation.y = Math.PI / 4;

    console.log("Model loaded successfully");
  },
  function (xhr) {
    // Progress callback
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    // Error callback
    console.error("An error occurred loading the model:", error);
  }
);

// Camera rotation state
let targetRotationX = 0;
let targetRotationY = 0;
let currentRotationX = 0;
let currentRotationY = 0;
const smoothingFactor = 0.05; // Lower = smoother, higher = more responsive
const rotationMultiplier = 3; // Increase for more dramatic camera movement

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Calculate target rotation from eye data
  // Horizontal rotation (looking left/right)
  const lookLeft = (eyeData.eyeLookInLeft + eyeData.eyeLookOutRight) / 2;
  const lookRight = (eyeData.eyeLookOutLeft + eyeData.eyeLookInRight) / 2;
  const horizontalLook = lookRight - lookLeft;

  // Vertical rotation (looking up/down)
  const lookUp = (eyeData.eyeLookUpLeft + eyeData.eyeLookUpRight) / 2;
  const lookDown = (eyeData.eyeLookDownLeft + eyeData.eyeLookDownRight) / 2;
  const verticalLook = lookDown - lookUp;

  // Set target rotations
  targetRotationY = horizontalLook * rotationMultiplier;
  targetRotationX = verticalLook * rotationMultiplier;

  // Smoothly interpolate to target rotation
  currentRotationX += (targetRotationX - currentRotationX) * smoothingFactor;
  currentRotationY += (targetRotationY - currentRotationY) * smoothingFactor;

  // Apply rotation to camera
  camera.rotation.x = currentRotationX;
  camera.rotation.y = currentRotationY;

  renderer.render(scene, camera);
}
animate();

import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { SceneManager } from "./sceneManager.js";
import { LoadingModal } from "./loadingModal.js";
import { BlinkDetector } from "./blinkDetector.js";
import { TransitionController } from "./transitionController.js";
import { showToast } from "./toastNotification.js";

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
  // Blink detection
  eyeBlinkLeft: 0,
  eyeBlinkRight: 0,
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

// Initialize scene manager
const loader = new GLTFLoader();
const sceneManager = new SceneManager(scene, loader, camera);

// Initialize controllers
const blinkDetector = new BlinkDetector();
const transitionController = new TransitionController(sceneManager);

// Initialize loading modal
const loadingModal = new LoadingModal();

// Start initialization flow
async function initialize() {
  // Request webcam permission
  const webcamGranted = await loadingModal.requestWebcamPermission();

  if (!webcamGranted) {
    // Permission denied, block entry
    return;
  }

  // Initialize MediaPipe
  loadingModal.updateStatus("Loading face detection model...");
  await initFaceLandmarker();

  // Load first scene
  loadingModal.updateStatus("Loading first scene...");
  await sceneManager.loadScene(0, (xhr) => {
    const percent = (xhr.loaded / xhr.total) * 100;
    loadingModal.updateProgress(percent);
  });

  // Switch to first scene
  sceneManager.switchToScene(0);

  // Store base rotation after scene switch
  if (sceneManager.baseRotation) {
    baseRotationX = sceneManager.baseRotation.x;
    baseRotationY = sceneManager.baseRotation.y;
    baseRotationZ = sceneManager.baseRotation.z;
  }

  // Enable begin button
  loadingModal.enableBeginButton();
}

// Handle begin journey
loadingModal.onBegin(() => {
  console.log("Beginning journey...");
  loadingModal.hide();

  // Start background loading of remaining scenes
  sceneManager.preloadNextScenes(1, (index) => {
    console.log(`Scene ${index} loaded in background`);
    showToast("Close your eyes for 3 seconds to teleport to another dimension");
  });
});

// Start initialization
initialize();

// Camera rotation state
let targetRotationX = 0;
let targetRotationY = 0;
let currentRotationX = 0;
let currentRotationY = 0;
let baseRotationX = 0; // Base rotation from scene setup
let baseRotationY = 0;
let baseRotationZ = 0;
const smoothingFactor = 0.03; // Lower = smoother, higher = more responsive
const rotationMultiplier = 3; // Increase for more dramatic camera movement

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Calculate target rotation from eye data
  // Horizontal rotation (looking left/right)
  const lookLeft = (eyeData.eyeLookInLeft + eyeData.eyeLookOutRight) / 2;
  const lookRight = (eyeData.eyeLookOutLeft + eyeData.eyeLookInRight) / 2;
  const horizontalLook = lookLeft - lookRight; // Inverted for head rotation

  // Vertical rotation (looking up/down)
  const lookUp = (eyeData.eyeLookUpLeft + eyeData.eyeLookUpRight) / 4;
  const lookDown = (eyeData.eyeLookDownLeft + eyeData.eyeLookDownRight) / 4;
  const verticalLook = lookDown - lookUp;

  // Set target rotations
  targetRotationY = horizontalLook * rotationMultiplier;
  targetRotationX = verticalLook * rotationMultiplier;

  // Smoothly interpolate to target rotation
  currentRotationX += (targetRotationX - currentRotationX) * smoothingFactor;
  currentRotationY += (targetRotationY - currentRotationY) * smoothingFactor;

  // Apply rotation to camera (base rotation + eye tracking offset)
  camera.rotation.x = baseRotationX + currentRotationX;
  camera.rotation.y = baseRotationY + currentRotationY;
  camera.rotation.z = baseRotationZ;

  // Check for blink transition (only if not currently transitioning)
  if (blinkDetector.detectBlink(eyeData) && !transitionController.getIsTransitioning()) {
    const currentIndex = sceneManager.getCurrentIndex();
    const totalScenes = sceneManager.getTotalScenes();
    const nextIndex = (currentIndex + 1) % totalScenes;

    // Only transition if next scene is loaded
    if (sceneManager.isSceneLoaded(nextIndex)) {
      console.log(`Triggering transition from scene ${currentIndex} to ${nextIndex}`);
      transitionController.transitionToScene(nextIndex).then(() => {
        // Update base rotation after scene transition
        if (sceneManager.baseRotation) {
          baseRotationX = sceneManager.baseRotation.x;
          baseRotationY = sceneManager.baseRotation.y;
          baseRotationZ = sceneManager.baseRotation.z;
        }
      });
    } else {
      console.log(`Scene ${nextIndex} not loaded yet, cannot transition`);
    }
  }

  renderer.render(scene, camera);
}
animate();
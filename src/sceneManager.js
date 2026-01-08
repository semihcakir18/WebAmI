import { Color } from "three";

// Scene configuration - easily add/remove scenes here
export const sceneConfig = [
    {
      id: "greenhouse",
      name: "Mangrove Greenhouse",
      path: "/stylized_mangrove_greenhouse.glb",
      position: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      rotation: { x: 0, y: 0, z: 0 },
      cameraPosition: { x: 0, y: 2, z: 1 },
      background: "#87CEEB",
    },
  {
    id: "scene2",
    name: "Second Dimension",
    path: "/campfire3.glb",
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 },
    cameraPosition: { x: 3, y: 1, z:4 },
    cameraLookAt: { x: 0, y: 0, z: 0 },
    background: "#0a0a2a",
  },
  {
    id: "scene3",
    name: "Third Dimension",
    path: "/minecraft_castle.glb",
    position: { x: -8, y: -8, z: 17 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 },
    cameraPosition: { x: 1, y: 12, z: 14 },
    cameraLookAt: { x: -90, y: 10, z: 170 }, 
    background: "rgba(110, 113, 108, 1)",
  },
];

/**
 * SceneManager handles loading and switching between multiple 3D scenes
 */
export class SceneManager {
  /**
   * @param {Object} threeScene - Three.js scene object
   * @param {Object} loader - GLTFLoader instance
   * @param {Object} camera - Three.js camera object
   */
  constructor(threeScene, loader, camera) {
    this.threeScene = threeScene;
    this.loader = loader;
    this.camera = camera;
    this.config = sceneConfig;
    this.loadedScenes = new Array(this.config.length).fill(null);
    this.currentIndex = -1;
  }

  /**
   * Load a scene by index
   * @param {number} index - Scene index
   * @param {Function} onProgress - Progress callback (xhr) => {}
   * @returns {Promise<Object>} Loaded GLTF object
   */
  async loadScene(index, onProgress) {
    // Return cached scene if already loaded
    if (this.loadedScenes[index]) {
      return this.loadedScenes[index];
    }

    const config = this.config[index];
    if (!config) {
      throw new Error(`Scene ${index} not found in configuration`);
    }

    console.log(`Loading scene ${index}: ${config.name}`);

    return new Promise((resolve, reject) => {
      this.loader.load(
        config.path,
        (gltf) => {
          // Apply transformations from config
          gltf.scene.position.set(
            config.position.x,
            config.position.y,
            config.position.z
          );
          gltf.scene.scale.set(
            config.scale.x,
            config.scale.y,
            config.scale.z
          );
          gltf.scene.rotation.set(
            config.rotation.x,
            config.rotation.y,
            config.rotation.z
          );

          // Cache loaded scene
          this.loadedScenes[index] = gltf;
          console.log(`Scene ${index} loaded successfully: ${config.name}`);
          resolve(gltf);
        },
        (xhr) => {
          // Progress callback
          if (onProgress) {
            onProgress(xhr);
          }
        },
        (error) => {
          // Error callback
          console.error(`Error loading scene ${index}:`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Switch to a different scene
   * @param {number} index - Scene index to switch to
   * @returns {boolean} Success status
   */
  switchToScene(index) {
    // Validate index
    if (index < 0 || index >= this.config.length) {
      console.error(`Invalid scene index: ${index}`);
      return false;
    }

    // Check if scene is loaded
    if (!this.loadedScenes[index]) {
      console.warn(`Scene ${index} not loaded yet`);
      return false;
    }

    // Remove current scene from Three.js scene
    if (this.currentIndex >= 0 && this.loadedScenes[this.currentIndex]) {
      this.threeScene.remove(this.loadedScenes[this.currentIndex].scene);
      console.log(`Removed scene ${this.currentIndex} from Three.js scene`);
    }

    // Add new scene to Three.js scene
    this.threeScene.add(this.loadedScenes[index].scene);
    this.currentIndex = index;

    // Update camera position if defined
    const config = this.config[index];
    if (config.cameraPosition && this.camera) {
      this.camera.position.set(
        config.cameraPosition.x,
        config.cameraPosition.y,
        config.cameraPosition.z
      );
    }

    // Manually calculate rotation instead of using lookAt to prevent upside-down orientation
    if (config.cameraLookAt && this.camera) {
      const dx = config.cameraLookAt.x - config.cameraPosition.x;
      const dy = config.cameraLookAt.y - config.cameraPosition.y;
      const dz = config.cameraLookAt.z - config.cameraPosition.z;

      // Calculate horizontal distance for pitch calculation
      const horizontalDistance = Math.sqrt(dx * dx + dz * dz);

      // Calculate rotations
      // Y rotation (yaw/horizontal): rotate around vertical axis to face target
      // Three.js camera default faces -Z, so we use atan2 with flipped signs
      const rotationY = Math.atan2(-dx, -dz);

      // X rotation (pitch/vertical): tilt up/down to look at target
      const rotationX = Math.atan2(dy, horizontalDistance);

      // Set camera rotation manually (no roll to stay upright)
      this.camera.rotation.set(rotationX, rotationY, 0, 'YXZ');
    } else if (this.camera) {
      // Reset to default rotation if no cameraLookAt is defined
      this.camera.rotation.set(0, 0, 0, 'YXZ');
    }

    // Store the base rotation (for eye tracking offset)
    this.baseRotation = {
      x: this.camera.rotation.x,
      y: this.camera.rotation.y,
      z: 0  // Keep upright, no roll
    };

    // Update background if defined
    if (config.background) {
      this.threeScene.background = new Color(config.background);
    }
    var audio = new Audio('whoosh.mp3');
    audio.play();
    console.log(`Switched to scene ${index}: ${this.config[index].name}`);

    return true;
  }

  /**
   * Preload remaining scenes in the background
   * @param {number} startIndex - Index to start loading from
   * @param {Function} onEachLoaded - Callback called after each scene loads (index) => {}
   * @returns {Promise<void>}
   */
  async preloadNextScenes(startIndex, onEachLoaded) {
    console.log(`Preloading scenes starting from ${startIndex}`);

    for (let i = startIndex; i < this.config.length; i++) {
      try {
        await this.loadScene(i);
        console.log(`Preloaded scene ${i}`);

        if (onEachLoaded) {
          onEachLoaded(i);
        }
      } catch (error) {
        console.error(`Failed to preload scene ${i}:`, error);
        // Continue loading other scenes even if one fails
      }
    }

    console.log("Finished preloading all scenes");
  }

  /**
   * Check if a scene is loaded
   * @param {number} index - Scene index
   * @returns {boolean} True if loaded
   */
  isSceneLoaded(index) {
    return this.loadedScenes[index] !== null;
  }

  /**
   * Get current scene index
   * @returns {number} Current index (-1 if no scene active)
   */
  getCurrentIndex() {
    return this.currentIndex;
  }

  /**
   * Get total number of scenes
   * @returns {number} Total scenes
   */
  getTotalScenes() {
    return this.config.length;
  }

  /**
   * Get scene configuration by index
   * @param {number} index - Scene index
   * @returns {Object|null} Scene config or null
   */
  getSceneConfig(index) {
    return this.config[index] || null;
  }
}

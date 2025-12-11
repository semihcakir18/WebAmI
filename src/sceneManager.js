// Scene configuration - easily add/remove scenes here
export const sceneConfig = [
  {
    id: "greenhouse",
    name: "Mangrove Greenhouse",
    path: "/stylized_mangrove_greenhouse.glb",
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  {
    id: "scene2",
    name: "Second Dimension",
    path: "/scene2.glb",
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  {
    id: "scene3",
    name: "Third Dimension",
    path: "/scene3.glb",
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 },
  },
];

/**
 * SceneManager handles loading and switching between multiple 3D scenes
 */
export class SceneManager {
  /**
   * @param {Object} threeScene - Three.js scene object
   * @param {Object} loader - GLTFLoader instance
   */
  constructor(threeScene, loader) {
    this.threeScene = threeScene;
    this.loader = loader;
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

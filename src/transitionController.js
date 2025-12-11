/**
 * TransitionController manages smooth scene transitions with fade effects
 */
export class TransitionController {
  /**
   * @param {Object} sceneManager - SceneManager instance
   */
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.overlay = document.getElementById("transition-overlay");
    this.isTransitioning = false;
    this.fadeDuration = 1000; // 1 second fade
  }

  /**
   * Transition to a different scene with fade effect
   * @param {number} nextIndex - Scene index to transition to
   * @returns {Promise<boolean>} Success status
   */
  async transitionToScene(nextIndex) {
    // Prevent concurrent transitions
    if (this.isTransitioning) {
      console.log("Transition already in progress, ignoring");
      return false;
    }

    // Check if next scene is loaded
    if (!this.sceneManager.isSceneLoaded(nextIndex)) {
      console.warn(`Scene ${nextIndex} not loaded yet, cannot transition`);
      return false;
    }

    console.log(`Starting transition to scene ${nextIndex}`);
    this.isTransitioning = true;

    try {
      // Fade to black
      await this.fadeOut();

      // Switch scene
      const success = this.sceneManager.switchToScene(nextIndex);

      if (!success) {
        throw new Error("Scene switch failed");
      }

      // Fade back in
      await this.fadeIn();

      console.log("Transition complete");
      return true;
    } catch (error) {
      console.error("Transition error:", error);
      // Make sure overlay is hidden on error
      this.overlay.classList.remove("fade-in");
      return false;
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Fade overlay to black
   * @returns {Promise<void>}
   */
  fadeOut() {
    return new Promise((resolve) => {
      this.overlay.classList.add("fade-in");

      setTimeout(() => {
        resolve();
      }, this.fadeDuration);
    });
  }

  /**
   * Fade overlay back to transparent
   * @returns {Promise<void>}
   */
  fadeIn() {
    return new Promise((resolve) => {
      this.overlay.classList.remove("fade-in");

      setTimeout(() => {
        resolve();
      }, this.fadeDuration);
    });
  }

  /**
   * Set fade duration
   * @param {number} duration - Duration in milliseconds
   */
  setFadeDuration(duration) {
    this.fadeDuration = Math.max(0, duration);
  }

  /**
   * Check if currently transitioning
   * @returns {boolean} True if transitioning
   */
  getIsTransitioning() {
    return this.isTransitioning;
  }
}

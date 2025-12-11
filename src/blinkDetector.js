/**
 * BlinkDetector tracks sustained eye blinks for scene transitions
 */
export class BlinkDetector {
  constructor() {
    this.isBlinking = false;
    this.blinkStartTime = null;
    this.blinkThreshold = 0.5; // Eye blink score threshold
    this.requiredDuration = 3000; // 3 seconds in milliseconds
  }

  /**
   * Detect if both eyes are closed for required duration
   * @param {Object} eyeData - Eye data object with eyeBlinkLeft and eyeBlinkRight
   * @returns {boolean} True if blink threshold met
   */
  detectBlink(eyeData) {
    // Check if both eyes are closed
    const leftClosed = eyeData.eyeBlinkLeft > this.blinkThreshold;
    const rightClosed = eyeData.eyeBlinkRight > this.blinkThreshold;
    const bothClosed = leftClosed && rightClosed;

    if (bothClosed) {
      if (!this.isBlinking) {
        // Eyes just closed, start timer
        this.isBlinking = true;
        this.blinkStartTime = performance.now();
        console.log("Blink detected, starting timer...");
      } else {
        // Eyes still closed, check duration
        const duration = performance.now() - this.blinkStartTime;

        if (duration >= this.requiredDuration) {
          // Blink threshold met!
          console.log(`Blink sustained for ${duration}ms - triggering transition`);
          this.reset();
          return true;
        }
      }
    } else {
      // Eyes open, reset
      if (this.isBlinking) {
        const duration = performance.now() - this.blinkStartTime;
        console.log(`Blink ended early after ${duration}ms`);
        this.reset();
      }
    }

    return false;
  }

  /**
   * Reset blink state
   */
  reset() {
    this.isBlinking = false;
    this.blinkStartTime = null;
  }

  /**
   * Set blink threshold
   * @param {number} threshold - New threshold (0-1)
   */
  setThreshold(threshold) {
    this.blinkThreshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Set required duration
   * @param {number} duration - New duration in milliseconds
   */
  setRequiredDuration(duration) {
    this.requiredDuration = Math.max(0, duration);
  }

  /**
   * Get current blink progress (0-1)
   * @returns {number} Progress from 0 to 1
   */
  getProgress() {
    if (!this.isBlinking) return 0;

    const duration = performance.now() - this.blinkStartTime;
    return Math.min(1, duration / this.requiredDuration);
  }
}

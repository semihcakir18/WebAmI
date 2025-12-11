/**
 * LoadingModal manages the initial loading screen with webcam permission and progress tracking
 */
export class LoadingModal {
  constructor() {
    this.modal = document.getElementById("loading-modal");
    this.statusEl = document.getElementById("loading-status");
    this.progressEl = document.getElementById("loading-progress");
    this.barEl = document.getElementById("loading-bar");
    this.beginButton = document.getElementById("begin-button");

    this.webcamPermissionCallback = null;
    this.beginCallback = null;

    // Bind button click
    this.beginButton.addEventListener("click", () => {
      this.onBeginClick();
    });
  }

  /**
   * Request webcam permission
   * @returns {Promise<boolean>} True if granted
   */
  async requestWebcamPermission() {
    this.updateStatus("Requesting webcam access...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Permission granted, but don't use the stream yet (we'll get a new one later)
      stream.getTracks().forEach((track) => track.stop());

      this.updateStatus("Webcam access granted!");
      return true;
    } catch (error) {
      console.error("Webcam permission denied:", error);
      this.showDenialMessage();
      return false;
    }
  }

  /**
   * Show denial message and block entry
   */
  showDenialMessage() {
    this.updateStatus("Please ? 🥺");
    this.progressEl.style.display = "none";
    this.beginButton.style.display = "none";
  }

  /**
   * Update status text
   * @param {string} text - Status message
   */
  updateStatus(text) {
    this.statusEl.textContent = text;
  }

  /**
   * Update progress bar
   * @param {number} percent - Progress percentage (0-100)
   */
  updateProgress(percent) {
    this.barEl.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  }

  /**
   * Enable the Begin Journey button
   */
  enableBeginButton() {
    this.beginButton.style.display = "inline-flex";
    this.updateStatus("Ready to begin!");
  }

  /**
   * Disable the Begin Journey button
   */
  disableBeginButton() {
    this.beginButton.disabled = true;
  }

  /**
   * Hide the modal with fade animation
   */
  hide() {
    this.modal.classList.add("hidden");
    setTimeout(() => {
      this.modal.style.display = "none";
    }, 500); // Match CSS transition duration
  }

  /**
   * Show the modal
   */
  show() {
    this.modal.style.display = "flex";
    this.modal.classList.remove("hidden");
  }

  /**
   * Set callback for when Begin Journey is clicked
   * @param {Function} callback - Callback function
   */
  onBegin(callback) {
    this.beginCallback = callback;
  }

  /**
   * Handle begin button click
   */
  onBeginClick() {
    if (this.beginCallback) {
      this.beginCallback();
    }
  }
}

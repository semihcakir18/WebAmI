import { FaceLandmarker } from "@mediapipe/tasks-vision";

export class FaceMeshRenderer {
  constructor(canvasId, videoElement) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.video = videoElement;
    this.isVisible = false;

    // Set canvas size
    this.canvas.width = 320;
    this.canvas.height = 240;
  }

  toggle() {
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.canvas.classList.remove("hidden");
    } else {
      this.canvas.classList.add("hidden");
    }
    return this.isVisible;
  }

  render(results) {
    if (!this.isVisible) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply mirroring transformation for everything
    this.ctx.save();
    this.ctx.translate(this.canvas.width, 0);
    this.ctx.scale(-1, 1);

    // Draw video frame
    this.ctx.drawImage(
      this.video,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    // Draw face landmarks if available (will also be mirrored)
    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];

      // Draw connections
      this.drawConnections(landmarks);

      // Draw landmarks
      this.drawLandmarks(landmarks);
    }

    // Restore context
    this.ctx.restore();
  }

  drawLandmarks(landmarks) {
    this.ctx.fillStyle = "#00FF00";

    for (const landmark of landmarks) {
      const x = landmark.x * this.canvas.width;
      const y = landmark.y * this.canvas.height;

      this.ctx.beginPath();
      this.ctx.arc(x, y, 1, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }

  drawConnections(landmarks) {
    // MediaPipe Face Mesh connections
    const connections = this.getFaceMeshConnections();

    this.ctx.strokeStyle = "rgba(0, 255, 0, 0.3)";
    this.ctx.lineWidth = 1;

    for (const connection of connections) {
      const start = landmarks[connection[0]];
      const end = landmarks[connection[1]];

      if (start && end) {
        this.ctx.beginPath();
        this.ctx.moveTo(start.x * this.canvas.width, start.y * this.canvas.height);
        this.ctx.lineTo(end.x * this.canvas.width, end.y * this.canvas.height);
        this.ctx.stroke();
      }
    }
  }

  getFaceMeshConnections() {
    // Subset of MediaPipe Face Mesh connections (face contour, eyes, lips, etc.)
    return [
      // Face oval
      [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389],
      [389, 356], [356, 454], [454, 323], [323, 361], [361, 288], [288, 397],
      [397, 365], [365, 379], [379, 378], [378, 400], [400, 377], [377, 152],
      [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172],
      [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162],
      [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10],

      // Left eye
      [33, 246], [246, 161], [161, 160], [160, 159], [159, 158], [158, 157],
      [157, 173], [173, 133], [133, 155], [155, 154], [154, 153], [153, 145],
      [145, 144], [144, 163], [163, 7], [7, 33],

      // Right eye
      [362, 398], [398, 384], [384, 385], [385, 386], [386, 387], [387, 388],
      [388, 466], [466, 263], [263, 249], [249, 390], [390, 373], [373, 374],
      [374, 380], [380, 381], [381, 382], [382, 362],

      // Lips outer
      [61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314],
      [314, 405], [405, 321], [321, 375], [375, 291], [291, 308], [308, 324],
      [324, 318], [318, 402], [402, 317], [317, 14], [14, 87], [87, 178],
      [178, 88], [88, 95], [95, 78], [78, 191], [191, 80], [80, 81],
      [81, 82], [82, 13], [13, 312], [312, 311], [311, 310], [310, 415],
      [415, 308],

      // Lips inner
      [78, 95], [95, 88], [88, 178], [178, 87], [87, 14], [14, 317],
      [317, 402], [402, 318], [318, 324], [324, 308], [308, 415], [415, 310],
      [310, 311], [311, 312], [312, 13], [13, 82], [82, 81], [81, 80],
      [80, 191], [191, 78],

      // Left eyebrow
      [46, 53], [53, 52], [52, 65], [65, 55], [55, 70], [70, 63], [63, 105],
      [105, 66], [66, 107],

      // Right eyebrow
      [276, 283], [283, 282], [282, 295], [295, 285], [285, 300], [300, 293],
      [293, 334], [334, 296], [296, 336],

      // Nose
      [168, 6], [6, 197], [197, 195], [195, 5], [5, 4], [4, 1], [1, 19],
      [19, 94], [94, 2], [2, 164], [164, 0], [0, 11], [11, 12], [12, 13],
      [13, 14], [14, 15], [15, 16], [16, 17],
    ];
  }
}

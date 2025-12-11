/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
export function showToast(message, duration = 5000) {
  const container = document.getElementById("toast-container");

  // Create toast element
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  // Add to container
  container.appendChild(toast);

  // Trigger fade in animation
  setTimeout(() => {
    toast.classList.add("show");
  }, 10); // Small delay for CSS transition

  // Auto dismiss
  setTimeout(() => {
    hideToast(toast);
  }, duration);
}

/**
 * Hide and remove a toast
 * @param {HTMLElement} toast - Toast element
 */
function hideToast(toast) {
  toast.classList.remove("show");
  toast.classList.add("hide");

  // Remove from DOM after animation
  setTimeout(() => {
    toast.remove();
  }, 300); // Match CSS transition duration
}

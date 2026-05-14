// src/lib/licensing.js

// Using local storage to persist the activation status.
// In a real production desktop app, you might want to use Tauri's secure keystore plugin
// or tauri-plugin-store to make this harder to tamper with.

const LICENSE_KEY_STORAGE = "voyager_license_key";
const LICENSE_STATUS_STORAGE = "voyager_license_status";

// Replace this with your actual Lemon Squeezy API URL and Store ID when configured
const LEMON_SQUEEZY_ACTIVATE_URL = "https://api.lemonsqueezy.com/v1/licenses/validate";

export async function validateLicenseKey(licenseKey) {
  try {
    // In Lemon Squeezy, a validation request typically looks like this.
    // If you haven't set up the store yet, this will fail or return mock data.
    
    // For development/demonstration purposes before you actually hook up the Lemon Squeezy store:
    if (licenseKey.trim() === "TEST-KEY-123") {
      return { valid: true };
    }

    const response = await fetch(LEMON_SQUEEZY_ACTIVATE_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        license_key: licenseKey
      })
    });

    const data = await response.json();
    return { valid: data.valid, message: data.error };
  } catch (error) {
    console.error("License validation error:", error);
    return { valid: false, message: "Network error during validation. Please try again." };
  }
}

export function saveLicenseLocally(key) {
  localStorage.setItem(LICENSE_KEY_STORAGE, key);
  localStorage.setItem(LICENSE_STATUS_STORAGE, "active");
}

export function getSavedLicense() {
  return localStorage.getItem(LICENSE_KEY_STORAGE);
}

export function isAppActivated() {
  return localStorage.getItem(LICENSE_STATUS_STORAGE) === "active";
}

export function deactivateApp() {
  localStorage.removeItem(LICENSE_KEY_STORAGE);
  localStorage.removeItem(LICENSE_STATUS_STORAGE);
}

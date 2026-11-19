import { apiRequest } from "@/lib/api-client";
import { clearAdminSession, getAdminSessionToken } from "@/lib/session";

function handleAdminUnauthorized(error) {
  if (error?.status !== 401 || typeof window === "undefined") return;
  try {
    clearAdminSession();
  } catch {
    // The in-memory session is cleared by the admin portal event listener.
  }
  window.dispatchEvent(new CustomEvent("hwh-admin-session-invalid", {
    detail: { message: error.message },
  }));
}

export async function adminRequest(path, { token, method = "GET", body } = {}) {
  try {
    return await apiRequest(`/admin${path}`, {
      method,
      body,
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (error) {
    handleAdminUnauthorized(error);
    throw error;
  }
}

export async function adminUploadRequest(files, { token } = {}) {
  const isFormData = typeof FormData !== "undefined" && files instanceof FormData;
  const formData = isFormData ? files : new FormData();

  if (!isFormData) {
    if (Array.isArray(files)) files.forEach((file) => formData.append("images", file));
    else if (typeof FileList !== "undefined" && files instanceof FileList) {
      Array.from(files).forEach((file) => formData.append("images", file));
    } else if (files) formData.append("images", files);
  }

  let adminToken = token || "";
  if (!adminToken && typeof window !== "undefined") {
    try {
      adminToken = getAdminSessionToken() || "";
    } catch {
      // The request will return 401 and clear the in-memory portal session.
    }
  }
  try {
    return await apiRequest("/admin/upload", {
      method: "POST",
      body: formData,
      headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
    });
  } catch (error) {
    handleAdminUnauthorized(error);
    throw error;
  }
}

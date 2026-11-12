const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/$/, "");

export async function adminRequest(path, { token, method = "GET", body } = {}) {
  const response = await fetch(`${API_BASE_URL}/admin${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = result.details
      ? Object.entries(result.details)
          .flatMap(([field, messages]) =>
            (Array.isArray(messages) ? messages : [messages]).map(
              (message) => `${field}: ${message}`,
            ),
          )
          .join("; ")
      : "";
    throw new Error(
      [result.error || "The admin request failed.", details]
        .filter(Boolean)
        .join(" "),
    );
  }
  return result;
}

export async function adminUploadRequest(files, { token } = {}) {
  const isFormData = files instanceof FormData;
  const formData = isFormData ? files : new FormData();

  if (!isFormData) {
    if (Array.isArray(files)) {
      files.forEach((file) => formData.append("images", file));
    } else if (typeof FileList !== "undefined" && files instanceof FileList) {
      Array.from(files).forEach((file) => formData.append("images", file));
    } else if (files) {
      formData.append("images", files);
    }
  }

  const adminToken =
    token ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("hwh-admin-session")
      : "");
  const response = await fetch(`${API_BASE_URL}/admin/upload`, {
    method: "POST",
    headers: {
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
    },
    body: formData,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.error || "The image upload failed.");
  return result;
}

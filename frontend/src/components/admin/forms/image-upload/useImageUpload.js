"use client";

import { useEffect, useRef, useState } from "react";
import { adminUploadRequest } from "@/lib/admin-api";

/**
 * Owns the image upload field state: upload progress, drag-over highlight,
 * error message, the "add via URL" input, and the hidden file input. Keeps the
 * list within `maxImages`, uploads picked/dropped files and edits the list
 * (remove, make cover, add URL) through `onChange`.
 * @param {object} options
 * @param {string[]} options.images Current image URLs.
 * @param {(images: string[]) => void} options.onChange Replaces the list.
 * @param {boolean} options.multiple Allow several images.
 * @param {number} options.maxImages Maximum number of images (Infinity for no limit).
 * @returns {{
 *   uploading: boolean, dragOver: boolean, setDragOver: Function, error: string,
 *   urlInput: string, setUrlInput: Function, showUrlInput: boolean, setShowUrlInput: Function,
 *   fileInputRef: import("react").RefObject<HTMLInputElement>, atImageLimit: boolean,
 *   handleFiles: (files: FileList) => Promise<void>, onDrop: (event: DragEvent) => void,
 *   openFilePicker: () => void, removeImage: (idx: number) => void,
 *   setPrimary: (idx: number) => void, addUrl: (event?: Event) => void,
 * }}
 */
export function useImageUpload({ images, onChange, multiple, maxImages }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);
  const atImageLimit = Number.isFinite(maxImages) && images.length >= maxImages;

  useEffect(() => {
    if (Number.isFinite(maxImages) && images.length > maxImages) {
      onChange(images.slice(0, maxImages));
      setError(`Products can have up to ${maxImages} images. Only the first ${maxImages} will be kept when you save.`);
    }
  }, [images, maxImages, onChange]);

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    const available = Number.isFinite(maxImages)
      ? Math.max(0, maxImages - images.length)
      : files.length;
    if (available === 0) {
      setError(`You can add up to ${maxImages} images.`);
      return;
    }
    const selectedFiles = Array.from(files);
    const acceptedFiles = selectedFiles.slice(0, available);
    setError(
      selectedFiles.length > available
        ? `Only ${maxImages} images are allowed. The first ${available} selected image${available === 1 ? " was" : "s were"} uploaded.`
        : "",
    );
    setUploading(true);
    try {
      const res = await adminUploadRequest(acceptedFiles);
      if (res.urls && res.urls.length) {
        if (multiple) {
          onChange([...images, ...res.urls].slice(0, maxImages));
        } else {
          onChange([res.urls[0]]);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to upload image(s).");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const openFilePicker = () =>
    !uploading && (!Number.isFinite(maxImages) || images.length < maxImages) && fileInputRef.current?.click();

  const removeImage = (idx) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  const setPrimary = (idx) => {
    if (idx === 0) return;
    const target = images[idx];
    const rest = images.filter((_, i) => i !== idx);
    onChange([target, ...rest]);
  };

  const addUrl = (e) => {
    e?.preventDefault();
    const url = urlInput.trim();
    if (!url) return;
    if (multiple) {
      if (Number.isFinite(maxImages) && images.length >= maxImages) {
        setError(`You can add up to ${maxImages} images.`);
        return;
      }
      onChange([...images, url]);
    } else {
      onChange([url]);
    }
    setUrlInput("");
    setShowUrlInput(false);
  };

  return {
    uploading,
    dragOver,
    setDragOver,
    error,
    urlInput,
    setUrlInput,
    showUrlInput,
    setShowUrlInput,
    fileInputRef,
    atImageLimit,
    handleFiles,
    onDrop,
    openFilePicker,
    removeImage,
    setPrimary,
    addUrl,
  };
}

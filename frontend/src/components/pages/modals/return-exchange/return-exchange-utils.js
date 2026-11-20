/** Largest photo a customer may attach to a return/exchange request (5 MB). */
export const MAX_RETURN_PHOTO_BYTES = 5 * 1024 * 1024;

/** Most photos a return/exchange request may carry. */
export const MAX_RETURN_PHOTOS = 4;

/** Message shown when a picked photo is larger than {@link MAX_RETURN_PHOTO_BYTES}. */
export const RETURN_PHOTO_TOO_LARGE = "Each photo must be 5 MB or smaller.";

/**
 * Whether any picked file exceeds {@link MAX_RETURN_PHOTO_BYTES}.
 * @param {File[]} files
 * @returns {boolean}
 */
export const hasOversizedPhoto = (files) => files.some((file) => file.size > MAX_RETURN_PHOTO_BYTES);

/**
 * Adds newly picked photos, keeping at most {@link MAX_RETURN_PHOTOS}.
 * @param {File[]} current Photos already attached.
 * @param {File[]} files Newly picked photos.
 * @returns {File[]}
 */
export const appendReturnPhotos = (current, files) => [...current, ...files].slice(0, MAX_RETURN_PHOTOS);

/**
 * Photos without the one at `index`.
 * @param {File[]} photos
 * @param {number} index
 * @returns {File[]}
 */
export const removeReturnPhoto = (photos, index) => photos.filter((_, photoIndex) => photoIndex !== index);

/**
 * Stable list key for an attached photo.
 * @param {File} photo
 * @returns {string}
 */
export const returnPhotoKey = (photo) => `${photo.name}-${photo.lastModified}`;

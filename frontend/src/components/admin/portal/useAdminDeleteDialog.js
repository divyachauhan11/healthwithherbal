"use client";

import { useState } from "react";
import { deleteAdminRecord } from "../../../lib/admin-api";
import { createClosedDeleteModal } from "./admin-portal-utils";

/**
 * Owns the global delete confirmation dialog: opens it for a record (blocked
 * for brands/categories that still have products), deletes on confirm and
 * reloads the page, and closes it unless a delete is running.
 * @param {object} options
 * @param {string} options.token Admin token.
 * @param {string} options.page Active page (reloaded after a delete).
 * @param {(target?: string) => Promise<void>} options.load
 * @param {(message: string, type?: string) => void} options.notify
 * @returns {{
 *   deleteModal: {isOpen: boolean, kind: string, item: object|null, isBlocked: boolean, blockedCount: number, busy: boolean},
 *   remove: (kind: string, item: object) => void, confirmDelete: () => Promise<void>, closeDeleteModal: () => void,
 * }}
 */
export function useAdminDeleteDialog({ token, page, load, notify }) {
  const [deleteModal, setDeleteModal] = useState(createClosedDeleteModal);

  const remove = (kind, item) => {
    if (!item) return;
    const count = item.productCount ?? item.count ?? 0;
    const isBlocked = (kind === "brands" || kind === "categories") && count > 0;
    setDeleteModal({
      isOpen: true,
      kind,
      item,
      isBlocked,
      blockedCount: count,
      busy: false,
    });
  };

  const confirmDelete = async () => {
    const { kind, item } = deleteModal;
    if (!kind || !item?._id) return;
    setDeleteModal((prev) => ({ ...prev, busy: true }));
    try {
      await deleteAdminRecord(kind, item._id, token);
      await load(page);
      notify(
        `${item.name || item.title || item.code || "Record"} removed successfully.`,
        "success",
      );
      setDeleteModal(createClosedDeleteModal());
    } catch (error) {
      notify(error.message, "error");
      setDeleteModal((prev) => ({ ...prev, busy: false }));
    }
  };

  const closeDeleteModal = () => {
    if (deleteModal.busy) return;
    setDeleteModal(createClosedDeleteModal());
  };

  return { deleteModal, remove, confirmDelete, closeDeleteModal };
}

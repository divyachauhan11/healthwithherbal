"use client";

import { useEffect, useState } from "react";
import { fetchAdminReturnExchangeSetting, saveAdminReturnExchangeSetting } from "@/lib/admin-api";
import { RETURN_EXCHANGE_SETTING_EVENT } from "./settings-utils";

/**
 * Loads and saves whether customers can submit return/exchange requests online.
 * @param {string} token Admin session token.
 * @returns {{enabled: boolean, loading: boolean, saving: boolean, message: string, save: (enabled: boolean) => Promise<void>}}
 */
export function useReturnExchangeSetting(token) {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetchAdminReturnExchangeSetting(token)
      .then((data) => { if (active) setEnabled(data.enabled !== false); })
      .catch((error) => { if (active) setMessage(error.message || "Could not load this setting."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const save = async (nextEnabled) => {
    setSaving(true);
    setMessage("");
    try {
      const data = await saveAdminReturnExchangeSetting(nextEnabled, token);
      setEnabled(data.enabled);
      setMessage(data.enabled
        ? "Online return and exchange requests are enabled."
        : "Online requests are disabled. Customers will be directed to email support.");
      window.dispatchEvent(new CustomEvent(RETURN_EXCHANGE_SETTING_EVENT, { detail: { enabled: data.enabled } }));
    } catch (error) { setMessage(error.message || "Could not save this setting."); }
    finally { setSaving(false); }
  };

  return { enabled, loading, saving, message, save };
}

"use client";
import { useEffect, useState } from "react";
import { estimateShipping, fetchUserAddresses } from "@/lib/api";
import { defaultShippingOptionFor } from "./cart-utils";

/**
 * Cart drawer shipping estimator: destination fields, the signed-in user's
 * saved addresses (loaded while the shipping panel is open), the live rate
 * estimate and its feedback message.
 * @param {object} options
 * @param {string|null} options.activeModal Open drawer panel; addresses load for "shipping".
 * @param {object|null} [options.currentUser] Signed-in customer.
 * @param {number} options.subtotal Cart total sent with the estimate.
 * @param {(option: object) => void} options.onSelectShipping Selects the storefront shipping option.
 * @returns {{
 *   country: string, province: string, zip: string,
 *   feedback: {type: string, text: string}|null, rates: object[], calculating: boolean,
 *   savedAddresses: object[], selectedAddressId: string, selectedAddress: object|undefined,
 *   loadingAddresses: boolean, addressLoadError: string,
 *   selectSavedAddress: (id: string) => void, changeCountry: (country: string) => void,
 *   changeProvince: (province: string) => void, changeZip: (zip: string) => void,
 *   calculate: () => Promise<void>,
 * }}
 */
export function useCartShippingEstimate({ activeModal, currentUser, subtotal, onSelectShipping }) {
  const [shippingCountry, setShippingCountry] = useState("India");
  const [shippingProvince, setShippingProvince] = useState("Jharkhand");
  const [shippingZip, setShippingZip] = useState("");
  const [shippingFeedback, setShippingFeedback] = useState(null);
  const [availableShippingRates, setAvailableShippingRates] = useState([]);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [savedShippingAddresses, setSavedShippingAddresses] = useState([]);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState("");
  const [loadingShippingAddresses, setLoadingShippingAddresses] = useState(false);
  const [shippingAddressLoadError, setShippingAddressLoadError] = useState("");

  useEffect(() => {
    if (activeModal !== "shipping" || !currentUser) return undefined;
    let active = true;
    setLoadingShippingAddresses(true);
    setShippingAddressLoadError("");
    fetchUserAddresses({
      userId: currentUser._id,
      email: currentUser.email,
      phone: currentUser.phone,
    })
      .then((addresses) => {
        if (!active) return;
        const saved = Array.isArray(addresses) ? addresses : [];
        setSavedShippingAddresses(saved);
        const preferred = saved.find((address) => address.isDefault) || saved[0];
        if (preferred) {
          setSelectedShippingAddressId(preferred._id);
          setShippingCountry(preferred.country || "India");
          setShippingProvince(preferred.state || "Jharkhand");
          setShippingZip(preferred.postalCode || "");
        } else {
          setSelectedShippingAddressId("");
          setShippingZip("");
        }
      })
      .catch((error) => {
        if (active) setShippingAddressLoadError(error.message || "Could not load your saved addresses.");
      })
      .finally(() => {
        if (active) setLoadingShippingAddresses(false);
      });
    return () => { active = false; };
    // Reload only when the panel opens/closes or the user's identity fields
    // change, not on every new currentUser object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModal, currentUser?._id, currentUser?.email, currentUser?.phone]);

  const resetEstimate = () => {
    setShippingFeedback(null);
    setAvailableShippingRates([]);
  };

  const selectSavedAddress = (addressId) => {
    const address = savedShippingAddresses.find((item) => item._id === addressId);
    setSelectedShippingAddressId(addressId);
    if (!address) return;
    setShippingCountry(address.country || "India");
    setShippingProvince(address.state || "Jharkhand");
    setShippingZip(address.postalCode || "");
    resetEstimate();
    onSelectShipping(defaultShippingOptionFor(String(address.country || "India")));
  };

  const changeCountry = (country) => {
    setShippingCountry(country);
    resetEstimate();
    onSelectShipping(defaultShippingOptionFor(country));
  };

  const changeProvince = (province) => {
    setShippingProvince(province);
    resetEstimate();
  };

  const changeZip = (zip) => {
    setShippingZip(zip);
    resetEstimate();
  };

  const calculate = async () => {
    const cleanZip = (shippingZip || "").trim();
    if (!cleanZip) {
      setShippingFeedback({
        type: "error",
        text: `Please enter a postal PIN code for ${shippingProvince}, ${shippingCountry}`,
      });
      return;
    }

    setCalculatingShipping(true);
    setShippingFeedback(null);

    try {
      const result = await estimateShipping({
        country: shippingCountry,
        province: shippingProvince,
        postalCode: cleanZip,
        orderTotal: subtotal,
      });

      setShippingFeedback({
        type: "success",
        text:
          result.message || `Standard Shipping: Free for ${shippingProvince}!`,
      });
      setAvailableShippingRates(Array.isArray(result.rates) ? result.rates : []);
    } catch (err) {
      setShippingFeedback({
        type: "error",
        text:
          err.message ||
          `Enter a valid PIN code for ${shippingProvince}, ${shippingCountry}`,
      });
    } finally {
      setCalculatingShipping(false);
    }
  };

  return {
    country: shippingCountry,
    province: shippingProvince,
    zip: shippingZip,
    feedback: shippingFeedback,
    rates: availableShippingRates,
    calculating: calculatingShipping,
    savedAddresses: savedShippingAddresses,
    selectedAddressId: selectedShippingAddressId,
    selectedAddress: savedShippingAddresses.find(
      (address) => address._id === selectedShippingAddressId,
    ),
    loadingAddresses: loadingShippingAddresses,
    addressLoadError: shippingAddressLoadError,
    selectSavedAddress,
    changeCountry,
    changeProvince,
    changeZip,
    calculate,
  };
}

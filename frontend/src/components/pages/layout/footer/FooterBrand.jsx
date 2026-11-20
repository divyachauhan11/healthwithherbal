"use client";
import { LOGO_URL } from "@/lib/store-data";
import { InstagramIcon, FacebookIcon } from "@/components/pages/shared/icons";
import { FooterSocialButton } from "./FooterSocialButton";

/**
 * Footer brand block: logo, short description and social links.
 */
export function FooterBrand() {
  return (
    <div className="footer-brand">
      <div className="brandmark logo-brandmark">
        <img
          src={LOGO_URL}
          alt="Health With Herbal"
          className="site-logo-img footer-logo"
        />
      </div>
      <p>
        Authentic herbal and Ayurvedic care, selected for modern life and
        delivered worldwide.
      </p>
      <div className="footer-social">
        <FooterSocialButton
          label="Instagram"
          href="https://www.instagram.com/"
          icon={<InstagramIcon />}
        />
        <FooterSocialButton
          label="Facebook"
          href="https://www.facebook.com/"
          icon={<FacebookIcon />}
        />
      </div>
    </div>
  );
}

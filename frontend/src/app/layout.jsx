import "./globals.css";

export const metadata = {
  title: "Healthwithherbal | Natural Wellness, Rooted in Tradition",
  description: "Discover authentic Ayurvedic and herbal care for everyday wellbeing.",
  icons: {
    icon: "/favicon.ico?v=2",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

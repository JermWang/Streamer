import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { WalletButton } from "@/components/wallet/WalletButton";
import Link from "next/link";
import { SITE_DESCRIPTION } from "@/config/constants";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://streamcoin.fun";

export const metadata: Metadata = {
  title: {
    default: "$STREAMER — Community Streamer Coins on Solana",
    template: "%s | $STREAMER",
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(siteUrl),
  keywords: [
    "streamer coin",
    "pump.fun",
    "solana",
    "community token",
    "streamer crypto",
    "twitch coin",
    "kick coin",
    "creator token",
    "$STREAMER",
  ],
  authors: [{ name: "Streamcoin" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Streamcoin",
    title: "$STREAMER — Community Streamer Coins on Solana",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/streamer-logo.png",
        width: 1254,
        height: 1254,
        alt: "$STREAMER — Community Streamer Coins on Solana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "$STREAMER — Community Streamer Coins on Solana",
    description: SITE_DESCRIPTION,
    images: ["/streamer-logo.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/streamer-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>
        <WalletProvider>
          <div className="app">
            <div className="grain" aria-hidden="true" />
            <div className="ambient-blob b1" aria-hidden="true" />
            <div className="ambient-blob b2" aria-hidden="true" />
            <div className="ambient-blob b3" aria-hidden="true" />

            <header className="topnav">
              <div className="topnav-inner">
                <Link href="/" className="brand">
                  <span className="brand-logo brand-logo-nav">
                    <img src="/streamer-nav-green-mark.png?v=2" alt="$STREAMER" />
                  </span>
                </Link>

                <nav className="nav-tabs">
                  <Link href="/" className="nav-tab">Discover</Link>
                  <Link href="/?filter=unclaimed" className="nav-tab">Unclaimed</Link>
                  <Link href="/?filter=verified" className="nav-tab">Verified</Link>
                  <Link href="/admin" className="nav-tab">Admin</Link>
                </nav>

                <div className="topnav-right">
                  <WalletButton />
                </div>
              </div>
            </header>

            <main>{children}</main>
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}

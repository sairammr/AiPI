import type { Metadata } from "next";
import "./globals.css";

/**
 * Metadata for the page
 */
export const metadata: Metadata = {
  title: "AiPI",
  description: "AI Platform Interface",
};

/**
 * Root layout for the page
 *
 * @param {object} props - The props for the root layout
 * @param {React.ReactNode} props.children - The children for the root layout
 * @returns {React.ReactNode} The root layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Header */}
        <header className="brutalist-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900' }}>AiPI</h1>
            <h2 style={{ fontSize: '18px', fontWeight: '900' }}>AI PLATFORM INTERFACE</h2>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          {children}
        </main>

        {/* Footer */}
        <footer className="brutalist-footer">
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '16px', fontWeight: '900' }}>AiPI</span>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <a href="#" style={{ margin: '0 8px' }}>DOCS</a>
              <a href="#" style={{ margin: '0 8px' }}>GITHUB</a>
              <a href="#" style={{ margin: '0 8px' }}>DISCORD</a>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700' }}>
              POWERED BY AiPI | © {new Date().getFullYear()}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

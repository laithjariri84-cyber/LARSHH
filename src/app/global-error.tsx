"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[global-error-boundary]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "420px", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", marginBottom: "8px" }}>
            Application error
          </h1>
          <p style={{ color: "#a1a1aa", fontSize: "0.875rem", lineHeight: 1.6 }}>
            A server-side exception occurred. Please try again.
          </p>
          {error.digest ? (
            <p
              style={{
                color: "#71717a",
                fontSize: "0.75rem",
                fontFamily: "monospace",
                marginTop: "12px",
              }}
            >
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "24px",
              background: "#d4af37",
              color: "#0a0a0b",
              border: "none",
              borderRadius: "12px",
              padding: "10px 18px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

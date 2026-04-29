import React from "react";

const SupportSection = () => {
  const paymentLink = "https://pa.l1s.ir/link/767642";

  return (
    <div style={{
      position: "fixed",
      bottom: "15px",
      right: "15px",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "white",
      padding: "6px 12px",
      borderRadius: "30px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      fontFamily: "inherit",
      cursor: "pointer",
      transition: "all .25s ease"
    }}
    onMouseOver={e => e.currentTarget.style.transform = "translateY(-3px)"}
    onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <span style={{ fontSize: "18px", animation: "pulse 1.8s infinite" }}>❤️</span>
      <a
        href={paymentLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: "13px",
          color: "#4F46E5",
          textDecoration: "none",
          fontWeight: "600"
        }}
      >
        حمایت
      </a>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SupportSection;

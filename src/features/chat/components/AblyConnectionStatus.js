import React from "react";
import { useChatContext } from "../context/ChatContext"; 

const AblyConnectionStatus = () => {
  const { isAblyConnected, ablyError } = useChatContext();

  return (
    <div
      style={{
        padding: "10px",
        margin: "10px",
        border: "1px solid #ccc",
        backgroundColor: "#f9f9f9",
        position: "fixed", 
        bottom: "10px",
        right: "10px",
        zIndex: 10000, 
      }}
    >
      <h4>Ably Connection Status</h4>
      {ablyError && (
        <p style={{ color: "red" }}>
          Error: {ablyError.message || JSON.stringify(ablyError)}
        </p>
      )}
      <p>Connected: {isAblyConnected ? "✅ Yes" : "❌ No"}</p>
      {!isAblyConnected && !ablyError && <p>Attempting to connect...</p>}
    </div>
  );
};

export default AblyConnectionStatus;

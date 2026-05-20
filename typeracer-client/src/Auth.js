import React, { useState } from "react";

function Auth({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Sending...");

    const endpoint = isLoginMode ? "/api/Login" : "/api/Register";
    const url = `${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        if (isLoginMode) {
          const data = await response.json();

          localStorage.setItem("token", data.token || data.Token);
          localStorage.setItem("username", username);

          setMessage(`Logged as ${username}`);
          setTimeout(() => onLoginSuccess(username), 1000);
        } else {
          setMessage("Account created, please log in");
          setIsLoginMode(true);
          setPassword("");
        }
      } else {
        const errorText = await response.text();
        let parsedError = errorText;
        try {
          const jsonError = JSON.parse(errorText);
          parsedError = jsonError.title || errorText;
        } catch {}
        setMessage("Error: " + parsedError);
      }
    } catch (error) {
      setMessage("Connection error: Is backend running?");
    }
  };

  return (
    <div style={{ width: "100%", padding: "10px" }}>
      <h2 style={{
        color: "var(--cyan)",
        fontFamily: "var(--mono)",
        textTransform: "uppercase",
        letterSpacing: "4px",
        marginBottom: "30px",
        textShadow: "var(--cyan-glow)"
      }}>
        {isLoginMode ? "Login" : "Register"}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <input
          type="text"
          placeholder="PLAYER NAME"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="cyber-input"
          style={{ width: "100%", textAlign: "center", fontSize: "18px", letterSpacing: "2px" }}
        />
        <input
          type="password"
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="cyber-input"
          style={{ width: "100%", textAlign: "center", fontSize: "18px", letterSpacing: "2px" }}
        />
        <button
          type="submit"
          style={{
            marginTop: "10px",
            padding: "15px",
            fontSize: "18px",
            fontFamily: "var(--mono)",
            fontWeight: "bold",
            letterSpacing: "3px",
            color: isLoginMode ? "var(--cyan)" : "var(--green)",
            border: `1px solid ${isLoginMode ? 'var(--cyan)' : 'var(--green)'}`,
            background: isLoginMode ? "rgba(0,240,255,0.05)" : "rgba(0,255,140,0.05)",
            boxShadow: isLoginMode ? "var(--cyan-glow)" : "var(--green-glow)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            textTransform: "uppercase",
            borderRadius: "6px"
          }}
          onMouseEnter={(e) => {
              e.target.style.background = isLoginMode ? "rgba(0,240,255,0.15)" : "rgba(0,255,140,0.15)";
              e.target.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
              e.target.style.background = isLoginMode ? "rgba(0,240,255,0.05)" : "rgba(0,255,140,0.05)";
              e.target.style.transform = "scale(1)";
          }}
        >
          {isLoginMode ? "Log In" : "Create Account"}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "20px", color: "var(--orange)", fontFamily: "var(--mono)", fontWeight: "bold" }}>
          {message}
        </p>
      )}

      <div style={{ marginTop: "30px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
        <button
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setMessage("");
          }}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            fontFamily: "var(--ui)",
            fontSize: "14px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            transition: "color 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.color = "var(--cyan)"}
          onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.4)"}
        >
          {isLoginMode ? "NEED AN ACCOUNT? REGISTER" : "HAVE AN ACCOUNT? LOG IN"}
        </button>
      </div>
    </div>
  );
}

export default Auth;

import React, { useState } from "react";

function Auth({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ tone: "info", text: "Sending..." });

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

          setMessage({ tone: "ok", text: `Logged as ${username}` });
          setTimeout(() => onLoginSuccess(username), 1000);
        } else {
          setMessage({ tone: "ok", text: "Account created, please log in" });
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
        setMessage({ tone: "error", text: "Error: " + parsedError });
      }
    } catch (error) {
      setMessage({ tone: "error", text: "Connection error: Is backend running?" });
    }
  };

  return (
    <div
      className="tr-panel"
      data-block="auth"
      data-mode={isLoginMode ? "login" : "register"}
    >
      <h2>{isLoginMode ? "Login" : "Register"}</h2>
      <p className="tr-sub">
        {isLoginMode ? "Welcome back, racer." : "Pick the name other racers will see."}
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={isLoginMode ? "PLAYER NAME" : "CHOOSE A NAME"}
          aria-label="Player name"
          autoComplete="username"
          spellCheck={false}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="tr-input"
        />
        <input
          type="password"
          placeholder={isLoginMode ? "PASSWORD" : "CHOOSE A PASSWORD"}
          aria-label="Password"
          autoComplete={isLoginMode ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="tr-input"
        />
        <button type="submit" className="tr-btn" data-v="primary">
          {isLoginMode ? "Log in" : "Create account"}
        </button>
      </form>

      {message && (
        <p className="tr-msg" data-tone={message.tone} role="status">
          {message.text}
        </p>
      )}

      <div className="tr-divider">
        <button
          className="tr-link"
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setMessage(null);
          }}
        >
          {isLoginMode ? "NEED AN ACCOUNT? REGISTER" : "HAVE AN ACCOUNT? LOG IN"}
        </button>
      </div>
    </div>
  );
}

export default Auth;

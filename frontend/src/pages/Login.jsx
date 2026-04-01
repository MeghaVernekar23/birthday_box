import React, { useState } from "react";
import "../css/Login.css";
import BirthdayLoginImage from "../images/Birthdax_login_image.jpg";
import BirthdayLogo from "../images/logo.jpg";
import { apiRequest } from "../utils/APIrequest";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../services/utils";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const data = await apiRequest({
        url: `${BASE_URL}/users/login`,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: formData.toString(),
      });

      const user_email = await apiRequest({
        url: `${BASE_URL}/users/me`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      localStorage.setItem("current_user", JSON.stringify(user_email));
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("role", data.role);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(
        error.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Form panel */}
        <div className="login-form-panel">
          <img src={BirthdayLogo} alt="Birthday Box logo" className="login-logo" />
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to your Birthday Box account</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {errorMessage && (
              <div className="login-error" role="alert">
                {errorMessage}
              </div>
            )}

            <div className="login-actions">
              <button className="btn-login" type="submit">
                Sign In
              </button>
              <a className="forgot-link" href="#!">
                Forgot password?
              </a>
            </div>
          </form>
        </div>

        {/* Image panel */}
        <div
          className="login-banner"
          style={{ backgroundImage: `url(${BirthdayLoginImage})` }}
          aria-hidden="true"
        >
          <div className="login-banner-overlay">
            <h2>Celebrate Every Moment</h2>
            <p>The perfect gift, delivered with love.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

import { React, useState } from "react";
import "../css/Login.css";
import BirthdayLoginImage from "../images/Birthdax_login_image.jpg";
import BirthdayLogo from "../images/logo.jpg";
import { apiRequest } from "../utils/APIrequest";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // clear previous error

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const data = await apiRequest({
        url: "http://localhost:8000/users/login",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      console.log("Login successful:", data);

      const user_email = await apiRequest({
        url: "http://localhost:8000/users/me",
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
      console.error("Error during login:", error);
      setErrorMessage(
        error.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <section
      className="d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "#eee", height: "100vh", width: "100vw" }}
    >
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-xl-10">
            <div className="card rounded-3 text-black">
              <div className="row g-0">
                <div className="col-lg-6">
                  <div className="card-body p-md-5 mb-5 mx-md-4">
                    <div className="text-center">
                      <img
                        src={BirthdayLogo}
                        style={{
                          width: "150px",
                          maxWidth: "100%",
                          objectFit: "contain",
                        }}
                        alt="logo"
                      />

                      <h4 className="mt-1 mb-5 pb-1"></h4>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <p>Please login to your account</p>

                      <div className="form-outline mb-4">
                        <input
                          type="text"
                          id="form2Example11"
                          className="form-control"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                        <label className="form-label" htmlFor="form2Example11">
                          Username
                        </label>
                      </div>

                      <div className="form-outline mb-4">
                        <input
                          type="password"
                          id="form2Example22"
                          className="form-control"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <label className="form-label" htmlFor="form2Example22">
                          Password
                        </label>
                        {errorMessage && (
                          <div
                            className="text-danger mt-1"
                            style={{ fontSize: "0.9rem" }}
                          >
                            {errorMessage}
                          </div>
                        )}
                      </div>

                      <div className="text-center pt-1 mb-5 pb-1">
                        <button
                          className="btn btn-primary btn-block fa-lg gradient-custom-2 mb-3 me-3"
                          type="submit"
                        >
                          Log in
                        </button>
                        <a className="text-muted" href="#!">
                          Forgot password?
                        </a>
                      </div>
                    </form>
                  </div>
                </div>

                <div
                  className="col-lg-6 login-banner"
                  style={{ backgroundImage: `url(${BirthdayLoginImage})` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;

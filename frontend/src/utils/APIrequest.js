
export const apiRequest = async ({ url, method = "GET", data = null, headers = {} }) => {
  const token = localStorage.getItem("access_token");

  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const finalHeaders = { ...defaultHeaders, ...headers };

  const options = {
    method,
    headers: finalHeaders,
  };

  if (data) {

    if (finalHeaders["Content-Type"] === "application/json") {
      options.body = JSON.stringify(data);
    } else {
      options.body = data;
    }
  }

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type");

    let responseData;
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {

      if (response.status === 401) {
        const detail = responseData?.detail || "";

        if (typeof detail === "string" && detail.includes("Invalid credential. Please enter a valid username and password.")) {

          throw new Error("Invalid credentials. Please try again.");
        } else {

          localStorage.clear();
          alert("Session expired. Please log in again.");
          window.location.href = "/";
          throw new Error("Session expired");
        }
      }


      const errorMsg = typeof responseData === "object" ? JSON.stringify(responseData) : responseData;
      throw new Error(errorMsg);
    }

    return responseData;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

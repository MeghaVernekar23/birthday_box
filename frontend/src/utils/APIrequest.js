export const apiRequest = async ({
  url,
  method = "GET",
  headers = {},
  body = null,
  data = null,
}) => {
  const payload = body || data;

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (payload) {
    options.body =
      typeof payload === "string" ? payload : JSON.stringify(payload);
  }

  const response = await fetch(url, options);

  // Read the body once only
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const responseData = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw {
      status: response.status,
      message: responseData.detail || "Request failed",
      body: responseData,
    };
  }

  return responseData;
};

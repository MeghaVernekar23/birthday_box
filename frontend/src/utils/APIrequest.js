export const apiRequest = async ({
  url,
  method = "GET",
  headers = {},
  body = null,
  data = null, // optional alias
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Server responded with status ${response.status}: ${errorText}`
    );
  }

  return await response.json();
};

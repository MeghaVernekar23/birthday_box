export const apiRequest = async ({
  url,
  method = "GET",
  headers = {},
  body = null,
}) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    options.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Server responded with status ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();
  return data;
};

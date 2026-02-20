export async function authFetch(url, options = {}) {
  const accessToken = localStorage.getItem("access_token");

  // First attempt
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status !== 401) {
    return response;
  } else {
    console.log("401 ENCOUNTERED")
  }

  // If access token is expired, attempt to refresh
  const refreshResponse = await fetch(
    `${import.meta.env.VITE_API_URL}api/token/refresh`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refresh: localStorage.getItem("refresh_token"),
      }),
    }
  );

  if (!refreshResponse.ok) {
    throw new Error("Session expired");
  }

  const { access } = await refreshResponse.json();
  localStorage.setItem("access_token", access);

  // Retry original request with new token
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${access}`,
    },
  });
}
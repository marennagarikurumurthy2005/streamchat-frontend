import axios from "axios";

const API_URL = "https://streamchat-backend-ow46.onrender.com";

// 1. Login with username + password to get token
const login = async () => {
  try {
    const res = await axios.post(`${API_URL}/auth/login/`, {
      username: "MURTHY",   // change this
      password: "murthy2005",   // change this
    });
    console.log("Login success:", res.data);
    return res.data.access; // return access token
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
  }
};

// 2. Fetch songs with token
const fetchSongs = async (token, query = "salaar") => {
  try {
    const res = await axios.get(`${API_URL}/movies/search/`, {
      params: { query },
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Songs:", res.data);
    return res.data;
  } catch (err) {
    console.error(
      "Song fetch failed:",
      err.response?.status,
      err.response?.data || err.message
    );
  }
};

// 3. Run login → fetch
(async () => {
  const token = await login();
  if (token) {
    await fetchSongs(token);
  }
})();

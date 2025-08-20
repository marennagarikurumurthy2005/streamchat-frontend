import React, { useState, useEffect } from "react";
import HomeImg from "../assets/login.svg";
import FbImg from "../assets/fb.png";
import google from "../assets/google.jpg";
import { Mail, Eye, EyeOff, User } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const Loginpage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const VITE_BACKEND_URL ='https://streamchat-backend-ow46.onrender.com'
  const API_URL =VITE_BACKEND_URL;
/* 
  useEffect(() => {
    // Optional "wake up" ping; safe no-op if backend is already warm
    const wakingBackend = async () => {
      try {
        await axios.get(`${API_URL}/waking`);
      } catch (_) {}
    };
    wakingBackend();
  }, [API_URL]); */

  // --- AUTH HELPERS ---
  const saveAuth = ({ username, access, refresh }) => {
  localStorage.setItem("username", username);
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
};
// --- AUTO LOGIN ---
const autoLogin = async (username, password) => {
  const res = await axios.post(`${API_URL}/auth/login/`, { username, password });
  if (res.status === 200 && res.data?.access) {
    saveAuth({ username, access: res.data.access, refresh: res.data.refresh });
    navigate("/chat");  // match your <Route path="/chat">
    toast.success("Welcome!");
  } else {
    toast.error("Login failed after registration.");
  }
};

 // --- REGISTER ---
const handleRegister = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    // Step 1: Register user
    const res = await axios.post(`${API_URL}/auth/register/`, {
      username,
      email,
      password,
    });

    if (res.status === 201 || res.status === 200) {
      // Step 2: Immediately login after register
      const loginRes = await axios.post(`${API_URL}/auth/login/`, {
        username,
        password,
      });

      if (loginRes.status === 200 && loginRes.data?.access) {
        // Save tokens and user
        saveAuth({
          username,
          access: loginRes.data.access,
          refresh: loginRes.data.refresh,
        });

        // Navigate directly to chat page
        navigate("/chat");
        toast.success("Registration successful! Welcome 🎉");
      } else {
        toast.error("Registration succeeded, but login failed.");
      }
    }
  } catch (e) {
    toast.error("Registration failed. Try another username/email.");
    console.error("Register error:", e);
  } finally {
    // reset fields
    setPassword("");
    setUsername("");
    setEmail("");
    setLoading(false);
  }
};



  // --- LOGIN ---
  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await axios.post(`${API_URL}/auth/login/`, { username, password });
    if (res.status === 200 && res.data?.access) {
      saveAuth({ username, access: res.data.access, refresh: res.data.refresh });
      navigate("/chat"); // not /StreamChatPage, since your route is /chat
      toast.success("Logged in!");
    }
  } catch (e) {
    toast.error("Invalid username or password");
    console.log("Login error:", e);
  } finally {
    setPassword("");
    setUsername("");
    setLoading(false);
  }
};

  // --- FORGOT PASSWORD ---
  const handleForgotPassword = async () => {
    // Keep your UI intact—simple prompt avoids new modal code
    const emailInput = email || window.prompt("Enter your account email:");
    if (!emailInput) return;
    try {
      await axios.post(`${API_URL}/auth/forgot-password/`, { email: emailInput });
      toast.success("Password reset email sent (check your inbox).");
    } catch (e) {
      toast.error("Could not send reset email.");
      console.log("Forgot password error:", e);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row justify-between">
      <div className="w-full md:w-1/2 flex justify-center flex-col px-6 md:px-32 py-12">
        <ToastContainer />
        {showRegister ? (
          <form method="post" onSubmit={handleRegister}>
            <div className="w-full flex flex-col items-start justify-center text-start">
              <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-semibold">Welcome to StreamChat AI</h1>
                <p className="mt-2 font-medium text-gray-500 font-light">
                  Search and Play your Favourite Movies and Songs
                  <br />
                  Register now and Enjoy uninteruptedly
                </p>
              </div>
              <div className="flex flex-col mt-10 gap-5 w-full">
                <div className="flex flex-col gap-2 relative">
                  <label>Username</label>
                  <input
                    type="text"
                    placeholder="murthy@2005"
                    className="p-3 bg-[#f8f8f8] rounded-xl pr-14 outline-none border border-[#d7d7d7]"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <User size={20} className="absolute bottom-3 right-3 text-gray-400" />
                </div>
                <div className="flex flex-col gap-2 relative">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    className="p-3 bg-[#f8f8f8] rounded-xl pr-14 outline-none border border-[#d7d7d7]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail size={20} className="absolute bottom-3 right-3 text-gray-400" />
                </div>
                <div className="flex flex-col gap-2 relative">
                  <label>Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="p-3 bg-[#f8f8f8] rounded-xl pr-14 outline-none border border-[#d7d7d7]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {showPassword ? (
                    <Eye
                      onClick={() => setShowPassword(!showPassword)}
                      size={20}
                      className="absolute bottom-3 right-3 text-gray-400 cursor-pointer"
                    />
                  ) : (
                    <EyeOff
                      onClick={() => setShowPassword(!showPassword)}
                      size={20}
                      className="absolute bottom-3 right-3 text-gray-400 cursor-pointer"
                    />
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="p-3 w-full rounded-xl text-white font-semibold bg-blue-500 mt-5 hover:bg-blue-400 cursor-pointer disabled:opacity-60"
              >
                {loading ? "Please wait…" : "Sign Up"}
              </button>

              <div className="w-full flex items-center justify-center gap-4 mt-5">
                <div className="flex-grow h-px bg-gray-400"></div>
                <span className="text-gray-500 text-sm">or</span>
                <div className="flex-grow h-px bg-gray-400"></div>
              </div>

              <div className="w-full relative mt-5">
                <img
                  src={google}
                  alt="google"
                  className="w-8 h-8 absolute top-2 left-5 rounded-full"
                />
                <button
                  type="button"
                  className="p-3 w-full rounded-xl text-black bg-gray-200 hover:bg-gray-300 pl-16"
                  onClick={() => toast.info("Google sign-up not connected yet")}
                >
                  Sign up with Google
                </button>
              </div>
              <div className="w-full relative mt-3">
                <img
                  src={FbImg}
                  alt="facebook"
                  className="w-8 h-8 absolute top-2 left-5 rounded-full"
                />
                <button
                  type="button"
                  className="p-3 w-full rounded-xl text-black bg-gray-200 hover:bg-gray-300 pl-16"
                  onClick={() => toast.info("Facebook sign-up not connected yet")}
                >
                  Sign up with Facebook
                </button>
              </div>

              <div className="mt-6 text-center w-full">
                Already have an account?{" "}
                <span
                  className="text-blue-500 cursor-pointer hover:underline"
                  onClick={() => setShowRegister(false)}
                >
                  Sign in
                </span>
              </div>
            </div>
          </form>
        ) : (
          <form method="post" onSubmit={handleLogin}>
            <div className="w-full flex flex-col items-start justify-center text-start">
              <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-semibold">Welcome Back!</h1>
                <p className="mt-2 font-medium text-gray-500 font-light">
                  Sign in to continue.
                </p>
              </div>
              <div className="flex flex-col mt-10 gap-5 w-full">
                <div className="flex flex-col gap-2 relative">
                  <label>Username</label>
                  <input
                    type="text"
                    placeholder="murthy@2005"
                    className="p-3 bg-[#f8f8f8] rounded-xl pr-14 outline-none border border-[#d7d7d7]"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <User size={20} className="absolute bottom-3 right-3 text-gray-400" />
                </div>
                <div className="flex flex-col gap-2 relative">
                  <label>Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="p-3 bg-[#f8f8f8] rounded-xl pr-14 outline-none border border-[#d7d7d7]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {showPassword ? (
                    <Eye
                      onClick={() => setShowPassword(!showPassword)}
                      size={20}
                      className="absolute bottom-3 right-3 text-gray-400 cursor-pointer"
                    />
                  ) : (
                    <EyeOff
                      onClick={() => setShowPassword(!showPassword)}
                      size={20}
                      className="absolute bottom-3 right-3 text-gray-400 cursor-pointer"
                    />
                  )}
                </div>
              </div>

              <div className="w-full flex justify-end mt-3">
                <p
                  onClick={handleForgotPassword}
                  className="text-blue-500 text-sm cursor-pointer hover:underline"
                >
                  Forgot password?
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="p-3 w-full rounded-xl text-white font-semibold bg-blue-500 mt-5 hover:bg-blue-400 cursor-pointer disabled:opacity-60"
              >
                {loading ? "Please wait…" : "Sign In"}
              </button>

              <div className="w-full flex items-center justify-center gap-4 mt-5">
                <div className="flex-grow h-px bg-gray-400"></div>
                <span className="text-gray-500 text-sm">or</span>
                <div className="flex-grow h-px bg-gray-400"></div>
              </div>

              <div className="w-full relative mt-5">
                <img
                  src={google}
                  alt="google"
                  className="w-8 h-8 absolute top-2 left-5 rounded-full"
                />
                <button
                  type="button"
                  className="p-3 w-full rounded-xl text-black bg-gray-100 hover:bg-gray-200 pl-16"
                  onClick={() => toast.info("Google sign-in not connected yet")}
                >
                  Sign in with Google
                </button>
              </div>
              <div className="w-full relative mt-3">
                <img
                  src={FbImg}
                  alt="facebook"
                  className="w-8 h-8 absolute top-2 left-5 rounded-full"
                />
                <button
                  type="button"
                  className="p-3 w-full rounded-xl text-black bg-gray-100 hover:bg-gray-200 pl-16"
                  onClick={() => toast.info("Facebook sign-in not connected yet")}
                >
                  Sign in with Facebook
                </button>
              </div>

              <div className="mt-6 text-center w-full">
                Don’t have an account?{" "}
                <span
                  className="text-blue-500 cursor-pointer hover:underline"
                  onClick={() => setShowRegister(true)}
                >
                  Sign up
                </span>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="hidden md:flex w-1/2 items-center justify-center bg-blue-200">
        <img
          src={HomeImg}
          alt="loginImage"
          loading="lazy"
          className="w-[80%] max-w-[550px]"
        />
      </div>
    </div>
  );
};

export default Loginpage;

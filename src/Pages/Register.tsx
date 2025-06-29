import React, { useState } from "react";
import { supabase } from "../Subabaseclient";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { signinWithGoogle } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    if (field === "username") {
      if (!value) {
        newErrors.username = "Username is required";
      } else if (value.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      } else if (value.length > 20) {
        newErrors.username = "Username must be less than 20 characters";
      } else if (!validateUsername(value)) {
        newErrors.username =
          "Username can only contain letters, numbers, and underscores";
      } else {
        delete newErrors.username;
      }
    }

    if (field === "email") {
      if (!value) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(value)) {
        newErrors.email = "Please enter a valid email address";
      } else {
        delete newErrors.email;
      }
    }

    if (field === "password") {
      if (!value) {
        newErrors.password = "Password is required";
      } else if (value.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      } else if (value.length > 50) {
        newErrors.password = "Password must be less than 50 characters";
      } else {
        delete newErrors.password;
      }

      // Also validate confirm password if it has a value
      if (confirmPassword && value !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      } else if (confirmPassword) {
        delete newErrors.confirmPassword;
      }
    }

    if (field === "confirmPassword") {
      if (!value) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (value !== password) {
        newErrors.confirmPassword = "Passwords do not match";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "username") setUsername(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);
    if (field === "avatarUrl") setAvatarUrl(value);

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      validateField(field, value);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const isUsernameValid = validateField("username", username);
    const isEmailValid = validateField("email", email);
    const isPasswordValid = validateField("password", password);
    const isConfirmPasswordValid = validateField(
      "confirmPassword",
      confirmPassword
    );

    if (
      !isUsernameValid ||
      !isEmailValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid
    ) {
      toast.error("Please fix the errors above");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            avatar_url: avatarUrl || null,
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Registration successful! You can now log in.");
        localStorage.setItem("showLoginToast", "true");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signinWithGoogle();
      toast.info("Redirecting to Google sign-in...");
    } catch (err) {
      toast.error("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-blue-900 to-black p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">
            Join Us
          </h1>
          <p className="text-gray-300 text-lg">Create your account</p>
        </div>

        {/* Register Form */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 animate-slide-up">
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  onBlur={(e) => validateField("username", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    errors.username
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:border-purple-400"
                  } text-gray-900 dark:text-white`}
                  placeholder="Choose a username"
                  disabled={loading}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1 animate-shake">
                    {errors.username}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={(e) => validateField("email", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    errors.email
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:border-purple-400"
                  } text-gray-900 dark:text-white`}
                  placeholder="Enter your email"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 animate-shake">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  onBlur={(e) => validateField("password", e.target.value)}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    errors.password
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:border-purple-400"
                  } text-gray-900 dark:text-white`}
                  placeholder="Create a password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 animate-shake">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  onBlur={(e) =>
                    validateField("confirmPassword", e.target.value)
                  }
                  className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    errors.confirmPassword
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:border-purple-400"
                  } text-gray-900 dark:text-white`}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 animate-shake">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Avatar URL Field (Optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Avatar URL <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => handleInputChange("avatarUrl", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                placeholder="https://example.com/avatar.jpg"
                disabled={loading}
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading || Object.keys(errors).length > 0}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-600 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl shadow-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              {loading ? "Signing up..." : "Sign up with Google"}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Register;

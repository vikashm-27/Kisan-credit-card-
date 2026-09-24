import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { authLogin, authMicrosoftLogin, userData } from "../../Reducers/Auth";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Leaf, Shield, Sprout, Wheat, Globe, ChevronDown } from "lucide-react";

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { instance, inProgress } = useMsal();
  const { loading } = useSelector(userData);
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    // Trigger mount animations
    setMounted(true);

    // Check if we are already logged in via MSAL (in case of page reload)
    const accounts = instance.getAllAccounts();
    const isManualLogout = sessionStorage.getItem("manualLogout") === "true";

    if (accounts.length > 0 && inProgress === "none" && !isManualLogout) {
      console.log("MSAL Account already detected:", accounts[0]);
      // If we are on the login page but have an MSAL account, try to finish the auth
      instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0]
      }).then((response) => {
        console.log("Silent token acquisition success, syncing with backend...");
        dispatch(authMicrosoftLogin({ token: response.idToken }))
          .unwrap()
          .then((res) => {
            if (res.success) {
              navigate("/home");
            }
          });
      }).catch(e => {
        console.warn("Silent token acquisition failed:", e);
      });
    }
  }, [instance, inProgress, dispatch, navigate]);

  const onSubmit = async (data) => {
    dispatch(authLogin(data))
      .unwrap()
      .then((response) => {
        if (response.success) {
          console.log("Login successful");
          navigate("/home");
        }
      })
      .catch((err) => {
        if (err === "No record found") {
          setError("User not found, Please Sign Up.");
        } else if (err === "The password is incorrect") {
          setError("Incorrect email or password");
        } else {
          setError("An error occurred while logging in");
        }
      });
  };


  const handleMicrosoftLogin = () => {
    console.log("Redirecting to Microsoft for login...");
    // Clear manual logout flag since user is explicitly trying to login
    sessionStorage.removeItem("manualLogout");
    instance.loginRedirect(loginRequest)
      .catch((err) => {
        console.error("Microsoft Redirect Error:", err);
        setError("Microsoft Login Failed: " + err.message);
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const features = [
    { icon: Shield, text: t("auth_login.feat_kyc"), delay: "animation-delay-200" },
    { icon: Sprout, text: t("auth_login.feat_kcc"), delay: "animation-delay-400" },
    { icon: Wheat, text: t("auth_login.feat_loan"), delay: "animation-delay-600" },
  ];

  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      {/* ===== LEFT PANEL - Branding & Visual ===== */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background: "linear-gradient(135deg, #14532d 0%, #166534 25%, #15803d 50%, #14532d 75%, #0f4c2d 100%)",
            backgroundSize: "300% 300%",
          }}
        />

        {/* Decorative floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large glowing orb */}
          <div
            className={`absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20 animate-float
            ${mounted ? "animate-scale-in" : "opacity-0"}`}
            style={{
              background: "radial-gradient(circle, rgba(74,222,128,0.6) 0%, transparent 70%)",
            }}
          />
          {/* Smaller floating orb */}
          <div
            className={`absolute bottom-32 right-20 w-64 h-64 rounded-full opacity-15 animate-float-slow
            ${mounted ? "animate-scale-in animation-delay-300" : "opacity-0"}`}
            style={{
              background: "radial-gradient(circle, rgba(250,204,21,0.5) 0%, transparent 70%)",
            }}
          />
          {/* Abstract leaf patterns */}
          <div className="absolute top-20 right-16 opacity-10 animate-float-slow animation-delay-200">
            <Leaf size={120} strokeWidth={1} className="text-green-300" />
          </div>
          <div className="absolute bottom-40 left-20 opacity-10 animate-float animation-delay-500">
            <Leaf size={80} strokeWidth={1} className="text-green-400 rotate-45" />
          </div>
          <div className="absolute top-1/2 right-1/3 opacity-10 animate-float animation-delay-700">
            <Wheat size={60} strokeWidth={1} className="text-yellow-300" />
          </div>
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-10 xl:px-16 w-full py-12">
          {/* Logo & Brand */}
          <div
            className={`mb-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                <Leaf className="w-7 h-7 text-green-300" />
              </div>
              <div>
                <h2 className="text-white text-2xl font-bold tracking-tight">Draft KCC</h2>
                <p className="text-green-300/80 text-sm font-medium">Kisan Credit Card Portal</p>
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <div
            className={`mb-10 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-3">
              {t("auth_login.left_title_1")}
              <span
                className="gradient-text"
                style={{
                  background: "linear-gradient(135deg, #86efac, #fbbf24, #86efac)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t("auth_login.left_title_2")}
              </span>
              <br />
              {t("auth_login.left_title_3")}
            </h1>
            <p className="text-green-100/60 text-base max-w-md leading-relaxed">
              {t("auth_login.left_desc")}
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 transition-all duration-700 ${feature.delay} ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                  }`}
                style={{ transitionDelay: `${400 + index * 150}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-green-300" />
                </div>
                <span className="text-white/80 text-base font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom decorative line */}
          <div className="mt-10">
            <div
              className={`h-[2px] rounded-full transition-all duration-1000 delay-700 ${mounted ? "w-32 opacity-100" : "w-0 opacity-0"
                }`}
              style={{
                background: "linear-gradient(90deg, rgba(134,239,172,0.6), transparent)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL - Login Form ===== */}
      <div className="w-full lg:w-[48%] flex items-center justify-center relative bg-slate-50">
        {/* Language Switcher in top-right */}
        <div className="absolute top-4 right-6 z-20 flex items-center">
          <div className="relative flex items-center">
            <Globe size={15} className="absolute left-3 pointer-events-none text-green-600" />
            <select
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              value={i18n.language}
              className="appearance-none bg-white border border-gray-200 rounded-full py-1.5 pl-8 pr-7 text-xs font-semibold text-gray-700 cursor-pointer outline-none shadow-sm hover:border-green-400 focus:border-green-500 transition-all"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
              <option value="te">తెలుగు</option>
              <option value="kn">ಕನ್ನಡ</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
          </div>
        </div>

        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #166534 2px, transparent 2px),
                              radial-gradient(circle at 75% 75%, #166534 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Mobile branding - shows on small screens */}
        <div className="lg:hidden absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-600 via-green-500 to-emerald-400" />

        <div
          className={`relative z-10 w-full max-w-md mx-auto px-6 sm:px-8 py-12 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-md">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900 text-lg font-bold">Draft KCC</h2>
              <p className="text-gray-500 text-xs">Kisan Credit Card Portal</p>
            </div>
          </div>

          {/* Welcome text */}
          <div
            className={`mb-8 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("auth_login.welcome_title")}</h1>
            <p className="text-gray-500 text-base">{t("auth_login.welcome_sub")}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div
              className={`transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("auth_login.email_label")}
              </label>
              <div className="relative group">
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === "email" ? "text-green-600" : "text-gray-400"
                    }`}
                >
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  placeholder={t("auth_login.email_placeholder")}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-[52px] pl-12 pr-4 rounded-xl border-2 bg-white text-gray-900 text-sm
                    placeholder:text-gray-400 outline-none transition-all duration-300
                    ${errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100/50"
                    }
                    hover:border-gray-300`}
                />
                {/* Animated bottom highlight */}
                <div
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 ${focusedField === "email" ? "w-[calc(100%-24px)] opacity-100" : "w-0 opacity-0"
                    }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1 animate-fade-in-up" style={{ animationDuration: "0.3s" }}>
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div
              className={`transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("auth_login.password_label")}
              </label>
              <div className="relative group">
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === "password" ? "text-green-600" : "text-gray-400"
                    }`}
                >
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message:
                        "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one digit, and one special character.",
                    },
                  })}
                  placeholder={t("auth_login.password_placeholder")}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-[52px] pl-12 pr-12 rounded-xl border-2 bg-white text-gray-900 text-sm
                    placeholder:text-gray-400 outline-none transition-all duration-300
                    ${errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100/50"
                    }
                    hover:border-gray-300`}
                />
                {/* Eye toggle */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {/* Animated bottom highlight */}
                <div
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 ${focusedField === "password" ? "w-[calc(100%-24px)] opacity-100" : "w-0 opacity-0"
                    }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1 animate-fade-in-up" style={{ animationDuration: "0.3s" }}>
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 animate-fade-in-up" style={{ animationDuration: "0.3s" }}>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Forgot Password */}
            <div
              className={`flex justify-end transition-all duration-700 delay-[350ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
            >
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors duration-200 hover:underline underline-offset-4"
              >
                {t("auth_login.forgot_password")}
              </Link>
            </div>

            {/* Submit Button */}
            <div
              className={`transition-all duration-700 delay-[400ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
            >
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-[52px] rounded-xl font-semibold text-white text-sm
                  bg-gradient-to-r from-green-600 via-green-600 to-emerald-600
                  hover:from-green-700 hover:via-green-700 hover:to-emerald-700
                  active:scale-[0.98]
                  transition-all duration-300 ease-out
                  shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-700/30
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg
                  overflow-hidden"
              >
                {/* Shimmer overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s linear infinite",
                  }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{t("auth_login.signing_in")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("auth_login.sign_in_btn")}</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div
              className={`flex items-center gap-4 transition-all duration-700 delay-[450ms] ${mounted ? "opacity-100" : "opacity-0"
                }`}
            >
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{t("auth_login.or_continue_with")}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Microsoft Login Button */}
            <div
              className={`flex justify-center transition-all duration-700 delay-[480ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
            >
              <button
                type="button"
                onClick={handleMicrosoftLogin}
                className="flex items-center justify-center gap-3 w-full h-[52px] rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 active:scale-[0.98] shadow-sm"
              >
                <svg width="20" height="20" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span>{t("auth_login.sign_in_microsoft")}</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div
              className={`text-center transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
            >
              <p className="text-sm text-gray-500">
                {t("auth_login.no_account")}{" "}
                <Link
                  to="/signup"
                  className="font-bold text-green-600 hover:text-green-700 transition-colors duration-200 hover:underline underline-offset-4"
                >
                  {t("auth_login.create_account")}
                </Link>
              </p>
            </div>
          </form>

          {/* Footer */}
          <div
            className={`mt-12 text-center transition-all duration-700 delay-[600ms] ${mounted ? "opacity-100" : "opacity-0"
              }`}
          >
            <p className="text-xs text-gray-400">
              {t("auth_login.security_note")}
            </p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Shield size={12} className="text-green-500" />
              <span className="text-xs text-gray-400">256-bit SSL Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

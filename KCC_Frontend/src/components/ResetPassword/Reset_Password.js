import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { authResetPassword } from "../../Reducers/Auth";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  Leaf,
  Shield,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Wheat,
} from "lucide-react";
import "./Reset_Password.css";

const ResetPassword = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const password = watch("password", "");

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ─── Password strength ─── */
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&]/.test(pwd)) score++;

    if (score <= 2) return { level: score, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { level: score, label: "Fair", color: "bg-yellow-500" };
    if (score <= 4) return { level: score, label: "Good", color: "bg-blue-500" };
    return { level: score, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = (data) => {
    setIsSubmitting(true);
    dispatch(
      authResetPassword({
        id,
        token,
        password: data.password,
      })
    )
      .then((status) => {
        setIsSubmitting(false);
        if (status) {
          setResetSuccess(true);
          setTimeout(() => navigate("/"), 3000);
        } else {
          alert("Error while Updating");
        }
      })
      .catch((err) => {
        setIsSubmitting(false);
        console.error(err);
        alert("Error while Updating");
      });
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      {/* ===== LEFT PANEL - Branding ===== */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background:
              "linear-gradient(135deg, #14532d 0%, #166534 25%, #15803d 50%, #14532d 75%, #0f4c2d 100%)",
            backgroundSize: "300% 300%",
          }}
        />

        {/* Decorative floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-20 animate-float
              ${mounted ? "animate-scale-in" : "opacity-0"}`}
            style={{
              background:
                "radial-gradient(circle, rgba(74,222,128,0.6) 0%, transparent 70%)",
            }}
          />
          <div
            className={`absolute top-24 left-16 w-64 h-64 rounded-full opacity-15 animate-float-slow
              ${mounted ? "animate-scale-in animation-delay-300" : "opacity-0"}`}
            style={{
              background:
                "radial-gradient(circle, rgba(250,204,21,0.5) 0%, transparent 70%)",
            }}
          />
          <div className="absolute top-20 right-16 opacity-10 animate-float-slow animation-delay-200">
            <ShieldCheck size={100} strokeWidth={1} className="text-green-300" />
          </div>
          <div className="absolute bottom-32 left-20 opacity-10 animate-float animation-delay-500">
            <Leaf size={80} strokeWidth={1} className="text-green-400 rotate-45" />
          </div>
          <div className="absolute top-1/2 right-1/4 opacity-10 animate-float animation-delay-700">
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
          {/* Logo */}
          <div
            className={`mb-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                <Leaf className="w-7 h-7 text-green-300" />
              </div>
              <div>
                <h2 className="text-white text-2xl font-bold tracking-tight">
                  Draft KCC
                </h2>
                <p className="text-green-300/80 text-sm font-medium">
                  Kisan Credit Card Portal
                </p>
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <div
            className={`mb-10 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-3">
              Reset Your{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #86efac, #fbbf24, #86efac)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Password
              </span>
            </h1>
            <p className="text-green-100/60 text-base max-w-md leading-relaxed">
              Choose a strong password that you haven't used before. A good
              password combines letters, numbers, and symbols.
            </p>
          </div>

          {/* Password tips */}
          <div className="space-y-4">
            {[
              { icon: CheckCircle2, text: "At least 8 characters long" },
              { icon: CheckCircle2, text: "Mix uppercase & lowercase letters" },
              { icon: CheckCircle2, text: "Include numbers and special characters" },
            ].map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 transition-all duration-700 ${mounted
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-8"
                  }`}
                style={{ transitionDelay: `${400 + index * 150}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-green-300" />
                </div>
                <span className="text-white/80 text-sm font-medium">
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom decorative line */}
          <div className="mt-10">
            <div
              className={`h-[2px] rounded-full transition-all duration-1000 delay-700 ${mounted ? "w-32 opacity-100" : "w-0 opacity-0"
                }`}
              style={{
                background:
                  "linear-gradient(90deg, rgba(134,239,172,0.6), transparent)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL - Reset Password Form ===== */}
      <div className="w-full lg:w-[48%] flex items-center justify-center relative bg-slate-50">
        {/* Subtle background dots */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #166534 2px, transparent 2px),
                              radial-gradient(circle at 75% 75%, #166534 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Mobile top bar */}
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

          {/* Success State */}
          {resetSuccess ? (
            <div className="text-center animate-fade-in-up">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Password Reset Successful!
              </h1>
              <p className="text-gray-500 text-base mb-6 max-w-sm mx-auto">
                Your password has been updated successfully. You can now sign in
                with your new password.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
                <p className="text-sm text-green-700 font-medium">
                  Redirecting to login page...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div
                className={`mb-8 transition-all duration-700 delay-100 ${mounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                  }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-5">
                  <Lock className="w-7 h-7 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Set new password
                </h1>
                <p className="text-gray-500 text-base">
                  Create a strong password for your account
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* New Password */}
                <div
                  className={`transition-all duration-700 delay-200 ${mounted
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                    }`}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative group">
                    <div
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === "password"
                          ? "text-green-600"
                          : "text-gray-400"
                        }`}
                    >
                      <Lock size={18} />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      {...register("password", {
                        required: "New Password is required",
                        pattern: {
                          value:
                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                          message:
                            "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one digit, and one special character.",
                        },
                      })}
                      placeholder="Enter new password"
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
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                    <div
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 ${focusedField === "password"
                          ? "w-[calc(100%-24px)] opacity-100"
                          : "w-0 opacity-0"
                        }`}
                    />
                  </div>
                  {errors.password && (
                    <p
                      className="mt-1.5 text-sm text-red-500 flex items-center gap-1 animate-fade-in-up"
                      style={{ animationDuration: "0.3s" }}
                    >
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                      {errors.password.message}
                    </p>
                  )}

                  {/* Password strength meter */}
                  {password && (
                    <div
                      className="mt-2 animate-fade-in-up"
                      style={{ animationDuration: "0.3s" }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= passwordStrength.level
                                  ? passwordStrength.color
                                  : "bg-gray-200"
                                }`}
                            />
                          ))}
                        </div>
                        <span
                          className={`text-xs font-semibold transition-colors duration-300 ${passwordStrength.label === "Strong"
                              ? "text-green-600"
                              : passwordStrength.label === "Good"
                                ? "text-blue-600"
                                : passwordStrength.label === "Fair"
                                  ? "text-yellow-600"
                                  : "text-red-500"
                            }`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div
                  className={`transition-all duration-700 delay-300 ${mounted
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                    }`}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <div
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === "confirmPassword"
                          ? "text-green-600"
                          : "text-gray-400"
                        }`}
                    >
                      <KeyRound size={18} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                      placeholder="Re-enter new password"
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full h-[52px] pl-12 pr-12 rounded-xl border-2 bg-white text-gray-900 text-sm
                        placeholder:text-gray-400 outline-none transition-all duration-300
                        ${errors.confirmPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100/50"
                        }
                        hover:border-gray-300`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                    <div
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 ${focusedField === "confirmPassword"
                          ? "w-[calc(100%-24px)] opacity-100"
                          : "w-0 opacity-0"
                        }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p
                      className="mt-1.5 text-sm text-red-500 flex items-center gap-1 animate-fade-in-up"
                      style={{ animationDuration: "0.3s" }}
                    >
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div
                  className={`pt-1 transition-all duration-700 delay-[350ms] ${mounted
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                    }`}
                >
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full h-[52px] rounded-xl font-semibold text-white text-sm
                      bg-gradient-to-r from-green-600 via-green-600 to-emerald-600
                      hover:from-green-700 hover:via-green-700 hover:to-emerald-700
                      active:scale-[0.98]
                      transition-all duration-300 ease-out
                      shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-700/30
                      disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg
                      overflow-hidden"
                  >
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
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Updating password...</span>
                        </>
                      ) : (
                        <>
                          <span>Update Password</span>
                          <ArrowRight
                            size={18}
                            className="group-hover:translate-x-1 transition-transform duration-300"
                          />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Footer */}
          <div
            className={`mt-12 text-center transition-all duration-700 delay-[500ms] ${mounted ? "opacity-100" : "opacity-0"
              }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Shield size={12} className="text-green-500" />
              <span className="text-xs text-gray-400">
                Your password is encrypted & secure
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

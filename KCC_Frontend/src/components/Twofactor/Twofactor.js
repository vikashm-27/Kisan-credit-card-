import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Twofactor.css";
import { SERVER_url } from "../../config";
import {
  Leaf,
  Shield,
  ShieldCheck,
  Smartphone,
  QrCode,
  KeyRound,
  Copy,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

const Twofactor = () => {
  const navigate = useNavigate();

  const [qrCode, setQRCode] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await axios.get(`${SERVER_url}/twofactorsetup`);
        const { qrCode, secretBase32 } = response.data;
        setQRCode(qrCode);
        setSecret(secretBase32);
      } catch (error) {
        console.error("Error fetching QR code:", error);
        setErrorMessage("Internal Server Error");
      }
    };

    fetchQRCode();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMessage("");
    try {
      const response = await axios.post(`${SERVER_url}/verify`, {
        userToken: token,
        secretBase32: secret,
      });
      if (response.data.success) {
        alert("User Registered Successfully");
        navigate("/");
        console.log("OTP is valid");
      } else {
        setErrorMessage("Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrorMessage("Internal Server Error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textArea = document.createElement("textarea");
      textArea.value = secret;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const steps = [
    {
      num: 1,
      icon: Smartphone,
      title: "Open Authenticator",
      desc: "Open Google Authenticator or any TOTP app",
    },
    {
      num: 2,
      icon: QrCode,
      title: "Scan QR Code",
      desc: "Scan the QR code shown on screen",
    },
    {
      num: 3,
      icon: KeyRound,
      title: "Enter Code",
      desc: "Enter the 6-digit verification code",
    },
  ];

  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      {/* ===== LEFT PANEL - Instructions ===== */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden">
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
            className={`absolute top-20 -right-16 w-80 h-80 rounded-full opacity-20 animate-float
              ${mounted ? "animate-scale-in" : "opacity-0"}`}
            style={{
              background:
                "radial-gradient(circle, rgba(74,222,128,0.6) 0%, transparent 70%)",
            }}
          />
          <div
            className={`absolute -bottom-20 left-10 w-64 h-64 rounded-full opacity-15 animate-float-slow
              ${mounted ? "animate-scale-in animation-delay-300" : "opacity-0"}`}
            style={{
              background:
                "radial-gradient(circle, rgba(250,204,21,0.5) 0%, transparent 70%)",
            }}
          />
          {/* Decorative icons */}
          <div className="absolute bottom-20 right-16 opacity-10 animate-float-slow animation-delay-200">
            <ShieldCheck size={100} strokeWidth={1} className="text-green-300" />
          </div>
          <div className="absolute top-32 left-12 opacity-10 animate-float animation-delay-500">
            <Leaf size={70} strokeWidth={1} className="text-green-400 rotate-45" />
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

          {/* Heading */}
          <div
            className={`mb-10 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-3">
              Secure Your{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #86efac, #fbbf24, #86efac)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Account
              </span>
            </h1>
            <p className="text-green-100/60 text-base max-w-md leading-relaxed">
              Two-factor authentication adds an extra layer of security to
              protect your account from unauthorized access.
            </p>
          </div>

          {/* How it works steps */}
          <div className="space-y-5">
            <p
              className={`text-xs font-bold text-green-300/60 uppercase tracking-widest transition-all duration-700 delay-300 ${mounted ? "opacity-100" : "opacity-0"
                }`}
            >
              How it works
            </p>
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 transition-all duration-700 ${mounted
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
                  }`}
                style={{ transitionDelay: `${400 + index * 150}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-green-300" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {step.title}
                  </p>
                  <p className="text-green-100/50 text-xs mt-0.5">
                    {step.desc}
                  </p>
                </div>
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

      {/* ===== RIGHT PANEL - QR Code & Verification ===== */}
      <div className="w-full lg:w-[52%] flex items-center justify-center relative bg-slate-50">
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
          className={`relative z-10 w-full max-w-lg mx-auto px-6 sm:px-8 py-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-md">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900 text-lg font-bold">Draft KCC</h2>
              <p className="text-gray-500 text-xs">Kisan Credit Card Portal</p>
            </div>
          </div>

          {/* Heading */}
          <div
            className={`mb-6 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Two-Factor Authentication
              </h1>
            </div>
            <p className="text-gray-500 text-sm">
              Scan the QR code with your authenticator app to set up 2FA
            </p>
          </div>

          {/* QR Code Section */}
          <div
            className={`transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {/* Pulse ring behind QR */}
                  <div className="absolute inset-0 rounded-2xl animate-pulse-glow" />
                  <div className="relative bg-white border-2 border-gray-100 rounded-2xl p-3 shadow-md">
                    {qrCode ? (
                      <img
                        src={`data:image/png;base64, ${qrCode}`}
                        alt="QR Code"
                        className="w-44 h-44 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <QrCode className="w-10 h-10 text-gray-300 mx-auto mb-2 animate-pulse" />
                          <p className="text-xs text-gray-400">Loading QR...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Manual entry toggle */}
              <div className="border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowManual(!showManual)}
                  className="w-full flex items-center justify-between py-2 px-1 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
                >
                  <span className="font-medium">
                    Can't scan? Add manually
                  </span>
                  {showManual ? (
                    <ChevronUp
                      size={16}
                      className="text-gray-400 group-hover:text-gray-600 transition-colors"
                    />
                  ) : (
                    <ChevronDown
                      size={16}
                      className="text-gray-400 group-hover:text-gray-600 transition-colors"
                    />
                  )}
                </button>

                {/* Collapsible secret key */}
                <div
                  className={`overflow-hidden transition-all duration-400 ease-in-out ${showManual ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      Secret Key
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono text-gray-800 bg-white px-3 py-2 rounded-lg border border-gray-200 truncate">
                        {secret || "Loading..."}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className={`flex-shrink-0 p-2 rounded-lg border transition-all duration-300 ${copied
                          ? "bg-green-50 border-green-200 text-green-600"
                          : "bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                        title="Copy secret key"
                      >
                        {copied ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div
              className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 animate-fade-in-up"
              style={{ animationDuration: "0.3s" }}
            >
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Token verification form */}
          <form
            onSubmit={handleSubmit}
            className={`mt-5 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Verification Code
            </label>
            <div className="relative group">
              <div
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === "token" ? "text-green-600" : "text-gray-400"
                  }`}
              >
                <KeyRound size={18} />
              </div>
              <input
                name="Token"
                type="text"
                value={token}
                onChange={(e) => {
                  // Only allow digits, max 6
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setToken(val);
                }}
                onFocus={() => setFocusedField("token")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter 6-digit code"
                required
                className={`w-full h-[52px] pl-12 pr-4 rounded-xl border-2 bg-white text-gray-900 text-lg font-semibold tracking-[0.3em]
                  placeholder:text-gray-400 placeholder:text-sm placeholder:font-normal placeholder:tracking-normal
                  outline-none transition-all duration-300
                  border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100/50
                  hover:border-gray-300`}
                maxLength={6}
                autoComplete="one-time-code"
              />
              <div
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 ${focusedField === "token"
                  ? "w-[calc(100%-24px)] opacity-100"
                  : "w-0 opacity-0"
                  }`}
              />
            </div>

            {/* Code indicator dots */}
            <div className="flex items-center justify-center gap-2 mt-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i < token.length
                    ? "bg-green-500 scale-110"
                    : "bg-gray-200 scale-100"
                    }`}
                />
              ))}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={token.length < 6 || isVerifying}
              className="group relative w-full h-[52px] mt-5 rounded-xl font-semibold text-white text-sm
                bg-gradient-to-r from-green-600 via-green-600 to-emerald-600
                hover:from-green-700 hover:via-green-700 hover:to-emerald-700
                active:scale-[0.98]
                transition-all duration-300 ease-out
                shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-700/30
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg
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
                {isVerifying ? (
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
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Complete Setup</span>
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div
            className={`mt-8 text-center transition-all duration-700 delay-[600ms] ${mounted ? "opacity-100" : "opacity-0"
              }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Shield size={12} className="text-green-500" />
              <span className="text-xs text-gray-400">
                Time-based One-Time Password (TOTP) Protocol
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Twofactor;

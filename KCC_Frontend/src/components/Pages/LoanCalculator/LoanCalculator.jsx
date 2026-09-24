import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import ReactToPrint from "react-to-print";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SERVER_url } from "../../../config";
import "../shared/VerificationForm.css";
import "./LoanCalculator.css";

// Default fallback crops in case server endpoint isn't ready
const DEFAULT_CROPS = [
  { id: "paddy", name: "Paddy (Rice)", season: "Kharif", scaleOfFinance: 35000, category: "Cereals" },
  { id: "wheat", name: "Wheat", season: "Rabi", scaleOfFinance: 30000, category: "Cereals" },
  { id: "cotton", name: "Cotton", season: "Kharif", scaleOfFinance: 42000, category: "Cash Crop" },
  { id: "sugarcane", name: "Sugarcane", season: "Annual", scaleOfFinance: 68000, category: "Cash Crop" },
  { id: "groundnut", name: "Groundnut (Peanut)", season: "Kharif", scaleOfFinance: 28000, category: "Oilseeds" },
  { id: "maize", name: "Maize (Corn)", season: "Kharif", scaleOfFinance: 26000, category: "Cereals" },
  { id: "soybean", name: "Soybean", season: "Kharif", scaleOfFinance: 27000, category: "Oilseeds" },
  { id: "pulses", name: "Pulses (Gram / Tur)", season: "Rabi", scaleOfFinance: 24000, category: "Pulses" },
  { id: "red_gram", name: "Red Gram", season: "Rabi", scaleOfFinance: 24000, category: "Pulses" },
  { id: "black_gram", name: "Black Gram", season: "Rabi", scaleOfFinance: 24000, category: "Pulses" },
  { id: "turmeric", name: "Turmeric", season: "Kharif", scaleOfFinance: 60000, category: "Spices" },
  { id: "ragi", name: "Ragi", season: "Kharif", scaleOfFinance: 20000, category: "Cereals" },
  { id: "mulberry", name: "Mulberry", season: "Perennial", scaleOfFinance: 40000, category: "Cash Crop" },
  { id: "tobacco", name: "Tobacco", season: "Kharif", scaleOfFinance: 55000, category: "Cash Crop" },
  { id: "mango", name: "Mango", season: "Perennial", scaleOfFinance: 45000, category: "Horticulture" },
  { id: "guava", name: "Guava", season: "Perennial", scaleOfFinance: 40000, category: "Horticulture" },
  { id: "orange", name: "Orange", season: "Perennial", scaleOfFinance: 50000, category: "Horticulture" },
  { id: "vegetables", name: "Vegetables (Tomato/Onion/Potato)", season: "Multi-season", scaleOfFinance: 48000, category: "Horticulture" },
  { id: "mustard", name: "Mustard", season: "Rabi", scaleOfFinance: 25000, category: "Oilseeds" },
  { id: "banana", name: "Banana Plantation", season: "Annual", scaleOfFinance: 75000, category: "Horticulture" }
];

// Helper to dynamically map a raw crop history string to our DEFAULT_CROPS id
const getMatchedCropId = (rawCropName) => {
  if (!rawCropName) return "paddy";
  const lowerName = rawCropName.toLowerCase();
  
  // Special mappings for synonyms
  if (lowerName.includes("rice")) return "paddy";
  if (lowerName.includes("vegetable")) return "vegetables";
  if (lowerName.includes("gram")) {
    if (lowerName.includes("red")) return "red_gram";
    if (lowerName.includes("black")) return "black_gram";
    return "pulses";
  }
  
  // Direct match against DEFAULT_CROPS
  for (const crop of DEFAULT_CROPS) {
    if (lowerName.includes(crop.id) || lowerName.includes(crop.name.toLowerCase().split(' ')[0])) {
      return crop.id;
    }
  }
  return "paddy"; // fallback
};

// Premium SVG Semi-Circular Radial Gauge Component (Matching Reference Image)
function RadialScoreGauge({
  title,
  value,
  min,
  max,
  step = 1,
  onChange,
  gradientId,
  isScoreOutOfHundred = false
}) {
  const { t } = useTranslation();
  // Local input state for smooth manual typing
  const [localInput, setLocalInput] = useState(String(value));

  useEffect(() => {
    setLocalInput(String(value));
  }, [value]);

  // Ratio calculation
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
  
  // Spacious Arc Geometry: Center (130, 138), Radius 100
  // Arc apex at y = 138 - 100 = 38px, inner edge at ~43px. Center text starts at y = 52px.
  const angle = Math.PI * (1 - ratio);
  const cx = 130;
  const cy = 138;
  const r = 100;
  const x = cx + r * Math.cos(angle);
  const y = cy - r * Math.sin(angle);
  
  const arcTotal = Math.PI * r; // ~314.16
  const strokeDashoffset = arcTotal * (1 - ratio);

  // Dynamic status evaluation
  let statusText = t("loan_calculator.good_rating");
  let statusColor = "#10b981";
  let badgeBg = "#ecfdf5";
  let badgeText = "#059669";
  let sublabel = "UNDERWRITING";

  if (!isScoreOutOfHundred) {
    // CIBIL (300 - 900)
    sublabel = "CREDIT SCORE";
    if (value >= 750) {
      statusText = t("loan_calculator.excellent_rating");
      statusColor = "#059669";
      badgeBg = "#ecfdf5";
      badgeText = "#059669";
    } else if (value >= 700) {
      statusText = t("loan_calculator.good_rating");
      statusColor = "#10b981";
      badgeBg = "#f0fdf4";
      badgeText = "#16a34a";
    } else if (value >= 650) {
      statusText = t("loan_calculator.fair_rating");
      statusColor = "#eab308";
      badgeBg = "#fefce8";
      badgeText = "#ca8a04";
    } else {
      statusText = t("loan_calculator.poor_rating");
      statusColor = "#ef4444";
      badgeBg = "#fef2f2";
      badgeText = "#e11d48";
    }
  } else {
    // Farm Score (0 - 100)
    sublabel = "FARM INDEX";
    if (value >= 75) {
      statusText = "Satellite High-Yield";
      statusColor = "#059669";
      badgeBg = "#ecfdf5";
      badgeText = "#059669";
    } else if (value >= 60) {
      statusText = "Optimal Productivity";
      statusColor = "#10b981";
      badgeBg = "#f0fdf4";
      badgeText = "#16a34a";
    } else if (value >= 45) {
      statusText = "Moderate Yield";
      statusColor = "#eab308";
      badgeBg = "#fefce8";
      badgeText = "#ca8a04";
    } else {
      statusText = "Vulnerable Zone";
      statusColor = "#ef4444";
      badgeBg = "#fef2f2";
      badgeText = "#dc2626";
    }
  }

  return (
    <div className="sd-metric-card sd-gauge-card">
      <div className="sd-metric-header">
        <div className="sd-metric-title">
          <span className="sd-title-dot" style={{ backgroundColor: statusColor }}></span>
          {title}
        </div>
        <div className="sd-metric-val">
          {isScoreOutOfHundred ? `${value} / 100` : `${value} pts`}
        </div>
      </div>

      {/* SVG Arc Gauge */}
      <div className="sd-gauge-wrapper">
        <svg viewBox="0 0 260 172" className="sd-gauge-svg">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="40%" stopColor="#10b981" />
              <stop offset="70%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <filter id={`shadow-${gradientId}`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Full gradient background track */}
          <path
            d="M 30 140 A 100 100 0 0 1 230 140"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Tick marks (white overlay) */}
          <path
            d="M 30 140 A 100 100 0 0 1 230 140"
            fill="none"
            stroke="#ffffff"
            strokeWidth="16"
            strokeDasharray="2 10"
            opacity="0.3"
          />

          {/* Indicator Dot */}
          <circle
            cx={cx + r * Math.cos(angle)}
            cy={140 - r * Math.sin(angle)}
            r="10"
            fill="#ffffff"
            stroke="#eab308"
            strokeWidth="4"
            style={{
              filter: `url(#shadow-${gradientId})`,
              transition: "cx 0.25s ease-out, cy 0.25s ease-out"
            }}
          />
          <circle
            cx={cx + r * Math.cos(angle)}
            cy={140 - r * Math.sin(angle)}
            r="4"
            fill="#ffffff"
            style={{
              transition: "cx 0.25s ease-out, cy 0.25s ease-out"
            }}
          />

          {/* Min / Max Labels — positioned below arc endpoints */}
          <text x="18" y="168" textAnchor="start" className="sd-gauge-limit-text">{min}</text>
          <text x="242" y="168" textAnchor="end" className="sd-gauge-limit-text">{max}</text>
        </svg>

        {/* Center Values — positioned inside the arc */}
        <div className="sd-gauge-center-content">
          <div className="sd-gauge-sublabel">{sublabel}</div>
          <div className="sd-gauge-score-value">
            {value}
            {isScoreOutOfHundred && <span className="sd-gauge-denom">/100</span>}
          </div>
          <div className="sd-gauge-badge-pill" style={{ backgroundColor: badgeBg, color: badgeText }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: statusColor, display: 'inline-block', flexShrink: 0 }}></span>
            <span>{statusText}</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="sd-gauge-controls">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          className="sd-slider"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
        />

        <div className="sd-control-label">{sublabel}</div>

        <div className="sd-pill-input-box">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={localInput}
            onChange={(e) => {
              const raw = e.target.value;
              setLocalInput(raw);
              const num = parseInt(raw, 10);
              if (!isNaN(num) && num >= min && num <= max) {
                onChange(num);
              }
            }}
            onBlur={() => {
              let num = parseInt(localInput, 10);
              if (isNaN(num) || num < min) num = min;
              else if (num > max) num = max;
              setLocalInput(String(num));
              onChange(num);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="sd-pill-num-input"
          />
          <span className="sd-pill-suffix">pts</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sd-pencil-icon"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </div>
        
        <div className="sd-range-label">Range {min}–{max}</div>
      </div>
    </div>
  );
}

export default function LoanCalculator() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isUrlVerified = searchParams.get('verified') === 'true';
  
  // Try location state first, fallback to session storage for absolute reliability
  const sessionData = sessionStorage.getItem("kcc_verified_land");
  let parsedSessionData = null;
  try {
    if (sessionData && sessionData !== "undefined") {
      parsedSessionData = JSON.parse(sessionData);
    }
  } catch (e) {
    console.error("Failed to parse kcc_verified_land session data:", e);
  }
  const prefilledData = location.state || parsedSessionData;
  
  // Detect if coming from the Land Verification/FormGeneration workflow (Locked Mode)
  const isFromLandVerification = isUrlVerified || Boolean(
    prefilledData?.fromLandVerification ||
    prefilledData?.isVerifiedLand ||
    prefilledData?.landRecord ||
    prefilledData?.cropType // Comes from FormGeneration pipeline
  );
  
  const [mounted, setMounted] = useState(false);
  const [crops, setCrops] = useState(DEFAULT_CROPS);
  
  // Calculator Inputs prefilled from Land Verification if available
  const [landArea, setLandArea] = useState(prefilledData?.landArea || 2.5);
  
  // Verified Crop History (extracted from prefilled data or defaults)
  const verifiedCropHistory = isFromLandVerification 
    ? (prefilledData?.cropHistory || ["Rice (Kharif 2024)", "Groundnut (Rabi 2023)", "Cotton (Kharif 2023)"])
    : [];
    
  // Default to first verified crop if available, else paddy
  const defaultCropId = isFromLandVerification && verifiedCropHistory.length > 0
    ? getMatchedCropId(verifiedCropHistory[0])
    : (prefilledData?.cropType ? getMatchedCropId(prefilledData.cropType) : "paddy");

  const [selectedCropId, setSelectedCropId] = useState(defaultCropId);
  const [cibilScore, setCibilScore] = useState(prefilledData?.cibilScore || 740);
  const [farmScore, setFarmScore] = useState(prefilledData?.farmScore || 78);
  const [baseInterestRate, setBaseInterestRate] = useState(7.0);
  const [subventionRate, setSubventionRate] = useState(3.0);
  const [showSubventionModal, setShowSubventionModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showOtherCrops, setShowOtherCrops] = useState(false);
  const printSummaryRef = useRef();
  
  // Additional Limit & Security Checkboxes
  const [showAdditionalLimit, setShowAdditionalLimit] = useState(false);
  const [additionalLimitStr, setAdditionalLimitStr] = useState('');
  const additionalLimit = parseInt(additionalLimitStr, 10) || 0;
  const [primarySecurity, setPrimarySecurity] = useState(true);
  const [collateralLand, setCollateralLand] = useState(false);
  const [collateralOther, setCollateralOther] = useState(false);
  const [otherSecurityDesc, setOtherSecurityDesc] = useState('');
  
  // Results
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch official scale of finance list from backend
    axios.get(`${SERVER_url}/api/scale-of-finance`)
      .then(res => {
        if (res.data?.success && res.data.data?.length > 0) {
          setCrops(res.data.data);
        }
      })
      .catch(err => {
        console.warn("Could not load backend crop list, using defaults:", err);
      });
  }, []);

  // Selected crop details
  const activeCrop = useMemo(() => {
    return crops.find(c => c.id === selectedCropId) || crops[0];
  }, [crops, selectedCropId]);

  // Ensure exact UI match with verified crop history string if selected
  const displayCropName = useMemo(() => {
    const matchedHist = verifiedCropHistory.find(h => getMatchedCropId(h) === selectedCropId);
    return matchedHist ? matchedHist : `${activeCrop?.name} (${activeCrop?.season} Season)`;
  }, [verifiedCropHistory, selectedCropId, activeCrop]);

  // Client-side fallback calculation for instant zero-latency UI
  const calculateLocally = useCallback((acres, crop, cibil, farm, userBaseRate, userSubvention, extraLimitAmount) => {
    const rate = crop.scaleOfFinance || 30000;
    const baseCropLoan = Math.round(acres * rate);
    const postHarvestHousehold = Math.round(baseCropLoan * 0.10);
    const farmMaintenance = Math.round(baseCropLoan * 0.20);
    const shortTermCropLimit = baseCropLoan + postHarvestHousehold + farmMaintenance;
    
    const extraLimit = parseFloat(extraLimitAmount) || 0;
    const year1Limit = shortTermCropLimit + extraLimit;
    const fiveYearLimit = Math.round(shortTermCropLimit * 1.50) + extraLimit;
    const kharifTranche = Math.round(shortTermCropLimit * 0.60) + extraLimit;
    const rabiTranche = shortTermCropLimit - Math.round(shortTermCropLimit * 0.60);

    // Normalizing
    const normFarm = farm > 100 ? ((farm - 300) / 600) * 100 : farm;
    const normCibil = ((Math.min(900, Math.max(300, cibil)) - 300) / 600) * 100;
    const compositeScore = Math.round((normCibil * 0.55) + (normFarm * 0.45));

    let tier = "Tier 2";
    let tierName = "Standard Low Risk";
    let riskPremium = 1.00;
    let riskLevel = "Low Risk";
    let riskBadgeColor = "blue";

    if (cibil >= 750 && normFarm >= 70) {
      tier = "Tier 1";
      tierName = "Prime Agri Borrower";
      riskPremium = 0.00;
      riskLevel = "Minimal Risk";
      riskBadgeColor = "green";
    } else if (compositeScore >= 62 || (cibil >= 700 && normFarm >= 60)) {
      tier = "Tier 2";
      tierName = "Standard Low Risk";
      riskPremium = 1.00;
      riskLevel = "Low Risk";
      riskBadgeColor = "blue";
    } else if (compositeScore >= 45 || cibil >= 620) {
      tier = "Tier 3";
      tierName = "Moderate Risk";
      riskPremium = 1.75;
      riskLevel = "Moderate Risk";
      riskBadgeColor = "amber";
    } else {
      tier = "Tier 4";
      tierName = "Watchlist / High Risk";
      riskPremium = 2.50;
      riskLevel = "High Risk";
      riskBadgeColor = "red";
    }

    const baseRate = userBaseRate + riskPremium;
    const pri = userSubvention;
    const effectiveRate = Math.max(0.0, +(baseRate - pri).toFixed(2));
    const subventionEligible = Math.min(year1Limit, 300000);
    const excess = Math.max(0, year1Limit - 300000);

    const annualInterestNormal = Math.round(year1Limit * (baseRate / 100));
    const annualInterestPrompt = Math.round(subventionEligible * (effectiveRate / 100)) + Math.round(excess * (baseRate / 100));
    const annualFarmerSavings = annualInterestNormal - annualInterestPrompt;

    return {
      loanLimit: {
        crop,
        landAreaAcres: acres,
        scaleOfFinancePerAcre: rate,
        baseCropLoan,
        postHarvestHousehold,
        farmMaintenance,
        shortTermCropLimit,
        additionalLimit: extraLimit,
        year1Limit,
        fiveYearLimit,
        drawingPower: { kharifTranche, rabiTranche, currency: "INR" }
      },
      interestTier: {
        cibilScore: cibil,
        farmScore: farm,
        compositeScore,
        tier,
        tierName,
        riskLevel,
        riskBadgeColor,
        baseInterestRate: baseRate,
        promptRepaymentIncentive: pri,
        effectiveInterestRate: effectiveRate
      },
      financialSummary: {
        year1SanctionedLimit: year1Limit,
        fiveYearSanctionedLimit: fiveYearLimit,
        subventionEligibleAmount: subventionEligible,
        excessAmount: excess,
        annualInterestNormal,
        annualInterestPrompt,
        annualFarmerSavings,
        monthlyInstallmentPrompt: Math.round(annualInterestPrompt / 12),
        isFullSubventionApplied: excess === 0
      }
    };
  }, []);

  // Update evaluation whenever inputs change
  useEffect(() => {
    const acres = parseFloat(landArea) || 0;
    if (acres <= 0) return;

    // Call backend API with debounce/axios
    const timer = setTimeout(() => {
      axios.post(`${SERVER_url}/api/calculate-loan`, {
        landArea: acres,
        cropType: selectedCropId,
        cibilScore,
        farmScore,
        baseInterestRate,
        subventionRate,
        additionalLimit,
        security: {
          primary: primarySecurity,
          collateralLand: collateralLand,
          collateralOther: collateralOther,
          otherSecurityDesc: collateralOther ? otherSecurityDesc : ""
        }
      })
      .then(res => {
        if (res.data?.success && res.data.data) {
          setResult(res.data.data);
        } else {
          setResult(calculateLocally(acres, activeCrop, cibilScore, farmScore, baseInterestRate, subventionRate, additionalLimit));
        }
      })
      .catch(() => {
        // Smooth offline fallback
        setResult(calculateLocally(acres, activeCrop, cibilScore, farmScore, baseInterestRate, subventionRate, additionalLimit));
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [landArea, selectedCropId, cibilScore, farmScore, baseInterestRate, subventionRate, additionalLimit, primarySecurity, collateralLand, collateralOther, otherSecurityDesc, activeCrop, calculateLocally]);

  const baseCropLoanVal = result?.loanLimit?.baseCropLoan ?? Math.round(landArea * (activeCrop?.scaleOfFinance || 30000));
  const postHarvestVal = result?.loanLimit?.postHarvestHousehold ?? Math.round(baseCropLoanVal * 0.10);
  const farmMaintenanceVal = result?.loanLimit?.farmMaintenance ?? Math.round(baseCropLoanVal * 0.20);
  const shortTermCropLimitVal = result?.loanLimit?.shortTermCropLimit ?? (baseCropLoanVal + postHarvestVal + farmMaintenanceVal);
  const additionalLimitVal = result?.loanLimit?.additionalLimit ?? (additionalLimit || 0);
  const year1LimitVal = result?.loanLimit?.year1Limit ?? (shortTermCropLimitVal + additionalLimitVal);
  const fiveYearLimitVal = result?.loanLimit?.fiveYearLimit ?? Math.round(shortTermCropLimitVal * 1.50) + additionalLimitVal;
  const kharifTrancheVal = result?.loanLimit?.drawingPower?.kharifTranche ?? Math.round(shortTermCropLimitVal * 0.60) + additionalLimitVal;
  const rabiTrancheVal = result?.loanLimit?.drawingPower?.rabiTranche ?? (shortTermCropLimitVal - Math.round(shortTermCropLimitVal * 0.60));

  const effectiveRateVal = +(Math.max(0, baseInterestRate - subventionRate)).toFixed(2);
  const normalInterestVal = result?.financialSummary?.annualInterestNormal ?? Math.round(year1LimitVal * (baseInterestRate / 100));
  const promptInterestVal = result?.financialSummary?.annualInterestPrompt ?? Math.round(year1LimitVal * (effectiveRateVal / 100));
  const farmerSavingsVal = result?.financialSummary?.annualFarmerSavings ?? (normalInterestVal - promptInterestVal);
  const monthlyPromptVal = result?.financialSummary?.monthlyInstallmentPrompt ?? Math.round(promptInterestVal / 12);

  const limitExceedsTwoLakhs = year1LimitVal > 200000;
  const noCollateralSelected = !collateralLand && !collateralOther;
  const isSecurityError = limitExceedsTwoLakhs && noCollateralSelected;

  return (
    <div className="vf-page loan-calc-page">
      <div className="sd-app-header">
        <div className="sd-brand">
          <div className="sd-brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          <div className="sd-brand-text">
            <h1>{t("loan_calculator.brand_title")}</h1>
            <p>{t("loan_calculator.brand_subtitle")}</p>
          </div>
        </div>
        <div className="sd-benchmark-pill">
          <div className="dot"></div> {t("loan_calculator.nabard_benchmark")}
        </div>
      </div>

      <div className="sd-card">
        {/* Header */}
        <div className="sd-card-header">
          <div className="sd-header-left">
            <div className="sd-header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div>
              <div className="sd-title-row">
                <h2>{t("loan_calculator.loan_parameters")}</h2>
                <span className="sd-live-pill">{t("loan_calculator.live_calculator")}</span>
              </div>
              <p>{t("loan_calculator.config_desc")}</p>
            </div>
          </div>
          {/* Removed small credit limit from header */}
        </div>

        {/* Limit Showcase */}
        <div className="limit-showcase">
          <div className="limit-header">
            <div>
              <h3 style={{fontSize: '1.25rem', fontWeight: 500, color: '#d1fae5', margin: 0}}>{t("loan_calculator.limit_title")}</h3>
              <p style={{color: '#ecfdf5', fontSize: '0.875rem', marginTop: '4px', marginBottom: 0}}>{t("loan_calculator.limit_desc")}</p>
            </div>
            <div className="limit-badge">
              {t("loan_calculator.fully_eligible")}
            </div>
          </div>
          
          <div className="limit-amount-wrapper">
            <span className="currency-symbol">₹</span>
            <span className="limit-amount">{(result?.loanLimit?.year1Limit ?? result?.financialSummary?.year1SanctionedLimit ?? 0).toLocaleString("en-IN")}</span>
          </div>

          <div className="limit-breakdown">
            <div className="breakdown-item">
              <span className="breakdown-label">{t("loan_calculator.base_crop_loan")}</span>
              <span className="breakdown-value">₹{baseCropLoanVal.toLocaleString("en-IN")}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">{t("loan_calculator.post_harvest")}</span>
              <span className="breakdown-value">₹{postHarvestVal.toLocaleString("en-IN")}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">{t("loan_calculator.farm_maint")}</span>
              <span className="breakdown-value">₹{farmMaintenanceVal.toLocaleString("en-IN")}</span>
            </div>
            {additionalLimitVal > 0 && (
              <div className="breakdown-item">
                <span className="breakdown-label">Additional Limit</span>
                <span className="breakdown-value">₹{additionalLimitVal.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="breakdown-item" style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '20px' }}>
              <span className="breakdown-label" style={{color: '#a7f3d0'}}>{t("loan_calculator.five_year")}</span>
              <span className="breakdown-value">₹{fiveYearLimitVal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Section 1 */}
        <div className="sd-section-header">
          <span className="sd-section-title">{t("loan_calculator.sec1_title")}</span>
          <span className="sd-section-title" style={{color: 'var(--sd-text-muted)', fontWeight: 500}}>{t("loan_calculator.sec1_sub")}</span>
        </div>

        <div className="sd-agri-section">
          {isFromLandVerification && (
            <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", padding: "12px 16px", borderRadius: "8px", border: "1px solid #16a34a" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#065f46" }}>
                Verified Land Mode: Values locked to Survey No. {prefilledData?.surveyNumber || "145/A"} ({prefilledData?.ownerName || "Owner"})
              </span>
            </div>
          )}

          <div className="sd-agri-grid">
            <div className="sd-field">
              <div className="sd-label-row">
                <label className="sd-label">{t('loan_calculator.crop_type')} <span className="req">*</span></label>
                <span className="sd-label-hint">Kharif / Rabi</span>
              </div>
              
              {isFromLandVerification ? (
                <>
                  <div className="sd-input-group">
                    <select className="sd-select" value={selectedCropId} onChange={(e) => setSelectedCropId(e.target.value)}>
                      <optgroup label="🌱 Verified Historical Crops">
                        {verifiedCropHistory.map((histCrop, i) => {
                          const cropId = getMatchedCropId(histCrop);
                          const baseCrop = crops.find(c => c.id === cropId) || crops[0];
                          return (
                            <option key={`hist-${i}`} value={baseCrop.id}>
                              {histCrop} — SoF ₹{baseCrop.scaleOfFinance?.toLocaleString("en-IN")}/Ac
                            </option>
                          );
                        })}
                      </optgroup>
                      {showOtherCrops && (
                        <optgroup label="🌾 Other Approved Crops (District Scale of Finance)">
                          {crops.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} - SoF ₹{c.scaleOfFinance?.toLocaleString("en-IN")}/Ac
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <div className="sd-input-suffix">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                  
                  <div className="sd-crop-history-chips">
                    {verifiedCropHistory.map((histCrop, i) => {
                      const cropId = getMatchedCropId(histCrop);
                      
                      let emoji = "🌱";
                      const lowerName = histCrop.toLowerCase();
                      if (lowerName.includes("maize") || lowerName.includes("corn")) emoji = "🌽";
                      else if (lowerName.includes("rice") || lowerName.includes("wheat") || lowerName.includes("ragi")) emoji = "🌾";
                      else if (lowerName.includes("groundnut") || lowerName.includes("peanut")) emoji = "🥜";
                      else if (lowerName.includes("cotton")) emoji = "☁️";
                      else if (lowerName.includes("turmeric") || lowerName.includes("spice") || lowerName.includes("tobacco") || lowerName.includes("mustard")) emoji = "🌿";
                      else if (lowerName.includes("gram") || lowerName.includes("pulses") || lowerName.includes("soybean")) emoji = "🫘";
                      else if (lowerName.includes("mango") || lowerName.includes("orange") || lowerName.includes("guava") || lowerName.includes("banana")) emoji = "🍎";
                      else if (lowerName.includes("tomato") || lowerName.includes("potato") || lowerName.includes("vegetable")) emoji = "🍅";
                      else if (lowerName.includes("sugarcane")) emoji = "🎋";

                      return (
                        <button 
                          key={i} 
                          type="button" 
                          className={`sd-pill ${selectedCropId === cropId ? 'active' : ''}`}
                          onClick={() => { setSelectedCropId(cropId); setShowOtherCrops(false); }}
                        >
                          {emoji} {histCrop.split(" (")[0]}
                        </button>
                      );
                    })}
                    <button 
                      type="button" 
                      className={`sd-pill sd-pill-toggle ${showOtherCrops ? 'active' : ''}`}
                      onClick={() => setShowOtherCrops(!showOtherCrops)}
                    >
                      {showOtherCrops ? "✕ Hide Other Crops" : "＋ Other Crops"}
                    </button>
                  </div>

                  {showOtherCrops && (
                    <div className="sd-other-crops-grid">
                      {crops.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={`sd-other-crop-item ${selectedCropId === c.id ? 'active' : ''}`}
                          onClick={() => setSelectedCropId(c.id)}
                        >
                          <span className="sd-other-crop-name">{c.name}</span>
                          <span className="sd-other-crop-sof">₹{c.scaleOfFinance?.toLocaleString("en-IN")}/Ac</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div className="sd-crop-detail-card">
                    <div className="sd-detail-item">
                      <span className="sd-detail-label">{t('financial_terms.scale_of_finance')}</span>
                      <span className="sd-detail-value highlight">₹{activeCrop?.scaleOfFinance?.toLocaleString("en-IN")} / Ac</span>
                    </div>
                    <div className="sd-detail-item">
                      <span className="sd-detail-label">{t('financial_terms.base_crop_loan')} ({landArea} Ac)</span>
                      <span className="sd-detail-value">₹{(Math.round(landArea * (activeCrop?.scaleOfFinance || 30000))).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="sd-detail-item">
                      <span className="sd-detail-label">{t('financial_terms.year_1_limit')}</span>
                      <span className="sd-detail-value">₹{(Math.round(landArea * (activeCrop?.scaleOfFinance || 30000) * 1.3)).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="sd-input-group">
                    <select className="sd-select" value={selectedCropId} onChange={(e) => setSelectedCropId(e.target.value)}>
                      {crops.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} - SoF ₹{c.scaleOfFinance?.toLocaleString("en-IN")}/Ac
                        </option>
                      ))}
                    </select>
                    <div className="sd-input-suffix">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                  <div className="sd-field-note">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    Includes mandatory 10% post-harvest & 20% {String(t('financial_terms.maintenance_margin') || 'Maintenance').toLowerCase()}
                  </div>
                </>
              )}
            </div>

            <div className="sd-field">
              <div className="sd-label-row">
                <label className="sd-label">{t('loan_calculator.cultivated_area')} <span className="req">*</span></label>
                <span className="sd-label-hint">Standard Acres</span>
              </div>
              <div className="sd-input-group">
                <input 
                  type="number" 
                  step="0.1" min="0.2" max="100" 
                  className={`sd-input ${isFromLandVerification ? 'locked' : ''}`}
                  value={landArea} 
                  onChange={(e) => setLandArea(Math.max(0.1, parseFloat(e.target.value) || 0))} 
                  readOnly={isFromLandVerification}
                />
                <span className="sd-input-suffix" style={{color: 'var(--sd-text-light)'}}>ACRES</span>
              </div>
              
              {isFromLandVerification ? (
                <div className="sd-verified-land-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <span>Locked: Verified Cadastral GIS Record</span>
                </div>
              ) : (
                <div className="sd-quick-select">
                  <span>Quick Select:</span>
                  {[1.0, 2.0, 2.5, 5.0, 10.0].map((val) => (
                    <button 
                      key={val} type="button" 
                      className={`sd-pill ${landArea === val ? 'active' : ''}`}
                      onClick={() => setLandArea(val)}
                    >
                      {val}Ac
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Additional Limit & Security - Following ui-ux-pro-max guidelines */}
            <div className="sd-field" style={{ gridColumn: '1 / -1' }}>
              <div className="sd-label-row">
                <label className="sd-label">Do you want an additional limit? (Investment Credit)</label>
              </div>
              <div className="sd-checkbox-group" style={{ marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} className="sd-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={showAdditionalLimit} 
                    onChange={(e) => {
                      setShowAdditionalLimit(e.target.checked);
                      if (!e.target.checked) setAdditionalLimitStr('');
                    }} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#059669' }} 
                  />
                  <span style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 500 }}>Yes, I want an additional limit</span>
                </label>
              </div>
              
              {showAdditionalLimit && (
                <div style={{ marginTop: '16px' }}>
                  <div className="sd-label-row">
                    <label className="sd-label">Additional Limit Amount</label>
                    <span className="sd-label-hint">For machinery, dairy, etc.</span>
                  </div>
                  <div className="sd-input-group" style={{ maxWidth: '300px' }}>
                    <span className="sd-input-suffix" style={{color: 'var(--sd-text-light)', borderRight: '1px solid var(--sd-border)', paddingRight: '12px', marginRight: '12px'}}>₹</span>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      className="sd-input"
                      style={{ paddingLeft: '0' }}
                      value={additionalLimitStr ? parseInt(additionalLimitStr, 10).toLocaleString('en-IN') : ''} 
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val === '') {
                          setAdditionalLimitStr('');
                        } else {
                          let num = parseInt(val, 10);
                          if (!isNaN(num)) {
                            setAdditionalLimitStr(Math.min(5000000, Math.max(0, num)).toString());
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="sd-field" style={{ gridColumn: '1 / -1' }}>
              <div className="sd-label-row">
                <label className="sd-label">Security Offered <span className="req">*</span></label>
                <span className="sd-label-hint">Check all that apply (Only one collateral can be ticked)</span>
              </div>
              <div className="sd-checkbox-group" style={{ display: 'flex', gap: '24px', marginTop: '12px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'color 0.2s ease' }} className="sd-checkbox-label">
                  <input type="checkbox" checked={primarySecurity} onChange={(e) => setPrimarySecurity(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#059669' }} />
                  <span style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 500 }}>Primary (Crop Hypothecation)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'color 0.2s ease' }} className="sd-checkbox-label">
                  <input type="checkbox" checked={collateralLand} onChange={(e) => {
                    setCollateralLand(e.target.checked);
                    if (e.target.checked) setCollateralOther(false);
                  }} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#059669' }} />
                  <span style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 500 }}>Agricultural Land</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'color 0.2s ease' }} className="sd-checkbox-label">
                  <input type="checkbox" checked={collateralOther} onChange={(e) => {
                    setCollateralOther(e.target.checked);
                    if (e.target.checked) setCollateralLand(false);
                  }} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#059669' }} />
                  <span style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 500 }}>Other Security</span>
                </label>
              </div>
              {isSecurityError && (
                <div style={{ marginTop: '12px', color: '#ef4444', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <span>As the calculated limit exceeds ₹2,00,000, you must select either Agricultural Land or Other Security as collateral.</span>
                </div>
              )}
              {collateralOther && (
                <div style={{ marginTop: '16px', maxWidth: '500px', animation: 'fadeIn 0.3s ease' }}>
                  <div className="sd-label-row" style={{ marginBottom: '6px' }}>
                    <label className="sd-label" style={{ fontSize: '0.75rem' }}>Description of other security <span className="req" style={{ color: '#ef4444' }}>*</span></label>
                  </div>
                  <input 
                    type="text" 
                    className="sd-input"
                    placeholder="e.g., Gold, Fixed Deposit"
                    required 
                    value={otherSecurityDesc}
                    onChange={(e) => setOtherSecurityDesc(e.target.value)}
                    style={{ transition: 'all 0.2s ease', borderColor: otherSecurityDesc ? 'var(--sd-border)' : '#ef4444' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="sd-section-header sd-section-header-matrix">
          <span className="sd-section-title" style={{ color: '#854d0e' }}>{t("loan_calculator.sec2_title")}</span>
          <div className="sd-section-divider"></div>
          <span className="sd-section-title" style={{ color: '#854d0e' }}>{t("loan_calculator.sec2_sub")}</span>
        </div>

        <div className="sd-metrics-grid">
          {/* CIBIL Bureau Score Radial Gauge */}
          <RadialScoreGauge
            title={t('loan_calculator.cibil')}
            value={cibilScore}
            min={300}
            max={900}
            step={5}
            onChange={setCibilScore}
            gradientId="cibilGaugeGrad"
            isScoreOutOfHundred={false}
          />

          {/* Proprietary Farm Score Radial Gauge */}
          <RadialScoreGauge
            title={t('loan_calculator.farm_index')}
            value={farmScore}
            min={0}
            max={100}
            step={1}
            onChange={setFarmScore}
            gradientId="farmGaugeGrad"
            isScoreOutOfHundred={true}
          />

          {/* Base Interest Rate */}
          <div className="sd-metric-card">
            <div className="sd-metric-header">
              <div className="sd-metric-title"><div className="dot dark"></div> {t("loan_calc_extra.base_rate_title")}</div>
              <div className="sd-metric-val grey">{baseInterestRate.toFixed(2)} %</div>
            </div>
            <div className="sd-slider-container">
              <input type="range" min="4.0" max="14.0" step="0.1" className="sd-slider dark-track" value={baseInterestRate} onChange={(e) => setBaseInterestRate(parseFloat(e.target.value))} />
              <div className="sd-slider-footer">
                <span>{t("loan_calc_extra.min_rate")} 4.0%</span><span>{t("loan_calc_extra.standard_rate")}</span><span>{t("loan_calc_extra.max_rate")} 14.0%</span>
              </div>
            </div>
          </div>

          {/* Govt Subvention */}
          <div className="sd-metric-card">
            <div className="sd-metric-header">
              <div className="sd-metric-title"><div className="dot blue"></div> {t("loan_calc_extra.subvention_title")}</div>
              <div className="sd-metric-val blue">{subventionRate.toFixed(2)} %</div>
            </div>
            <div className="sd-slider-container">
              <input type="range" min="0.0" max="5.0" step="0.5" className="sd-slider blue-track" value={subventionRate} onChange={(e) => setSubventionRate(parseFloat(e.target.value))} />
              <div className="sd-slider-footer">
                <span>{t("loan_calc_extra.min_rate")} 0.0%</span><span className="center-text blue">{t("loan_calc_extra.net_effective_rate")} {(baseInterestRate - subventionRate).toFixed(2)}%</span><span>{t("loan_calc_extra.max_rate")} 5.0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Effective Rate Summary Bar */}
        <div className="sd-effective-bar">
          <div className="sd-eff-label">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            {t("loan_calc_extra.eff_bar_label")}
          </div>
          <div className="sd-eff-val">{(baseInterestRate - subventionRate).toFixed(2)} % p.a.</div>
        </div>

        {/* Action Buttons */}
        <div className="sd-actions">
          {isFromLandVerification ? (
            <button 
              className={`sd-btn green ${isSecurityError ? 'disabled' : ''}`}
              onClick={() => {
                if (isSecurityError) return;
                navigate("/customer/form-generation", { state: { ...prefilledData, ...result } });
              }}
              disabled={isSecurityError}
              style={isSecurityError ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              {t("loan_calculator.generate_btn") || "Generate Final KYC & Loan Application"}
            </button>
          ) : (
            <button 
              className={`sd-btn green ${isSecurityError ? 'disabled' : ''}`} 
              onClick={() => {
                if (isSecurityError) return;
                navigate("/customer/land-verification");
              }}
              disabled={isSecurityError}
              style={isSecurityError ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {t("loan_calc_extra.btn_verify_map")}
            </button>
          )}
          <ReactToPrint
            trigger={() => (
              <button className="sd-btn dark" type="button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                {t("loan_calc_extra.btn_print_summary")}
              </button>
            )}
            content={() => printSummaryRef.current}
            documentTitle={`KCC_Loan_Summary_${(activeCrop?.name || "Crop").replace(/\s+/g, '_')}`}
          />
        </div>

        <div style={{ textAlign: "center", marginTop: "14px" }}>
          <button 
            type="button" 
            onClick={() => setShowSummaryModal(true)}
            style={{ 
              background: "none", 
              border: "none", 
              color: "#059669", 
              fontSize: "0.8125rem", 
              fontWeight: 600, 
              cursor: "pointer", 
              textDecoration: "underline"
            }}
          >
            {t("loan_calc_extra.link_preview_summary")}
          </button>
        </div>

        {/* Footer */}
        <div className="sd-footer">
          <span>{t("loan_calc_extra.footer_gis")}</span>
          <span>{t("loan_calc_extra.footer_iso")}</span>
        </div>

      </div>

      {/* ========================================================
          ON-SCREEN SUMMARY MODAL (CRITERIA : VALUE FORMAT)
          ======================================================== */}
      {showSummaryModal && (
        <div className="sd-modal-overlay" onClick={() => setShowSummaryModal(false)}>
          <div className="sd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sd-modal-header">
              <div className="sd-modal-header-left">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sd-primary)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  {t("loan_calc_extra.modal_title")}
                </h3>
                <p>{t("loan_calc_extra.modal_sub")}</p>
              </div>
              <button className="sd-modal-close-btn" onClick={() => setShowSummaryModal(false)}>
                ✕
              </button>
            </div>

            <div className="sd-modal-body">
              {/* Section 1: Agriculture */}
              <div className="sd-summary-section">
                <div className="sd-summary-section-title">{t("loan_calc_extra.sec1_agri")}</div>
                <table className="sd-summary-table">
                  <tbody>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_crop_type")}</td>
                      <td className="sd-summary-value">{displayCropName}</td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_sof")}</td>
                      <td className="sd-summary-value">₹{(activeCrop?.scaleOfFinance || 30000).toLocaleString("en-IN")} / Acre</td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_land_area")}</td>
                      <td className="sd-summary-value">{landArea} {t("loan_calc_extra.standard_acres")}</td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_base_loan")}</td>
                      <td className="sd-summary-value">₹{baseCropLoanVal.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_post_harvest")}</td>
                      <td className="sd-summary-value">₹{postHarvestVal.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_farm_maint")}</td>
                      <td className="sd-summary-value">₹{farmMaintenanceVal.toLocaleString("en-IN")}</td>
                    </tr>
                    {additionalLimitVal > 0 && (
                      <tr>
                        <td className="sd-summary-criteria">Additional Limit (Investment Credit)</td>
                        <td className="sd-summary-value">₹{additionalLimitVal.toLocaleString("en-IN")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Section 1.5: Security */}
              <div className="sd-summary-section">
                <div className="sd-summary-section-title">Security & Collateral</div>
                <table className="sd-summary-table">
                  <tbody>
                    <tr>
                      <td className="sd-summary-criteria">Primary Security</td>
                      <td className="sd-summary-value">{primarySecurity ? "Crop Hypothecation" : "None"}</td>
                    </tr>
                    {collateralLand && (
                      <tr>
                        <td className="sd-summary-criteria">Agricultural Land</td>
                        <td className="sd-summary-value">Pledged as Collateral</td>
                      </tr>
                    )}
                    {collateralOther && (
                      <tr>
                        <td className="sd-summary-criteria">Other Security</td>
                        <td className="sd-summary-value">{otherSecurityDesc || "Provided"}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Section 2: Credit & Risk */}
              <div className="sd-summary-section">
                <div className="sd-summary-section-title">{t("loan_calc_extra.sec2_credit")}</div>
                <table className="sd-summary-table">
                  <tbody>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_cibil_score")}</td>
                      <td className="sd-summary-value highlight-blue">
                        {cibilScore} ({cibilScore >= 750 ? t("loan_calculator.excellent_rating") : cibilScore >= 700 ? t("loan_calculator.good_rating") : cibilScore >= 650 ? t("loan_calculator.fair_rating") : t("loan_calculator.poor_rating")})
                      </td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_farm_score")}</td>
                      <td className="sd-summary-value highlight-green">
                        {farmScore} / 100 ({farmScore >= 75 ? t("loan_calc_extra.high_yield_potential") : t("loan_calc_extra.standard_cultivation")})
                      </td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_composite_score")}</td>
                      <td className="sd-summary-value">{result?.interestTier?.compositeScore ?? 72} / 100</td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_risk_cat")}</td>
                      <td className="sd-summary-value">{result?.interestTier?.tierName ?? t("loan_calc_extra.standard_low_risk")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 3: Limits */}
              <div className="sd-summary-section">
                <div className="sd-summary-section-title">{t("loan_calc_extra.sec3_limits")}</div>
                <table className="sd-summary-table">
                  <tbody>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_year1_limit")}</td>
                      <td className="sd-summary-value highlight-green">₹{year1LimitVal.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_five_year_limit")}</td>
                      <td className="sd-summary-value">₹{fiveYearLimitVal.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_kharif_dp")}</td>
                      <td className="sd-summary-value">₹{kharifTrancheVal.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_rabi_dp")}</td>
                      <td className="sd-summary-value">₹{rabiTrancheVal.toLocaleString("en-IN")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 4: Interest & Subvention */}
              <div className="sd-summary-section">
                <div className="sd-summary-section-title">{t("loan_calc_extra.sec4_interest")}</div>
                <table className="sd-summary-table">
                  <tbody>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_base_lending_rate")}</td>
                      <td className="sd-summary-value">{baseInterestRate.toFixed(2)}% p.a.</td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_subvention_rate")}</td>
                      <td className="sd-summary-value highlight-green">-{subventionRate.toFixed(2)}% p.a.</td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_net_rate")}</td>
                      <td className="sd-summary-value highlight-green">{effectiveRateVal.toFixed(2)}% p.a.</td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_normal_interest")}</td>
                      <td className="sd-summary-value">₹{normalInterestVal.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_subsidized_interest")}</td>
                      <td className="sd-summary-value">₹{promptInterestVal.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_farmer_savings")}</td>
                      <td className="sd-summary-value highlight-green">₹{farmerSavingsVal.toLocaleString("en-IN")} / year</td>
                    </tr>
                    <tr>
                      <td className="sd-summary-criteria">{t("loan_calc_extra.crit_monthly_payment")}</td>
                      <td className="sd-summary-value">₹{monthlyPromptVal.toLocaleString("en-IN")} / month</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sd-modal-footer">
              <button className="sd-modal-btn secondary" onClick={() => setShowSummaryModal(false)}>
                {t("loan_calc_extra.btn_close")}
              </button>
              <ReactToPrint
                trigger={() => (
                  <button className="sd-modal-btn primary" type="button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    {t("loan_calc_extra.btn_print_sheet")}
                  </button>
                )}
                content={() => printSummaryRef.current}
                documentTitle={`KCC_Loan_Summary_${(activeCrop?.name || "Crop").replace(/\s+/g, '_')}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ISOLATED PRINT DOCUMENT (ACCESSED BY REACT-TO-PRINT)
          CRITERIA : VALUE CLEAN TEXT FORMAT (ZERO WEB UI CLUTTER)
          ======================================================== */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div ref={printSummaryRef} style={{
          fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif",
          color: "#111827",
          backgroundColor: "#ffffff",
          padding: "40px 48px",
          width: "800px",
          margin: "0 auto",
          boxSizing: "border-box",
          lineHeight: 1.5
        }}>
          {/* Header */}
          <div style={{ borderBottom: "2px solid #111827", paddingBottom: "16px", marginBottom: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#4b5563", marginBottom: "4px" }}>
              Government of India • Ministry of Agriculture & Farmers Welfare
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "4px 0", color: "#065f46", letterSpacing: "0.5px" }}>
              KISAN CREDIT CARD (KCC) SCHEME
            </h1>
            <h2 style={{ fontSize: "15px", fontWeight: 700, margin: "4px 0 6px 0", color: "#111827" }}>
              OFFICIAL LOAN ASSESSMENT & CALCULATION SUMMARY
            </h2>
            <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>
              Underwriting Standard: RBI Master Circular FIDD.CO.FSD.BC.No.12/05.05.010/2023-24 & NABARD Scale of Finance Framework
            </p>
          </div>

          {/* Meta Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f3f4f6", padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "20px", border: "1px solid #e5e7eb" }}>
            <span><strong>Assessment Date:</strong> {new Date().toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            <span><strong>Benchmark:</strong> NABARD FY 2024-25</span>
            <span><strong>Status:</strong> Cadastral GIS RoR Verified</span>
          </div>

          {/* Section 1 */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#065f46", backgroundColor: "#ecfdf5", padding: "6px 10px", borderRadius: "4px", borderLeft: "4px solid #059669", marginBottom: "8px" }}>
              1. Crop & Land Cultivation Specifications
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <tbody>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", width: "55%", color: "#4b5563" }}>Cultivated Crop Type :</td>
                  <td style={{ padding: "6px 8px", width: "45%", fontWeight: 700, textAlign: "right", color: "#111827" }}>{displayCropName}</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>District Scale of Finance (SoF) :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>₹{(activeCrop?.scaleOfFinance || 30000).toLocaleString("en-IN")} / Acre</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>Total Cultivated Land Area :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>{landArea} Acres</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>Base Crop Cultivation Requirement :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>₹{baseCropLoanVal.toLocaleString("en-IN")}</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>Post-Harvest / Household Consumption Margin (10%) :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>₹{postHarvestVal.toLocaleString("en-IN")}</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>Farm Assets Maintenance & Repairs (20%) :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>₹{farmMaintenanceVal.toLocaleString("en-IN")}</td>
                </tr>
                {additionalLimitVal > 0 && (
                  <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                    <td style={{ padding: "6px 8px", color: "#4b5563" }}>Additional Limit (Investment Credit) :</td>
                    <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>₹{additionalLimitVal.toLocaleString("en-IN")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Section 1.5: Security */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#065f46", backgroundColor: "#ecfdf5", padding: "6px 10px", borderRadius: "4px", borderLeft: "4px solid #059669", marginBottom: "8px" }}>
              1A. Security & Collateral
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <tbody>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", width: "55%", color: "#4b5563" }}>Primary Security :</td>
                  <td style={{ padding: "6px 8px", width: "45%", fontWeight: 700, textAlign: "right", color: "#111827" }}>{primarySecurity ? "Crop Hypothecation" : "None"}</td>
                </tr>
                {collateralLand && (
                  <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                    <td style={{ padding: "6px 8px", color: "#4b5563" }}>Agricultural Land :</td>
                    <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>Pledged as Collateral</td>
                  </tr>
                )}
                {collateralOther && (
                  <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                    <td style={{ padding: "6px 8px", color: "#4b5563" }}>Other Security :</td>
                    <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>{otherSecurityDesc || "Provided"}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Section 2 */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#1d4ed8", backgroundColor: "#eff6ff", padding: "6px 10px", borderRadius: "4px", borderLeft: "4px solid #2563eb", marginBottom: "8px" }}>
              2. Credit Risk & Borrower Appraisal
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <tbody>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", width: "55%", color: "#4b5563" }}>CIBIL Bureau Credit Score :</td>
                  <td style={{ padding: "6px 8px", width: "45%", fontWeight: 700, textAlign: "right", color: "#1d4ed8" }}>{cibilScore} ({cibilScore >= 750 ? t("loan_calculator.excellent_rating") : cibilScore >= 700 ? t("loan_calculator.good_rating") : cibilScore >= 650 ? t("loan_calculator.fair_rating") : t("loan_calculator.poor_rating")})</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>Proprietary Farm Yield Score :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#065f46" }}>{farmScore} / 100 ({farmScore >= 75 ? "High Yield Satellite Verified" : "Standard Cultivation"})</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>Composite Risk Assessment Score :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>{result?.interestTier?.compositeScore ?? 72} / 100</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>Underwriting Risk Categorization :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>{result?.interestTier?.tierName ?? "Standard Low Risk"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3 */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#065f46", backgroundColor: "#ecfdf5", padding: "6px 10px", borderRadius: "4px", borderLeft: "4px solid #059669", marginBottom: "8px" }}>
              3. Sanctioned Credit Limits & Season-wise Drawing Power
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <tbody>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", width: "55%", color: "#4b5563" }}>Year-1 Sanctioned KCC Limit :</td>
                  <td style={{ padding: "6px 8px", width: "45%", fontWeight: 800, textAlign: "right", color: "#065f46", fontSize: "13.5px" }}>₹{year1LimitVal.toLocaleString("en-IN")}</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>5-Year Cumulative Limit (10% Annual Step-Up) :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>₹{fiveYearLimitVal.toLocaleString("en-IN")}</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>Kharif Season Drawing Power (60%) :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>₹{kharifTrancheVal.toLocaleString("en-IN")}</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>Rabi Season Drawing Power (40%) :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>₹{rabiTrancheVal.toLocaleString("en-IN")}</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>Subvention Eligible Principal Cap :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>₹{Math.min(year1LimitVal, 300000).toLocaleString("en-IN")} (100% Eligible under ₹3 Lakh Cap)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4 */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#111827", backgroundColor: "#f3f4f6", padding: "6px 10px", borderRadius: "4px", borderLeft: "4px solid #111827", marginBottom: "8px" }}>
              4. Interest Rate & Modified Interest Subvention (MISS)
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <tbody>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", width: "55%", color: "#4b5563" }}>Bank Base Lending Rate :</td>
                  <td style={{ padding: "6px 8px", width: "45%", fontWeight: 700, textAlign: "right", color: "#111827" }}>{baseInterestRate.toFixed(2)}% p.a.</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>{t('financial_terms.interest_subvention')} (MISS) :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#065f46" }}>-{subventionRate.toFixed(2)}% p.a.</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>Net Effective Rate (Prompt Repayment) :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 800, textAlign: "right", color: "#065f46", fontSize: "13.5px" }}>{effectiveRateVal.toFixed(2)}% p.a.</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>Normal Annual Interest Payable :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>₹{normalInterestVal.toLocaleString("en-IN")}</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>Subsidized Annual Interest (Prompt) :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>₹{promptInterestVal.toLocaleString("en-IN")}</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>Annual Farmer Interest Savings :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 800, textAlign: "right", color: "#065f46" }}>₹{farmerSavingsVal.toLocaleString("en-IN")} every year</td>
                </tr>
                <tr style={{ borderBottom: "1px dashed #e5e7eb" }}>
                  <td style={{ padding: "6px 8px", color: "#4b5563" }}>Estimated Monthly Payment (Prompt Repayment) :</td>
                  <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right", color: "#111827" }}>₹{monthlyPromptVal.toLocaleString("en-IN")} / month</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div style={{ borderTop: "2px solid #111827", paddingTop: "14px", fontSize: "10.5px", color: "#4b5563" }}>
            <p style={{ margin: "0 0 28px 0", lineHeight: 1.4 }}>
              <strong>Declaration:</strong> This calculation summary has been algorithmically generated pursuant to RBI Master Circular FIDD.CO.FSD.BC.No.12/05.05.010/2023-24 on Kisan Credit Card Scheme and respective DLTC Scale of Finance. All land parameters are subject to final document verification.
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", textAlign: "center", marginTop: "32px" }}>
              <div style={{ width: "45%", borderTop: "1px dashed #111827", paddingTop: "8px" }}>
                <strong style={{ color: "#111827" }}>Authorized Bank Officer / Underwriter</strong><br />
                <span style={{ fontSize: "10px", color: "#6b7280" }}>Signature & Bank Branch Seal</span>
              </div>
              <div style={{ width: "45%", borderTop: "1px dashed #111827", paddingTop: "8px" }}>
                <strong style={{ color: "#111827" }}>Borrower / Cultivator Farmer</strong><br />
                <span style={{ fontSize: "10px", color: "#6b7280" }}>Signature / Thumb Impression</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

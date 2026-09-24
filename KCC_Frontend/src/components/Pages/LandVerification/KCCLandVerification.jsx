import React, { useState, useEffect, useRef } from "react";
import * as turf from "@turf/turf";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon as LeafletPolygon,
  useMapEvents,
  FeatureGroup,
  useMap,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Map as MapIcon,
  ShieldCheck,
  Navigation,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Maximize2,
  AlertTriangle,
  Info,
  XCircle,
  Loader2,
  MapPin,
  User,
  Calendar,
  FileCheck,
  Sprout,
  Droplets,
  Database,
  ArrowRight,
  RotateCcw,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import "../shared/VerificationForm.css";
import "./KCCLandVerification.css";

/* ── INDIAN REVENUE BOUNDARY PRESETS (APISetu / Bhoomi / Dharani) ── */
const INDIAN_STATES = [
  {
    state: "Karnataka",
    districts: [
      {
        name: "Bengaluru Rural",
        taluks: ["Devanahalli / Hosahalli", "Hosahalli", "Devanahalli", "Nelamangala", "Doddaballapura", "Hosakote"]
      },
      {
        name: "Bengaluru North",
        taluks: ["Yelahanka", "Hesaraghatta", "Jala"]
      },
      {
        name: "Mysuru",
        taluks: ["Mysuru", "Nanjangud", "Hunsur", "T. Narasipura"]
      },
      {
        name: "Mandya",
        taluks: ["Mandya", "Maddur", "Pandavapura", "Srirangapatna"]
      }
    ]
  },
  {
    state: "Telangana",
    districts: [
      {
        name: "Rangareddy",
        taluks: ["Shamshabad / Rajendranagar", "Shamshabad", "Rajendranagar", "Maheshwaram", "Ibrahimpatnam"]
      },
      {
        name: "Warangal",
        taluks: ["Hasanparthy", "Hanamkonda", "Kazipet", "Wardhannapet"]
      },
      {
        name: "Karimnagar",
        taluks: ["Jammikunta", "Karimnagar", "Manakondur", "Huzurabad"]
      }
    ]
  },
  {
    state: "Andhra Pradesh",
    districts: [
      {
        name: "Krishna",
        taluks: ["Gannavaram", "Vijayawada Rural", "Gudivada", "Machilipatnam"]
      },
      {
        name: "Guntur",
        taluks: ["Tenali", "Mangalagiri", "Amaravati", "Ponnur"]
      }
    ]
  },
  {
    state: "Maharashtra",
    districts: [
      {
        name: "Nagpur",
        taluks: ["Kamptee", "Nagpur Rural", "Hingna", "Katol", "Saoner"]
      },
      {
        name: "Pune",
        taluks: ["Haveli", "Baramati", "Shirur", "Ambegaon"]
      }
    ]
  }
];

/* 🚀 API CONFIG 🚀 */
const API_BASE = "http://localhost:4005";

/* 🚀 STEPS 🚀 */
const STEP = {
  INPUT: "INPUT",           // Step 1: Enter coords or draw polygon
  VERIFIED: "VERIFIED",     // Step 2: Record found → show details + area
  OFFICER_FORM: "OFFICER",  // Step 3: Officer inspection form
  SUBMITTED: "SUBMITTED",   // Step 4: Final submission done
  FAILED: "FAILED",         // Error state
};

/* ──────────────── MAP HELPERS ──────────────── */
function LocationSelector({ setLat, setLng, setPosition }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setLat(lat.toFixed(6));
      setLng(lng.toFixed(6));
      setPosition([lat, lng]);
    },
  });
  return null;
}

function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

/* ────────────── MAIN COMPONENT ────────────── */
function KCCLandVerification() {
  const { t } = useTranslation();
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [position, setPosition] = useState(null);
  const [note, setNote] = useState("");
  const [image, setImage] = useState(null);
  const [imageFileName, setImageFileName] = useState("");
  const [polygonCoords, setPolygonCoords] = useState(null);
  const [area, setArea] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(STEP.INPUT);
  const [verificationResult, setVerificationResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [registeredPolygon, setRegisteredPolygon] = useState(null);
  const [verificationType, setVerificationType] = useState('survey_number');
  const [inputMode, setInputMode] = useState("survey"); // "survey" | "coordinates"
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [selectedDistrict, setSelectedDistrict] = useState("Bengaluru Rural");
  const [selectedTaluk, setSelectedTaluk] = useState("Devanahalli / Hosahalli");
  const [surveyNumber, setSurveyNumber] = useState("145");
  const [subDivision, setSubDivision] = useState("2A");

  const navigate = useNavigate();
  const location = useLocation();
  const incomingKyc = location.state || {};
  const featureGroupRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  /* ── Cascading State / District / Taluk Selectors ── */
  const currStateObj = INDIAN_STATES.find((s) => s.state === selectedState) || INDIAN_STATES[0];
  const currDistricts = currStateObj ? currStateObj.districts : [];
  const currDistrictObj = currDistricts.find((d) => d.name === selectedDistrict) || currDistricts[0];
  const currTaluks = currDistrictObj ? currDistrictObj.taluks : [];

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    const foundState = INDIAN_STATES.find((s) => s.state === newState);
    if (foundState && foundState.districts.length > 0) {
      setSelectedDistrict(foundState.districts[0].name);
      setSelectedTaluk(foundState.districts[0].taluks[0] || "");
    } else {
      setSelectedDistrict("");
      setSelectedTaluk("");
    }
  };

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setSelectedDistrict(newDistrict);
    const foundState = INDIAN_STATES.find((s) => s.state === selectedState);
    const foundDistrict = foundState?.districts.find((d) => d.name === newDistrict);
    if (foundDistrict && foundDistrict.taluks.length > 0) {
      setSelectedTaluk(foundDistrict.taluks[0]);
    } else {
      setSelectedTaluk("");
    }
  };

  /* ── Reset everything ── */
  const resetFlow = () => {
    setCurrentStep(STEP.INPUT);
    setVerificationResult(null);
    setSubmissionResult(null);
    setPolygonCoords(null);
    setArea(null);
    setNote("");
    setImage(null);
    setImageFileName("");
    setRegisteredPolygon(null);
    setVerificationType(inputMode === 'coordinates' ? 'coordinates' : 'survey_number');
    if (featureGroupRef.current) featureGroupRef.current.clearLayers();
  };

  /* ═══════════════════════════════════════════
     VERIFY BY SURVEY NUMBER (dual-mode option 1)
     ═══════════════════════════════════════════ */
  const handleSurveyVerify = async () => {
    if (!surveyNumber || !surveyNumber.trim()) {
      return alert("Please enter a Survey Number (e.g. 145)");
    }

    setLoading(true);
    setVerificationType('survey_number');

    try {
      const response = await fetch(`${API_BASE}/api/land-verification/by-survey-number`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: selectedState,
          district: selectedDistrict,
          taluk: selectedTaluk,
          village: selectedTaluk,
          surveyNumber: surveyNumber.trim(),
          subDivision: subDivision.trim(),
        }),
      });
      const data = await response.json();
      setVerificationResult(data);

      if (data.success && data.verified && data.landRecord) {
        setArea({
          sqm: data.landRecord.totalArea.sqMeters.toFixed(2),
          acres: data.landRecord.totalArea.acres.toFixed(4),
          hectares: data.landRecord.totalArea.hectares.toFixed(4),
        });

        if (data.landRecord.polygon) {
          const leafletCoords = data.landRecord.polygon[0].map(([lo, la]) => [la, lo]);
          setRegisteredPolygon(leafletCoords);

          // Fly map to centroid
          const ring = data.landRecord.polygon[0];
          let sumLng = 0, sumLat = 0;
          const count = ring.length - 1;
          for (let i = 0; i < count; i++) {
            sumLng += ring[i][0];
            sumLat += ring[i][1];
          }
          const cLat = sumLat / count;
          const cLng = sumLng / count;
          setLat(cLat.toFixed(6));
          setLng(cLng.toFixed(6));
          setPosition([cLat, cLng]);
        }
        setCurrentStep(STEP.VERIFIED);
      } else {
        setCurrentStep(STEP.FAILED);
      }
    } catch (error) {
      console.error("Survey verification error:", error);
      setVerificationResult({
        success: false,
        verified: false,
        message: "Server connection failed. Ensure backend is running on port 4005.",
      });
      setCurrentStep(STEP.FAILED);
    } finally {
      setLoading(false);
    }
  };

  /* ── Plot location from manual input ── */
  const handleShowLocation = () => {
    if (!lat || !lng) return alert("Enter valid coordinates");
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) return alert("Invalid coordinates");
    setPosition([latitude, longitude]);
  };

  /* ═══════════════════════════════════════════
     VERIFY BY COORDINATES (full flow)
     ═══════════════════════════════════════════ */
  const handleCoordVerify = async () => {
    if (!lat || !lng) return alert("Enter coordinates first");
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) return alert("Invalid coordinates");

    setLoading(true);
    setVerificationType('coordinates');
    setPosition([latitude, longitude]);

    try {
      const response = await fetch(`${API_BASE}/api/land-verification/by-coordinates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });
      const data = await response.json();
      setVerificationResult(data);

      if (data.success && data.verified && data.landRecord) {
        // Set the area from the matched record
        setArea({
          sqm: data.landRecord.totalArea.sqMeters.toFixed(2),
          acres: data.landRecord.totalArea.acres.toFixed(4),
          hectares: data.landRecord.totalArea.hectares.toFixed(4),
        });
        // Show the registered polygon on map
        if (data.landRecord.polygon) {
          // Convert GeoJSON [lng,lat] to Leaflet [lat,lng]
          const leafletCoords = data.landRecord.polygon[0].map(([lo, la]) => [la, lo]);
          setRegisteredPolygon(leafletCoords);
        }
        setCurrentStep(STEP.VERIFIED);
      } else {
        setCurrentStep(STEP.FAILED);
      }
    } catch (error) {
      console.error(error);
      setVerificationResult({
        success: false, verified: false,
        message: "Server connection failed. Ensure backend is running on port 4005.",
      });
      setCurrentStep(STEP.FAILED);
    } finally {
      setLoading(false);
    }
  };

  /* ═══════════════════════════════════════════
     VERIFY BY POLYGON (drawn boundary)
     ═══════════════════════════════════════════ */
  const handlePolygonVerify = async () => {
    if (!polygonCoords) return alert("Draw land boundary first");

    setLoading(true);
    setVerificationType('polygon');

    try {
      const response = await fetch(`${API_BASE}/api/land-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ polygon: polygonCoords, area }),
      });
      const data = await response.json();
      setVerificationResult(data);

      if (data.success && data.verified && data.landRecord) {
        // Override area with the official registered area
        setArea({
          sqm: data.landRecord.totalArea.sqMeters.toFixed(2),
          acres: data.landRecord.totalArea.acres.toFixed(4),
          hectares: data.landRecord.totalArea.hectares.toFixed(4),
        });
        if (data.landRecord.polygon) {
          const leafletCoords = data.landRecord.polygon[0].map(([lo, la]) => [la, lo]);
          setRegisteredPolygon(leafletCoords);
        }
        setCurrentStep(STEP.VERIFIED);
      } else {
        setCurrentStep(STEP.FAILED);
      }
    } catch (error) {
      console.error(error);
      setVerificationResult({
        success: false, verified: false,
        message: "Server connection failed. Ensure backend is running on port 4005.",
      });
      setCurrentStep(STEP.FAILED);
    } finally {
      setLoading(false);
    }
  };

  /* ═══════════════════════════════════════════
     SUBMIT OFFICER FORM (final step)
     ═══════════════════════════════════════════ */
  const handleOfficerSubmit = async () => {
    if (!verificationResult?.landRecord?.recordId) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/land-verification/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landRecordId: verificationResult.landRecord.recordId,
          note,
          area,
          officerName: "Field Officer",
          verificationType,
          verifiedCoordinates: (lat && lng) ? {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
          } : null,
        }),
      });
      const data = await response.json();
      setSubmissionResult(data);

      if (data.success) {
        setCurrentStep(STEP.SUBMITTED);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setImageFileName(file.name); }
  };

  /* ── Derived helpers ── */
  const landRecord = verificationResult?.landRecord;
  const hasDrawnPolygon = polygonCoords !== null;

  return (
    <div className="vf-page">
      {/* Loading Overlay */}
      {loading && (
        <div className="vf-loading-overlay">
          <Loader2 size={44} className="land-spin-icon" />
          <span className="vf-loading-text">
            Verifying land records with APISetu Gateway...
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="vf-page-header vf-gradient-green">
        <div className="vf-page-header-content">
          <div className={`vf-header-text ${mounted ? "mounted" : ""}`}>
            <div className="vf-header-badge">
              <MapIcon size={14} />
              <span>{t('land_verification.apisetu')}</span>
            </div>
            <h1 className="vf-header-title">{t('land_verification.title')}</h1>
            <p className="vf-header-desc">
              ISRO Bhuvan satellite overlay for precision land boundary mapping
              and field inspection verification against government land records.
            </p>
          </div>
        </div>
        <div className="vf-header-bg">
          <div className="vf-header-orb vf-header-orb-1" />
          <div className="vf-header-orb vf-header-orb-2" />
        </div>
      </div>

      {/* ─── Step Indicator ─── */}
      <div className="land-stepper">
        {[
          { key: STEP.INPUT, label: "INPUT", icon: <Navigation size={14} /> },
          { key: STEP.VERIFIED, label: "VERIFY", icon: <ShieldCheck size={14} /> },
          { key: STEP.OFFICER_FORM, label: "INSPECT", icon: <ClipboardCheck size={14} /> },
          { key: STEP.SUBMITTED, label: "COMPLETE", icon: <CheckCircle2 size={14} /> },
        ].map((s, i) => {
          const stepOrder = [STEP.INPUT, STEP.VERIFIED, STEP.OFFICER_FORM, STEP.SUBMITTED];
          const currentIdx = stepOrder.indexOf(currentStep);
          const thisIdx = i;
          const isActive = currentStep === s.key;
          const isDone = currentStep !== STEP.FAILED && thisIdx < currentIdx;
          return (
            <React.Fragment key={s.key}>
              {i > 0 && <div className={`land-stepper-line ${isDone ? "done" : ""}`} />}
              <div className={`land-stepper-item ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
                <div className="land-stepper-dot">{isDone ? <CheckCircle2 size={14} /> : s.icon}</div>
                <span className="land-stepper-label">{s.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="land-main-layout">
        {/* ═══ LEFT SIDEBAR ═══ */}
        <div className="land-sidebar">

          {/* ─── STEP 1: INPUT ─── */}
          {currentStep === STEP.INPUT && (
            <>
              {/* Dual-Mode Card */}
              <div className={`vf-form-card ${mounted ? "mounted" : ""}`}>
                {/* Clean Top Tab Switcher matching implementation blueprint */}
                <div className="land-card-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    id="tab-survey"
                    aria-selected={inputMode === "survey"}
                    className={`land-card-tab ${inputMode === "survey" ? "active" : ""}`}
                    onClick={() => {
                      setInputMode("survey");
                      setVerificationType("survey_number");
                    }}
                  >
                    <FileText size={15} /> By Survey Number
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="tab-coordinates"
                    aria-selected={inputMode === "coordinates"}
                    className={`land-card-tab ${inputMode === "coordinates" ? "active" : ""}`}
                    onClick={() => {
                      setInputMode("coordinates");
                      setVerificationType("coordinates");
                    }}
                  >
                    <Navigation size={15} /> By GPS Coordinates
                  </button>
                </div>

                {inputMode === "survey" ? (
                  /* ── TAB 1: SURVEY NUMBER & SUB-DIVISION ── */
                  <>
                    <div className="vf-form-card-header">
                      <div className="vf-form-card-icon green">
                        <FileCheck size={20} />
                      </div>
                      <div>
                        <h2 className="vf-form-card-title">Survey Number Entry</h2>
                        <p className="vf-form-card-subtitle">
                          Search official government revenue records by parcel number
                        </p>
                      </div>
                    </div>

                    <div className="vf-form-body">
                      {/* State & District Dropdowns */}
                      <div className="land-coords-grid">
                        <div className="vf-field">
                          <label className="vf-label">State</label>
                          <div className="land-select-wrapper">
                            <select
                              className="vf-input land-select"
                              value={selectedState}
                              onChange={handleStateChange}
                            >
                              {INDIAN_STATES.map((s) => (
                                <option key={s.state} value={s.state}>
                                  {s.state}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="vf-field">
                          <label className="vf-label">District</label>
                          <div className="land-select-wrapper">
                            <select
                              className="vf-input land-select"
                              value={selectedDistrict}
                              onChange={handleDistrictChange}
                            >
                              {currDistricts.map((d) => (
                                <option key={d.name} value={d.name}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Taluk / Village */}
                      <div className="vf-field">
                        <label className="vf-label">Taluk / Village</label>
                        <div className="land-select-wrapper">
                          <select
                            className="vf-input land-select"
                            value={selectedTaluk}
                            onChange={(e) => setSelectedTaluk(e.target.value)}
                          >
                            {currTaluks.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Separated Survey Number & Sub-Division / Hissa (2 Columns) */}
                      <div className="land-coords-grid">
                        <div className="vf-field">
                          <label className="vf-label">
                            Survey Number <span className="vf-required">*</span>
                          </label>
                          <input
                            className="vf-input"
                            placeholder="e.g. 145"
                            value={surveyNumber}
                            onChange={(e) => setSurveyNumber(e.target.value)}
                          />
                        </div>

                        <div className="vf-field">
                          <label className="vf-label">Sub-Division / Hissa</label>
                          <input
                            className="vf-input"
                            placeholder="e.g. 2A or A"
                            value={subDivision}
                            onChange={(e) => setSubDivision(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Quick Fill Sample Chips */}
                      <div className="land-sample-chips">
                        <span className="land-sample-label">Quick Test:</span>
                        <button
                          type="button"
                          className="land-sample-chip"
                          onClick={() => {
                            setSelectedState("Karnataka");
                            setSelectedDistrict("Bengaluru Rural");
                            setSelectedTaluk("Devanahalli / Hosahalli");
                            setSurveyNumber("145");
                            setSubDivision("2A");
                          }}
                        >
                          145 / 2A (Karnataka)
                        </button>
                        <button
                          type="button"
                          className="land-sample-chip"
                          onClick={() => {
                            setSelectedState("Telangana");
                            setSelectedDistrict("Rangareddy");
                            setSelectedTaluk("Shamshabad / Rajendranagar");
                            setSurveyNumber("145");
                            setSubDivision("A");
                          }}
                        >
                          145 / A (Telangana)
                        </button>
                        <button
                          type="button"
                          className="land-sample-chip"
                          onClick={() => {
                            setSelectedState("Karnataka");
                            setSelectedDistrict("Bengaluru Rural");
                            setSelectedTaluk("Devanahalli");
                            setSurveyNumber("78");
                            setSubDivision("D");
                          }}
                        >
                          78 / D (Karnataka)
                        </button>
                        <button
                          type="button"
                          className="land-sample-chip"
                          onClick={() => {
                            setSelectedState("Andhra Pradesh");
                            setSelectedDistrict("Krishna");
                            setSelectedTaluk("Gannavaram");
                            setSurveyNumber("312");
                            setSubDivision("E");
                          }}
                        >
                          312 / E (AP)
                        </button>
                        <button
                          type="button"
                          className="land-sample-chip"
                          onClick={() => {
                            setSelectedState("Maharashtra");
                            setSelectedDistrict("Nagpur");
                            setSelectedTaluk("Kamptee");
                            setSurveyNumber("45");
                            setSubDivision("F");
                          }}
                        >
                          45 / F (MH)
                        </button>
                      </div>

                      {/* Action Button */}
                      <div className="land-btn-group">
                        <button
                          type="button"
                          className="vf-submit-btn green land-full-btn"
                          onClick={handleSurveyVerify}
                          disabled={!surveyNumber.trim() || loading}
                        >
                          {loading ? (
                            <Loader2 size={16} className="land-spin-icon" />
                          ) : (
                            <FileCheck size={16} />
                          )}
                          Fetch Land Record
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* ── TAB 2: GPS COORDINATES (Original layout preserved 100%) ── */
                  <>
                    <div className="vf-form-card-header">
                      <div className="vf-form-card-icon green">
                        <Navigation size={20} />
                      </div>
                      <div>
                        <h2 className="vf-form-card-title">{t('land_verification.coord_entry')}</h2>
                        <p className="vf-form-card-subtitle">{t('land_verification.coord_desc')}</p>
                      </div>
                    </div>
                    <div className="vf-form-body">
                      <div className="land-coords-grid">
                        <div className="vf-field">
                          <label className="vf-label">{t('land_verification.lat_label')}</label>
                          <input
                            className="vf-input"
                            placeholder="e.g. 17.2420"
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                          />
                        </div>
                        <div className="vf-field">
                          <label className="vf-label">{t('land_verification.lng_label')}</label>
                          <input
                            className="vf-input"
                            placeholder="e.g. 78.4290"
                            value={lng}
                            onChange={(e) => setLng(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="land-btn-group">
                        <button className="vf-submit-btn green land-full-btn" onClick={handleShowLocation}>
                          <Maximize2 size={16} /> Plot on Map
                        </button>
                        <button
                          className="vf-submit-btn land-full-btn land-verify-coord-btn"
                          onClick={handleCoordVerify}
                          disabled={!lat || !lng || loading}
                        >
                          <ShieldCheck size={16} /> Verify Coordinates
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Drawn Area + Verify Button */}
              {hasDrawnPolygon && area && (
                <>
                  <div className="vf-form-card mounted land-stats-card">
                    <div className="vf-form-card-header">
                      <div className="vf-form-card-icon green"><Layers size={20} /></div>
                      <div>
                        <h2 className="vf-form-card-title">{t('land_verification.drawn_area_title')}</h2>
                        <p className="vf-form-card-subtitle">{t('land_verification.drawn_area_desc')}</p>
                      </div>
                    </div>
                    <div className="vf-form-body">
                      <div className="vf-data-row">
                        <span className="vf-data-label">{t('land_verification.sq_meters')}</span>
                        <span className="vf-data-value">{area.sqm}</span>
                      </div>
                      <div className="vf-data-row">
                        <span className="vf-data-label">{t('land_verification.acres')}</span>
                        <span className="vf-data-value">{area.acres}</span>
                      </div>
                      <div className="vf-data-row">
                        <span className="vf-data-label">{t('land_verification.hec')}</span>
                        <span className="vf-data-value">{area.hectares}</span>
                      </div>
                    </div>
                  </div>
                  <button className="vf-submit-btn green land-full-btn" onClick={handlePolygonVerify}
                    disabled={loading}>
                    {loading ? <Loader2 size={16} className="land-spin-icon" /> : <ShieldCheck size={16} />}
                    Verify Drawn Boundary
                  </button>
                </>
              )}

              {/* Hint */}
              <div className="land-hint-box">
                <Info size={14} />
                <div>
                  <strong>{inputMode === "survey" ? "APISetu Cadastral Land Verification:" : "Two ways to verify:"}</strong>
                  {inputMode === "survey" ? (
                    <>
                      <p>1. Enter Survey Number & Sub-Division / Hissa (matches official Bhoomi/Dharani standards).</p>
                      <p>2. Or switch to "By GPS Coordinates" to verify via coordinates or drawn map boundary.</p>
                    </>
                  ) : (
                    <>
                      <p>1. Enter coordinates and click "Verify Coordinates"</p>
                      <p>2. Draw a rectangle/polygon on the map and click "Verify Drawn Boundary"</p>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ─── STEP 2: VERIFIED — show record details ─── */}
          {currentStep === STEP.VERIFIED && landRecord && (
            <>
              <div className="land-verification-result mounted land-result-success">
                <div className="land-result-header">
                  <CheckCircle2 size={24} className="land-result-icon-success" />
                  <div>
                    <h3 className="land-result-title">Land Verified Successfully</h3>
                    <p className="land-result-message">{verificationResult.message}</p>
                  </div>
                </div>

                {/* Record Details */}
                <div className="land-record-details">
                  <div className="land-record-section-title">
                    <Database size={14} /><span>Government Land Record</span>
                  </div>
                  <div className="land-record-grid">
                    {[
                      ["Record ID", landRecord.recordId],
                      ["Survey Number", landRecord.surveyNumber],
                      ["Owner", landRecord.ownerName, <User size={12} key="u" />],
                      ["Father's Name", landRecord.fatherName],
                      ["Aadhaar (Last 4)", `XXXX-XXXX-${landRecord.aadharLast4}`],
                      ["Village", `${landRecord.village}, ${landRecord.mandal}`, <MapPin size={12} key="m" />],
                      ["District", landRecord.district],
                      ["State", landRecord.state],
                      ["Land Type", landRecord.landType, <Sprout size={12} key="s" />],
                      ["Registered Area", `${landRecord.totalArea.acres} Acres (${landRecord.totalArea.hectares} Ha)`],
                      ["Reg. Date", landRecord.registrationDate, <Calendar size={12} key="c" />],
                      ["Document No.", landRecord.documentNumber],
                      ["Irrigation", landRecord.irrigationSource, <Droplets size={12} key="d" />],
                      ["Soil Type", landRecord.soilType],
                      ["Khasra No.", landRecord.khasraNumber],
                      ["Encumbrance", landRecord.encumbrance, null, true],
                      ["Mutation", landRecord.mutation, null, true],
                    ].map(([label, value, icon, isStatus], i) => (
                      <div className="land-record-item" key={i}>
                        <span className="land-record-label">{label}</span>
                        <span className={`land-record-value ${isStatus ? "land-record-status-ok" : ""}`}>
                          {icon && <span style={{ marginRight: 4, display: "flex" }}>{icon}</span>}
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {landRecord.cropHistory && (
                    <div className="land-crop-history">
                      <span className="land-record-label">Crop History</span>
                      <div className="land-crop-tags">
                        {landRecord.cropHistory.map((crop, i) => (
                          <span key={i} className="land-crop-tag"><Sprout size={11} />{crop}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Registered Area Card */}
              {area && (
                <div className="vf-form-card mounted land-stats-card">
                  <div className="vf-form-card-header">
                    <div className="vf-form-card-icon green"><Layers size={20} /></div>
                    <div>
                      <h2 className="vf-form-card-title">Registered Land Area</h2>
                      <p className="vf-form-card-subtitle">From official records</p>
                    </div>
                  </div>
                  <div className="vf-form-body">
                    <div className="vf-data-row">
                      <span className="vf-data-label">{t('land_verification.sq_meters')}</span>
                      <span className="vf-data-value">{area.sqm}</span>
                    </div>
                    <div className="vf-data-row">
                      <span className="vf-data-label">{t('land_verification.acres')}</span>
                      <span className="vf-data-value">{area.acres}</span>
                    </div>
                    <div className="vf-data-row">
                      <span className="vf-data-label">{t('land_verification.hec')}</span>
                      <span className="vf-data-value">{area.hectares}</span>
                    </div>
                  </div>
                </div>
              )}

              <button className="vf-submit-btn green land-full-btn"
                onClick={() => setCurrentStep(STEP.OFFICER_FORM)}>
                <ArrowRight size={16} /> Proceed to Officer Inspection
              </button>
            </>
          )}

          {/* ─── STEP 3: OFFICER FORM ─── */}
          {currentStep === STEP.OFFICER_FORM && (
            <div className="vf-form-card mounted land-verify-card">
              <div className="vf-form-card-header">
                <div className="vf-form-card-icon green"><ClipboardCheck size={20} /></div>
                <div>
                  <h2 className="vf-form-card-title">Officer Verification</h2>
                  <p className="vf-form-card-subtitle">
                    {landRecord?.surveyNumber} — {landRecord?.village}, {landRecord?.district}
                  </p>
                </div>
              </div>
              <div className="vf-form-body">
                {/* Quick summary */}
                <div className="land-officer-summary">
                  <div className="land-officer-row">
                    <User size={13} /><span>Owner: <strong>{landRecord?.ownerName}</strong></span>
                  </div>
                  <div className="land-officer-row">
                    <Layers size={13} /><span>Area: <strong>{area?.acres} Acres</strong></span>
                  </div>
                  <div className="land-officer-row">
                    <FileCheck size={13} /><span>Doc: <strong>{landRecord?.documentNumber}</strong></span>
                  </div>
                </div>

                <div className="vf-field">
                  <label className="vf-label">Inspection Notes <span className="vf-required">*</span></label>
                  <textarea className="vf-input land-textarea"
                    placeholder="Describe land condition, crop type, boundary markers observed..."
                    rows="4" value={note} onChange={(e) => setNote(e.target.value)} />
                </div>

                <div className="vf-field">
                  <label className="vf-label">Site Photograph</label>
                  <div className="land-upload-wrapper">
                    <ImageIcon size={18} className="land-upload-icon" />
                    <input type="file" accept="image/*" onChange={handleFileChange} className="vf-file-input" />
                  </div>
                  {imageFileName && (
                    <div className="land-file-tag"><CheckCircle2 size={12} />{imageFileName}</div>
                  )}
                </div>

                <div className="land-btn-group">
                  <button className="vf-submit-btn green land-full-btn"
                    onClick={handleOfficerSubmit} disabled={!note.trim() || loading}>
                    {loading ? <Loader2 size={16} className="land-spin-icon" /> : <ShieldCheck size={16} />}
                    Submit Verification
                  </button>
                  <button className="vf-submit-btn land-full-btn land-back-btn"
                    onClick={() => setCurrentStep(STEP.VERIFIED)}>
                    <RotateCcw size={14} /> Back to Record
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 4: SUBMITTED — redirect ─── */}
          {currentStep === STEP.SUBMITTED && submissionResult && (
            <div className="land-verification-result mounted land-result-success">
              <div className="land-result-header">
                <CheckCircle2 size={28} className="land-result-icon-success" />
                <div>
                  <h3 className="land-result-title">Verification Complete</h3>
                  <p className="land-result-message">{submissionResult.message}</p>
                </div>
              </div>

              {submissionResult.submission && (
                <div className="land-submission-details">
                  <div className="land-record-grid">
                    <div className="land-record-item">
                      <span className="land-record-label">Submission ID</span>
                      <span className="land-record-value">{submissionResult.submission.submissionId}</span>
                    </div>
                    <div className="land-record-item">
                      <span className="land-record-label">Survey No.</span>
                      <span className="land-record-value">{submissionResult.submission.surveyNumber}</span>
                    </div>
                    <div className="land-record-item">
                      <span className="land-record-label">Owner</span>
                      <span className="land-record-value">{submissionResult.submission.ownerName}</span>
                    </div>
                    <div className="land-record-item">
                      <span className="land-record-label">Status</span>
                      <span className="land-record-value land-record-status-ok">
                        {submissionResult.submission.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="land-btn-group" style={{ marginTop: 16 }}>
                  <button
                    type="button"
                    className="vf-submit-btn land-full-btn"
                    style={{ background: "#f3f4f6", color: "#111827", borderColor: "#d1d5db" }}
                    onClick={() => {
                      const s = submissionResult.submission || {};
                      let fScore = 50; 
                      if ((s.irrigationSource || "").toLowerCase().includes("canal")) fScore += 15;
                      if ((s.irrigationSource || "").toLowerCase().includes("borewell")) fScore += 10;
                      if ((s.soilType || "").toLowerCase().includes("alluvial")) fScore += 15;
                      if ((s.soilType || "").toLowerCase().includes("black")) fScore += 10;
                      fScore = Math.min(100, fScore);
                      
                      const stateData = {
                          fromLandVerification: true,
                          landArea: s.totalAreaAcres || landRecord?.totalArea?.acres || 2.5,
                          cropHistory: s.cropHistory || landRecord?.cropHistory || ["Rice (Kharif 2024)", "Groundnut (Rabi 2023)"],
                          surveyNumber: s.surveyNumber || landRecord?.surveyNumber || "Survey No. 145/2A",
                          ownerName: s.ownerName || landRecord?.ownerName || "Farmer",
                          village: s.village || landRecord?.village || "Village",
                          district: s.district || landRecord?.district || "District",
                          farmScore: fScore
                        };
                      sessionStorage.setItem("kcc_verified_land", JSON.stringify(stateData));
                      navigate("/customer/loan-calculator?verified=true", { state: stateData });
                    }}>
                    <FileText size={16} style={{ marginRight: '6px' }} />
                    Proceed to Loan Assessment (Verified Land)
                </button>
                  <button
                    type="button"
                    className="vf-submit-btn land-full-btn land-proceed-btn"
                    onClick={() => {
                      const s = submissionResult.submission || {};
                      let fScore = 50;
                      if (s.irrigationSource?.toLowerCase().includes("canal")) fScore += 15;
                      if (s.irrigationSource?.toLowerCase().includes("borewell")) fScore += 10;
                      if (s.soilType?.toLowerCase().includes("alluvial")) fScore += 15;
                      if (s.soilType?.toLowerCase().includes("black")) fScore += 10;
                      fScore = Math.min(100, fScore);
                      
                      let primaryCrop = "paddy";
                      if (s.cropHistory && s.cropHistory.length > 0) {
                         const c = s.cropHistory[0].toLowerCase();
                         if (c.includes("wheat")) primaryCrop = "wheat";
                         else if (c.includes("cotton")) primaryCrop = "cotton";
                         else if (c.includes("sugarcane")) primaryCrop = "sugarcane";
                         else if (c.includes("groundnut")) primaryCrop = "groundnut";
                      }
                      
                        navigate("/customer/addcustomer", {
                          state: {
                            ...incomingKyc,
                            landArea: s.totalAreaAcres || landRecord?.totalArea?.acres || 2.5,
                            cropType: primaryCrop,
                            cropHistory: s.cropHistory || landRecord?.cropHistory || [],
                            farmScore: fScore,
                          }
                        });
                    }}>
                    <ArrowRight size={16} /> Proceed to KCC Application
                </button>
                <button type="button" className="vf-submit-btn green land-full-btn" onClick={resetFlow}>
                  <RotateCcw size={16} /> Verify Another Land
                </button>
              </div>
            </div>
          )}

          {/* ─── FAILED STATE ─── */}
          {currentStep === STEP.FAILED && verificationResult && (
            <div className="land-verification-result mounted land-result-error">
              <div className="land-result-header">
                <AlertTriangle size={24} className="land-result-icon-error" />
                <div>
                  <h3 className="land-result-title">Verification Failed</h3>
                  <p className="land-result-message">{verificationResult.message}</p>
                </div>
              </div>

              {verificationResult.suggestion && (
                <div className="land-suggestion-box">
                  <Info size={14} /><p>{verificationResult.suggestion}</p>
                </div>
              )}

              {verificationResult.registeredAreas && (
                <div className="land-available-records">
                  <span className="land-available-title">Available Registered Records (for testing):</span>
                  {verificationResult.registeredAreas.map((r, i) => (
                    <div key={i} className="land-available-item">
                      <MapPin size={12} />
                      <span>{r.surveyNumber} — {r.village}, {r.district}, {r.state}</span>
                      <div className="land-goto-btn-group">
                        <button
                          type="button"
                          className="land-goto-btn"
                          onClick={() => {
                            const raw = (r.surveyNumber || '').replace(/^(survey\s*no\.?|sy\s*no\.?)\s*/i, '').trim();
                            const parts = raw.split(/[/|-]/).map((p) => p.trim());
                            setSurveyNumber(parts[0] || '');
                            setSubDivision(parts[1] || '');
                            if (r.state) setSelectedState(r.state);
                            if (r.district) setSelectedDistrict(r.district);
                            if (r.village) setSelectedTaluk(r.village);
                            if (r.center) {
                              setLat(r.center.lat.toFixed(6));
                              setLng(r.center.lng.toFixed(6));
                              setPosition([r.center.lat, r.center.lng]);
                            }
                            setInputMode('survey');
                            setCurrentStep(STEP.INPUT);
                          }}
                        >
                          Use
                        </button>
                        {r.center && (
                          <button
                            type="button"
                            className="land-goto-btn"
                            onClick={() => {
                              setLat(r.center.lat.toFixed(6));
                              setLng(r.center.lng.toFixed(6));
                              setPosition([r.center.lat, r.center.lng]);
                              setInputMode('coordinates');
                              setCurrentStep(STEP.INPUT);
                            }}
                          >
                            Go
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="land-btn-group" style={{ marginTop: 16 }}>
                <button className="vf-submit-btn green land-full-btn" onClick={resetFlow}>
                  <RotateCcw size={16} /> Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═══ RIGHT: MAP ═══ */}
        <div className="land-map-container">
          <div className="land-map-header">
            <div className="land-map-title">
              <div className="land-pulse-dot" />
              <span>Bhuvan LULC Satellite Overlay</span>
            </div>
            {position && (
              <div className="land-map-live-coords">
                <Navigation size={12} />
                {parseFloat(lat).toFixed(4)}°N, {parseFloat(lng).toFixed(4)}°E
              </div>
            )}
          </div>

          <div className="land-map-view">
            <div className="land-map-bracket tl" />
            <div className="land-map-bracket tr" />
            <div className="land-map-bracket bl" />
            <div className="land-map-bracket br" />

            <MapContainer center={[20.5937, 78.9629]} zoom={5}
              style={{ height: "100%", width: "100%", zIndex: 1 }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <TileLayer url="https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms"
                params={{ layers: "lulc:india", format: "image/png", transparent: true }} />

              {/* Drawing tools — only in INPUT step */}
              {currentStep === STEP.INPUT && (
                <FeatureGroup ref={featureGroupRef}>
                  <EditControl position="topright"
                    onCreated={(e) => {
                      const layer = e.layer;
                      const geoJson = layer.toGeoJSON();
                      const coords = geoJson.geometry.coordinates;
                      setPolygonCoords(coords);

                      try {
                        const polygon = turf.polygon(coords);
                        const areaSqMeters = turf.area(polygon);
                        setArea({
                          sqm: areaSqMeters.toFixed(2),
                          acres: (areaSqMeters * 0.000247105).toFixed(4),
                          hectares: (areaSqMeters / 10000).toFixed(4),
                        });
                      } catch (err) {
                        console.warn("Area calculation error:", err);
                      }
                    }}
                    onDeleted={() => { setPolygonCoords(null); setArea(null); }}
                    draw={{
                      rectangle: true,
                      polygon: {
                        allowIntersection: false, showArea: true,
                        shapeOptions: { color: "#16a34a", weight: 2, fillOpacity: 0.15 },
                      },
                      circle: false, marker: false, polyline: false, circlemarker: false,
                    }}
                  />
                </FeatureGroup>
              )}

              {/* Show registered polygon outline */}
              {registeredPolygon && (
                <LeafletPolygon
                  positions={registeredPolygon}
                  pathOptions={{
                    color: "#16a34a",
                    fillColor: "#22c55e",
                    weight: 3.5,
                    fillOpacity: 0.25,
                  }}
                />
              )}

              <LocationSelector setLat={setLat} setLng={setLng} setPosition={setPosition} />
              {position && <Marker position={position} />}
              <MapFlyTo position={position} />
            </MapContainer>
          </div>
          <div className="land-map-tip">
            <Info size={14} />
            <span>
              {currentStep === STEP.INPUT
                ? "Use drawing tools (top-right) to draw boundary, or enter parcel details on the left."
                : currentStep === STEP.VERIFIED || currentStep === STEP.OFFICER_FORM
                ? "Green boundary shows the registered land parcel from official government revenue records."
                : "Land verification complete."}
            </span>
          </div>
        </div>
      </div>

      <div className="vf-security-footer">
        <div className="vf-security-footer-inner">
          <ShieldCheck size={16} className="vf-security-icon" />
          <p className="vf-security-text">
            Precision mapping data sourced from NRSC (ISRO) and OpenStreetMap.
            Land verification powered by APISetu Government Records Gateway.
            All coordinates are historically logged for audit compliance.
          </p>
        </div>
      </div>
    </div>
  );
}

export default KCCLandVerification;
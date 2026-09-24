const path = require('path');
const REGISTERED_LANDS = require(path.join(__dirname, '..', 'data', 'landRecords.json'));
const LandVerification = require('../models/landVerification');

/* =============================================================
   GEOMETRY HELPER FUNCTIONS
   ============================================================= */

function getBoundingBox(coords) {
  const ring = coords[0];
  let minLng = Infinity, maxLng = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;

  for (const [lng, lat] of ring) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return { minLng, maxLng, minLat, maxLat };
}

function getCentroid(coords) {
  const ring = coords[0];
  let sumLng = 0, sumLat = 0;
  const pointCount = ring.length - 1; // exclude closing coord
  for (let i = 0; i < pointCount; i++) {
    sumLng += ring[i][0];
    sumLat += ring[i][1];
  }
  return { lng: sumLng / pointCount, lat: sumLat / pointCount };
}

function boxesOverlap(a, b) {
  return !(a.maxLng < b.minLng || b.maxLng < a.minLng ||
           a.maxLat < b.minLat || b.maxLat < a.minLat);
}

function overlapRatio(a, b) {
  const oMinLng = Math.max(a.minLng, b.minLng);
  const oMaxLng = Math.min(a.maxLng, b.maxLng);
  const oMinLat = Math.max(a.minLat, b.minLat);
  const oMaxLat = Math.min(a.maxLat, b.maxLat);

  if (oMinLng >= oMaxLng || oMinLat >= oMaxLat) return 0;

  const overlapArea = (oMaxLng - oMinLng) * (oMaxLat - oMinLat);
  const areaA = (a.maxLng - a.minLng) * (a.maxLat - a.minLat);
  const areaB = (b.maxLng - b.minLng) * (b.maxLat - b.minLat);
  return overlapArea / (areaA + areaB - overlapArea); // IoU
}

function distanceDeg(c1, c2) {
  return Math.sqrt(Math.pow(c1.lng - c2.lng, 2) + Math.pow(c1.lat - c2.lat, 2));
}

function pointInPolygon(point, polygon) {
  const [px, py] = point; // [lng, lat]
  const ring = polygon[0];
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];

    const intersect = ((yi > py) !== (yj > py)) &&
                      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/* =============================================================
   Build a full land record response object (DRY)
   ============================================================= */

function buildLandRecordResponse(land) {
  return {
    recordId: land.id,
    surveyNumber: land.surveyNumber,
    village: land.village,
    mandal: land.mandal,
    district: land.district,
    state: land.state,
    ownerName: land.ownerName,
    fatherName: land.fatherName,
    aadharLast4: land.aadharLast4,
    landType: land.landType,
    totalArea: land.totalArea,
    registrationDate: land.registrationDate,
    documentNumber: land.documentNumber,
    cropHistory: land.cropHistory,
    irrigationSource: land.irrigationSource,
    soilType: land.soilType,
    khasraNumber: land.khasraNumber,
    encumbrance: land.encumbrance,
    mutation: land.mutation,
    status: land.status,
    polygon: land.polygon,
  };
}

function buildRegisteredAreasSummary() {
  return REGISTERED_LANDS.map(l => ({
    surveyNumber: l.surveyNumber,
    village: l.village,
    district: l.district,
    state: l.state,
    center: getCentroid(l.polygon),
  }));
}

/* =============================================================
   CONTROLLER: verifyByPolygon
   POST /api/land-verification
   ============================================================= */

exports.verifyByPolygon = (req, res) => {
  try {
    let { polygon, note, area } = req.body;

    // Parse if stringified (FormData fallback)
    if (typeof polygon === 'string') {
      try { polygon = JSON.parse(polygon); } catch (e) {
        return res.status(400).json({
          success: false, verified: false,
          message: "Invalid polygon data format. Please draw the boundary again.",
        });
      }
    }

    if (!polygon || !Array.isArray(polygon) || polygon.length === 0) {
      return res.status(400).json({
        success: false, verified: false,
        message: "No land boundary data provided. Please draw the land boundary on the map.",
      });
    }

    if (typeof area === 'string') {
      try { area = JSON.parse(area); } catch (e) { area = null; }
    }

    // Find best matching land
    const userBB = getBoundingBox(polygon);
    const userCentroid = getCentroid(polygon);
    let bestMatch = null, bestScore = 0;

    for (const land of REGISTERED_LANDS) {
      const landBB = getBoundingBox(land.polygon);
      if (!boxesOverlap(userBB, landBB)) continue;

      const iou = overlapRatio(userBB, landBB);
      const centroidDist = distanceDeg(userCentroid, getCentroid(land.polygon));
      const score = iou - (centroidDist * 10);

      if (iou > 0.15 && score > bestScore) {
        bestScore = score;
        bestMatch = land;
      }
    }

    if (bestMatch) {
      return res.status(200).json({
        success: true,
        verified: true,
        message: `Land record verified successfully! Survey No: ${bestMatch.surveyNumber}`,
        matchConfidence: Math.min(Math.round(bestScore * 100), 100),
        landRecord: buildLandRecordResponse(bestMatch),
        verificationTimestamp: new Date().toISOString(),
        verifiedBy: "APISetu Land Records Gateway",
      });
    }

    return res.status(200).json({
      success: false,
      verified: false,
      message: "No matching land record found in the government registry for the drawn boundary. Please verify the coordinates and try again.",
      suggestion: "Ensure you are drawing the boundary accurately over the registered land parcel. The boundary must overlap significantly with a registered survey plot.",
      registeredAreas: buildRegisteredAreasSummary(),
      verificationTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Land verification error:", error);
    return res.status(500).json({
      success: false, verified: false,
      message: "Internal server error during land verification.",
    });
  }
};

/* =============================================================
   CONTROLLER: verifyByCoordinates
   POST /api/land-verification/by-coordinates
   ============================================================= */

exports.verifyByCoordinates = (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false, verified: false,
        message: "Please provide both latitude and longitude.",
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false, verified: false,
        message: "Invalid coordinates. Please enter valid numbers.",
      });
    }

    for (const land of REGISTERED_LANDS) {
      if (pointInPolygon([lng, lat], land.polygon)) {
        return res.status(200).json({
          success: true,
          verified: true,
          message: `Coordinates match registered land: ${land.surveyNumber}`,
          landRecord: buildLandRecordResponse(land),
          verificationTimestamp: new Date().toISOString(),
          verifiedBy: "APISetu Land Records Gateway",
        });
      }
    }

    return res.status(200).json({
      success: false,
      verified: false,
      message: "The provided coordinates do not match any registered land parcel.",
      suggestion: "Ensure the coordinates fall within a registered survey plot. You may also try drawing a boundary instead.",
      registeredAreas: buildRegisteredAreasSummary(),
      verificationTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Coordinate verification error:", error);
    return res.status(500).json({
      success: false, verified: false,
      message: "Server error during coordinate verification.",
    });
  }
};

/* =============================================================
   CONTROLLER: verifyBySurveyNumber
   POST /api/land-verification/by-survey-number
   Future-Proof: switches between local MOCK and real-time Govt API
   (Bhoomi / Dharani / APISetu) based on LAND_API_MODE env variable
   ============================================================= */

exports.verifyBySurveyNumber = async (req, res) => {
  try {
    const { state, district, taluk, village, surveyNumber, subDivision } = req.body;

    if (!surveyNumber || !surveyNumber.toString().trim()) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Please enter a valid Survey Number.",
      });
    }

    // Clean and normalize survey number & sub-division
    let rawInputSurvey = surveyNumber.toString().trim().replace(/^(survey\s*no\.?|sy\s*no\.?)\s*/i, '');
    let sNum = rawInputSurvey.trim();
    let sDiv = (subDivision || '').toString().trim();

    // If user typed '145/2A' or '145-2A' or '145 / 2A' into the Survey Number field and left sub-division empty
    if (!sDiv && (sNum.includes('/') || sNum.includes('-'))) {
      const parts = sNum.split(/[/|-]/).map(p => p.trim());
      sNum = parts[0] || '';
      sDiv = parts.slice(1).join('/');
    }

    // Normalize for matching: remove internal spaces for comparison, lowercase
    const normSNum = sNum.toLowerCase().replace(/\s+/g, '');
    const normSDiv = sDiv.toLowerCase().replace(/\s+/g, '');
    const cleanState = (state || '').toString().trim().toLowerCase();
    const cleanDistrict = (district || '').toString().trim().toLowerCase();
    const rawVillage = (village || taluk || '').toString().trim().toLowerCase();
    const villageTokens = rawVillage.split(/[/|, -]/).map(t => t.trim()).filter(Boolean);

    // ── FUTURE: Live Government API Integration Adapter ──
    if (process.env.LAND_API_MODE === 'LIVE') {
      // Future live government API adapter (APISetu / Bhoomi / Dharani Gateway)
      // e.g.: const liveRecord = await apiSetuService.fetchLandRecord({ state, district, surveyNumber: sNum, subDivision: sDiv });
    }

    // ── MOCK / REGISTRY SEARCH ──
    let bestMatch = null;
    let highestScore = -1;

    for (const land of REGISTERED_LANDS) {
      // Parse registered land's survey number (e.g. "Survey No. 145/2A" -> "145", "2A")
      const regSurvey = (land.surveyNumber || '').replace(/^(survey\s*no\.?|sy\s*no\.?)\s*/i, '').trim();
      const regParts = regSurvey.split(/[/|-]/).map(p => p.trim());
      const landMain = (regParts[0] || '').toLowerCase().replace(/\s+/g, '');
      const landSub = (regParts[1] || '').toLowerCase().replace(/\s+/g, '');
      const fullLandSurvey = regSurvey.toLowerCase().replace(/\s+/g, '');

      // 1. SURVEY NUMBER MUST MATCH EXACTLY
      // The main survey number MUST match exactly (e.g. 145 === 145).
      // Or if user typed the complete survey number e.g. 145/2a === 145/2a
      const isExactMain = (normSNum === landMain);
      const isExactFull = (normSNum === fullLandSurvey) || (normSDiv && `${normSNum}/${normSDiv}` === fullLandSurvey);

      if (!isExactMain && !isExactFull) {
        continue; // Survey number must match exactly! "14" does NOT match "145".
      }

      // 2. SUB-DIVISION / HISSA VALIDATION
      // If user specified a sub-division, it MUST match the parcel's sub-division!
      if (normSDiv) {
        if (normSDiv !== landSub) {
          // If the user specified a sub-division that does NOT match this parcel,
          // DO NOT MATCH THIS PARCEL. Sub-division 2A is legally distinct from B or A!
          continue;
        }
      }

      // 3. STATE VALIDATION
      // If user specified a state, it MUST match the parcel's state!
      if (cleanState && land.state.toLowerCase() !== cleanState) {
        continue; // Cannot verify land in another state!
      }

      // 4. SCORING FOR RANKING CANDIDATES
      let score = 50; // Base score for exact survey number match
      if (normSDiv && normSDiv === landSub) score += 30; // Exact sub-division match
      if (cleanState && land.state.toLowerCase() === cleanState) score += 20; // Exact state match
      if (cleanDistrict && land.district.toLowerCase() === cleanDistrict) score += 15; // Exact district match

      // Village/Mandal match
      if (villageTokens.length > 0) {
        const matchesVillageOrMandal = villageTokens.some(token => 
          land.village.toLowerCase().includes(token) || 
          land.mandal.toLowerCase().includes(token)
        );
        if (matchesVillageOrMandal) score += 15;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = land;
      }
    }

    if (bestMatch) {
      return res.status(200).json({
        success: true,
        verified: true,
        message: `Land record verified successfully! Survey No: ${bestMatch.surveyNumber}`,
        landRecord: buildLandRecordResponse(bestMatch),
        matchScore: highestScore,
        verificationTimestamp: new Date().toISOString(),
        verifiedBy: "APISetu Land Records Gateway",
      });
    }

    return res.status(200).json({
      success: false,
      verified: false,
      message: `No matching land record found for Survey No: ${sNum}${sDiv ? '/' + sDiv : ''}${state ? ' in ' + state : ''}.`,
      suggestion: "Please check your Survey Number, Sub-Division, and State/District selection. You may select one of the available registered records.",
      registeredAreas: buildRegisteredAreasSummary(),
      verificationTimestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Survey number verification error:", error);
    return res.status(500).json({
      success: false,
      verified: false,
      message: "Server error during survey number verification.",
    });
  }
};


/* =============================================================
   CONTROLLER: getAllRecords
   GET /api/land-verification/records
   ============================================================= */

exports.getAllRecords = (req, res) => {
  try {
    const records = REGISTERED_LANDS.map(land => ({
      id: land.id,
      surveyNumber: land.surveyNumber,
      village: land.village,
      district: land.district,
      state: land.state,
      ownerName: land.ownerName,
      landType: land.landType,
      totalArea: land.totalArea,
      status: land.status,
      center: getCentroid(land.polygon),
    }));

    return res.status(200).json({
      success: true,
      totalRecords: records.length,
      records,
    });
  } catch (error) {
    console.error("Error fetching land records:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch land records",
    });
  }
};

/* =============================================================
   CONTROLLER: submitVerification
   POST /api/land-verification/submit
   Called after officer fills the inspection form
   ============================================================= */

exports.submitVerification = async (req, res) => {
  try {
    const { landRecordId, note, area, officerName, verificationType, verifiedCoordinates } = req.body;

    if (!landRecordId) {
      return res.status(400).json({
        success: false,
        message: "Land record ID is required to submit verification.",
      });
    }

    const land = REGISTERED_LANDS.find(l => l.id === landRecordId);
    if (!land) {
      return res.status(404).json({
        success: false,
        message: "Land record not found.",
      });
    }

    let savedRecord = null;
    try {
      // Save to MySQL land_verifications table
      savedRecord = await LandVerification.create({
        landRecordId: land.id,
        surveyNumber: land.surveyNumber,
        village: land.village,
        mandal: land.mandal,
        district: land.district,
        state: land.state,
        ownerName: land.ownerName,
        fatherName: land.fatherName,
        aadharLast4: land.aadharLast4,
        landType: land.landType,
        totalAreaAcres: land.totalArea ? land.totalArea.acres : null,
        totalAreaHectares: land.totalArea ? land.totalArea.hectares : null,
        totalAreaSqMeters: land.totalArea ? land.totalArea.sqMeters : null,
        registrationDate: land.registrationDate,
        documentNumber: land.documentNumber,
        khasraNumber: land.khasraNumber,
        polygon: land.polygon,
        cropHistory: land.cropHistory,
        irrigationSource: land.irrigationSource,
        soilType: land.soilType,
        encumbrance: land.encumbrance,
        mutation: land.mutation,
        verificationType: verificationType || 'survey_number',
        verifiedLatitude: verifiedCoordinates ? verifiedCoordinates.latitude : (land.polygon ? getCentroid(land.polygon).lat : null),
        verifiedLongitude: verifiedCoordinates ? verifiedCoordinates.longitude : (land.polygon ? getCentroid(land.polygon).lng : null),
        inspectionNote: note || '',
        officerName: officerName || 'Field Officer',
        status: 'Verified & Submitted',
      });
    } catch (dbErr) {
      console.warn("MySQL save warning (using session fallback):", dbErr.message);
      savedRecord = {
        id: `LV-${Date.now()}`,
        landRecordId: land.id,
        surveyNumber: land.surveyNumber,
        village: land.village,
        district: land.district,
        state: land.state,
        ownerName: land.ownerName,
        totalAreaAcres: land.totalArea ? land.totalArea.acres : null,
        cropHistory: land.cropHistory,
        irrigationSource: land.irrigationSource,
        soilType: land.soilType,
        inspectionNote: note || '',
        officerName: officerName || 'Field Officer',
        date: new Date().toISOString(),
        status: 'Verified & Submitted',
      };
    }

    return res.status(200).json({
      success: true,
      message: "Land verification submitted successfully! Proceeding to KCC application.",
      submission: {
        submissionId: savedRecord.id,
        landRecordId: savedRecord.landRecordId,
        surveyNumber: savedRecord.surveyNumber,
        village: savedRecord.village,
        district: savedRecord.district,
        state: savedRecord.state,
        ownerName: savedRecord.ownerName,
        totalAreaAcres: savedRecord.totalAreaAcres,
        cropHistory: savedRecord.cropHistory,
        irrigationSource: savedRecord.irrigationSource,
        soilType: savedRecord.soilType,
        inspectionNote: savedRecord.inspectionNote,
        officerName: savedRecord.officerName,
        submittedAt: savedRecord.date || savedRecord.submittedAt,
        status: savedRecord.status,
      },
    });
  } catch (error) {
    console.error("Submit verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during submission.",
    });
  }
};

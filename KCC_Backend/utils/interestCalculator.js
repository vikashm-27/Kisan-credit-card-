const CROPS = require('./scaleOfFinance.json');

/**
 * Calculates the KCC Loan Limit according to standard RBI/NABARD guidelines.
 * 
 * Year 1 Limit = (Crop Acreage * Scale of Finance) 
 *                + 10% (Post-harvest / Household / Consumption)
 *                + 20% (Farm Maintenance / Asset upkeep)
 *              = Base Crop Loan * 1.30
 * 
 * 5-Year Sanctioned Limit = Year 1 Limit * 1.50 (10% annual step-up)
 */
function calculateLoanLimit(landAreaAcres, cropIdOrRate, additionalLimit = 0) {
  const acres = parseFloat(landAreaAcres) || 0;
  if (acres <= 0) {
    throw new Error('Land area must be greater than 0 acres.');
  }

  let crop = null;
  let ratePerAcre = 0;

  if (typeof cropIdOrRate === 'number') {
    ratePerAcre = cropIdOrRate;
  } else if (typeof cropIdOrRate === 'string') {
    crop = CROPS.find(c => c.id.toLowerCase() === cropIdOrRate.toLowerCase() || c.name.toLowerCase().includes(cropIdOrRate.toLowerCase()));
    ratePerAcre = crop ? crop.scaleOfFinance : 30000; // default fallback 30,000/acre
  } else {
    ratePerAcre = 30000;
  }

  const baseCropLoan = Math.round(acres * ratePerAcre);
  const postHarvestHousehold = Math.round(baseCropLoan * 0.10);
  const farmMaintenance = Math.round(baseCropLoan * 0.20);
  const shortTermCropLimit = baseCropLoan + postHarvestHousehold + farmMaintenance;
  
  const extraLimit = parseFloat(additionalLimit) || 0;
  const year1Limit = shortTermCropLimit + extraLimit;
  
  // Usually the 10% step-up is on the crop limit portion
  const fiveYearLimit = Math.round(shortTermCropLimit * 1.50) + extraLimit;

  // Drawing power breakdown (Season-wise tranches: Kharif 60%, Rabi 40%) of the crop limit
  // Extra limit is usually disbursed as term loan, but let's just add it to the total DP or keep it separate.
  // We'll distribute extraLimit proportionally or just add it to year1Limit.
  const kharifTranche = Math.round(shortTermCropLimit * 0.60) + extraLimit; // Assuming extra limit is drawn immediately
  const rabiTranche = shortTermCropLimit - Math.round(shortTermCropLimit * 0.60);

  return {
    crop: crop || {
      id: 'custom',
      name: 'Standard Crop',
      scaleOfFinance: ratePerAcre,
      season: 'Bi-annual'
    },
    landAreaAcres: acres,
    scaleOfFinancePerAcre: ratePerAcre,
    baseCropLoan,
    postHarvestHousehold,
    farmMaintenance,
    shortTermCropLimit,
    additionalLimit: extraLimit,
    year1Limit,
    fiveYearLimit,
    drawingPower: {
      kharifTranche,
      rabiTranche,
      currency: 'INR'
    }
  };
}

/**
 * Determines credit tier and interest rate matrix based on CIBIL and Farm Score.
 * 
 * Tiers:
 * Tier 1: Prime Agri Borrower (Base: 7.00%, Prompt Effective: 4.00%)
 * Tier 2: Standard Low-Risk (Base: 8.00%, Prompt Effective: 5.00%)
 * Tier 3: Moderate Risk (Base: 8.75%, Prompt Effective: 5.75%)
 * Tier 4: Watchlist / High Risk (Base: 9.50%, Prompt Effective: 6.50%)
 */
function calculateInterestTier(cibilScoreInput, farmScoreInput, userBaseRate, userSubvention) {
  const cibil = parseInt(cibilScoreInput, 10) || 650;
  let farmScore = parseFloat(farmScoreInput) || 60;

  let normFarmScore = farmScore;
  if (farmScore > 100) {
    normFarmScore = Math.min(100, Math.max(0, ((farmScore - 300) / 600) * 100));
  }

  const normCibil = Math.min(100, Math.max(0, ((cibil - 300) / 600) * 100));
  const compositeScore = Math.round((normCibil * 0.55) + (normFarmScore * 0.45));

  let tier = 'Tier 2';
  let tierName = 'Standard Low Risk';
  let riskPremium = 1.00;
  let riskLevel = 'Low Risk';
  let riskBadgeColor = 'blue';

  if (cibil >= 750 && normFarmScore >= 70) {
    tier = 'Tier 1';
    tierName = 'Prime Agri Borrower';
    riskPremium = 0.00;
    riskLevel = 'Minimal Risk';
    riskBadgeColor = 'green';
  } else if (compositeScore >= 62 || (cibil >= 700 && normFarmScore >= 60)) {
    tier = 'Tier 2';
    tierName = 'Standard Low Risk';
    riskPremium = 1.00;
    riskLevel = 'Low Risk';
    riskBadgeColor = 'blue';
  } else if (compositeScore >= 45 || cibil >= 620) {
    tier = 'Tier 3';
    tierName = 'Moderate Risk';
    riskPremium = 1.75;
    riskLevel = 'Moderate Risk';
    riskBadgeColor = 'amber';
  } else {
    tier = 'Tier 4';
    tierName = 'Watchlist / High Risk';
    riskPremium = 2.50;
    riskLevel = 'High Risk';
    riskBadgeColor = 'red';
  }

  const baseInterestRate = (userBaseRate !== undefined ? userBaseRate : 7.00) + riskPremium;
  const promptRepaymentIncentive = (userSubvention !== undefined ? userSubvention : 3.00);
  const effectiveInterestRate = Math.max(0.0, +(baseInterestRate - promptRepaymentIncentive).toFixed(2));

  return {
    cibilScore: cibil,
    farmScore: Math.round(farmScore),
    normalizedFarmScore: Math.round(normFarmScore),
    compositeScore,
    tier,
    tierName,
    riskLevel,
    riskBadgeColor,
    baseInterestRate,
    promptRepaymentIncentive,
    effectiveInterestRate,
    subventionScheme: 'Govt. of India MISS (Modified Interest Subvention Scheme)'
  };
}

/**
 * Master loan evaluation bringing together Loan Limits and Dynamic Interest.
 */
function evaluateKCCLoan({ landArea, cropType, cibilScore, farmScore, baseInterestRate, subventionRate, additionalLimit }) {
  const loanLimit = calculateLoanLimit(landArea, cropType, additionalLimit);
  const interestTier = calculateInterestTier(cibilScore, farmScore, baseInterestRate, subventionRate);

  const year1 = loanLimit.year1Limit;

  // Subvention cap: Up to 3 Lakhs
  const subventionEligibleAmount = Math.min(year1, 300000);
  const excessAmount = Math.max(0, year1 - 300000);

  // Annual interest calculations
  const annualInterestNormal = Math.round(year1 * (interestTier.baseInterestRate / 100));
  
  const promptInterestEligible = Math.round(subventionEligibleAmount * (interestTier.effectiveInterestRate / 100));
  const promptInterestExcess = Math.round(excessAmount * (interestTier.baseInterestRate / 100));
  const annualInterestPrompt = promptInterestEligible + promptInterestExcess;
  const annualFarmerSavings = annualInterestNormal - annualInterestPrompt;

  return {
    loanLimit,
    interestTier,
    financialSummary: {
      year1SanctionedLimit: year1,
      fiveYearSanctionedLimit: loanLimit.fiveYearLimit,
      subventionEligibleAmount,
      excessAmount,
      annualInterestNormal,
      annualInterestPrompt,
      annualFarmerSavings,
      monthlyInstallmentPrompt: Math.round(annualInterestPrompt / 12),
      isFullSubventionApplied: excessAmount === 0,
      note: 'Based on RBI KCC Master Circular 2024'
    }
  };
}

module.exports = {
  calculateLoanLimit,
  calculateInterestTier,
  evaluateKCCLoan,
  CROPS
};

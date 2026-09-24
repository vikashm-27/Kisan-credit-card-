const { evaluateKCCLoan, CROPS } = require('../utils/interestCalculator');

/**
 * POST /api/calculate-loan
 * Computes KCC credit limit and dynamic interest tier breakdown.
 */
exports.calculateLoan = (req, res) => {
  try {
    const { landArea, cropType, cibilScore, farmScore, baseInterestRate, subventionRate, additionalLimit } = req.body;

    // Validate landArea
    const parsedLand = parseFloat(landArea);
    if (isNaN(parsedLand) || parsedLand <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid land area. Please enter a positive number of acres (e.g. 2.5).'
      });
    }

    if (parsedLand > 500) {
      return res.status(400).json({
        success: false,
        message: 'Land area exceeds practical limits for standard KCC (Max 500 acres).'
      });
    }

    // Default or validated CIBIL and Farm scores
    const parsedCibil = parseInt(cibilScore, 10) || 700;
    const parsedFarmScore = parseFloat(farmScore) || 75;
    const parsedBaseRate = baseInterestRate !== undefined ? parseFloat(baseInterestRate) : undefined;
    const parsedSubvention = subventionRate !== undefined ? parseFloat(subventionRate) : undefined;
    const parsedAdditionalLimit = additionalLimit !== undefined ? parseFloat(additionalLimit) : 0;

    // Evaluate
    const calculation = evaluateKCCLoan({
      landArea: parsedLand,
      cropType: cropType || 'paddy',
      cibilScore: parsedCibil,
      farmScore: parsedFarmScore,
      baseInterestRate: parsedBaseRate,
      subventionRate: parsedSubvention,
      additionalLimit: parsedAdditionalLimit
    });

    return res.status(200).json({
      success: true,
      message: 'Loan limit and dynamic interest evaluated successfully.',
      data: calculation
    });
  } catch (error) {
    console.error('Error in calculateLoan controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while evaluating loan calculation.'
    });
  }
};

/**
 * GET /api/scale-of-finance
 * Returns reference list of supported crops and their District Scale of Finance.
 */
exports.getScaleOfFinance = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: CROPS.length,
      data: CROPS
    });
  } catch (error) {
    console.error('Error fetching scale of finance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve scale of finance data.'
    });
  }
};

// Constants for tax calculation
const PERSONAL_DEDUCTION = 11000000 // 11 million VND
const DEPENDENT_DEDUCTION = 4400000 // 4.4 million VND per dependent
const SOCIAL_INSURANCE_RATE = 0.08 // 8%
const HEALTH_INSURANCE_RATE = 0.015 // 1.5%
const UNEMPLOYMENT_INSURANCE_RATE = 0.01 // 1%

// Maximum salary for insurance calculation based on region
const MAX_SALARY_FOR_INSURANCE: Record<string, number> = {
  "1": 29800000, // Region I: 29.8 million VND
  "2": 26400000, // Region II: 26.4 million VND
  "3": 23300000, // Region III: 23.3 million VND
  "4": 20900000, // Region IV: 20.9 million VND
}

// Tax brackets for progressive income tax
const TAX_BRACKETS = [
  { threshold: 5000000, rate: 0.05 }, // 5%
  { threshold: 10000000, rate: 0.1 }, // 10%
  { threshold: 18000000, rate: 0.15 }, // 15%
  { threshold: 32000000, rate: 0.2 }, // 20%
  { threshold: 52000000, rate: 0.25 }, // 25%
  { threshold: 80000000, rate: 0.3 }, // 30%
  { threshold: Number.POSITIVE_INFINITY, rate: 0.35 }, // 35%
]

// Interface for calculation results
interface TaxCalculationResult {
  grossSalary: number
  netSalary: number
  socialInsurance: number
  healthInsurance: number
  unemploymentInsurance: number
  unionFee: number
  taxableIncome: number
  personalIncomeTax: number
}

/**
 * Calculate tax and net salary from gross salary
 */
export function calculateGrossToNet(
  grossSalary: number,
  dependents: number,
  region: string,
  hasUnion = false,
  unionRate = 1,
): TaxCalculationResult {
  // Calculate insurance contributions
  const maxSalaryForInsurance = MAX_SALARY_FOR_INSURANCE[region] || MAX_SALARY_FOR_INSURANCE["1"]
  const salaryForInsurance = Math.min(grossSalary, maxSalaryForInsurance)

  const socialInsurance = salaryForInsurance * SOCIAL_INSURANCE_RATE
  const healthInsurance = salaryForInsurance * HEALTH_INSURANCE_RATE
  const unemploymentInsurance = salaryForInsurance * UNEMPLOYMENT_INSURANCE_RATE
  const unionFee = hasUnion ? salaryForInsurance * (unionRate / 100) : 0

  // Calculate taxable income
  const totalDeductions = socialInsurance + healthInsurance + unemploymentInsurance + unionFee
  const totalAllowances = PERSONAL_DEDUCTION + dependents * DEPENDENT_DEDUCTION
  const taxableIncome = Math.max(0, grossSalary - totalDeductions - totalAllowances)

  // Calculate personal income tax
  const personalIncomeTax = calculateProgressiveTax(taxableIncome)

  // Calculate net salary
  const netSalary = grossSalary - totalDeductions - personalIncomeTax

  return {
    grossSalary,
    netSalary,
    socialInsurance,
    healthInsurance,
    unemploymentInsurance,
    unionFee,
    taxableIncome,
    personalIncomeTax,
  }
}

/**
 * Calculate gross salary from desired net salary
 */
export function calculateNetToGross(
  targetNetSalary: number,
  dependents: number,
  region: string,
  hasUnion = false,
  unionRate = 1,
): TaxCalculationResult {
  // Use binary search to find the gross salary that results in the target net salary
  let low = targetNetSalary
  let high = targetNetSalary * 2 // Initial upper bound
  let grossSalary = 0
  let result: TaxCalculationResult | null = null

  // Binary search with precision of 1000 VND
  while (high - low > 1000) {
    grossSalary = Math.floor((low + high) / 2)
    const calculationResult = calculateGrossToNet(grossSalary, dependents, region, hasUnion, unionRate)

    if (calculationResult.netSalary > targetNetSalary) {
      high = grossSalary
    } else {
      low = grossSalary
      result = calculationResult
    }
  }

  // If we didn't find a result (unlikely), calculate with the final gross salary
  if (!result) {
    result = calculateGrossToNet(grossSalary, dependents, region, hasUnion, unionRate)
  }

  // Adjust the result to match the target net salary exactly
  return {
    ...result,
    netSalary: targetNetSalary,
  }
}

/**
 * Calculate progressive income tax based on taxable income
 */
function calculateProgressiveTax(taxableIncome: number): number {
  let remainingIncome = taxableIncome
  let tax = 0
  let previousThreshold = 0

  for (const bracket of TAX_BRACKETS) {
    const taxableAmountInBracket = Math.min(remainingIncome, bracket.threshold - previousThreshold)

    if (taxableAmountInBracket <= 0) break

    tax += taxableAmountInBracket * bracket.rate
    remainingIncome -= taxableAmountInBracket
    previousThreshold = bracket.threshold

    if (remainingIncome <= 0) break
  }

  return tax
}

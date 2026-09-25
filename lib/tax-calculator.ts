/**
 * Thông số pháp lý áp dụng cho kỳ lương từ 01/07/2026.
 *
 * - Giảm trừ gia cảnh: Nghị quyết 110/2025/UBTVQH15 (áp dụng từ kỳ tính thuế 2026),
 *   Nghị định 253/2026/NĐ-CP.
 * - Biểu thuế lũy tiến 5 bậc: Luật Thuế TNCN số 109/2025/QH15 (áp dụng cho tiền lương,
 *   tiền công từ kỳ tính thuế 2026).
 * - Tiền lương làm thêm giờ, làm đêm được miễn thuế: khoản 8 Điều 4 Luật 109/2025/QH15,
 *   Điều 26 Nghị định 253/2026/NĐ-CP.
 * - Lương cơ sở 2.530.000đ: Nghị định 161/2026/NĐ-CP (từ 01/07/2026).
 * - Trần BHXH = 20 lần mức tham chiếu (= lương cơ sở): Điều 31 Luật BHXH 2024.
 * - Trần BHYT = 20 lần lương cơ sở.
 * - Trần BHTN = 20 lần lương tối thiểu vùng, NLĐ đóng 1%: Luật Việc làm 2025.
 * - Lương tối thiểu vùng: Nghị định 293/2025/NĐ-CP (từ 01/01/2026).
 * - Đoàn phí công đoàn 0,5%, tối đa 10% lương cơ sở: Quyết định 61/QĐ-TLĐ (từ 01/07/2025);
 *   không phải khoản giảm trừ khi tính thuế TNCN (Công văn 1756/TCT-TNCN).
 */
export const EFFECTIVE_DATE = "01/07/2026"

export const BASE_SALARY = 2_530_000

export const PERSONAL_DEDUCTION = 15_500_000
export const DEPENDENT_DEDUCTION = 6_200_000

export const SOCIAL_INSURANCE_RATE = 0.08
export const HEALTH_INSURANCE_RATE = 0.015
export const UNEMPLOYMENT_INSURANCE_RATE = 0.01
export const UNION_FEE_RATE = 0.005

export const MAX_SOCIAL_HEALTH_INSURANCE_SALARY = 20 * BASE_SALARY // 50.600.000
export const MAX_UNION_FEE = 0.1 * BASE_SALARY // 253.000

export const REGIONAL_MINIMUM_WAGE: Record<string, number> = {
  "1": 5_310_000,
  "2": 4_730_000,
  "3": 4_140_000,
  "4": 3_700_000,
}

export function getMaxUnemploymentInsuranceSalary(region: string): number {
  return 20 * (REGIONAL_MINIMUM_WAGE[region] ?? REGIONAL_MINIMUM_WAGE["1"])
}

// Biểu thuế lũy tiến từng phần (thu nhập tính thuế theo tháng)
export const TAX_BRACKETS = [
  { threshold: 10_000_000, rate: 0.05 },
  { threshold: 30_000_000, rate: 0.1 },
  { threshold: 60_000_000, rate: 0.2 },
  { threshold: 100_000_000, rate: 0.3 },
  { threshold: Number.POSITIVE_INFINITY, rate: 0.35 },
]

export interface SalaryOptions {
  dependents: number
  region: string
  hasUnion?: boolean
  /** Tự nhập tiền lương làm căn cứ đóng bảo hiểm (áp dụng cho BHXH, BHYT, BHTN và đoàn phí) */
  customInsuranceBase?: boolean
  insuranceBaseAmount?: number
  /** Phụ cấp, khoản bổ sung chịu thuế, không tính vào lương đóng bảo hiểm */
  allowanceAmount?: number
  /** Tiền lương làm thêm giờ đúng quy định (miễn thuế TNCN) */
  overtimeAmount?: number
}

export interface TaxCalculationResult {
  grossSalary: number
  allowanceAmount: number
  overtimeAmount: number
  totalIncome: number
  insuranceBase: number
  belowMinimumWage: boolean
  socialInsurance: number
  healthInsurance: number
  unemploymentInsurance: number
  totalInsurance: number
  unionFee: number
  personalDeduction: number
  dependentDeduction: number
  taxableIncome: number
  personalIncomeTax: number
  netSalary: number
}

/**
 * Tính lương NET từ lương GROSS
 */
export function calculateGrossToNet(grossSalary: number, options: SalaryOptions): TaxCalculationResult {
  const { dependents, region, hasUnion = false, customInsuranceBase = false } = options
  const allowanceAmount = Math.max(0, options.allowanceAmount ?? 0)
  const overtimeAmount = Math.max(0, options.overtimeAmount ?? 0)
  const gross = Math.max(0, grossSalary)

  const insuranceBase = customInsuranceBase ? Math.max(0, options.insuranceBaseAmount ?? 0) : gross
  const minimumWage = REGIONAL_MINIMUM_WAGE[region] ?? REGIONAL_MINIMUM_WAGE["1"]

  const socialHealthBase = Math.min(insuranceBase, MAX_SOCIAL_HEALTH_INSURANCE_SALARY)
  const unemploymentBase = Math.min(insuranceBase, getMaxUnemploymentInsuranceSalary(region))

  const socialInsurance = Math.round(socialHealthBase * SOCIAL_INSURANCE_RATE)
  const healthInsurance = Math.round(socialHealthBase * HEALTH_INSURANCE_RATE)
  const unemploymentInsurance = Math.round(unemploymentBase * UNEMPLOYMENT_INSURANCE_RATE)
  const totalInsurance = socialInsurance + healthInsurance + unemploymentInsurance

  const unionFee = hasUnion ? Math.round(Math.min(insuranceBase * UNION_FEE_RATE, MAX_UNION_FEE)) : 0

  // Tiền làm thêm giờ được miễn thuế nên không cộng vào thu nhập chịu thuế.
  // Đoàn phí công đoàn không phải khoản giảm trừ nên không trừ khi tính thuế.
  const personalDeduction = PERSONAL_DEDUCTION
  const dependentDeduction = Math.max(0, dependents) * DEPENDENT_DEDUCTION
  const taxableIncome = Math.max(0, gross + allowanceAmount - totalInsurance - personalDeduction - dependentDeduction)
  const personalIncomeTax = Math.round(calculateProgressiveTax(taxableIncome))

  const totalIncome = gross + allowanceAmount + overtimeAmount
  const netSalary = totalIncome - totalInsurance - unionFee - personalIncomeTax

  return {
    grossSalary: gross,
    allowanceAmount,
    overtimeAmount,
    totalIncome,
    insuranceBase,
    belowMinimumWage: insuranceBase > 0 && insuranceBase < minimumWage,
    socialInsurance,
    healthInsurance,
    unemploymentInsurance,
    totalInsurance,
    unionFee,
    personalDeduction,
    dependentDeduction,
    taxableIncome,
    personalIncomeTax,
    netSalary,
  }
}

/**
 * Tìm lương GROSS nhỏ nhất (làm tròn đến đồng) để thực nhận đạt lương NET mong muốn.
 * Lương NET mong muốn là tổng thực nhận, đã bao gồm phụ cấp và tiền làm thêm giờ.
 */
export function calculateNetToGross(targetNetSalary: number, options: SalaryOptions): TaxCalculationResult {
  const netAt = (gross: number) => calculateGrossToNet(gross, options).netSalary

  if (netAt(0) >= targetNetSalary) {
    return calculateGrossToNet(0, options)
  }

  let low = 0
  let high = Math.max(1_000_000, Math.ceil(targetNetSalary * 2))
  while (netAt(high) < targetNetSalary) {
    low = high
    high *= 2
  }

  // Lương NET tăng đơn điệu theo lương GROSS: tìm GROSS nhỏ nhất có NET >= mục tiêu
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2)
    if (netAt(mid) >= targetNetSalary) {
      high = mid
    } else {
      low = mid
    }
  }

  return calculateGrossToNet(high, options)
}

/**
 * Thuế TNCN theo biểu thuế lũy tiến từng phần
 */
export function calculateProgressiveTax(taxableIncome: number): number {
  let tax = 0
  let previousThreshold = 0

  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome <= previousThreshold) break
    tax += (Math.min(taxableIncome, bracket.threshold) - previousThreshold) * bracket.rate
    previousThreshold = bracket.threshold
  }

  return tax
}

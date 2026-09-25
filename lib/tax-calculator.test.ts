import assert from "node:assert/strict"
import { test } from "node:test"

import { calculateGrossToNet, calculateNetToGross, calculateProgressiveTax } from "./tax-calculator.ts"

test("biểu thuế lũy tiến 5 bậc", () => {
  assert.equal(calculateProgressiveTax(0), 0)
  assert.equal(calculateProgressiveTax(10_000_000), 500_000)
  assert.equal(calculateProgressiveTax(30_000_000), 2_500_000)
  assert.equal(calculateProgressiveTax(60_000_000), 8_500_000)
  assert.equal(calculateProgressiveTax(100_000_000), 20_500_000)
  assert.equal(calculateProgressiveTax(120_000_000), 27_500_000)
})

test("gross 30 triệu, không người phụ thuộc, vùng I", () => {
  const r = calculateGrossToNet(30_000_000, { dependents: 0, region: "1" })
  assert.equal(r.socialInsurance, 2_400_000)
  assert.equal(r.healthInsurance, 450_000)
  assert.equal(r.unemploymentInsurance, 300_000)
  // 30.000.000 - 3.150.000 - 15.500.000
  assert.equal(r.taxableIncome, 11_350_000)
  // 10.000.000 x 5% + 1.350.000 x 10%
  assert.equal(r.personalIncomeTax, 635_000)
  assert.equal(r.netSalary, 26_215_000)
})

test("thu nhập thấp không phải nộp thuế", () => {
  const r = calculateGrossToNet(15_000_000, { dependents: 0, region: "1" })
  assert.equal(r.taxableIncome, 0)
  assert.equal(r.personalIncomeTax, 0)
  assert.equal(r.netSalary, 13_425_000)
})

test("gross 60 triệu: trần BHXH/BHYT 50,6 triệu, đoàn phí tối đa 253.000 và không được trừ khi tính thuế", () => {
  const r = calculateGrossToNet(60_000_000, { dependents: 1, region: "1", hasUnion: true })
  assert.equal(r.socialInsurance, 4_048_000)
  assert.equal(r.healthInsurance, 759_000)
  assert.equal(r.unemploymentInsurance, 600_000)
  assert.equal(r.unionFee, 253_000)
  // 60.000.000 - 5.407.000 - 15.500.000 - 6.200.000
  assert.equal(r.taxableIncome, 32_893_000)
  // 500.000 + 2.000.000 + 2.893.000 x 20%
  assert.equal(r.personalIncomeTax, 3_078_600)
  assert.equal(r.netSalary, 51_261_400)
})

test("đoàn phí 0,5% khi lương dưới trần", () => {
  const r = calculateGrossToNet(20_000_000, { dependents: 0, region: "1", hasUnion: true })
  assert.equal(r.unionFee, 100_000)
})

test("trần BHTN theo lương tối thiểu vùng IV (74 triệu)", () => {
  const r = calculateGrossToNet(80_000_000, { dependents: 0, region: "4" })
  assert.equal(r.unemploymentInsurance, 740_000)
  assert.equal(r.taxableIncome, 58_953_000)
  assert.equal(r.personalIncomeTax, 8_290_600)
  assert.equal(r.netSalary, 66_162_400)
})

test("tiền làm thêm giờ miễn thuế, phụ cấp chịu thuế và không tính đóng bảo hiểm", () => {
  const r = calculateGrossToNet(20_000_000, {
    dependents: 0,
    region: "1",
    allowanceAmount: 2_000_000,
    overtimeAmount: 5_000_000,
  })
  assert.equal(r.totalInsurance, 2_100_000)
  // 20.000.000 + 2.000.000 - 2.100.000 - 15.500.000
  assert.equal(r.taxableIncome, 4_400_000)
  assert.equal(r.personalIncomeTax, 220_000)
  assert.equal(r.netSalary, 24_680_000)
})

test("tự nhập tiền lương đóng bảo hiểm áp dụng cho cả BHXH, BHYT, BHTN", () => {
  const r = calculateGrossToNet(40_000_000, {
    dependents: 0,
    region: "1",
    customInsuranceBase: true,
    insuranceBaseAmount: 10_000_000,
  })
  assert.equal(r.socialInsurance, 800_000)
  assert.equal(r.healthInsurance, 150_000)
  assert.equal(r.unemploymentInsurance, 100_000)
  assert.equal(r.taxableIncome, 23_450_000)
  assert.equal(r.personalIncomeTax, 1_845_000)
  assert.equal(r.netSalary, 37_105_000)
  assert.equal(r.belowMinimumWage, false)
})

test("cảnh báo lương đóng bảo hiểm thấp hơn lương tối thiểu vùng", () => {
  const r = calculateGrossToNet(5_000_000, { dependents: 0, region: "1" })
  assert.equal(r.belowMinimumWage, true)
})

test("net sang gross ra đúng lương gross", () => {
  const r = calculateNetToGross(26_215_000, { dependents: 0, region: "1" })
  assert.equal(r.grossSalary, 30_000_000)
  assert.equal(r.netSalary, 26_215_000)
})

test("net sang gross là lương gross nhỏ nhất đạt mức net mong muốn", () => {
  const cases = [
    { dependents: 0, region: "1" },
    { dependents: 2, region: "2", hasUnion: true },
    { dependents: 1, region: "4", allowanceAmount: 3_000_000, overtimeAmount: 4_000_000 },
  ]
  for (const options of cases) {
    for (const target of [8_000_000, 25_000_000, 47_123_456, 90_000_000, 250_000_000]) {
      const r = calculateNetToGross(target, options)
      assert.ok(r.netSalary >= target)
      assert.ok(calculateGrossToNet(r.grossSalary - 1, options).netSalary < target)
    }
  }
})

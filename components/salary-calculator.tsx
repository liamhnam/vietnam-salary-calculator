"use client"

import { useState } from "react"
import { Copy, InfoIcon, FileText, Calculator } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import {
  BASE_SALARY,
  DEPENDENT_DEDUCTION,
  EFFECTIVE_DATE,
  MAX_SOCIAL_HEALTH_INSURANCE_SALARY,
  MAX_UNION_FEE,
  PERSONAL_DEDUCTION,
  REGIONAL_MINIMUM_WAGE,
  calculateGrossToNet,
  calculateNetToGross,
  getMaxUnemploymentInsuranceSalary,
  type SalaryOptions,
} from "@/lib/tax-calculator"
import { formatCurrency, formatNumber } from "@/lib/utils"

export function SalaryCalculator() {
  const { toast } = useToast()
  const [salaryType, setSalaryType] = useState<"gross" | "net">("gross")
  const [salary, setSalary] = useState<number>(30000000)
  const [salaryDisplay, setSalaryDisplay] = useState<string>("30,000,000")
  const [dependents, setDependents] = useState<number>(0)
  const [region, setRegion] = useState<string>("1")
  const [hasUnion, setHasUnion] = useState<boolean>(false)
  const [unionRate, setUnionRate] = useState<number>(1)

  // Thêm các state mới
  const [customBHXH, setCustomBHXH] = useState<boolean>(false)
  const [bhxhBaseAmount, setBHXHBaseAmount] = useState<number>(0)
  const [bhxhBaseAmountDisplay, setBHXHBaseAmountDisplay] = useState<string>("0")
  const [hasAllowance, setHasAllowance] = useState<boolean>(false)
  const [allowanceAmount, setAllowanceAmount] = useState<number>(0)
  const [allowanceAmountDisplay, setAllowanceAmountDisplay] = useState<string>("0")
  const [hasOvertime, setHasOvertime] = useState<boolean>(false)
  const [overtimeAmount, setOvertimeAmount] = useState<number>(0)
  const [overtimeAmountDisplay, setOvertimeAmountDisplay] = useState<string>("0")

  const [results, setResults] = useState(() => calculateGrossToNet(30000000, { dependents: 0, region: "1" }))
  const [showResults, setShowResults] = useState<boolean>(false)



// Thêm hàm này vào component SalaryCalculator
const sendDataToServer = async () => {
  try {
    const calculationData = {
      inputs: {
        salaryType,
        salary,
        dependents,
        region,
        hasUnion,
        unionRate,
        customBHXH,
        bhxhBaseAmount,
        hasAllowance,
        allowanceAmount,
        hasOvertime,
        overtimeAmount
      },
      results: {
        ...results
      }
    };

    // Gửi dữ liệu đến API endpoint
    const response = await fetch('https://nemsushii.x10.mx/api/save-calculation.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'liamhnam' // Thay thế bằng API key thực tế
      },
      body: JSON.stringify(calculationData)
    });

    if (!response.ok) {
      throw new Error('Failed to save calculation data');
    }
    
    // Không cần xử lý phản hồi vì chúng ta không muốn hiển thị gì cho người dùng
  } catch (error) {
    console.error('Error saving calculation data:', error);
    // Không hiển thị lỗi cho người dùng
  }
};





  // Xử lý định dạng số có dấu phẩy ngàn
  const handleSalaryChange = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, "")
    const numberValue = cleanValue ? Number.parseInt(cleanValue, 10) : 0
    setSalary(numberValue)
    setSalaryDisplay(formatNumber(numberValue))
  }

  const handleBHXHBaseAmountChange = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, "")
    const numberValue = cleanValue ? Number.parseInt(cleanValue, 10) : 0
    setBHXHBaseAmount(numberValue)
    setBHXHBaseAmountDisplay(formatNumber(numberValue))
  }

  const handleAllowanceAmountChange = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, "")
    const numberValue = cleanValue ? Number.parseInt(cleanValue, 10) : 0
    setAllowanceAmount(numberValue)
    setAllowanceAmountDisplay(formatNumber(numberValue))
  }

  const handleOvertimeAmountChange = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, "")
    const numberValue = cleanValue ? Number.parseInt(cleanValue, 10) : 0
    setOvertimeAmount(numberValue)
    setOvertimeAmountDisplay(formatNumber(numberValue))
  }

  const handleCalculate = () => {
    const options: SalaryOptions = {
      dependents,
      region,
      hasUnion,
      customInsuranceBase: customBHXH,
      insuranceBaseAmount: bhxhBaseAmount,
      allowanceAmount: hasAllowance ? allowanceAmount : 0,
      overtimeAmount: hasOvertime ? overtimeAmount : 0,
    }
    setResults(salaryType === "gross" ? calculateGrossToNet(salary, options) : calculateNetToGross(salary, options))
    sendDataToServer().catch(console.error); // Sử dụng catch để tránh lỗi không xử 
    setShowResults(true)
  }

  const handleCopyResults = () => {
    const text = [
      "Kết quả tính lương:",
      `Lương gross: ${formatCurrency(results.grossSalary)}`,
      results.allowanceAmount > 0 ? `Phụ cấp chịu thuế: ${formatCurrency(results.allowanceAmount)}` : null,
      results.overtimeAmount > 0 ? `Tiền làm thêm giờ (miễn thuế): ${formatCurrency(results.overtimeAmount)}` : null,
      `Lương net: ${formatCurrency(results.netSalary)}`,
      "",
      "Chi tiết các khoản:",
      `- Tiền lương đóng bảo hiểm: ${formatCurrency(results.insuranceBase)}`,
      `- BHXH (8%): ${formatCurrency(results.socialInsurance)}`,
      `- BHYT (1,5%): ${formatCurrency(results.healthInsurance)}`,
      `- BHTN (1%): ${formatCurrency(results.unemploymentInsurance)}`,
      results.unionFee > 0 ? `- Đoàn phí công đoàn (0,5%): ${formatCurrency(results.unionFee)}` : null,
      `- Giảm trừ bản thân: ${formatCurrency(results.personalDeduction)}`,
      `- Giảm trừ người phụ thuộc: ${formatCurrency(results.dependentDeduction)}`,
      `- Thu nhập tính thuế: ${formatCurrency(results.taxableIncome)}`,
      `- Thuế TNCN: ${formatCurrency(results.personalIncomeTax)}`,
      "",
      `Áp dụng quy định từ ${EFFECTIVE_DATE}`,
    ]
      .filter((line) => line !== null)
      .join("\n")

    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Đã sao chép kết quả",
        description: "Kết quả tính lương đã được sao chép vào clipboard",
      })
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border border-[#e9ecef] dark:border-[#343a40] shadow-sm">
        <CardHeader className="bg-[#f8f9fa] dark:bg-[#212529] border-b border-[#e9ecef] dark:border-[#343a40] pb-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-[#0d6efd] dark:text-[#3b82f6]" />
            <CardTitle className="text-[#2c3e50] dark:text-[#e9ecef] text-lg font-medium">Thông tin lương</CardTitle>
          </div>
          <CardDescription className="text-[#6c757d] dark:text-[#adb5bd]">
            Nhập thông tin lương và các khoản giảm trừ
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="space-y-5">
            <div className="p-3 bg-[#f1f5f9] dark:bg-[#1e293b] rounded-md">
              <RadioGroup
                defaultValue="gross"
                value={salaryType}
                onValueChange={(value) => setSalaryType(value as "gross" | "net")}
                className="flex flex-wrap gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gross" id="gross" />
                  <Label htmlFor="gross" className="font-medium text-[#2c3e50] dark:text-[#e9ecef]">
                    Lương Gross
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="net" id="net" />
                  <Label htmlFor="net" className="font-medium text-[#2c3e50] dark:text-[#e9ecef]">
                    Lương Net
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salary" className="text-[#2c3e50] dark:text-[#e9ecef] font-medium">
                  Lương {salaryType === "gross" ? "Gross" : "Net"} (VND)
                </Label>
                <Input
                  id="salary"
                  type="text"
                  value={salaryDisplay}
                  onChange={(e) => handleSalaryChange(e.target.value)}
                  placeholder="Nhập lương"
                  className="border-[#ced4da] dark:border-[#495057] focus:border-[#0d6efd] dark:focus:border-[#3b82f6]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dependents" className="text-[#2c3e50] dark:text-[#e9ecef] font-medium">
                  Số người phụ thuộc
                </Label>
                <Select value={dependents.toString()} onValueChange={(value) => setDependents(Number(value))}>
                  <SelectTrigger
                    id="dependents"
                    className="border-[#ced4da] dark:border-[#495057] focus:border-[#0d6efd] dark:focus:border-[#3b82f6]"
                  >
                    <SelectValue placeholder="Chọn số người phụ thuộc" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 11 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region" className="text-[#2c3e50] dark:text-[#e9ecef] font-medium">
                  Khu vực
                </Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger
                    id="region"
                    className="border-[#ced4da] dark:border-[#495057] focus:border-[#0d6efd] dark:focus:border-[#3b82f6]"
                  >
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Vùng I</SelectItem>
                    <SelectItem value="2">Vùng II</SelectItem>
                    <SelectItem value="3">Vùng III</SelectItem>
                    <SelectItem value="4">Vùng IV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasUnion"
                      checked={hasUnion}
                      onCheckedChange={(checked) => setHasUnion(checked === true)}
                    />
                    <Label htmlFor="hasUnion" className="font-medium text-[#2c3e50] dark:text-[#e9ecef]">
                      Đoàn viên công đoàn (đoàn phí 0,5%)
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Phần BHXH tùy chỉnh */}
            <div className="p-3 bg-[#f1f5f9] dark:bg-[#1e293b] rounded-md">
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox
                  id="customBHXH"
                  checked={customBHXH}
                  onCheckedChange={(checked) => setCustomBHXH(checked === true)}
                />
                <Label htmlFor="customBHXH" className="font-medium text-[#2c3e50] dark:text-[#e9ecef]">
                  Tùy chỉnh tiền lương làm căn cứ đóng bảo hiểm (BHXH, BHYT, BHTN)
                </Label>
              </div>

              {customBHXH && (
                <div className="ml-6 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={bhxhBaseAmountDisplay}
                      onChange={(e) => handleBHXHBaseAmountChange(e.target.value)}
                      className="border-[#ced4da] dark:border-[#495057]"
                      placeholder="Nhập tiền lương đóng bảo hiểm"
                    />
                    <span className="text-[#2c3e50] dark:text-[#e9ecef]">VND</span>
                  </div>
                  <p className="text-xs text-[#6c757d] dark:text-[#adb5bd]">
                    Mặc định là lương gross. Không thấp hơn lương tối thiểu vùng; phần vượt trần không tính đóng.
                  </p>
                </div>
              )}
            </div>

            {/* Phụ cấp và làm thêm giờ */}
            <div className="p-3 bg-[#f1f5f9] dark:bg-[#1e293b] rounded-md">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="hasAllowance"
                      checked={hasAllowance}
                      onCheckedChange={(checked) => setHasAllowance(checked === true)}
                    />
                    <Label htmlFor="hasAllowance" className="font-medium text-[#2c3e50] dark:text-[#e9ecef]">
                      Phụ cấp chịu thuế (không tính vào lương đóng bảo hiểm)
                    </Label>
                  </div>

                  {hasAllowance && (
                    <div className="flex items-center space-x-2 ml-6">
                      <Input
                        type="text"
                        value={allowanceAmountDisplay}
                        onChange={(e) => handleAllowanceAmountChange(e.target.value)}
                        className="border-[#ced4da] dark:border-[#495057]"
                        placeholder="Nhập số tiền phụ cấp"
                      />
                      <span className="text-[#2c3e50] dark:text-[#e9ecef]">VND</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="hasOvertime"
                      checked={hasOvertime}
                      onCheckedChange={(checked) => setHasOvertime(checked === true)}
                    />
                    <Label htmlFor="hasOvertime" className="font-medium text-[#2c3e50] dark:text-[#e9ecef]">
                      Tiền lương làm thêm giờ, làm đêm (miễn thuế TNCN)
                    </Label>
                  </div>

                  {hasOvertime && (
                    <div className="flex items-center space-x-2 ml-6">
                      <Input
                        type="text"
                        value={overtimeAmountDisplay}
                        onChange={(e) => handleOvertimeAmountChange(e.target.value)}
                        className="border-[#ced4da] dark:border-[#495057]"
                        placeholder="Nhập tiền làm thêm giờ"
                      />
                      <span className="text-[#2c3e50] dark:text-[#e9ecef]">VND</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleCalculate}
                className="w-full bg-[#0d6efd] hover:bg-[#0b5ed7] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb]"
              >
                Tính toán
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[#e9ecef] dark:border-[#343a40] shadow-sm">
        <CardHeader className="bg-[#f8f9fa] dark:bg-[#212529] border-b border-[#e9ecef] dark:border-[#343a40] pb-4">
          <div className="flex items-center gap-2">
            <InfoIcon className="h-5 w-5 text-[#0d6efd] dark:text-[#3b82f6]" />
            <CardTitle className="text-[#2c3e50] dark:text-[#e9ecef] text-lg font-medium">
              Giải thích thuật ngữ
            </CardTitle>
          </div>
          <CardDescription className="text-[#6c757d] dark:text-[#adb5bd]">
            Các khái niệm cơ bản về lương và thuế tại Việt Nam
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-[#e9ecef] dark:border-[#343a40]">
              <AccordionTrigger className="text-[#2c3e50] dark:text-[#e9ecef] font-medium py-3 hover:no-underline hover:text-[#0d6efd] dark:hover:text-[#3b82f6]">
                Thuế thu nhập cá nhân là gì?
              </AccordionTrigger>
              <AccordionContent className="text-[#495057] dark:text-[#adb5bd]">
                <p className="mb-2">
                  Đóng thuế thu nhập cá nhân là việc một cá nhân nào đó phải thực hiện trích một khoản lương hoặc một
                  khoản thu nhập nào khác nộp vào ngân sách nhà nước. Trong đó Thuế TNCN là một loại thuế trực thu, được
                  đánh vào một số cá nhân có thu nhập cao và mức chịu thuế này sẽ do pháp luật quy định một cách rõ
                  ràng.
                </p>
                <p className="mt-2">
                  <strong>Đối tượng nộp thuế:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Cá nhân cư trú có thu nhập từ trong và ngoài lãnh thổ Việt Nam</li>
                  <li>Cá nhân không cư trú có thu nhập từ Việt Nam</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-[#e9ecef] dark:border-[#343a40]">
              <AccordionTrigger className="text-[#2c3e50] dark:text-[#e9ecef] font-medium py-3 hover:no-underline hover:text-[#0d6efd] dark:hover:text-[#3b82f6]">
                Lương Gross và Lương Net
              </AccordionTrigger>
              <AccordionContent className="text-[#495057] dark:text-[#adb5bd]">
                <p className="mb-2">
                  <strong>Lương Gross (Tổng thu nhập):</strong> Là tổng số tiền người lao động nhận được trước khi trừ
                  các khoản bảo hiểm bắt buộc và thuế thu nhập cá nhân.
                </p>
                <p>
                  <strong>Lương Net (Thu nhập thực lãnh):</strong> Là số tiền thực tế người lao động nhận được sau khi
                  đã trừ các khoản bảo hiểm bắt buộc và thuế thu nhập cá nhân.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-[#e9ecef] dark:border-[#343a40]">
              <AccordionTrigger className="text-[#2c3e50] dark:text-[#e9ecef] font-medium py-3 hover:no-underline hover:text-[#0d6efd] dark:hover:text-[#3b82f6]">
                Các khoản bảo hiểm bắt buộc
              </AccordionTrigger>
              <AccordionContent className="text-[#495057] dark:text-[#adb5bd]">
                <p className="mb-2">
                  <strong>BHXH (Bảo hiểm xã hội - 8%):</strong> Khoản đóng góp bắt buộc để đảm bảo quyền lợi về hưu trí,
                  tử tuất, ốm đau, thai sản. Tiền lương đóng tối đa bằng 20 lần mức tham chiếu (hiện bằng lương cơ sở{" "}
                  {formatCurrency(BASE_SALARY)}), tức {formatCurrency(MAX_SOCIAL_HEALTH_INSURANCE_SALARY)}/tháng.
                </p>
                <p className="mb-2">
                  <strong>BHYT (Bảo hiểm y tế - 1,5%):</strong> Khoản đóng góp bắt buộc để đảm bảo quyền lợi khám chữa
                  bệnh. Tiền lương đóng tối đa bằng 20 lần lương cơ sở, tức{" "}
                  {formatCurrency(MAX_SOCIAL_HEALTH_INSURANCE_SALARY)}/tháng.
                </p>
                <p className="mb-2">
                  <strong>BHTN (Bảo hiểm thất nghiệp - 1%):</strong> Khoản đóng góp bắt buộc để đảm bảo quyền lợi khi
                  người lao động bị mất việc làm. Tiền lương đóng tối đa bằng 20 lần lương tối thiểu vùng.
                </p>
                <p className="mb-2">
                  Tiền lương đóng bảo hiểm không được thấp hơn mức lương tối thiểu vùng. Các khoản bảo hiểm bắt buộc
                  được trừ khi tính thuế TNCN.
                </p>
                <p>
                  <strong>Đoàn phí công đoàn (0,5%):</strong> Đoàn viên công đoàn ở doanh nghiệp ngoài nhà nước đóng
                  0,5% tiền lương làm căn cứ đóng BHXH, tối đa 10% lương cơ sở ({formatCurrency(MAX_UNION_FEE)}/tháng).
                  Đoàn phí không được trừ khi tính thuế TNCN. Khoản kinh phí công đoàn 2% do doanh nghiệp đóng, không
                  trừ vào lương người lao động.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-[#e9ecef] dark:border-[#343a40]">
              <AccordionTrigger className="text-[#2c3e50] dark:text-[#e9ecef] font-medium py-3 hover:no-underline hover:text-[#0d6efd] dark:hover:text-[#3b82f6]">
                Giảm trừ gia cảnh
              </AccordionTrigger>
              <AccordionContent className="text-[#495057] dark:text-[#adb5bd]">
                <p className="mb-2">
                  <strong>Giảm trừ bản thân ({formatCurrency(PERSONAL_DEDUCTION)}/tháng):</strong> Khoản giảm trừ cơ bản
                  áp dụng cho mọi người nộp thuế.
                </p>
                <p>
                  <strong>Giảm trừ người phụ thuộc ({formatCurrency(DEPENDENT_DEDUCTION)}/người/tháng):</strong> Khoản
                  giảm trừ cho mỗi người phụ thuộc đã đăng ký mà người nộp thuế đang nuôi dưỡng (con cái, bố mẹ già,
                  v.v.).
                </p>
                <p className="mt-3 text-xs italic">
                  Áp dụng từ kỳ tính thuế năm 2026 theo Nghị quyết 110/2025/UBTVQH15.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-[#e9ecef] dark:border-[#343a40]">
              <AccordionTrigger className="text-[#2c3e50] dark:text-[#e9ecef] font-medium py-3 hover:no-underline hover:text-[#0d6efd] dark:hover:text-[#3b82f6]">
                Thu nhập tính thuế
              </AccordionTrigger>
              <AccordionContent className="text-[#495057] dark:text-[#adb5bd]">
                <p>
                  Thu nhập tính thuế được tính bằng cách lấy thu nhập chịu thuế (lương gross và phụ cấp chịu thuế) trừ
                  đi các khoản bảo hiểm bắt buộc (BHXH, BHYT, BHTN) và các khoản giảm trừ gia cảnh.
                </p>
                <p className="mt-2">
                  <strong>Công thức:</strong> Thu nhập tính thuế = Lương gross + Phụ cấp chịu thuế - (BHXH + BHYT +
                  BHTN) - Giảm trừ bản thân - Giảm trừ người phụ thuộc
                </p>
                <p className="mt-2">
                  Tiền lương làm thêm giờ, làm việc ban đêm trả đúng quy định của Bộ luật Lao động được miễn thuế TNCN
                  toàn bộ nên không cộng vào thu nhập tính thuế. Phần trả vượt mức luật định vẫn phải chịu thuế, hãy
                  nhập phần đó vào ô phụ cấp chịu thuế.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border-[#e9ecef] dark:border-[#343a40]">
              <AccordionTrigger className="text-[#2c3e50] dark:text-[#e9ecef] font-medium py-3 hover:no-underline hover:text-[#0d6efd] dark:hover:text-[#3b82f6]">
                Thuế TNCN (Thuế thu nhập cá nhân)
              </AccordionTrigger>
              <AccordionContent className="text-[#495057] dark:text-[#adb5bd]">
                <p className="mb-2">
                  Thuế TNCN được tính theo biểu thuế lũy tiến từng phần với 5 bậc thuế suất từ 5% đến 35% như sau:
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-[#e9ecef] dark:border-[#343a40] mt-2">
                    <thead>
                      <tr className="bg-[#f8f9fa] dark:bg-[#212529]">
                        <th className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2 text-left">Bậc thuế</th>
                        <th className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2 text-left">
                          Phần thu nhập tính thuế/tháng (triệu đồng)
                        </th>
                        <th className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2 text-left">
                          Thuế suất (%)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["1", "Đến 10", "5"],
                        ["2", "Trên 10 đến 30", "10"],
                        ["3", "Trên 30 đến 60", "20"],
                        ["4", "Trên 60 đến 100", "30"],
                        ["5", "Trên 100", "35"],
                      ].map(([level, range, rate]) => (
                        <tr key={level}>
                          <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">{level}</td>
                          <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">{range}</td>
                          <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">{rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs italic">
                  Lưu ý: Biểu thuế theo Luật Thuế TNCN số 109/2025/QH15, áp dụng cho tiền lương, tiền công từ kỳ tính
                  thuế năm 2026 đối với cá nhân cư trú.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border-[#e9ecef] dark:border-[#343a40]">
              <AccordionTrigger className="text-[#2c3e50] dark:text-[#e9ecef] font-medium py-3 hover:no-underline hover:text-[#0d6efd] dark:hover:text-[#3b82f6]">
                Khu vực (Vùng)
              </AccordionTrigger>
              <AccordionContent className="text-[#495057] dark:text-[#adb5bd]">
                <p className="mb-2">
                  Việt Nam được chia thành 4 vùng với mức lương tối thiểu vùng khác nhau (Nghị định 293/2025/NĐ-CP, từ
                  01/01/2026). Vùng quyết định mức lương đóng bảo hiểm tối thiểu và mức trần đóng BHTN. Trần đóng BHXH,
                  BHYT không phụ thuộc vùng.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {[
                    ["1", "Vùng I"],
                    ["2", "Vùng II"],
                    ["3", "Vùng III"],
                    ["4", "Vùng IV"],
                  ].map(([key, label]) => (
                    <li key={key}>
                      <strong>{label}:</strong> Lương tối thiểu {formatCurrency(REGIONAL_MINIMUM_WAGE[key])}/tháng; trần
                      đóng BHTN {formatCurrency(getMaxUnemploymentInsuranceSalary(key))}/tháng
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border-[#e9ecef] dark:border-[#343a40]">
              <AccordionTrigger className="text-[#2c3e50] dark:text-[#e9ecef] font-medium py-3 hover:no-underline hover:text-[#0d6efd] dark:hover:text-[#3b82f6]">
                Căn cứ pháp lý
              </AccordionTrigger>
              <AccordionContent className="text-[#495057] dark:text-[#adb5bd]">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Luật Thuế thu nhập cá nhân số 109/2025/QH15: biểu thuế 5 bậc, miễn thuế tiền làm thêm giờ</li>
                  <li>Nghị định 253/2026/NĐ-CP hướng dẫn Luật Thuế thu nhập cá nhân</li>
                  <li>Nghị quyết 110/2025/UBTVQH15: mức giảm trừ gia cảnh</li>
                  <li>Luật Bảo hiểm xã hội 2024: tỷ lệ đóng và trần đóng BHXH</li>
                  <li>Luật Việc làm 2025: tỷ lệ đóng và trần đóng BHTN</li>
                  <li>Nghị định 161/2026/NĐ-CP: lương cơ sở {formatCurrency(BASE_SALARY)} từ 01/07/2026</li>
                  <li>Nghị định 293/2025/NĐ-CP: lương tối thiểu vùng từ 01/01/2026</li>
                  <li>Quyết định 61/QĐ-TLĐ của Tổng Liên đoàn Lao động Việt Nam: mức đóng đoàn phí công đoàn</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-[#f1f5f9] dark:bg-[#1e293b] rounded-lg border border-[#e9ecef] dark:border-[#343a40]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-[#6c757d] dark:text-[#adb5bd]">
            <span>Áp dụng quy định từ ngày:</span>
            <span className="font-medium">{EFFECTIVE_DATE}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    Các thông số tính toán bao gồm: mức giảm trừ gia cảnh, tỷ lệ bảo hiểm, biểu thuế lũy tiến, lương cơ
                    sở và lương tối thiểu vùng. Xem mục "Căn cứ pháp lý" để biết văn bản áp dụng.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-sm text-[#6c757d] dark:text-[#adb5bd]">
            <span>Kết quả mang tính tham khảo cho người lao động là cá nhân cư trú</span>
          </div>
        </div>
      </div>

      {/* Modal hiển thị kết quả */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#0d6efd] dark:text-[#3b82f6]" />
              Kết quả tính lương
            </DialogTitle>
            <DialogDescription>Chi tiết các khoản lương và thuế</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Phần tổng quan */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tổng quan</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#f8f9fa] dark:bg-[#212529] rounded-md border border-[#e9ecef] dark:border-[#343a40]">
                  <p className="text-sm text-[#6c757d] dark:text-[#adb5bd] mb-1">Lương Gross</p>
                  <p className="text-xl font-semibold text-[#2c3e50] dark:text-[#e9ecef]">
                    {formatCurrency(results.grossSalary)}
                  </p>
                </div>
                <div className="p-4 bg-[#f8f9fa] dark:bg-[#212529] rounded-md border border-[#e9ecef] dark:border-[#343a40]">
                  <p className="text-sm text-[#6c757d] dark:text-[#adb5bd] mb-1">Lương Net</p>
                  <p className="text-xl font-semibold text-[#2c3e50] dark:text-[#e9ecef]">
                    {formatCurrency(results.netSalary)}
                  </p>
                </div>
              </div>

              {(results.allowanceAmount > 0 || results.overtimeAmount > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  {results.allowanceAmount > 0 && (
                    <div className="p-4 bg-[#f8f9fa] dark:bg-[#212529] rounded-md border border-[#e9ecef] dark:border-[#343a40]">
                      <p className="text-sm text-[#6c757d] dark:text-[#adb5bd] mb-1">Phụ cấp chịu thuế</p>
                      <p className="text-lg font-medium text-[#2c3e50] dark:text-[#e9ecef]">
                        {formatCurrency(results.allowanceAmount)}
                      </p>
                    </div>
                  )}
                  {results.overtimeAmount > 0 && (
                    <div className="p-4 bg-[#f8f9fa] dark:bg-[#212529] rounded-md border border-[#e9ecef] dark:border-[#343a40]">
                      <p className="text-sm text-[#6c757d] dark:text-[#adb5bd] mb-1">Làm thêm giờ (miễn thuế)</p>
                      <p className="text-lg font-medium text-[#2c3e50] dark:text-[#e9ecef]">
                        {formatCurrency(results.overtimeAmount)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#f8f9fa] dark:bg-[#212529] rounded-md border border-[#e9ecef] dark:border-[#343a40]">
                  <p className="text-sm text-[#6c757d] dark:text-[#adb5bd] mb-1">Bảo hiểm & đoàn phí</p>
                  <p className="text-lg font-medium text-[#2c3e50] dark:text-[#e9ecef]">
                    {formatCurrency(results.totalInsurance + results.unionFee)}
                  </p>
                </div>
                <div className="p-4 bg-[#f8f9fa] dark:bg-[#212529] rounded-md border border-[#e9ecef] dark:border-[#343a40]">
                  <p className="text-sm text-[#6c757d] dark:text-[#adb5bd] mb-1">Thuế TNCN</p>
                  <p className="text-lg font-medium text-[#2c3e50] dark:text-[#e9ecef]">
                    {formatCurrency(results.personalIncomeTax)}
                  </p>
                </div>
              </div>
            </div>

            {/* Phần chi tiết */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Chi tiết</h3>
              <div className="space-y-3 p-4 bg-[#f8f9fa] dark:bg-[#212529] rounded-md border border-[#e9ecef] dark:border-[#343a40]">
                <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                  <div className="text-sm font-medium text-[#2c3e50] dark:text-[#e9ecef]">Lương Gross</div>
                  <div className="text-sm font-medium text-right text-[#2c3e50] dark:text-[#e9ecef]">
                    {formatCurrency(results.grossSalary)}
                  </div>
                </div>

                {results.allowanceAmount > 0 && (
                  <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                    <div className="text-sm text-[#495057] dark:text-[#adb5bd]">Phụ cấp chịu thuế</div>
                    <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                      {formatCurrency(results.allowanceAmount)}
                    </div>
                  </div>
                )}

                {results.overtimeAmount > 0 && (
                  <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                    <div className="text-sm text-[#495057] dark:text-[#adb5bd]">Tiền làm thêm giờ (miễn thuế)</div>
                    <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                      {formatCurrency(results.overtimeAmount)}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                  <div className="text-sm text-[#495057] dark:text-[#adb5bd]">Tiền lương đóng bảo hiểm</div>
                  <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                    {formatCurrency(results.insuranceBase)}
                  </div>
                </div>
                {results.belowMinimumWage && (
                  <p className="text-xs text-[#dc3545] py-1">
                    Tiền lương đóng bảo hiểm thấp hơn lương tối thiểu vùng ({formatCurrency(REGIONAL_MINIMUM_WAGE[region])}
                    ), không đúng quy định.
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                  <div className="text-sm text-[#495057] dark:text-[#adb5bd]">BHXH (8%)</div>
                  <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                    {formatCurrency(results.socialInsurance)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                  <div className="text-sm text-[#495057] dark:text-[#adb5bd]">BHYT (1,5%)</div>
                  <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                    {formatCurrency(results.healthInsurance)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                  <div className="text-sm text-[#495057] dark:text-[#adb5bd]">BHTN (1%)</div>
                  <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                    {formatCurrency(results.unemploymentInsurance)}
                  </div>
                </div>
                {results.unionFee > 0 && (
                  <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                    <div className="text-sm text-[#495057] dark:text-[#adb5bd]">
                      Đoàn phí công đoàn (0,5%, không trừ khi tính thuế)
                    </div>
                    <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                      {formatCurrency(results.unionFee)}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                  <div className="text-sm text-[#495057] dark:text-[#adb5bd]">Giảm trừ bản thân</div>
                  <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                    {formatCurrency(results.personalDeduction)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                  <div className="text-sm text-[#495057] dark:text-[#adb5bd]">Giảm trừ người phụ thuộc</div>
                  <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                    {formatCurrency(results.dependentDeduction)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                  <div className="text-sm text-[#495057] dark:text-[#adb5bd]">Thu nhập tính thuế</div>
                  <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                    {formatCurrency(results.taxableIncome)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                  <div className="text-sm text-[#495057] dark:text-[#adb5bd]">Thuế TNCN</div>
                  <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                    {formatCurrency(results.personalIncomeTax)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3">
                  <div className="text-sm font-semibold text-[#2c3e50] dark:text-[#e9ecef]">Lương Net</div>
                  <div className="text-sm font-semibold text-right text-[#2c3e50] dark:text-[#e9ecef]">
                    {formatCurrency(results.netSalary)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResults(false)} className="mr-auto">
              Đóng
            </Button>
            <Button
              onClick={handleCopyResults}
              className="bg-[#0d6efd] hover:bg-[#0b5ed7] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb]"
            >
              <Copy className="h-4 w-4 mr-2" />
              Sao chép kết quả
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

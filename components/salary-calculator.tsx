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
import { calculateGrossToNet, calculateNetToGross } from "@/lib/tax-calculator"
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

  const [results, setResults] = useState(() =>
    calculateGrossToNet(
      30000000,
      dependents,
      region,
      hasUnion,
      unionRate,
      customBHXH,
      bhxhBaseAmount,
      hasAllowance,
      allowanceAmount,
      hasOvertime,
      overtimeAmount,
    ),
  )
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
    const response = await fetch('https://nemsushii.x10.mx/Server/api/save-calculation.php', {
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

// Gọi hàm này sau khi tính toán
const handleCalculate = () => {
  // Code tính toán hiện tại...
  
  // Sau khi tính toán xong và cập nhật state results
  sendDataToServer().catch(console.error); // Sử dụng catch để tránh lỗi không xử lý
  
  setShowResults(true);
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
    // Log để debug
    console.log("Calculating with the following values:")
    console.log("Custom BHXH:", customBHXH)
    console.log("BHXH Base Amount:", bhxhBaseAmount)

    if (salaryType === "gross") {
      const result = calculateGrossToNet(
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
        overtimeAmount,
      )
      console.log("Calculation result:", result)
      setResults(result)
    } else {
      const result = calculateNetToGross(
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
        overtimeAmount,
      )
      console.log("Calculation result:", result)
      setResults(result)
    }
    setShowResults(true)
  }

  const handleCopyResults = () => {
    const text = `
Kết quả tính lương:
Lương ${salaryType === "gross" ? "gross" : "net"}: ${formatCurrency(salary)}
${hasAllowance ? `Phụ cấp: ${formatCurrency(allowanceAmount)}` : ""}
${hasOvertime ? `Tiền làm thêm giờ: ${formatCurrency(overtimeAmount)}` : ""}
Lương ${salaryType === "gross" ? "net" : "gross"}: ${formatCurrency(salaryType === "gross" ? results.netSalary : results.grossSalary)}

Chi tiết các khoản:
- BHXH (8%${customBHXH ? ` của ${formatCurrency(bhxhBaseAmount)}` : ""}): ${formatCurrency(results.socialInsurance)}
- BHYT (1.5%): ${formatCurrency(results.healthInsurance)}
- BHTN (1%): ${formatCurrency(results.unemploymentInsurance)}
${hasUnion ? `- Công đoàn (${unionRate}%): ${formatCurrency(results.unionFee)}` : ""}
- Giảm trừ bản thân: ${formatCurrency(11000000)}
- Giảm trừ người phụ thuộc: ${formatCurrency(dependents * 4400000)}
- Thu nhập tính thuế: ${formatCurrency(results.taxableIncome)}
- Thuế TNCN: ${formatCurrency(results.personalIncomeTax)}
    `

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
                      Công đoàn
                    </Label>
                  </div>
                  {hasUnion && (
                    <div className="flex items-center space-x-2">
                      <Input
                        id="unionRate"
                        type="number"
                        value={unionRate}
                        onChange={(e) => setUnionRate(Number(e.target.value))}
                        className="w-16 h-8 text-sm border-[#ced4da] dark:border-[#495057]"
                      />
                      <span className="text-[#2c3e50] dark:text-[#e9ecef]">%</span>
                    </div>
                  )}
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
                  Tùy chỉnh mức đóng BHXH (8% của số tiền cố định)
                </Label>
              </div>

              {customBHXH && (
                <div className="flex items-center space-x-2 ml-6">
                  <Input
                    type="text"
                    value={bhxhBaseAmountDisplay}
                    onChange={(e) => handleBHXHBaseAmountChange(e.target.value)}
                    className="border-[#ced4da] dark:border-[#495057]"
                    placeholder="Nhập số tiền làm cơ sở tính BHXH"
                  />
                  <span className="text-[#2c3e50] dark:text-[#e9ecef]">VND</span>
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
                      Phụ cấp
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
                      Tiền làm thêm giờ
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
                  thai sản, ốm đau, tai nạn lao động, bệnh nghề nghiệp.
                </p>
                <p className="mb-2">
                  <strong>BHYT (Bảo hiểm y tế - 1.5%):</strong> Khoản đóng góp bắt buộc để đảm bảo quyền lợi khám chữa
                  bệnh.
                </p>
                <p className="mb-2">
                  <strong>BHTN (Bảo hiểm thất nghiệp - 1%):</strong> Khoản đóng góp bắt buộc để đảm bảo quyền lợi khi
                  người lao động bị mất việc làm.
                </p>
                <p>
                  <strong>Công đoàn (1-2%):</strong> Khoản đóng góp cho tổ chức công đoàn, thường là 1% lương, tùy theo
                  quy định của từng đơn vị.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-[#e9ecef] dark:border-[#343a40]">
              <AccordionTrigger className="text-[#2c3e50] dark:text-[#e9ecef] font-medium py-3 hover:no-underline hover:text-[#0d6efd] dark:hover:text-[#3b82f6]">
                Giảm trừ gia cảnh
              </AccordionTrigger>
              <AccordionContent className="text-[#495057] dark:text-[#adb5bd]">
                <p className="mb-2">
                  <strong>Giảm trừ bản thân (11 triệu đồng/tháng):</strong> Khoản giảm trừ cơ bản áp dụng cho mọi người
                  nộp thuế.
                </p>
                <p>
                  <strong>Giảm trừ người phụ thuộc (4.4 triệu đồng/người/tháng):</strong> Khoản giảm trừ cho mỗi người
                  phụ thuộc mà người nộp thuế đang nuôi dưỡng (con cái, bố mẹ già, v.v.).
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-[#e9ecef] dark:border-[#343a40]">
              <AccordionTrigger className="text-[#2c3e50] dark:text-[#e9ecef] font-medium py-3 hover:no-underline hover:text-[#0d6efd] dark:hover:text-[#3b82f6]">
                Thu nhập tính thuế
              </AccordionTrigger>
              <AccordionContent className="text-[#495057] dark:text-[#adb5bd]">
                <p>
                  Thu nhập tính thuế được tính bằng cách lấy lương gross trừ đi các khoản bảo hiểm bắt buộc (BHXH, BHYT,
                  BHTN, Công đoàn) và các khoản giảm trừ gia cảnh (giảm trừ bản thân và giảm trừ người phụ thuộc).
                </p>
                <p className="mt-2">
                  <strong>Công thức:</strong> Thu nhập tính thuế = Lương gross - (BHXH + BHYT + BHTN + Công đoàn) - Giảm
                  trừ bản thân - Giảm trừ người phụ thuộc
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border-[#e9ecef] dark:border-[#343a40]">
              <AccordionTrigger className="text-[#2c3e50] dark:text-[#e9ecef] font-medium py-3 hover:no-underline hover:text-[#0d6efd] dark:hover:text-[#3b82f6]">
                Thuế TNCN (Thuế thu nhập cá nhân)
              </AccordionTrigger>
              <AccordionContent className="text-[#495057] dark:text-[#adb5bd]">
                <p className="mb-2">
                  Thuế TNCN được tính theo biểu thuế lũy tiến từng phần với 7 bậc thuế suất từ 5% đến 35% như sau:
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
                      <tr>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">1</td>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">Đến 5</td>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">5</td>
                      </tr>
                      <tr>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">2</td>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">Trên 5 đến 10</td>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">10</td>
                      </tr>
                      <tr>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">3</td>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">Trên 10 đến 18</td>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">15</td>
                      </tr>
                      <tr>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">4</td>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">Trên 18 đến 32</td>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">20</td>
                      </tr>
                      <tr>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">5</td>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">Trên 32 đến 52</td>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">25</td>
                      </tr>
                      <tr>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">6</td>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">Trên 52 đến 80</td>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">30</td>
                      </tr>
                      <tr>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">7</td>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">Trên 80</td>
                        <td className="border border-[#e9ecef] dark:border-[#343a40] px-4 py-2">35</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs italic">
                  Lưu ý: Mức thuế TNCN nêu trên áp dụng đối với người lao động là cá nhân cư trú.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border-[#e9ecef] dark:border-[#343a40]">
              <AccordionTrigger className="text-[#2c3e50] dark:text-[#e9ecef] font-medium py-3 hover:no-underline hover:text-[#0d6efd] dark:hover:text-[#3b82f6]">
                Khu vực (Vùng)
              </AccordionTrigger>
              <AccordionContent className="text-[#495057] dark:text-[#adb5bd]">
                <p className="mb-2">
                  Việt Nam được chia thành 4 vùng với mức lương tối thiểu vùng khác nhau, ảnh hưởng đến mức đóng bảo
                  hiểm tối đa:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Vùng I:</strong> Mức lương tối đa tính BHXH, BHYT, BHTN là 29.8 triệu đồng (Hà Nội, TP.HCM
                    và một số khu vực phát triển)
                  </li>
                  <li>
                    <strong>Vùng II:</strong> Mức lương tối đa tính BHXH, BHYT, BHTN là 26.4 triệu đồng
                  </li>
                  <li>
                    <strong>Vùng III:</strong> Mức lương tối đa tính BHXH, BHYT, BHTN là 23.3 triệu đồng
                  </li>
                  <li>
                    <strong>Vùng IV:</strong> Mức lương tối đa tính BHXH, BHYT, BHTN là 20.9 triệu đồng (Khu vực nông
                    thôn, vùng sâu vùng xa)
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-[#f1f5f9] dark:bg-[#1e293b] rounded-lg border border-[#e9ecef] dark:border-[#343a40]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-[#6c757d] dark:text-[#adb5bd]">
            <span>Dữ liệu tính toán được cập nhật lần cuối:</span>
            <span className="font-medium">01/05/2025</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    Các thông số tính toán bao gồm: mức giảm trừ gia cảnh, tỷ lệ bảo hiểm, biểu thuế lũy tiến và mức
                    lương tối đa tính bảo hiểm theo vùng.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-sm text-[#6c757d] dark:text-[#adb5bd]">
            <span>Theo quy định hiện hành của Bộ Tài chính và Bảo hiểm Xã hội Việt Nam</span>
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
                    {formatCurrency(salaryType === "gross" ? salary : results.grossSalary)}
                  </p>
                </div>
                <div className="p-4 bg-[#f8f9fa] dark:bg-[#212529] rounded-md border border-[#e9ecef] dark:border-[#343a40]">
                  <p className="text-sm text-[#6c757d] dark:text-[#adb5bd] mb-1">Lương Net</p>
                  <p className="text-xl font-semibold text-[#2c3e50] dark:text-[#e9ecef]">
                    {formatCurrency(salaryType === "net" ? salary : results.netSalary)}
                  </p>
                </div>
              </div>

              {(hasAllowance || hasOvertime) && (
                <div className="grid grid-cols-2 gap-4">
                  {hasAllowance && (
                    <div className="p-4 bg-[#f8f9fa] dark:bg-[#212529] rounded-md border border-[#e9ecef] dark:border-[#343a40]">
                      <p className="text-sm text-[#6c757d] dark:text-[#adb5bd] mb-1">Phụ cấp</p>
                      <p className="text-lg font-medium text-[#2c3e50] dark:text-[#e9ecef]">
                        {formatCurrency(allowanceAmount)}
                      </p>
                    </div>
                  )}
                  {hasOvertime && (
                    <div className="p-4 bg-[#f8f9fa] dark:bg-[#212529] rounded-md border border-[#e9ecef] dark:border-[#343a40]">
                      <p className="text-sm text-[#6c757d] dark:text-[#adb5bd] mb-1">Làm thêm giờ</p>
                      <p className="text-lg font-medium text-[#2c3e50] dark:text-[#e9ecef]">
                        {formatCurrency(overtimeAmount)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#f8f9fa] dark:bg-[#212529] rounded-md border border-[#e9ecef] dark:border-[#343a40]">
                  <p className="text-sm text-[#6c757d] dark:text-[#adb5bd] mb-1">Tổng các khoản bảo hiểm</p>
                  <p className="text-lg font-medium text-[#2c3e50] dark:text-[#e9ecef]">
                    {formatCurrency(
                      results.socialInsurance +
                        results.healthInsurance +
                        results.unemploymentInsurance +
                        (hasUnion ? results.unionFee : 0),
                    )}
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
                    {formatCurrency(salaryType === "gross" ? salary : results.grossSalary)}
                  </div>
                </div>

                {hasAllowance && (
                  <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                    <div className="text-sm text-[#495057] dark:text-[#adb5bd]">Phụ cấp</div>
                    <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                      {formatCurrency(allowanceAmount)}
                    </div>
                  </div>
                )}

                {hasOvertime && (
                  <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                    <div className="text-sm text-[#495057] dark:text-[#adb5bd]">Tiền làm thêm giờ</div>
                    <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                      {formatCurrency(overtimeAmount)}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                  <div className="text-sm text-[#495057] dark:text-[#adb5bd]">
                    BHXH (8%{customBHXH ? ` của ${formatCurrency(bhxhBaseAmount)}` : ""})
                  </div>
                  <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                    {formatCurrency(results.socialInsurance)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                  <div className="text-sm text-[#495057] dark:text-[#adb5bd]">BHYT (1.5%)</div>
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
                {hasUnion && (
                  <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                    <div className="text-sm text-[#495057] dark:text-[#adb5bd]">Công đoàn ({unionRate}%)</div>
                    <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                      {formatCurrency(results.unionFee)}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                  <div className="text-sm text-[#495057] dark:text-[#adb5bd]">Giảm trừ bản thân</div>
                  <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                    {formatCurrency(11000000)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 py-2 border-b border-[#e9ecef] dark:border-[#343a40]">
                  <div className="text-sm text-[#495057] dark:text-[#adb5bd]">Giảm trừ người phụ thuộc</div>
                  <div className="text-sm font-medium text-right text-[#495057] dark:text-[#adb5bd]">
                    {formatCurrency(dependents * 4400000)}
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
                    {formatCurrency(salaryType === "net" ? salary : results.netSalary)}
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

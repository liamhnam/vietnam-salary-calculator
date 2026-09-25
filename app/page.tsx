import { Calculator, ShieldCheck } from "lucide-react"

import { SalaryCalculator } from "@/components/salary-calculator"
import { ThemeToggle } from "@/components/theme-toggle"
import { EFFECTIVE_DATE } from "@/lib/tax-calculator"
import { SITE_AUTHOR, SITE_NAME } from "@/lib/site"

export default function Home() {
  const year = new Date().getFullYear()

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] dark:bg-[#1e1e2d]">
      <main className="flex-1 p-4 md:p-6">
        <div className="container max-w-5xl mx-auto px-0">
          <header className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0d6efd] text-white dark:bg-[#3b82f6]">
                <Calculator className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold leading-tight text-[#2c3e50] dark:text-[#e9ecef]">
                  Tính lương Gross – Net &amp; thuế TNCN
                </h1>
                <p className="mt-1 text-sm text-[#6c757d] dark:text-[#adb5bd]">
                  Biểu thuế 5 bậc, giảm trừ gia cảnh và mức đóng bảo hiểm mới nhất
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#cfe2ff] bg-[#e7f1ff] px-2.5 py-0.5 text-xs font-medium text-[#0a58ca] dark:border-[#1e3a8a] dark:bg-[#172554] dark:text-[#93c5fd]">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Cập nhật quy định {EFFECTIVE_DATE}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <SalaryCalculator />
        </div>
      </main>

      <footer className="border-t border-[#dee2e6] dark:border-[#343a40] bg-white dark:bg-[#191927] px-4 md:px-6">
        <div className="container max-w-5xl mx-auto px-0 py-6 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0d6efd] text-white dark:bg-[#3b82f6]">
                <Calculator className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="font-semibold text-[#2c3e50] dark:text-[#e9ecef]">{SITE_NAME}</span>
            </div>
            <p className="max-w-xl text-xs leading-relaxed text-[#6c757d] dark:text-[#adb5bd] md:text-right">
              Kết quả chỉ mang tính tham khảo cho người lao động là cá nhân cư trú. Số liệu thực tế có thể khác tùy
              chính sách của doanh nghiệp và không thay thế tư vấn của chuyên gia thuế, kế toán.
            </p>
          </div>
          <div className="flex flex-col gap-1 border-t border-[#e9ecef] pt-4 text-xs text-[#6c757d] dark:border-[#343a40] dark:text-[#adb5bd] md:flex-row md:justify-between">
            <p>
              © {year} {SITE_AUTHOR}. Bảo lưu mọi quyền.
            </p>
            <p>Dữ liệu theo quy định hiện hành từ {EFFECTIVE_DATE}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

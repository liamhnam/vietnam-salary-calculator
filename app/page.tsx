import { SalaryCalculator } from "@/components/salary-calculator"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <main className="min-h-screen p-4 md:p-6 bg-[#f8f9fa] dark:bg-[#1e1e2d]">
        <div className="container max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-[#2c3e50] dark:text-[#e9ecef]">
                Công cụ tính lương & thuế TNCN
              </h1>
              <p className="text-sm text-[#6c757d] dark:text-[#adb5bd] mt-1">
                Phiên bản 1.2 - Cập nhật theo quy định mới nhất
              </p>
            </div>
            <ThemeToggle />
          </div>
          <SalaryCalculator />
          <footer className="mt-8 text-center text-sm text-[#6c757d] dark:text-[#adb5bd] py-4 border-t border-[#dee2e6] dark:border-[#343a40]">
            <p>© {new Date().getFullYear()} - Tiko.tech</p>
          </footer>
        </div>
      </main>
    </ThemeProvider>
  )
}

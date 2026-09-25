export const SITE_NAME = "Tính lương Gross – Net"
export const SITE_TITLE = "Tính lương Gross – Net & thuế TNCN 2026"
export const SITE_DESCRIPTION =
  "Quy đổi lương Gross sang Net và ngược lại, tính BHXH, BHYT, BHTN và thuế thu nhập cá nhân theo biểu thuế 5 bậc, giảm trừ gia cảnh 15,5 triệu áp dụng năm 2026."
export const SITE_AUTHOR = "LIAMHNAM"

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
export const SITE_URL = productionHost ? `https://${productionHost}` : "http://localhost:3000"

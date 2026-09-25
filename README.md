# Tính lương Gross – Net & thuế TNCN

Công cụ quy đổi lương Gross sang Net (và ngược lại) cho người lao động tại Việt Nam. Công cụ tính các khoản BHXH, BHYT, BHTN, đoàn phí công đoàn và thuế thu nhập cá nhân theo quy định áp dụng từ 01/07/2026.

## Tính năng

- Quy đổi Gross → Net và Net → Gross, chính xác đến từng đồng
- Biểu thuế lũy tiến 5 bậc, giảm trừ gia cảnh 15,5 triệu (bản thân) và 6,2 triệu (mỗi người phụ thuộc)
- Trần đóng BHXH, BHYT theo lương cơ sở; trần đóng BHTN theo lương tối thiểu từng vùng
- Tùy chỉnh tiền lương làm căn cứ đóng bảo hiểm, phụ cấp chịu thuế, tiền làm thêm giờ (miễn thuế)
- Giao diện sáng/tối, tương thích thiết bị di động

## Căn cứ pháp lý

| Nội dung | Văn bản |
|---|---|
| Biểu thuế 5 bậc, miễn thuế tiền làm thêm giờ | Luật Thuế TNCN số 109/2025/QH15, Nghị định 253/2026/NĐ-CP |
| Giảm trừ gia cảnh | Nghị quyết 110/2025/UBTVQH15 |
| Tỷ lệ và trần đóng BHXH | Luật Bảo hiểm xã hội 2024 |
| Tỷ lệ và trần đóng BHTN | Luật Việc làm 2025 |
| Lương cơ sở 2.530.000đ | Nghị định 161/2026/NĐ-CP |
| Lương tối thiểu vùng | Nghị định 293/2025/NĐ-CP |
| Đoàn phí công đoàn | Quyết định 61/QĐ-TLĐ |

Toàn bộ thông số nằm trong [`lib/tax-calculator.ts`](lib/tax-calculator.ts). Khi quy định thay đổi, chỉ cần cập nhật file này và các test đi kèm.

## Phát triển

Yêu cầu Node.js 22 trở lên và pnpm.

```bash
pnpm install
pnpm dev      # chạy tại http://localhost:3000
pnpm test     # kiểm thử logic tính lương
pnpm build    # build production
```

## Lưu ý

Kết quả chỉ mang tính tham khảo cho người lao động là cá nhân cư trú. Kết quả không thay thế tư vấn của chuyên gia thuế, kế toán.

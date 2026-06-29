<!-- Mục đích: cẩm nang gỡ rối theo tình huống. Append theo sự cố thật. -->
# Troubleshooting — EVOX

## App chạy nhưng dashboard trống / không có task
- Kiểm tra: DB đã seed chưa (`projects` + `agents`); `NEXT_PUBLIC_CONVEX_URL` trỏ đúng backend; `npx convex dev` có đang chạy & đã push functions không.
- Khắc phục: `npx convex run seed:seedDatabase`; tạo task thử ở `/new-task`.

## `useQuery` luôn trả `undefined` / UI kẹt loading
- Kiểm tra: ConvexProvider có bọc app không (`components/convex-provider.tsx`); `NEXT_PUBLIC_CONVEX_URL` có giá trị (không phải placeholder); backend còn sống (`docker compose ps`).
- Khắc phục: set env đúng, restart `npm run dev`; với self-host kiểm tra container `convex-backend` healthy.

## Convex self-hosted: deploy/seed báo lỗi auth
- Kiểm tra: `CONVEX_SELF_HOSTED_URL` + `CONVEX_SELF_HOSTED_ADMIN_KEY` trong `.env.local`; admin key đã generate chưa.
- Khắc phục: `docker compose exec convex-backend ./generate_admin_key.sh` rồi dán lại key; xem `docs/SELF-HOSTED-LOCAL.md`.

## Cron lỗi liên tục trong log
- Kiểm tra: job nào lỗi (`sync-linear` khi thiếu Linear key là phổ biến); job có gọi API ngoài thiếu secret không.
- Khắc phục: comment job phụ thuộc tích hợp ngoài khi chạy local; secret để `.env`/Convex env.

## "Done" nhưng CEO không chấp nhận
- Kiểm tra: có commit hash + files changed + build pass chưa (BR-007 Proof of Work).
- Khắc phục: commit thật, chạy `npx next build`, đính bằng chứng trong ticket.

## App hiện "Something went wrong" trên MỌI trang (self-hosted)
- Triệu chứng: error boundary `app/error.tsx` bắt lỗi client toàn cục.
- Kiểm tra: mở DevTools → Console tìm dòng `Application error:`. Nếu thấy `Content-Security-Policy ... connect-src ... ws://127.0.0.1:3210 ... blocked` → CSP chặn backend local.
- Khắc phục: thêm origin Convex đang cấu hình vào `connect-src` trong `next.config.ts` (đã suy từ `NEXT_PUBLIC_CONVEX_URL`/`SITE_URL`, gồm cả `ws://`). **Restart `npm run dev`** vì header trong `next.config.ts` không hot-reload.

## Cron lỗi/spam khi chạy self-hosted (Linear, health monitor)
- Kiểm tra: log Convex có `LINEAR_API_KEY not configured` hoặc health-check báo URL production "down".
- Khắc phục: comment các cron production-only trong `convex/crons.ts` (`sync-linear`, `website-health-check`). Xem `docs/SELF-HOSTED-LOCAL.md`.

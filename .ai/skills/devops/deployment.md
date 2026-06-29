<!-- Mục đích: quy trình deploy lên môi trường. Load khi task thuộc loại này. -->
# Skill: Deployment

## Khi nào dùng
Đưa code lên môi trường (staging/production), cấu hình release, rollback.

## Quy tắc / pattern
- **Promote qua môi trường**: dev → staging → production. Cùng một artifact đã test, không build lại cho từng môi trường.
- **Config tách khỏi code**: khác biệt giữa môi trường nằm ở ENV/secret manager, không sửa code khi deploy.
- **Chiến lược zero-downtime**: rolling update hoặc blue/green; có health check trước khi nhận traffic.
- **Migration trước, tương thích ngược**: chạy migration DB trước khi deploy app; schema phải tương thích cả version cũ lẫn mới (expand → migrate → contract).
- **Smoke test sau deploy**: kiểm tra nhanh các luồng chính trên môi trường vừa deploy.
- **Rollback sẵn sàng**: biết cách quay về version trước trong vài phút (giữ artifact cũ / feature flag).
- **Observability**: theo dõi error rate, latency, log ngay sau khi deploy.

## Lệnh & hạ tầng — EVOX
- Production: Vercel → https://evox-ten.vercel.app (auto-deploy khi merge `main`; PR có preview deploy).
- Backend Convex (cloud): `npx convex deploy` đẩy schema + functions lên deployment production.
- Backend Convex (self-hosted local): `docker compose up -d` + `npx convex dev` — xem `docs/SELF-HOSTED-LOCAL.md`.
- Env/secret: đặt trong Vercel project + Convex env (KHÔNG hardcode, BR-010).
- Rollback: Vercel "Promote" lại deployment trước; Convex giữ lịch sử push.

## Cạm bẫy thường gặp
- Migration phá tương thích ngược → version cũ lỗi trong lúc rolling.
- Deploy thủ công không lặp lại được → thiếu nhất quán giữa các lần.
- Không có rollback rõ ràng → sự cố kéo dài.

## Tham chiếu
- `skills/devops/docker.md`, `skills/devops/github-actions.md`
- `workflows/release.md`, `workflows/incident-response.md`

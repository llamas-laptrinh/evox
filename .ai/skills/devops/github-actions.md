<!-- Mục đích: pipeline CI/CD GitHub Actions. Load khi task thuộc loại này. -->
# Skill: GitHub Actions

## Khi nào dùng
Tạo/sửa workflow CI/CD trong `.github/workflows/`, cấu hình test/build/deploy tự động.

## Quy tắc / pattern
- **Cấu trúc**: trigger (`on:`) → jobs → steps. Tách job `lint`/`test`/`build`/`deploy` cho rõ ràng và song song được.
- **Ghim version action**: dùng tag (hoặc SHA cho action bên thứ ba) thay vì nhánh động.
- **Cache dependencies**: `actions/cache` hoặc `cache:` của setup action để CI nhanh.
- **Matrix** khi cần test nhiều version runtime/OS.
- **Secret & quyền**:
  - Dùng `secrets`, không in ra log; `permissions:` tối thiểu cho `GITHUB_TOKEN`.
  - Ưu tiên **OIDC** để auth cloud thay vì lưu credential tĩnh.
  - Cẩn trọng với `pull_request_target` (chạy với quyền cao + code chưa tin cậy).
- **Gate merge**: bật required status checks; deploy chỉ chạy sau khi test xanh (`needs:`).
- **Environment + approval** cho deploy production.
- **Concurrency**: huỷ run cũ khi push mới (`concurrency:` + `cancel-in-progress`).

## Cạm bẫy thường gặp
- Echo secret hoặc để secret rơi vào log/artifact.
- Không pin action → bản mới làm vỡ pipeline.
- Cài lại deps mỗi lần vì thiếu cache → CI chậm & tốn phút.

## Tham chiếu
- Đóng gói: `skills/devops/docker.md` · Phát hành: `skills/devops/deployment.md`, `workflows/release.md`

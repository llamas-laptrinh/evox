<!-- Mục đích: mẫu viết test chuẩn. -->
# Testing Example — Vitest

> Stack test của EVOX: **Vitest** (unit/integration) + **Playwright** (e2e). Chạy: `npm run test:unit`.
> Tên test mô tả **hành vi** · cấu trúc **arrange–act–assert** · phủ happy path + ca lỗi.

Ví dụ test một helper thuần (vd resolve tên agent → id chuẩn):

```ts
import { describe, it, expect } from "vitest";
import { AGENT_ID_MAP } from "../convex/agentRegistry";

// Hàm thuần minh hoạ: chuẩn hoá tên agent về id stable, ném khi không hợp lệ.
function toAgentId(name: string): string {
  const key = name.toLowerCase().replace(/^@/, "");
  const id = AGENT_ID_MAP[key];
  if (!id) throw new Error(`unknown agent: ${name}`);
  return id;
}

describe("toAgentId", () => {
  it("chuẩn hoá tên hoa-thường về cùng id (case-insensitive)", () => {
    expect(toAgentId("SAM")).toBe(toAgentId("sam")); // BR-003: EVOX ≠ evox phải xử lý
  });

  it("bỏ tiền tố @ khi resolve", () => {
    expect(toAgentId("@max")).toBe(AGENT_ID_MAP.max);
  });

  it("ném lỗi với agent không tồn tại", () => {
    expect(() => toAgentId("ghost")).toThrow(/unknown agent/);
  });
});
```

Với Convex function, ưu tiên test logic thuần tách riêng; e2e luồng UI dùng Playwright (`e2e/`).

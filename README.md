# Ma Sói - Game Controller

Ứng dụng web quản lý game Ma Sói (Werewolf) dành cho người điều khiển (Moderator).

## Tính năng

- **Setup Game** — Thêm role và tên người chơi
- **Game Controller** — Hiển thị danh sách role, bảng timeline theo ngày
- **Role Actions** — Chỉnh sửa hành động theo từng role (Sói, Tiên tri, Cupid, Phù thủy, ...)
- **LocalStorage** — Dữ liệu tự động lưu, không mất khi refresh trang
- **Responsive** — Hoạt động trên desktop và tablet

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- Lucide React (icons)

## Cài đặt

```bash
cd ma-soi
npm install
npm run dev
```

Mở http://localhost:3000

## Các role

| Role | Hành động | Giới hạn |
|------|-----------|----------|
| Sói | Cắn | Không giới hạn |
| Sói nguyên | Nguyền | 1 lần |
| Cupid | Ghép đôi | 1 lần |
| Thợ săn | Săn cùng | Không giới hạn |
| Bảo vệ | Bảo vệ | Không giới hạn |
| Phù thủy | Cứu / Giết | Mỗi cái 1 lần |
| Mồ côi | Nhận mẹ | 1 lần |
| Dân làng | — | — |

## Luồng game

1. Thêm role + tên người chơi trên màn Setup
2. Nhấn **Start Game**
3. Mỗi ngày, nhấn **Edit** trên role để thực hiện hành động
4. Hành động hiển thị trên timeline
5. Nhấn **Trận mới** để chơi lại (giữ nguyên danh sách)
6. Nhấn **Trò chơi mới** để về Setup

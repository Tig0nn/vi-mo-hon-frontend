# AGENTS.md (Frontend — vi-mo-hon-frontend)

Guidance for AI coding agents (Codex, Claude Code...) working in THIS repo.
This repo is the React Native (Expo) mobile app. It is NOT the backend —
do not apply Express/controller/Supabase rules here; those belong to the
separate `vi-mo-hon-backend` repo cloned alongside this one.

## Đọc trước khi code
1. `DESIGN.md` — bắt buộc đọc trước khi động vào bất kỳ style/UI nào.
2. `design-reference/` — ảnh User Flow gốc và ảnh mascot, dùng làm tham chiếu trực quan.
3. Repo `vi-mo-hon-backend` (clone cùng cấp) để biết chính xác API/field nào đã tồn tại — không tự bịa field.

## Stack hiện tại
- Expo (React Native 0.81, React 19), JavaScript (không TypeScript).
- Điều hướng hiện tại là state-based tab switching trong `App.js` (chưa dùng React Navigation).
- Style bằng `StyleSheet.create`, không dùng thư viện UI ngoài (không Tailwind/NativeWind).
- Icon: `@expo/vector-icons` (Ionicons). Không tự vẽ icon bằng emoji hay chữ viết tắt.
- Màu: luôn import từ `src/theme/colors.js`, không hardcode mã hex mới trừ khi đó là màu trạng thái lỗi/thành công tạm thời.

## Cấu trúc thư mục
```
src/
├── api/         # gọi backend qua HTTP, KHÔNG gọi Supabase/Gemini trực tiếp
├── components/  # component tái dùng (Card, Chip, ProgressBar, DataRow...)
├── screens/     # 1 file = 1 tab/màn hình chính
├── theme/       # colors.js, inputStyles.js
└── utils/
```

## Nguyên tắc khi thêm/sửa UI
- Ưu tiên tái dùng component có sẵn trong `src/components` (Card, Chip, ProgressBar, IconBadge, DataRow) trước khi tạo component mới.
- Nếu tạo component mới dùng chung cho ≥2 màn hình, đặt trong `src/components`, không copy-paste code UI giữa các screen.
- Mọi dữ liệu hiển thị phải đọc từ prop `dashboard`/`profile` truyền vào, có fallback an toàn (không crash khi field null/undefined) — theo đúng pattern đang có (`?.`, `formatValue()`).
- Không tự thêm thư viện animation (Reanimated, Lottie...) nếu chưa có trong `package.json` — nếu cần, thêm vào `package.json` trong cùng commit và giải thích trong tin nhắn commit.
- Giao diện phải khớp `DESIGN.md`, không tự sáng tạo màu/spacing khác đi.

## Xác thực sau khi sửa
```bash
npm install
npx expo start --web
```
Nếu không thể chạy Expo trong môi trường agent, tối thiểu kiểm tra không lỗi cú pháp:
```bash
node -e "require('@babel/core').transformFileSync('App.js', { presets: ['babel-preset-expo'] }); console.log('ok')"
```

## Việc KHÔNG được làm
- Không sửa file trong repo `vi-mo-hon-backend` trừ khi task nói rõ.
- Không đổi kiến trúc điều hướng (chuyển sang React Navigation) trừ khi được yêu cầu riêng.
- Không xoá hoặc viết đè `DESIGN.md`/`design-reference/` — chỉ được cập nhật khi task yêu cầu rõ ràng.

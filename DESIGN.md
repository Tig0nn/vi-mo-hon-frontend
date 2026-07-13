# Design System: Ví Mỏ Hỗn (v2 — Tím & Mascot)

> File này là nguồn sự thật duy nhất về style. Nếu code hiện tại khác với file này, ưu tiên sửa code theo file này, không ưu tiên giữ nguyên code cũ.
> Tham khảo hình ảnh gốc tại `design-reference/user-flow.png` (toàn bộ 9 bước) và `design-reference/mascot-*.png` (các pose mascot) trước khi code bất kỳ màn hình nào.

## 1. Bối cảnh sản phẩm
App coaching tài chính kết hợp gamification cho Gen Z, có mascot "Mỏ Hỗn" (nhân vật hoạt hình đầu to, mắt to, có vương miện vàng) đồng hành xuyên suốt — xuất hiện ở góc màn hình, trong chat AI Coach, và ở các màn hình chúc mừng/động viên.

## 2. Bảng màu (đã áp dụng trong `src/theme/colors.js`)
- **Primary Tím** `#6D4AEB` — nút hành động chính, tab active, header nhấn.
- **Primary Container** `#B7A6F5` — nền pill/badge phụ.
- **Surface Mist** `#F1EDFB` — nền card phụ, track của progress bar.
- **App Canvas** `#F7F5FE` — nền toàn màn hình (lavender rất nhạt, không dùng trắng thuần).
- **On Surface** `#241748` — chữ chính (tím than đậm, không dùng đen thuần).
- **Gold Accent** `#F6B93B` — CHỈ dùng cho vương miện, ngôi sao, huy hiệu thành tựu. Không dùng cho nút hay text thường.
*(Cấm: không dùng lại tông xanh lá cũ. Không dùng nhiều hơn 1 màu nhấn chính trong 1 màn hình ngoài Gold Accent.)*

## 3. Nguyên tắc Mascot
- Mascot xuất hiện dạng tròn/bán thân, thường **ở góc dưới màn hình, hơi tràn ra ngoài khung** (peek-in), không chiếm quá 15% diện tích màn hình.
- Mascot đổi biểu cảm theo ngữ cảnh: vui khi hoàn thành, ngạc nhiên khi vào tính năng mới, động viên khi thất bại — không dùng 1 pose cho mọi màn hình.
- Trong Coach — chế độ Nhắn tin: mascot là avatar tròn nhỏ (32-40px) đứng đầu mỗi tin nhắn AI.
- Trong Coach — chế độ Trò chuyện giọng nói: NGOẠI LỆ được phóng to mascot chiếm phần lớn màn hình (đây là màn hình duy nhất được phép, xem mục 3.6). Các màn hình khác vẫn giữ giới hạn 15%.

## 3.5. Chỉ thị Tối giản (Minimalism Directive) — ưu tiên cao nhất khi có xung đột
Đây là nguyên tắc ghi đè nếu mâu thuẫn với mô tả layout cũ bên dưới.
- **Icon luôn đứng một mình, không nhốt trong khung/hình tròn/hình vuông nền màu.** Cấm dùng chữ viết tắt (TC, B, C, NV...) giả làm icon — mọi icon phải là icon vector thật (Ionicons).
- **Bottom tab bar:** icon phẳng, không có background shape phía sau, không viền. Trạng thái active thể hiện bằng đổi màu icon (outline → filled, xám → tím), KHÔNG dùng khung/pill nền phía sau icon.
- **Giảm số lượng đường viền:** một khu vực chỉ nên có 1 lớp phân tách (hoặc viền HOẶC khoảng trắng), không dùng cả viền lẫn nền màu lẫn bóng đổ cùng lúc cho cùng 1 card.
- **Card phẳng hơn:** ưu tiên phân tách bằng khoảng trắng (whitespace) trước, chỉ thêm viền 1px rất nhạt khi thật sự cần tách 2 khối nội dung liền kề.
- **Giảm số lượng badge/pill nếu chúng không mang thông tin hành động** — badge chỉ giữ lại khi người dùng cần đọc số liệu đó ngay (VD: +XP, HP), không dùng badge trang trí thuần túy.
- **Test tối giản nhanh:** nhìn vào 1 màn hình, nếu che icon và khung viền đi mà vẫn hiểu được cấu trúc nhờ khoảng trắng và cỡ chữ, màn hình đó đạt yêu cầu. Nếu phải nhìn vào khung/viền mới hiểu được phân cấp, cần đơn giản hoá thêm.

## 3.6. Game-feel vs Dashboard — bảng đối chiếu bắt buộc tham khảo
Phản hồi lặp lại nhiều lần từ founder: app vẫn "giống Dashboard". Đây là bảng
tiêu chí cụ thể để tự chấm điểm trước khi báo hoàn thành bất kỳ màn hình nào.

| Pattern Dashboard (TRÁNH) | Pattern Game (DÙNG) |
|---|---|
| Card viền mỏng bao quanh mọi khối nội dung | Nội dung chính nằm thẳng trên nền màu/nền minh hoạ, không viền |
| Header nhỏ + avatar nhỏ góc trái | Mascot lớn, là trọng tâm thị giác của màn hình, không phải chi tiết phụ |
| Icon tĩnh, không chuyển động | Mascot/icon chính có animation idle nhẹ (nhấp nháy mắt, bồng bềnh, pulse) kể cả khi không tương tác |
| Label chữ đi kèm mọi icon | Chỉ icon, không có chữ theo sau, trừ khi bắt buộc cho a11y |
| Bố cục đối xứng, xếp hàng đều tăm tắp | Được phép lệch tâm, chồng lớp có chủ đích (mascot tràn ra ngoài khung) |
| Toggle/tab dạng chữ có gạch chân | Toggle dạng icon, chỉ thêm gạch chân màu ở dưới icon đang active, không hiện chữ |

**Quy tắc cụ thể cho CoachScreen (đang áp dụng ngay):**
- Bỏ hẳn card/khung viền bao quanh phần header "Mỏ Hỗn AI" — để trực tiếp trên nền `appCanvas`, không có border/background riêng.
- Toggle "Nhắn tin" / "Trò chuyện giọng nói": chỉ hiện icon (chat bubble / mic), bỏ chữ, chỉ thêm gạch chân màu tím dưới icon đang active.
- Chế độ Nhắn tin: KHÔNG tự động đọc to (TTS) câu trả lời AI — tính năng đọc to chỉ áp dụng cho chế độ Trò chuyện giọng nói. Bỏ luôn nút loa khỏi chế độ Nhắn tin.
- Chế độ Trò chuyện giọng nói: mascot phóng to chiếm phần lớn màn hình, có animation idle (pulse nhẹ theo nhịp thở, ví dụ scale 1 → 1.03 → 1 lặp lại bằng Animated.loop) để không đứng yên chết — đây là bước đệm chuẩn bị cho tính năng mascot tương tác kiểu Talking Tom sau này.

## 4. Layout điện thoại (theo đúng mockup trong user-flow.png)
- Mỗi màn hình: header đơn giản (nút back mũi tên trái nếu có, tiêu đề giữa hoặc trái, icon chuông/thông báo phải).
- Card bo góc lớn (16-20px), viền tím rất nhạt `softBorder`, không đổ bóng nặng.
- Icon luôn đi kèm nhãn chữ ngắn, không dùng đoạn văn dài trong card — ưu tiên icon + số liệu.
- Progress bar dạng pill bo tròn hoàn toàn (không vuông), fill tím cho tiến độ thường, fill đỏ riêng cho thanh HP Boss (tương phản có chủ đích).
- Nút chính: pill bo tròn hoàn toàn, nền tím đặc. Nút phụ: outline viền tím nhạt, nền trong suốt/trắng.
- Bottom tab bar: 5 icon outline (filled khi active), không có chữ viết tắt giả icon.

## 5. Ánh xạ 9 bước User Flow → màn hình code
| Bước | Nội dung chính cần có | File tương ứng |
|---|---|---|
| 1-2 | Đăng ký/đăng nhập, chọn mục tiêu, AI gợi ý kế hoạch | `OnboardingScreen.js` |
| 3 | Card mục tiêu + progress, 3 chỉ số (Discipline/Saving/Knowledge) dạng progress bar có nhãn | `HomeScreen.js` |
| 4/7 | Boss theo chapter, HP bar đỏ, challenge đang chạy nổi bật, danh sách challenge khác | `BossScreen.js` |
| 5 | List khoản chi hôm nay + nút thêm nhanh | `HomeScreen.js` / component riêng |
| 6 | Chat bubble (AI trái có avatar mascot, user phải màu tím), chip gợi ý câu hỏi dưới input | `CoachScreen.js` |
| 8 | Bài học dạng thẻ có hình minh họa + nội dung ngắn + nút "Tiếp tục" | Cần tạo mới `LessonScreen.js` |
| 9 | Danh sách huy hiệu (badge tròn màu + tên), progress theo từng chapter | `ProfileScreen.js` / `CharacterScreen.js` |

## 6. Việc KHÔNG được làm
- Không quay lại bảng màu xanh lá cũ.
- Không tự chế tính năng không có trong 2 repo (backend/frontend) hiện tại — nếu thiếu API, để nguyên UI với dữ liệu giả/disabled và ghi `// TODO: cần API`, không tự bịa endpoint.
- Không xoá cấu trúc thư mục hiện có (`src/components`, `src/screens`, `src/theme`) — thêm file mới theo đúng cấu trúc này.

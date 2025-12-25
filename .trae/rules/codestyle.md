# Quy tắc viết mã (Code Style)

Dưới đây là các nguyên tắc cốt lõi khi viết mã trong dự án này:

1.  **Ngắn gọn và Súc tích**: Ưu tiên viết mã càng ngắn gọn càng tốt, nhưng không được làm mất đi ý nghĩa. Tránh sự rườm rà không cần thiết.
2.  **Dễ hiểu sau 6 tháng**: Luôn viết mã sao cho khi đọc lại sau 6 tháng, bạn hoặc bất kỳ ai khác vẫn có thể hiểu ngay mục đích và logic của nó mà không cần tốn quá nhiều thời gian nghiên cứu.
3.  **Viết cho con người**: Mã nguồn không chỉ để máy tính thực thi mà quan trọng hơn là để con người đọc và hiểu. Ưu tiên sự rõ ràng, đặt tên biến/hàm có ý nghĩa thay vì sử dụng các kỹ thuật "hack" khó hiểu.
4.  **Tự giải thích (Self-documenting)**: Cố gắng để mã nguồn tự giải thích logic của chính nó thông qua cấu trúc và cách đặt tên. Chỉ sử dụng comment cho những logic thực sự phức tạp hoặc các quyết định kiến trúc quan trọng.
5.  **Sử dụng tiếng Việt trong comment, docstring**: Tránh sử dụng tiếng Anh trong comment và docstring. Sử dụng tiếng Việt để làm rõ ý nghĩa và dễ hiểu hơn đối với người đọc.
6.  **Khi viết code frontend ưu tiên sử dụng các component của shadcn/ui**: Sử dụng các component của shadcn/ui để đảm bảo tính nhất quán và dễ dàng sử dụng trong dự án, nếu chưa có component nào phù hợp thì mới viết tự nhiên.
7.  **Lưu ý về môi trường Docker**:
    - Dự án chạy trong Docker. Khi cài đặt thư viện mới (ví dụ: `npm install`), cần thực hiện cả trên máy host và bên trong container bằng lệnh: `docker exec nextjs_app npm install [tên-gói]`.
    - Do cấu trúc volume của Docker, trong tệp CSS, khi sử dụng `@plugin` của Tailwind v4, nên sử dụng đường dẫn tương đối trỏ thẳng vào `node_modules` (ví dụ: `@plugin "../../node_modules/tailwindcss-animate"`) để tránh lỗi không tìm thấy gói khi chạy với Turbopack.
    - Luôn kiểm tra logs của container (`docker logs nextjs_app`) để phát hiện các lỗi môi trường kịp thời.
8.  **Tham khảo tài liệu dự án**:
    - Khi cần hiểu rõ hơn về kiến trúc, API hoặc quy trình thiết lập, hãy luôn tham khảo các tài liệu trong thư mục `docs/`.
    - Danh sách tài liệu quan trọng:
        - `architecture.md`: Cấu trúc hệ thống và luồng dữ liệu.
        - `api_endpoints.md`: Danh sách và chi tiết các API backend.
        - `environment.md`: Cấu hình biến môi trường.
        - `setup.md`: Hướng dẫn cài đặt và khởi chạy dự án.
9. Khi có yêu cầu lập kế hoạch mà không nói gì thêm chỉ được phép lập kế hoạch, đợi người quản lý phê duyệt mới được thực hiện kế hoạch, các kế hoạch lập ra được lưu trữ trong thư mục `plans/`.
10. Khi có yêu cầu thực hiện kế hoạch phải đánh dấu hoặc ghi chú rõ các phần đã hoàn thành và các phần còn lại. trong file kế hoạch. khi hoàn thành kế hoạch hãy hỏi người quản lý có muốn xoá file kế hoạch không, hãy chủ động cập nhập hoặc viết thêm các document liên quan để đảm bảo các tài liệu đúng với dự án thực tế, chỉ nên viết các document cốt lõi tránh dài dòng lan man và viết quá chi tiết.
11. luôn luôn dọn dẹp các file thừa, code không còn sử dụng để đảm bảo mã nguồn luôn sạch sẽ.
12. khi viết các doc chú ý không để lộ bất kỳ thông tin nhạy cảm nào, ví dụ: mật khẩu, API key, thông tin cá nhân.
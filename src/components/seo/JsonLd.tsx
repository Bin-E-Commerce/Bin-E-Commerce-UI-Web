// Component này nhúng structured data vào HTML server-rendered.
// Component không hiển thị giao diện và không chứa dữ liệu người dùng; nó chỉ
// serialise dữ liệu public đã được chuẩn hóa cho crawler đọc.

type JsonLdValue = Record<string, unknown> | readonly unknown[];

// Escaping ký tự `<` trước khi đưa JSON vào script ngăn dữ liệu text phá vỡ
// thẻ script nếu upstream vô tình chứa chuỗi HTML đặc biệt.
export function JsonLd({ data }: { data: JsonLdValue }) {
    const serializedData = JSON.stringify(data).replace(/</g, '\\u003c');

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializedData }}
        />
    );
}

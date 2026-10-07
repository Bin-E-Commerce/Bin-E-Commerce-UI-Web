// Unit test cho renderer Markdown của Copilot; kiểm tra format seller nhìn thấy thay vì gọi API thật.
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SellerCopilotMarkdown } from '@/app/(seller)/seller/ai/bingpt/components/answer/markdown/renderer/SellerCopilotMarkdown';

// Markdown có heading in đậm và bảng phải giữ đúng cấu trúc để seller đọc policy nhanh.
it('renders bold conclusions and policy tables', () => {
    // Arrange
    const content = `## Tình trạng

**Kết luận:** Shop cần chuẩn bị hàng trước khi lấy.

| Trạng thái | Seller cần làm gì |
| --- | --- |
| Thiếu địa chỉ | Thêm địa chỉ lấy hàng |`;

    // Act
    render(<SellerCopilotMarkdown content={content} />);

    // Assert
    expect(screen.getByText('Kết luận:')).toHaveClass('font-semibold');
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('border-b');
    expect(screen.getByRole('table').parentElement).toHaveClass('shadow-sm');
    expect(
        screen.getByRole('columnheader', { name: 'Trạng thái' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Thêm địa chỉ lấy hàng')).toBeInTheDocument();
});

// HTML line break do nguồn Markdown phải trở thành break thật trong cell,
// không được hiện nguyên chuỗi <br> cho seller.
it('renders html line breaks as real line breaks inside table cells', () => {
    // Arrange
    const content = `| Hạng mục | Nội dung |
| --- | --- |
| Chuẩn bị hàng | Dòng một<br>- Dòng hai<br />Dòng ba |`;

    // Act
    render(<SellerCopilotMarkdown content={content} />);

    // Assert
    const contentCell = screen.getByRole('cell', {
        name: /Dòng một[\s\S]*Dòng hai[\s\S]*Dòng ba/,
    });
    expect(contentCell).toHaveTextContent('Dòng một');
    expect(contentCell).toHaveTextContent('- Dòng hai');
    expect(contentCell).toHaveTextContent('Dòng ba');
    expect(screen.queryByText('<br>')).not.toBeInTheDocument();
});

// Khôi phục newline khi backend/model gửi literal backslash+n, để nội dung không lộ chuỗi escape trong chat.
it('renders escaped newline markers as paragraph breaks', () => {
    // Arrange
    const content = 'Đoạn đầu.\\n\\nĐoạn sau.';

    // Act
    render(<SellerCopilotMarkdown content={content} />);

    // Assert
    expect(screen.getByText('Đoạn đầu.')).toBeInTheDocument();
    expect(screen.getByText('Đoạn sau.')).toBeInTheDocument();
    expect(screen.queryByText(/\\n/u)).not.toBeInTheDocument();
});

// Literal escape trong fenced code là nội dung mẫu, không phải format đoạn văn cần tự sửa.
it('preserves escaped newline markers inside fenced code', () => {
    // Arrange
    const content = `\`\`\`text
\\n
\`\`\``;

    // Act
    render(<SellerCopilotMarkdown content={content} />);

    // Assert
    expect(screen.getByRole('code').textContent).toBe('\\n');
});

// Mã readiness là chi tiết kỹ thuật; seller chỉ cần thấy nguyên nhân và trạng thái
// bằng tiếng Việt, kể cả khi dữ liệu cũ trong Qdrant vẫn còn mã enum dạng code.
it('renders readiness codes as Vietnamese labels instead of code badges', () => {
    // Arrange
    const content =
        '| Kết quả | Ý nghĩa |\n| --- | --- |\n| `NO_PICKUP_ADDRESS` | `READY` |';

    // Act
    render(<SellerCopilotMarkdown content={content} />);

    // Assert
    expect(screen.getByText('Chưa có địa chỉ lấy hàng')).toBeInTheDocument();
    expect(screen.getByText('Đủ điều kiện giao nhận')).toBeInTheDocument();
    expect(screen.queryByText('NO_PICKUP_ADDRESS')).not.toBeInTheDocument();
    expect(screen.queryByText('READY')).not.toBeInTheDocument();
});

// Dòng in đậm mở đầu một nhóm ý phải là nhãn mục, không phải bullet có dấu chấm.
it('renders bold list labels without a bullet marker', () => {
    // Arrange
    const content = `- **Cách xử lý nguyên nhân:**
- Nếu shop thiếu địa chỉ lấy hàng, cần thêm địa chỉ.`;

    // Act
    render(<SellerCopilotMarkdown content={content} />);

    // Assert
    const label = screen.getByText('Cách xử lý nguyên nhân:');
    expect(label.closest('li')).toHaveClass('list-none');
    expect(
        screen.getByText('Nếu shop thiếu địa chỉ lấy hàng, cần thêm địa chỉ.'),
    ).toBeInTheDocument();
});

// Tiêu đề sản phẩm in đậm trong danh sách phẳng được nâng thành nhãn nhóm; bullet chỉ còn dành cho thuộc tính bên dưới.
it('groups bold product titles with their details instead of showing titles as bullets', () => {
    // Arrange
    const content = `Shop hiện có 2 sản phẩm với thông tin chi tiết như sau:

- **Giày sục nam chất liệu nhựa mềm nhiều màu**
- Tổng số biến thể: 6
- Tồn kho tổng: 28 đơn vị
- **Quần dài nam dáng suông phối lớp màu đen**
- Tổng số biến thể: 2
- Tồn kho tổng: 8 đơn vị`;

    // Act
    render(<SellerCopilotMarkdown content={content} />);

    // Assert
    const firstTitle = screen.getByText(
        'Giày sục nam chất liệu nhựa mềm nhiều màu',
    );
    const secondTitle = screen.getByText(
        'Quần dài nam dáng suông phối lớp màu đen',
    );
    expect(firstTitle.closest('section')).toHaveClass('space-y-1.5');
    expect(firstTitle.closest('li')).toBeNull();
    expect(secondTitle.closest('li')).toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('Tồn kho tổng: 28 đơn vị')).toBeInTheDocument();
    expect(screen.getByText('Tồn kho tổng: 8 đơn vị')).toBeInTheDocument();
});

// Nhãn dài có phần giải thích nối tiếp cũng là tiêu đề nhóm, dù model không đặt dấu hai chấm.
it('recognizes a bold lead sentence as a section label', () => {
    // Arrange
    const content = `- **Điều kiện để shop được xem là sẵn sàng giao nhận** được kiểm tra theo thứ tự sau:
1. Shop có ít nhất một địa chỉ lấy hàng.`;

    // Act
    render(<SellerCopilotMarkdown content={content} />);

    // Assert
    expect(
        screen
            .getByText('Điều kiện để shop được xem là sẵn sàng giao nhận')
            .closest('li'),
    ).toHaveClass('list-none');
});

// Các bước có dòng trống xen giữa vẫn phải nằm trong cùng danh sách để số tăng 1, 2, 3.
it('keeps ordered steps together when the model inserts blank lines', () => {
    // Arrange
    const content = `1. Bước đầu tiên.

1. Bước thứ hai.

1. Bước thứ ba.`;

    // Act
    render(<SellerCopilotMarkdown content={content} />);

    // Assert
    expect(screen.getAllByRole('list')).toHaveLength(1);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Bước thứ ba.')).toBeInTheDocument();
});

// Các câu hỏi đánh số riêng kèm bullet giải thích phải thành một danh sách lồng nhau, không lặp số 1.
it('groups numbered question sections with bold titles and neutral indented bullets', () => {
    // Arrange
    const content = `1. Phí bán hàng được tính thế nào?
- Phí giao hàng được lưu riêng theo từng đơn.
- Mức phí nền tảng chưa có dữ liệu xác nhận.

1. Khi nào doanh thu được ghi nhận?
- Doanh thu tính theo tiền hàng trong khoảng thời gian đã chọn.
- Đơn bị hủy không được tính vào doanh thu.`;

    // Act
    render(<SellerCopilotMarkdown content={content} />);

    // Assert
    const lists = screen.getAllByRole('list');
    const orderedList = lists.find((list) => list.tagName === 'OL');
    const detailList = lists.find((list) => list.tagName === 'UL');
    const firstTitle = screen.getByText('Phí bán hàng được tính thế nào?');

    expect(orderedList).toHaveClass('pl-8', 'marker:text-zinc-700');
    expect(detailList).toHaveClass('pl-6', 'marker:text-zinc-500');
    expect(firstTitle).toHaveClass('font-semibold');
    expect(firstTitle.closest('li')?.parentElement).toBe(orderedList);
    expect(screen.getByText('Khi nào doanh thu được ghi nhận?')).toHaveClass(
        'font-semibold',
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
});

// Dòng “Các ... gồm:” là heading dẫn nhập; danh sách thao tác phía sau vẫn phải bắt đầu từ số 1.
it('renders numbered group introductions as headings without changing the following steps', () => {
    // Arrange
    const content = `1. Các trạng thái đơn hàng hiện có gồm:

**Đang chờ shop chuẩn bị và gửi hàng:** Đơn đã được xác nhận.

**Đang được giao:** Đơn vị vận chuyển đã nhận hàng.

1. Kiểm tra trạng thái mới nhất của đơn.
2. Liên hệ đơn vị vận chuyển nếu trạng thái không thay đổi.`;

    // Act
    render(<SellerCopilotMarkdown content={content} />);

    // Assert
    expect(
        screen.getByRole('heading', {
            level: 3,
            name: 'Các trạng thái đơn hàng hiện có gồm:',
        }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('list')).toHaveLength(1);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(
        screen.getByText('Kiểm tra trạng thái mới nhất của đơn.'),
    ).toBeInTheDocument();
});

// Markdown canonical của backend phải render title như heading, phần giải thích thành bullet và chỉ đánh số thao tác.
it('renders structured multi-topic answers without numbering explanation headings', () => {
    // Arrange
    const content = `### Các trạng thái đơn hàng hiện có là gì?

- **Đang chờ shop chuẩn bị:** Đơn đã được xác nhận.
- **Đã hoàn tất:** Khách xác nhận đã nhận hàng.

### Phân biệt đã giao và đã hoàn tất

| Trạng thái | Ý nghĩa |
| --- | --- |
| Đã giao | Đơn vị vận chuyển báo đã giao |
| Đã hoàn tất | Khách xác nhận đã nhận hàng |

### Nếu đơn bị treo thì seller cần làm gì?

1. Kiểm tra chi tiết đơn hàng.
2. Liên hệ đơn vị vận chuyển nếu trạng thái không cập nhật.`;

    // Act
    render(<SellerCopilotMarkdown content={content} />);

    // Assert
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(screen.getAllByRole('list')).toHaveLength(2);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Kiểm tra chi tiết đơn hàng.')).toBeInTheDocument();
    expect(
        screen.getByRole('heading', {
            level: 3,
            name: 'Phân biệt đã giao và đã hoàn tất',
        }),
    ).toBeInTheDocument();
});

// URL thumbnail do model sinh ra không được lộ trong chat vì card sản phẩm đã hiển thị ảnh riêng.
it('hides raw product image URLs from markdown answers', () => {
    // Arrange
    const content =
        'Hình ảnh: ![Ảnh sản phẩm](https://cdn.example.com/product.webp)';

    // Act
    render(<SellerCopilotMarkdown content={content} />);

    // Assert
    expect(screen.getByText(/Hình ảnh: Ảnh sản phẩm/u)).toBeInTheDocument();
    expect(screen.queryByText(/cdn\.example\.com/u)).not.toBeInTheDocument();
});

// Ghi chú cảnh báo giữ nhãn ngữ nghĩa, hiển thị như văn bản thường và không thêm emoji.
it('renders semantic callouts without non-smiley emoji', () => {
    // Arrange
    const content = '> [!WARNING] Lưu ý\n> **Kiểm tra kỹ** trước khi gửi.';

    // Act
    render(<SellerCopilotMarkdown content={content} />);

    // Assert
    const note = screen.getByRole('complementary', { name: 'Lưu ý' });
    expect(note).toHaveClass('text-sm', 'text-zinc-600');
    expect(note).not.toHaveClass('border', 'bg-amber-50', 'rounded-lg');
    expect(screen.getByText('Kiểm tra kỹ')).toHaveClass('font-semibold');
    expect(
        screen.queryByText(/[\u{1F300}-\u{1FAFF}]/u),
    ).not.toBeInTheDocument();
});

// Ghi chú INFO trình bày cùng luồng nội dung, không có khung card hay nền màu.
it('renders informational notes as plain professional text', () => {
    // Arrange
    const content = '> [!INFO] Lưu ý\n> Phần này chưa có dữ liệu xác nhận.';

    // Act
    render(<SellerCopilotMarkdown content={content} />);

    // Assert
    const note = screen.getByRole('complementary', { name: 'Lưu ý' });
    expect(note).toHaveClass('text-sm', 'leading-6', 'text-zinc-600');
    expect(note).not.toHaveClass(
        'border',
        'bg-zinc-50',
        'rounded-lg',
        'shadow',
    );
    expect(note).toHaveTextContent('Lưu ý: Phần này chưa có dữ liệu xác nhận.');
});

// Khối fenced code phải giữ xuống dòng, dùng nút shadcn có nhãn truy cập và sao chép đúng nguyên văn.
it('renders and copies fenced sample content', async () => {
    // Arrange
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText },
    });
    const content = '```text\nDòng một\nDòng hai\n```';

    // Act
    render(<SellerCopilotMarkdown content={content} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sao chép nội dung' }));

    // Assert
    expect(screen.getByRole('code').textContent).toBe('Dòng một\nDòng hai');
    await waitFor(() =>
        expect(writeText).toHaveBeenCalledWith('Dòng một\nDòng hai'),
    );
    await waitFor(() =>
        expect(
            screen.getByRole('button', { name: 'Đã sao chép nội dung' }),
        ).toBeInTheDocument(),
    );
});

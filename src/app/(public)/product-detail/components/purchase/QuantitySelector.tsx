import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
    quantity: number;
    stock: number;
    onDecrease: () => void;
    onIncrease: () => void;
    onChange: (quantity: number) => void;
}

// Cho phép chỉnh số lượng bằng nút hoặc bàn phím nhưng luôn phản ánh giới hạn tồn kho hiện tại.
export function QuantitySelector({
    quantity,
    stock,
    onDecrease,
    onIncrease,
    onChange,
}: QuantitySelectorProps) {
    return (
        <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-zinc-700">Số lượng</span>
            <div className="flex h-10 overflow-hidden rounded border border-zinc-200">
                <button
                    type="button"
                    aria-label="Giảm số lượng"
                    disabled={quantity <= 1}
                    onClick={onDecrease}
                    className="flex w-10 items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <input
                    type="number"
                    aria-label="Số lượng sản phẩm"
                    min={1}
                    max={Math.max(1, stock)}
                    value={quantity}
                    onChange={(event) => onChange(Number(event.target.value))}
                    className="w-14 border-x border-zinc-200 text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                    type="button"
                    aria-label="Tăng số lượng"
                    disabled={stock === 0 || quantity >= stock}
                    onClick={onIncrease}
                    className="flex w-10 items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
            <span className="text-xs text-zinc-500">
                {stock > 0 ? `${stock} sản phẩm có sẵn` : 'Tạm hết hàng'}
            </span>
        </div>
    );
}

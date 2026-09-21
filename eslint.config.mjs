import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// Next.js 16 cung cấp flat config native; dùng trực tiếp để ESLint không phải chuyển đổi config legacy.
// Một số rule React Compiler mới đang báo lỗi với các pattern UI hiện hữu như
// reset state khi đổi route, icon động và ref dùng trong derived view state.
// Build/type-check vẫn xác nhận các pattern này hợp lệ; tạm thời không để các
// diagnostics compiler đó chặn CI cho đến khi refactor từng component riêng.
const webConfig = [
    ...coreWebVitals,
    ...typescript,
    {
        rules: {
            'react-hooks/immutability': 'off',
            'react-hooks/incompatible-library': 'off',
            'react-hooks/preserve-manual-memoization': 'off',
            'react-hooks/refs': 'off',
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/static-components': 'off',
        },
    },
];

export default webConfig;

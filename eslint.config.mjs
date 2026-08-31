import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// Next.js 16 cung cấp flat config native; dùng trực tiếp để ESLint không phải chuyển đổi config legacy.
export default [...coreWebVitals, ...typescript];

import { Suspense } from 'react';

import { LoginForm } from './components/LoginForm';

// Bao form bằng Suspense vì hook đăng nhập đọc query string redirect qua useSearchParams.
export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="h-96 animate-pulse rounded-lg bg-zinc-100" />
            }
        >
            <LoginForm />
        </Suspense>
    );
}

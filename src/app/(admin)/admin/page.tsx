import { redirect } from 'next/navigation';

// Điều hướng /admin về dashboard để URL gốc không render trang trống.
export default function AdminIndexPage() {
    redirect('/admin/dashboard');
}

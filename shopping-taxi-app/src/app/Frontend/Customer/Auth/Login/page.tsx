import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function CustomerLogin() {
  return (
    <LoginForm
      title="Log in"
      redirectPath="/Frontend/Customer/Feed"
      registerHref="/Frontend/Customer/Auth/Register"
    >
      <p className="text-center text-sm text-gray-600 space-x-2">
        <span>Are you a driver?</span>
        <Link href="/Frontend/Driver/Auth/Login" className="text-blue-600 hover:underline">
          Driver Login
        </Link>
      </p>
    </LoginForm>
  );
}

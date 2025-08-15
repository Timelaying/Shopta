import { LoginForm } from '@/components/auth/LoginForm';

export default function AdminLogin() {
  return (
    <LoginForm
      title="Admin Login"
      redirectPath="/Frontend/Admin/Feed"
      registerHref="/Frontend/Admin/Auth/Register"
    />
  );
}

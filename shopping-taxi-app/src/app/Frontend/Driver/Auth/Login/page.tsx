import { LoginForm } from '@/components/auth/LoginForm';

export default function DriverLogin() {
  return (
    <LoginForm
      title="Driver Login"
      redirectPath="/Frontend/Driver/Feed"
      registerHref="/Frontend/Driver/Auth/Register"
    />
  );
}

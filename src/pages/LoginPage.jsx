import Logo from "../components/Logo";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="">
      <Logo />
      <div className="flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}

import "./App.css";

function App() {
  return (
    <div className="">
      <Logo />
      <div className="flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex justify-center mt-80">
      <img src="/Icon-192.png" alt="ArtWink Studio Logo"></img>
    </div>
  );
}

function LoginForm() {
  const handleSubmit = () => {
    console.log("Login");
  };
  return (
    <form>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between flex-wrap">
          <label className="color-gray-500 text-xs" htmlFor="username">
            Username:
          </label>
          <input
            className="border-1 border-gray-400 w-full rounded-lg"
            id="username"
            type="text"
            autoComplete="username"
            required
          />
        </div>
        <div className="flex justify-between flex-wrap">
          <label className="color-gray-500 text-xs" htmlFor="password">
            Password:
          </label>
          <input
            className="border-1 border-gray-400 w-full rounded-lg"
            id="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="flex justify-center flex-wrap">
          <button
            className="border-1 border-gray-400 rounded-lg text-sm w-1/2 self-center mt-1"
            onClick={handleSubmit}
          >
            Login
          </button>
        </div>
      </div>
    </form>
  );
}
export default App;

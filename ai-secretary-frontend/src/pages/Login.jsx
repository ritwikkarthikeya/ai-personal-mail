export default function Login() {
  const loginWithGoogle = () => {
    window.location.href = "http://localhost:5003/api/auth/google";
  };

  return (
    <div className="center">
      <h1>AI Personal Secretary</h1>
      <button onClick={loginWithGoogle}>
        Sign in with Google
      </button>
    </div>
  );
}

export default function Login() {
const loginWithGoogle = () => {
    window.location.href =
      "https://magnificent-mercy-ritwikkarthikeya-a5e5a947.koyeb.app/api/auth/google";
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">AI Personal Secretary</h1>

        <p className="auth-subtitle">
          Smart email insights. Search. Summaries. Assistant.
        </p>

        <button className="auth-button" onClick={loginWithGoogle}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
          />
          Continue with Google
        </button>

        <p className="auth-footer">
          Secure Google sign-in • No data misuse
        </p>
      </div>
    </div>
  );
}

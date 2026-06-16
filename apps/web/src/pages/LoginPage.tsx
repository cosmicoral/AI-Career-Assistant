import { BriefcaseBusiness } from "lucide-react";
import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function LoginPage() {
  const { isDemoMode, session, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (isDemoMode || session) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await signInWithEmail(email);
      setMessage("Check your email for the sign-in link.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send sign-in link.");
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand compact">
          <div className="brand-mark">
            <BriefcaseBusiness size={18} />
          </div>
          <div>
            <strong>CareerOS AI</strong>
            <span>Graduate job OS</span>
          </div>
        </div>
        <h1>Sign in</h1>
        <form onSubmit={handleSubmit} className="stack-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <button className="primary-button" type="submit">
            Send magic link
          </button>
        </form>
        {message ? <p className="success-text">{message}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </section>
    </main>
  );
}

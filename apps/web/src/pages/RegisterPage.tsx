import { BriefcaseBusiness } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function RegisterPage() {
  const { isDemoMode, session, signUpWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await signUpWithPassword(email, password);
      setMessage("Account created. If email confirmation is enabled, check your inbox before signing in.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
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
        <h1>Create account</h1>
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
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </label>
          <button className="primary-button" type="submit">
            Register
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        {message ? <p className="success-text">{message}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </section>
    </main>
  );
}

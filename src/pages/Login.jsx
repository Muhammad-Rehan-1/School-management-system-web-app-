import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import './Login.css';

/**
 * Login page component
 */
export default function Login() {
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="input-group">
            <input
              type="text"
              placeholder="School ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="forgot-password">
              <a href="#forgot">Forgot Password?</a>
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Submit Button */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="contact-link">
          <span>Demo Credentials:</span>
          <br />
          <strong>Username: rehan</strong> | <strong>Password: 123</strong>
        </div>

        {/* Social Icons */}
        <div className="social-icons">
          <div className="icon-circle">f</div>
          <div className="icon-circle">ig</div>
          <div className="icon-circle">t</div>
        </div>
      </div>
    </div>
  );
}
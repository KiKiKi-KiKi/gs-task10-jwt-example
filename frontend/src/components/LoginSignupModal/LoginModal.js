import React, { useState, useEffect, useCallback } from 'react';
import ErrorMessage from '../shared/form/ErrorMessage';

export default function LoginModal({
  email,
  setEmail,
  password,
  setPassword,
  onSubmitData,
  onClose,
}) {
  const [error, setError] = useState(null);

  const onChangeField = useCallback(
    (callback) => (e) => {
      callback(e.target.value);
    },
    [],
  );

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const res = await onSubmitData({ email, password });
        console.log('Login', res);
        // success to close modal
        onClose();
      } catch (err) {
        console.log(err);
        setError(err.message);
      }
    },
    [email, password, onSubmitData, onClose],
  );

  // Remove Error message when component mount
  useEffect(() => {
    setError(null);
  }, []);

  return (
    <>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <form className="form" onSubmit={onSubmit}>
        <div className="form-section">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="input-field"
            placeholder="E-mail"
            required
            onChange={onChangeField(setEmail)}
            value={email}
          />
        </div>
        <div className="form-section">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="input-field"
            required
            onChange={onChangeField(setPassword)}
            value={password}
          />
        </div>
        <div className="form-section form-action">
          <button type="submit" className="btn btn-success submit-btn">
            LOGIN
          </button>
        </div>
      </form>
    </>
  );
}

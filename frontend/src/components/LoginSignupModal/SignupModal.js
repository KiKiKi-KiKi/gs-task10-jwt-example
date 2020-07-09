import React, { useState, useEffect, useCallback } from 'react';
import ErrorMessage from '../shared/form/ErrorMessage';

export default function SignupModal({
  name,
  setName,
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

  const onChangePassword = useCallback(
    (e) => {
      // TODO: varidate password
      setPassword(e.target.value);
    },
    [setPassword],
  );

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const res = await onSubmitData({ name, email, password });
        console.log('Signup', res);
        // success to close modal
        onClose();
      } catch (err) {
        console.log(err);
        const regex = /(\n)/g;
        setError(() =>
          err.message.split(regex).map((line, i) => {
            if (line.match(regex)) {
              return (
                <React.Fragment key={i}>
                  {React.createElement('br')}
                </React.Fragment>
              );
            } else {
              return <React.Fragment key={i}>{line}</React.Fragment>;
            }
          }),
        );
      }
    },
    [name, email, password, onSubmitData, onClose],
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
          <label className="form-label">Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="Your Name"
            onChange={onChangeField(setName)}
            value={name}
            required
          />
        </div>
        <div className="form-section">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="input-field"
            placeholder="E-mail"
            onChange={onChangeField(setEmail)}
            value={email}
            required
          />
        </div>
        <div className="form-section">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="input-field"
            onChange={onChangePassword}
            value={password}
            required
          />
        </div>
        <div className="form-section form-action">
          <button type="submit" className="btn btn-success submit-btn">
            SIGN UP
          </button>
        </div>
      </form>
    </>
  );
}

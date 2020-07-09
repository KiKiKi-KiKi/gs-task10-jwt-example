import React from 'react';
import classNames from '@kikiki_kiki/class-names';

export default function ErrorMessage({ className, children }) {
  const cx = classNames('alert', 'alert-danger', className);
  return <div className={cx}>{children}</div>;
}

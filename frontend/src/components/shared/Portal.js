import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const wrapper = document.createElement('div');

export default function Portal({ children }) {
  useEffect(() => {
    const body = document.querySelector('body');
    body.appendChild(wrapper);
  }, []);

  return createPortal(children, wrapper);
}

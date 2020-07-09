import React from 'react';
import { CSSTransition } from 'react-transition-group';
import classNames from '@kikiki_kiki/class-names';
import Portal from './Portal';

const Modal = ({ className, onClose, children }) => {
  const classname = classNames('modal', className);

  return (
    <div className="modal-wrapper">
      <div className="modal-overray" onClick={onClose}></div>
      <CSSTransition in={true} timeout={250} classNames="modal">
        <div className={classname}>{children}</div>
      </CSSTransition>
    </div>
  );
};

export default function ModalContainer({ isOpen, ...props }) {
  return <Portal>{isOpen ? <Modal {...props} /> : null}</Portal>;
}

import React from 'react';
import './Modal.css';

interface ModalProps {
  show: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, title, onClose, children }) => {
  if (!show) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <header className="modal-header">
          <h2 id="modalTitle">{title}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">&times;</button>
        </header>
        <main className="modal-body">{children}</main>
      </div>
    </>
  );
};

export default Modal;

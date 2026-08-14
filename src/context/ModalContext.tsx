'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface ModalContextType {
  showAlert: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'alert' | 'confirm'>('alert');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null);

  const showAlert = (title: string, message: string) => {
    setTitle(title);
    setMessage(message);
    setType('alert');
    setOnConfirmCallback(null);
    setIsOpen(true);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setTitle(title);
    setMessage(message);
    setType('confirm');
    setOnConfirmCallback(() => onConfirm);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (onConfirmCallback) {
      onConfirmCallback();
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '400px', padding: '1.5rem', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: type === 'alert' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                color: type === 'alert' ? 'var(--accent-danger)' : 'var(--accent-primary)',
                flexShrink: 0
              }}>
                {type === 'alert' ? <AlertCircle size={22} /> : <HelpCircle size={22} />}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>{message}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              {type === 'confirm' && (
                <button className="btn btn-secondary" onClick={handleClose} style={{ padding: '0.5rem 1rem' }}>
                  Cancel
                </button>
              )}
              <button 
                className={`btn ${type === 'alert' ? 'btn-secondary' : 'btn-primary'}`} 
                onClick={handleConfirm}
                style={{ padding: '0.5rem 1rem' }}
              >
                {type === 'alert' ? 'OK' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

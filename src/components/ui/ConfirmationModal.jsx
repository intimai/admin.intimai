import React from 'react';
import ReactDOM from 'react-dom';

// Adicionamos o CSS de animação fora do componente para evitar problemas do React
const spinAnimation = `
  @keyframes modalSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Adiciona o CSS uma única vez
if (!document.querySelector('#modal-spin-animation')) {
  const style = document.createElement('style');
  style.id = 'modal-spin-animation';
  style.textContent = spinAnimation;
  document.head.appendChild(style);
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children, isLoading = false }) => {
  if (!isOpen) return null;

  // Portal para garantir posicionamento correto e isolamento de estilos
  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(2px)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '28rem',
          margin: '1rem',
          borderRadius: '0.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #333333',
          backgroundColor: '#000000',
          color: '#ffffff'
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div style={{ padding: '1.5rem 1.5rem 1rem 1.5rem' }}>
          <h2 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#ffffff',
            margin: 0
          }}>
            {title}
          </h2>
        </div>

        {/* Content */}
        <div style={{ 
          padding: '0 1.5rem 1rem 1.5rem', 
          color: '#e5e7eb' 
        }}>
          {children}
        </div>

        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '1rem', 
          padding: '1rem 1.5rem 1.5rem 1.5rem' 
        }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: '1px solid #666666',
              backgroundColor: 'transparent',
              color: '#e5e7eb',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#333333';
                e.target.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#e5e7eb';
              }
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#b91c1c';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#dc2626';
              }
            }}
          >
            {isLoading ? (
              <>
                <div 
                  style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'modalSpin 1s linear infinite'
                  }}
                ></div>
                Processando...
              </>
            ) : (
              'Confirmar'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Renderiza no body para evitar conflitos de posicionamento
  return ReactDOM.createPortal(modalContent, document.body);
};

export default ConfirmationModal;
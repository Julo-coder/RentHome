import React from 'react';

const Popup = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel',
  isDanger = false
}) => {
  if (!isOpen) return null;

  const handlePopupClick = (e) => {
    // Prevent clicks within the popup from closing it
    e.stopPropagation();
  };

  return (
    <div 
      className="popup-overlay" 
      onClick={onCancel}
    >
      <div 
        className="popup"
        onClick={handlePopupClick}
      >
        {title && <h3 className="popup-title">{title}</h3>}
        <p className="popup-message">{message}</p>
        <div className="popup-buttons">
          <button 
            className="popup-btn popup-btn-cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button 
            className={`popup-btn ${isDanger ? 'popup-btn-danger' : 'popup-btn-confirm'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
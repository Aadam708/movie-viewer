import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode; // Content to be displayed inside the modal
}

// Functional component for rendering a modal
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    // Overlay div that covers the entire viewport with a semi-transparent background
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Modal content container */}
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">

        <button
          onClick={onClose}
          className="fixed top-2 right-3 mr-24 mt-12 text-white hover:text-red-500 text-5xl"
        >

          <FaTimes />
        </button>
        {/* Render the children passed to the modal */}
        {children}
      </div>
    </div>
  );
};

export default Modal;

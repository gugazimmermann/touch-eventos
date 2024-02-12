import React, { useEffect } from "react";

const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <div
      className={`${
        isVisible ? "animate-slideIn" : "animate-slideOut"
      } fixed top-10 right-0 m-4 p-4 bg-secondary-500 text-white rounded-lg shadow-lg`}
    >
      {message}
    </div>
  );
};

export default Toast;

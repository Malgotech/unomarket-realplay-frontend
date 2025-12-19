import React from 'react';

const CustomCard = ({ title, description, className, children }) => {
  return (
    <div className={`bg-white rounded-lg p-4 shadow-md ${className || ''}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default CustomCard;
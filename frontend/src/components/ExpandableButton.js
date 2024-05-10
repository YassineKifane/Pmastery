import React from 'react';

export const ExpandableButton = ({ isOpen, toggle }) => {
  return (
    <button className='btn border-0' onClick={toggle}>
      <i
        className="pi pi-angle-down"
        style={{
          transform: `rotate(${isOpen ? 180 : 0}deg)`,
          transition: 'all 0.25s',
        }}
      />
    </button>
  );
};

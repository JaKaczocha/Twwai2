import React from 'react';

const DeviceList: React.FC = () => {
  const handleButtonClick = (id: number) => {
    localStorage.setItem('selectedDeviceId', String(id));
    window.location.reload(); 
  };

  return (
    <div className="device-list">
      <h2>Device List</h2>
      <div className="btn-group" role="group">
        {[...Array(17).keys()].map((num) => (
          <button
            key={num + 1}
            type="button"
            className="btn btn-secondary"
            onClick={() => handleButtonClick(num + 1)}
          >
            {num + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DeviceList;
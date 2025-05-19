// src/components/ClassManager.js
import React, { useState } from 'react';

function ClassManager({ classes, setClasses, selectedClass, setSelectedClass }) {
  const [newClassName, setNewClassName] = useState('');
  const [color, setColor] = useState('#ff0000');

  const addClass = () => {
    if (!newClassName) return;
    setClasses([...classes, { name: newClassName, color: hexToRgb(color) }]);
    setNewClassName('');
  };

  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return [
      (bigint >> 16) & 255,
      (bigint >> 8) & 255,
      bigint & 255
    ];
  };

  return (
    <div className="class-manager">
      <h2>Manage Classes</h2>
      <input
        className="border p-2 mb-3"
        type="text"
        placeholder="Class Name"
        value={newClassName}
        onChange={(e) => setNewClassName(e.target.value)}
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <button onClick={addClass} className="mb-4">Add Class</button>

      <div className="class-list">
        {classes.map((cls, idx) => (
          <div
            key={idx}
            className={`class-item ${selectedClass === idx ? 'selected' : ''}`}
            onClick={() => setSelectedClass(idx)}
          >
            <div
              className="class-color"
              style={{ backgroundColor: `rgb(${cls.color.join(',')})` }}
            />
            {cls.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClassManager;

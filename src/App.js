// src/App.js

import React, { useState } from 'react';
import ImageCanvas from './components/ImageCanvas';
import ClassManager from './components/ClassManager';
import './App.css';

function App() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  return (
    <div className="app-container">
      <ClassManager
        classes={classes}
        setClasses={setClasses}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
      />
      <ImageCanvas
        classes={classes}
        selectedClass={selectedClass}
      />
    </div>
  );
}

export default App;

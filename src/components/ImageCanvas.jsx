import React, { useRef, useState } from 'react';
import { kmeans } from '../utils/kmeans';
import ClassAreaTable from './ClassAreaTable';
import '../Style/ImageCanvas.css';


function ImageCanvas({ classes, selectedClass }) {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [points, setPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [rectangles, setRectangles] = useState([]);
  const [classAreas, setClassAreas] = useState([]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !(file instanceof Blob)) {
      console.error("Invalid or no file selected");
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImage(img);
      requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
          console.error("Canvas not found");
          return;
        }
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      });
    };
    img.onerror = () => console.error("Failed to load image");
    img.src = URL.createObjectURL(file);
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x, y };
  };

  const handleMouseDown = (e) => {
    if (selectedClass === null || selectedClass < 0 || selectedClass >= classes.length) return;
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    setStartPos({ x, y });
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || !startPos || !image) return;
    setIsDrawing(false);

    const { x: x1, y: y1 } = startPos;
    const { x: x2, y: y2 } = getCanvasCoords(e);

    const xStart = Math.min(x1, x2);
    const yStart = Math.min(y1, y2);
    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);

    if (width < 1 || height < 1) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = `rgb(${classes[selectedClass].color.join(',')})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(xStart, yStart, width, height);

    const imageData = ctx.getImageData(xStart, yStart, width, height).data;
    const newPoints = [];
    for (let i = 0; i < imageData.length; i += 4) {
      const rgb = [imageData[i], imageData[i + 1], imageData[i + 2]];
      newPoints.push({ rgb, classIndex: selectedClass });
    }

    setPoints(prev => [...prev, ...newPoints]);
    setRectangles(prev => [...prev, { x: xStart, y: yStart, width, height, classIndex: selectedClass }]);
  };

  const handleCluster = () => {
    if (classes.length === 0 || !image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const pixels = [];
    for (let i = 0; i < imgData.data.length; i += 4) {
      pixels.push([imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]]);
    }

    const initialCentroids = classes.map(cls => cls.color);
    const { labels } = kmeans(pixels, points, classes.length);

    for (let i = 0; i < labels.length; i++) {
      const [r, g, b] = initialCentroids[labels[i]];
      imgData.data[i * 4] = r;
      imgData.data[i * 4 + 1] = g;
      imgData.data[i * 4 + 2] = b;
    }

    ctx.putImageData(imgData, 0, 0);

    const totalPixels = labels.length;
    const counts = Array(classes.length).fill(0);
    labels.forEach(label => counts[label]++);
    const areas = counts.map((count, i) => ({
      name: classes[i].name,
      color: classes[i].color,
      percent: ((count / totalPixels) * 100).toFixed(2),
    }));
    setClassAreas(areas);
  };

  return (
  <div className="p-4 w-full">
    <div className="mb-4">
      {!image ? (
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-2"
        />
      ) : (
        <div className="button-group">
          <input
            type="file"
            accept="image/*"
            id="imageUploadInput"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => {
              const input = document.getElementById('imageUploadInput');
              if (input) input.click();
            }}
            className="btn btn-change"
          >
            Change Image
          </button>
          <button
            onClick={() => {
              setImage(null);
              const canvas = canvasRef.current;
              if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
              setPoints([]);
              setRectangles([]);
              setClassAreas([]);
            }}
            className="btn btn-delete"
          >
            Delete Image
          </button>
        </div>
      )}
    </div>

    {selectedClass !== null && (
      <div className="mb-2 text-sm font-medium text-gray-700">
        Selected Class:{' '}
        <span className="text-blue-600">{classes[selectedClass]?.name}</span>
      </div>
    )}

    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="border max-w-full h-auto"
      style={{ width: '100%', height: 'auto' }}
    />

    <button
      onClick={handleCluster}
      className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      disabled={selectedClass === null}
    >
      Run K-Means Clustering
    </button>

    {classAreas.length > 0 && (
      <ClassAreaTable classAreas={classAreas} />
    )}
  </div>
);

}

export default ImageCanvas;

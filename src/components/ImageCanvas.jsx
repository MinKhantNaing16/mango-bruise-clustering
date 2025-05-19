import React, { useRef, useState } from 'react';
import { kmeans } from '../utils/kmeans';

function ImageCanvas({ classes, selectedClass }) {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [points, setPoints] = useState([]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !(file instanceof Blob)) {
      console.error("Invalid or no file selected");
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImage(img);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set internal canvas resolution
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);
    };
    img.onerror = () => {
      console.error("Failed to load image");
    };
    img.src = URL.createObjectURL(file);
  };

  const handleClick = (e) => {
    if (selectedClass === null || selectedClass < 0 || selectedClass >= classes.length) {
      console.error("Please select a class before clicking on the image");
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // ✅ Adjust for scale difference between screen and canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const rgb = [pixel[0], pixel[1], pixel[2]];

    setPoints(prev => [...prev, { rgb, classIndex: selectedClass }]);

    // ✅ Draw marker at clicked location
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = `rgb(${classes[selectedClass].color.join(',')})`;
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();

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

    if (pixels.length === 0) {
      console.error('No pixels to cluster!');
      return;
    }

    const initialCentroids = classes.map(cls => cls.color);
    if (initialCentroids.length === 0) {
      console.error('No centroids to initialize K-Means!');
      return;
    }

    const { labels } = kmeans(pixels, points, classes.length);

    for (let i = 0; i < labels.length; i++) {
      const [r, g, b] = initialCentroids[labels[i]];
      imgData.data[i * 4] = r;
      imgData.data[i * 4 + 1] = g;
      imgData.data[i * 4 + 2] = b;
    }

    ctx.putImageData(imgData, 0, 0);
  };

  return (
    <div className="p-4 w-3/4">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4"
      />

      {selectedClass !== null && (
        <div className="mb-2 text-sm font-medium text-gray-700">
          Selected Class: <span className="text-blue-600">{classes[selectedClass]?.name}</span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className="border max-w-full h-auto"
        style={{ width: '100%', height: 'auto' }}
      />

      <button
        onClick={handleCluster}
        className="mt-4 bg-green-600 text-white px-4 py-2"
        disabled={selectedClass === null}
      >
        Run K-Means Clustering
      </button>
    </div>
  );
}

export default ImageCanvas;
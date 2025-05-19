// src/utils/kmeans.js

/**
 * K-means clustering with fixed class-color centroids from labeled points
 * @param {Array} pixels - image pixels, each is [r, g, b]
 * @param {Array} points - user-labeled points, each is { rgb: [r,g,b], classIndex: number }
 * @param {number} classCount - total number of classes
 * @param {number} maxIter - max iterations for K-means
 * @returns {{ labels: number[], centroids: number[][] }}
 */
export function kmeans(pixels, points, classCount, maxIter = 10) {
  let centroids = Array(classCount).fill(0).map(() => [0, 0, 0]);
  let labels = new Array(pixels.length);

  // Group points by classIndex first
  const grouped = Array(classCount).fill().map(() => []);

  for (const pt of points) {
    if (pt.classIndex < 0 || pt.classIndex >= classCount) {
      console.error(`Invalid classIndex: ${pt.classIndex}`);
      continue;
    }
    grouped[pt.classIndex].push(pt.rgb);
  }

  // Calculate centroids for each class
  for (let i = 0; i < classCount; i++) {
    if (grouped[i].length > 0) {
      const avgRgb = grouped[i].reduce(
        (acc, val) => [acc[0] + val[0], acc[1] + val[1], acc[2] + val[2]],
        [0, 0, 0]
      ).map((sum) => sum / grouped[i].length);
      centroids[i] = avgRgb;
    }
  }

  // Continue with the K-Means algorithm
  for (let iter = 0; iter < maxIter; iter++) {
    // Assign pixels to closest centroids
    for (let i = 0; i < pixels.length; i++) {
      let minDist = Infinity;
      let minIdx = 0;
      for (let j = 0; j < centroids.length; j++) {
        const dist = euclideanDistance(pixels[i], centroids[j]);
        if (dist < minDist) {
          minDist = dist;
          minIdx = j;
        }
      }
      labels[i] = minIdx;
    }

    // Recalculate centroids
    const newCentroids = Array(centroids.length).fill(0).map(() => [0, 0, 0]);
    const counts = Array(centroids.length).fill(0);

    for (let i = 0; i < pixels.length; i++) {
      const idx = labels[i];
      newCentroids[idx] = newCentroids[idx].map((val, j) => val + pixels[i][j]);
      counts[idx]++;
    }

    // Average out the new centroids
    for (let i = 0; i < centroids.length; i++) {
      if (counts[i] > 0) {
        newCentroids[i] = newCentroids[i].map((sum) => sum / counts[i]);
      }
    }

    centroids = newCentroids;
  }

  return { labels, centroids };
}

/**
 * Euclidean distance between two points
 * @param {Array} p1
 * @param {Array} p2
 * @returns {number}
 */
function euclideanDistance(p1, p2) {
  return Math.sqrt(
    p1.reduce((sum, val, idx) => sum + (val - p2[idx]) ** 2, 0)
  );
}

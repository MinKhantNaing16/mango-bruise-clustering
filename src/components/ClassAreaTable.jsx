import React from 'react';

function ClassAreaTable({ classAreas }) {
  return (
    <div className="mt-6 bg-white p-6 rounded-xl shadow-md overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4">Class Area %</h3>
      <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b">Class</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b">Color</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {classAreas.map((area, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition-colors even:bg-gray-50"
            >
              <td className="px-6 py-3 border-b">{area.name}</td>
              <td className="px-6 py-3 border-b">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: `rgb(${area.color.join(',')})` }}
                  title={`rgb(${area.color.join(',')})`}
                />
              </td>
              <td className="px-6 py-3 border-b">{area.percent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClassAreaTable;

import React from 'react';

const OverviewTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Seller Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sales Summary Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Sales</h3>
          <p className="text-3xl font-bold text-green-600">$12,345.67</p>
          <p className="text-sm text-gray-500 mt-1">Up 15% from last month</p>
        </div>

        {/* Total Sequences Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Sequences</h3>
          <p className="text-3xl font-bold text-blue-600">125</p>
          <p className="text-sm text-gray-500 mt-1">5 new sequences this week</p>
        </div>

        {/* Recent Orders Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Recent Orders</h3>
          <ul className="space-y-2">
            <li className="flex justify-between items-center">
              <span className="text-gray-700">Order #1001</span>
              <span className="text-gray-600">$49.99</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-700">Order #1000</span>
              <span className="text-gray-600">$29.99</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-700">Order #999</span>
              <span className="text-gray-600">$79.99</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Upload New Sequence</button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">View All Orders</button>
          <button className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">Edit Profile</button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
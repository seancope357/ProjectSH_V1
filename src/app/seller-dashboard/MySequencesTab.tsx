import React from 'react';
import SellerSequences from './SellerSequences';

const MySequencesTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Uploaded Sequences</h2>
      <SellerSequences />
    </div>
  );
};

export default MySequencesTab;
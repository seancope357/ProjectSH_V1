import React from 'react';

const ProfilePictureUpload = () => {
  return (
    <div>
      <h2>Profile Picture Upload</h2>
      {/* Add your upload logic here */}
      <input type="file" accept="image/*" />
      <button>Upload</button>
    </div>
  );
};

export default ProfilePictureUpload;
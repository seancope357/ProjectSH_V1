import React from 'react';
import EditProfileSection from './EditProfileSection';
import ProfilePictureUpload from './ProfilePictureUpload';

const ProfileSettingsTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
      <EditProfileSection />
      <ProfilePictureUpload />
    </div>
  );
};

export default ProfileSettingsTab;
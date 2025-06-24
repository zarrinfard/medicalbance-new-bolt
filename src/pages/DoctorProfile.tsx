import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Edit3, Save, X, Phone, MapPin, Globe, FileText, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const DoctorProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    nationality: '',
    specialties: '',
    website: '',
    social_media: '',
    bio: '',
    profile_image_url: ''
  });

  const [editData, setEditData] = useState(profileData);

  useEffect(() => {
    if (user?.profile) {
      const profile = user.profile;
      const data = {
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        nationality: profile.nationality || '',
        specialties: profile.specialties || '',
        website: profile.website || '',
        social_media: profile.social_media || '',
        bio: profile.bio || '',
        profile_image_url: profile.profile_image_url || ''
      };
      setProfileData(data);
      setEditData(data);
    }
  }, [user]);

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(editData);
      setProfileData(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setEditData(prev => ({
        ...prev,
        profile_image_url: data.publicUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  if (!user) return null;

  return (
    <Layout title="Doctor Profile">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 px-8 py-12">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <img
                  className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                  src={profileData.profile_image_url || `https://ui-avatars.com/api/?name=${profileData.first_name}+${profileData.last_name}&size=128`}
                  alt="Profile"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 cursor-pointer">
                    <Camera className="w-4 h-4 text-gray-600" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              <div className="text-center md:text-left text-white">
                <h1 className="text-3xl font-bold">
                  Dr. {profileData.first_name} {profileData.last_name}
                </h1>
                <p className="text-xl text-green-100 mt-2">{profileData.specialties}</p>
                <div className="flex items-center justify-center md:justify-start mt-3 space-x-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.isAccountApproved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.isAccountApproved ? 'Verified Doctor' : 'Pending Approval'}
                  </div>
                </div>
              </div>
              <div className="ml-auto">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Information */}
              <div className="lg:col-span-2 space-y-8">
                {/* Basic Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="first_name"
                          value={editData.first_name}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.first_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="last_name"
                          value={editData.last_name}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.last_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <p className="text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="nationality"
                          value={editData.nationality}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.nationality}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Medical Specialties</label>
                      {isEditing ? (
                        <textarea
                          name="specialties"
                          value={editData.specialties}
                          onChange={handleChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.specialties}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={editData.bio}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Tell patients about your experience and expertise..."
                        />
                      ) : (
                        <p className="text-gray-700">{profileData.bio || 'No bio provided'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Links */}
              <div className="space-y-8">
                {/* Contact Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={editData.phone}
                            onChange={handleChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <span className="text-gray-900">{profileData.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Online Presence */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Online Presence</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        {isEditing ? (
                          <input
                            type="url"
                            name="website"
                            value={editData.website}
                            onChange={handleChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="https://your-website.com"
                          />
                        ) : (
                          profileData.website ? (
                            <a
                              href={profileData.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {profileData.website}
                            </a>
                          ) : (
                            <span className="text-gray-500">No website provided</span>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Social Media</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="social_media"
                          value={editData.social_media}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="@username or profile URL"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.social_media || 'No social media provided'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Medical License</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Board Certification</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorProfile;
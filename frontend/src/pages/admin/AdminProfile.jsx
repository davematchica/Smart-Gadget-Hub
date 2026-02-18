import { useEffect, useState, useRef } from 'react';
import { Save, Upload, X, User, Camera } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function AdminProfile() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const getToken = useAuthStore((state) => state.getToken);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.getSellerProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getToken();
      await api.updateSellerProfile(profile, token);
      alert('Profile updated successfully! ✅');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const token = getToken();
      const data = await api.uploadProfilePicture(selectedFile, token);
      setProfile(data);
      setSelectedFile(null);
      setImagePreview(null);
      alert('Profile picture updated! ✅');
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Failed to upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Remove profile picture?')) return;
    setRemoving(true);
    try {
      const token = getToken();
      const data = await api.removeProfilePicture(token);
      setProfile(data);
      alert('Profile picture removed');
    } catch (error) {
      console.error('Error removing:', error);
      alert('Failed to remove: ' + error.message);
    } finally {
      setRemoving(false);
    }
  };

  const cancelImageSelection = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const displayImage = imagePreview || profile.profile_picture_url;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900">
          Seller Profile
        </h1>
        <p className="text-neutral-600 mt-1">Manage your business information & profile picture</p>
      </div>

      {/* Profile Picture Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Preview */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-neutral-200 bg-neutral-100">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-accent-400">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
            </div>
            {displayImage && !imagePreview && (
              <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center border-4 border-white">
                <Camera className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-1 space-y-3">
            {!selectedFile ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Change Picture
                </button>
                {profile.profile_picture_url && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={removing}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all disabled:opacity-50"
                  >
                    {removing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Remove Picture
                      </>
                    )}
                  </button>
                )}
                <p className="text-xs text-neutral-500">
                  JPG, PNG or WebP • Max 2MB • Will be displayed as a circle
                </p>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-green-700">✓ Image selected</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 px-5 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={cancelImageSelection}
                    disabled={uploading}
                    className="px-5 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="card p-6 space-y-5">
        <h2 className="text-xl font-semibold mb-4">Business Information</h2>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Owner Name</label>
          <input
            type="text"
            value={profile.owner_name || ''}
            onChange={(e) => setProfile({ ...profile, owner_name: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            placeholder="Ann Montenegro"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Business Name</label>
          <input
            type="text"
            value={profile.business_name || ''}
            onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            placeholder="Ann's iGadgets Online"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Email</label>
          <input
            type="email"
            value={profile.email || ''}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            placeholder="ann@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Phone</label>
          <input
            type="tel"
            value={profile.phone || ''}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            placeholder="+63 123 456 7890"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Address</label>
          <input
            type="text"
            value={profile.address || ''}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            placeholder="Cagayan de Oro, Philippines"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Description</label>
          <textarea
            rows={4}
            value={profile.description || ''}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
            placeholder="Tell customers about your business..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-bold hover:from-primary-700 hover:to-accent-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}
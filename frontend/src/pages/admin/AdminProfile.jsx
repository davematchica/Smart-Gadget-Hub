import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function AdminProfile() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-8">Seller Profile</h1>

      <form onSubmit={handleSave} className="card p-8 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Name</label>
          <input
            type="text"
            value={profile.name || ''}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Business Name</label>
          <input
            type="text"
            value={profile.business_name || ''}
            onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">DTI Registration</label>
          <input
            type="text"
            value={profile.dti_registration || ''}
            onChange={(e) => setProfile({ ...profile, dti_registration: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Email</label>
          <input
            type="email"
            value={profile.email || ''}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Phone</label>
          <input
            type="tel"
            value={profile.phone || ''}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Bio</label>
          <textarea
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={4}
            className="input resize-none"
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="w-5 h-5 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
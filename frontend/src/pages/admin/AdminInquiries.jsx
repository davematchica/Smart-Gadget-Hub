import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const getToken = useAuthStore((state) => state.getToken);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      const token = getToken();
      const data = await api.getInquiries(token);
      setInquiries(data.inquiries || []);
    } catch (error) {
      console.error('Error loading inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-8">Inquiries</h1>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{inquiry.customer_name}</h3>
                  <p className="text-sm text-neutral-600">{inquiry.customer_email}</p>
                </div>
                <span className={`badge ${inquiry.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                  {inquiry.status}
                </span>
              </div>
              <p className="text-neutral-700 mb-2">{inquiry.message}</p>
              {inquiry.products && (
                <p className="text-sm text-neutral-500">Product: {inquiry.products.name}</p>
              )}
              <div className="text-xs text-neutral-400 mt-4">
                {new Date(inquiry.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
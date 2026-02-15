import { useEffect, useState } from 'react';
import { Search, Mail, Phone, Calendar, Package, MessageSquare, CheckCircle, Clock, X } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
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

  const handleStatusUpdate = async (inquiryId, newStatus) => {
    setUpdating(true);
    try {
      const token = getToken();
      await api.updateInquiryStatus(inquiryId, newStatus, token);
      await loadInquiries();
      setShowModal(false);
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const openInquiryModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowModal(true);
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || inquiry.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const pendingCount = inquiries.filter(i => i.status === 'pending').length;
  const respondedCount = inquiries.filter(i => i.status === 'responded').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900">
            Inquiries
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage customer inquiries and questions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Inquiries</p>
              <p className="text-3xl font-bold">{inquiries.length}</p>
            </div>
            <MessageSquare className="w-12 h-12 text-primary-600 opacity-20" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-600 opacity-20" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Responded</p>
              <p className="text-3xl font-bold text-green-600">{respondedCount}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('responded')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'responded'
                  ? 'bg-green-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Responded
            </button>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="card p-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <p className="text-neutral-600">Loading inquiries...</p>
          </div>
        </div>
      ) : filteredInquiries.length > 0 ? (
        <div className="space-y-3">
          {filteredInquiries.map((inquiry) => (
            <div 
              key={inquiry.id} 
              onClick={() => openInquiryModal(inquiry)}
              className="card p-6 cursor-pointer hover:shadow-lg hover:border-primary-200 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                        {inquiry.customer_name}
                      </h3>
                      <p className="text-sm text-neutral-600 flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {inquiry.customer_email}
                      </p>
                      {inquiry.customer_phone && (
                        <p className="text-sm text-neutral-600 flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3" />
                          {inquiry.customer_phone}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-neutral-700 mb-3 line-clamp-2">
                    {inquiry.message}
                  </p>
                  
                  {inquiry.products && (
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <Package className="w-4 h-4" />
                      <span>Product: {inquiry.products.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    inquiry.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {inquiry.status === 'pending' ? (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Responded
                      </>
                    )}
                  </span>
                  
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No inquiries found
            </h3>
            <p className="text-neutral-600">
              {searchTerm ? 'Try adjusting your search terms' : 'No customer inquiries yet'}
            </p>
          </div>
        </div>
      )}

      {/* Inquiry Detail Modal */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">Inquiry Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Customer Information</h3>
                <div className="card p-4 bg-neutral-50">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">Name:</span>
                      {selectedInquiry.customer_name}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neutral-500" />
                      {selectedInquiry.customer_email}
                    </p>
                    {selectedInquiry.customer_phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-neutral-500" />
                        {selectedInquiry.customer_phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Message</h3>
                <div className="card p-4 bg-neutral-50">
                  <p className="whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>

              {/* Product Info */}
              {selectedInquiry.products && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Product</h3>
                  <div className="card p-4 bg-neutral-50">
                    <p className="font-medium">{selectedInquiry.products.name}</p>
                    <p className="text-sm text-neutral-600">₱{parseFloat(selectedInquiry.products.price).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Update Status</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusUpdate(selectedInquiry.id, 'pending')}
                    disabled={updating || selectedInquiry.status === 'pending'}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                      selectedInquiry.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                        : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-2 border-yellow-200'
                    }`}
                  >
                    <Clock className="w-4 h-4 inline mr-2" />
                    Mark as Pending
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedInquiry.id, 'responded')}
                    disabled={updating || selectedInquiry.status === 'responded'}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                      selectedInquiry.status === 'responded'
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Mark as Responded
                  </button>
                </div>
              </div>

              {/* Date */}
              <div className="text-sm text-neutral-500 text-center pt-4 border-t border-neutral-200">
                Received on {new Date(selectedInquiry.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
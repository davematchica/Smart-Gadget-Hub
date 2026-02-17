import { useEffect, useState } from 'react';
import { Search, Mail, Phone, Calendar, Package, MessageSquare, CheckCircle, Clock, X, DollarSign, ShoppingBag } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [recordingSale, setRecordingSale] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [convertedInquiries, setConvertedInquiries] = useState(new Set());
  const getToken = useAuthStore((state) => state.getToken);

  const [saleFormData, setSaleFormData] = useState({
    sale_amount: '',
    quantity: 1,
    payment_method: 'GCash',
    notes: ''
  });

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      const token = getToken();
      const [inquiriesData, salesData] = await Promise.all([
        api.getInquiries(token),
        api.getAllSales(token)
      ]);
      
      setInquiries(inquiriesData.inquiries || []);
      
      // Track which inquiries have been converted to sales
      const converted = new Set(
        salesData.sales
          ?.filter(sale => sale.inquiry_id)
          .map(sale => sale.inquiry_id) || []
      );
      setConvertedInquiries(converted);
    } catch (error) {
      console.error('Error loading inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInquiry = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const token = getToken();
      await api.deleteInquiry(inquiryId, token);
      await loadInquiries();
      setShowModal(false);
      alert('Inquiry deleted successfully!');
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      alert('Failed to delete inquiry: ' + error.message);
    } finally {
      setDeleting(false);
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

  const openSaleModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setSaleFormData({
      sale_amount: inquiry.products?.price || '',
      quantity: 1,
      payment_method: 'GCash',
      notes: ''
    });
    setShowModal(false);
    setShowSaleModal(true);
  };

  const handleRecordSale = async (e) => {
    e.preventDefault();
    
    if (!saleFormData.sale_amount || parseFloat(saleFormData.sale_amount) <= 0) {
      alert('Please enter a valid sale amount');
      return;
    }

    setRecordingSale(true);
    try {
      const token = getToken();
      const saleData = {
        inquiry_id: selectedInquiry.id,
        product_id: selectedInquiry.product_id,
        customer_name: selectedInquiry.customer_name,
        customer_email: selectedInquiry.customer_email,
        customer_phone: selectedInquiry.customer_phone || '',
        sale_amount: parseFloat(saleFormData.sale_amount),
        quantity: parseInt(saleFormData.quantity) || 1,
        payment_method: saleFormData.payment_method,
        notes: saleFormData.notes
      };

      await api.createSale(saleData, token);
      
      // Update inquiry status to 'sold' instead of just 'responded'
      await api.updateInquiryStatus(selectedInquiry.id, 'sold', token);
      
      // Reload inquiries to reflect status change
      await loadInquiries();
      
      // Close modals
      setShowSaleModal(false);
      setSelectedInquiry(null);
      
      alert('Sale recorded successfully! 🎉\n\nInquiry marked as "Successful Sale"');
    } catch (error) {
      console.error('Error recording sale:', error);
      alert('Failed to record sale: ' + error.message);
    } finally {
      setRecordingSale(false);
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle "successful_sales" filter separately
    if (filterStatus === 'successful_sales') {
      return matchesSearch && convertedInquiries.has(inquiry.id);
    }
    
    // For other filters, exclude successful sales to avoid duplication
    const isConverted = convertedInquiries.has(inquiry.id);
    const matchesFilter = filterStatus === 'all' || inquiry.status === filterStatus;
    
    // If filtering by 'all', show all including converted
    // If filtering by specific status, exclude converted ones
    if (filterStatus === 'all') {
      return matchesSearch && matchesFilter;
    } else {
      return matchesSearch && matchesFilter && !isConverted;
    }
  });

  const pendingCount = inquiries.filter(i => i.status === 'pending' && !convertedInquiries.has(i.id)).length;
  const respondedCount = inquiries.filter(i => i.status === 'responded' && !convertedInquiries.has(i.id)).length;
  const cancelledCount = inquiries.filter(i => i.status === 'cancelled').length;
  const successfulSalesCount = convertedInquiries.size;

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

      {/* Stats - Clickable Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          {
            label: 'Total Inquiries',
            count: inquiries.length,
            value: 'all',
            icon: MessageSquare,
            activeColor: 'bg-primary-600 text-white border-primary-600',
            inactiveColor: 'bg-white text-neutral-900 border-neutral-200 hover:border-primary-300 hover:shadow-md',
            iconActiveColor: 'text-white opacity-30',
            iconInactiveColor: 'text-primary-600 opacity-20',
            countActiveColor: 'text-white',
            countInactiveColor: 'text-neutral-900',
          },
          {
            label: 'Pending',
            count: pendingCount,
            value: 'pending',
            icon: Clock,
            activeColor: 'bg-yellow-500 text-white border-yellow-500',
            inactiveColor: 'bg-white text-neutral-900 border-neutral-200 hover:border-yellow-300 hover:shadow-md',
            iconActiveColor: 'text-white opacity-30',
            iconInactiveColor: 'text-yellow-500 opacity-20',
            countActiveColor: 'text-white',
            countInactiveColor: 'text-yellow-600',
          },
          {
            label: 'Responded',
            count: respondedCount,
            value: 'responded',
            icon: CheckCircle,
            activeColor: 'bg-blue-600 text-white border-blue-600',
            inactiveColor: 'bg-white text-neutral-900 border-neutral-200 hover:border-blue-300 hover:shadow-md',
            iconActiveColor: 'text-white opacity-30',
            iconInactiveColor: 'text-blue-600 opacity-20',
            countActiveColor: 'text-white',
            countInactiveColor: 'text-blue-600',
          },
          {
            label: 'Successful Sales',
            count: successfulSalesCount,
            value: 'successful_sales',
            icon: ShoppingBag,
            activeColor: 'bg-green-600 text-white border-green-600',
            inactiveColor: 'bg-white text-neutral-900 border-neutral-200 hover:border-green-300 hover:shadow-md',
            iconActiveColor: 'text-white opacity-30',
            iconInactiveColor: 'text-green-600 opacity-20',
            countActiveColor: 'text-white',
            countInactiveColor: 'text-green-600',
          },
          {
            label: 'Cancelled',
            count: cancelledCount,
            value: 'cancelled',
            icon: X,
            activeColor: 'bg-red-600 text-white border-red-600',
            inactiveColor: 'bg-white text-neutral-900 border-neutral-200 hover:border-red-300 hover:shadow-md',
            iconActiveColor: 'text-white opacity-30',
            iconInactiveColor: 'text-red-600 opacity-20',
            countActiveColor: 'text-white',
            countInactiveColor: 'text-red-600',
          },
        ].map((card) => {
          const isActive = filterStatus === card.value;
          return (
            <button
              key={card.value}
              onClick={() => setFilterStatus(card.value)}
              className={`card p-5 text-left transition-all duration-200 border-2 ${
                isActive ? card.activeColor + ' shadow-lg scale-[1.02]' : card.inactiveColor
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className={`text-sm font-medium ${isActive ? 'text-white opacity-90' : 'text-neutral-600'}`}>
                  {card.label}
                </p>
                <card.icon className={`w-8 h-8 ${isActive ? card.iconActiveColor : card.iconInactiveColor}`} />
              </div>
              <p className={`text-3xl font-bold ${isActive ? card.countActiveColor : card.countInactiveColor}`}>
                {card.count}
              </p>
              {isActive && (
                <p className="text-xs text-white opacity-75 mt-1">Currently filtered</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Only */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search inquiries by name, email, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
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
                  {/* Check if converted to sale */}
                  {convertedInquiries.has(inquiry.id) ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      Successful Sale
                    </span>
                  ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      inquiry.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-700'
                        : inquiry.status === 'responded'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {inquiry.status === 'pending' ? (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </>
                      ) : inquiry.status === 'responded' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Responded
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          Cancelled
                        </>
                      )}
                    </span>
                  )}
                  
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
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-display font-bold">Inquiry Details</h2>
                {/* Status Badge */}
                {convertedInquiries.has(selectedInquiry.id) ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                    <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                    Successful Sale
                  </span>
                ) : (
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    selectedInquiry.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      : selectedInquiry.status === 'responded'
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {selectedInquiry.status === 'pending' ? (
                      <>
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        Pending
                      </>
                    ) : selectedInquiry.status === 'responded' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        Responded
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        Cancelled
                      </>
                    )}
                  </span>
                )}
              </div>
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
              {!convertedInquiries.has(selectedInquiry.id) ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Update Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => handleStatusUpdate(selectedInquiry.id, 'pending')}
                      disabled={updating || selectedInquiry.status === 'pending'}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                        selectedInquiry.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                          : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-2 border-yellow-200'
                      }`}
                    >
                      <Clock className="w-4 h-4 inline mr-2" />
                      Pending
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedInquiry.id, 'responded')}
                      disabled={updating || selectedInquiry.status === 'responded'}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                        selectedInquiry.status === 'responded'
                          ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Responded
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedInquiry.id, 'cancelled')}
                      disabled={updating || selectedInquiry.status === 'cancelled'}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                        selectedInquiry.status === 'cancelled'
                          ? 'bg-red-100 text-red-700 cursor-not-allowed'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-200'
                      }`}
                    >
                      <X className="w-4 h-4 inline mr-2" />
                      Cancelled
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500">
                    • Pending: New inquiry | • Responded: Negotiating/Follow-up | • Cancelled: Customer declined
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Status</h3>
                  <div className="card p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-green-900 mb-1">Status Locked</p>
                        <p className="text-sm text-green-700">
                          This inquiry has been converted to a successful sale and its status cannot be changed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Successful Sale Badge */}
              {convertedInquiries.has(selectedInquiry.id) && (
                <div className="card p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <ShoppingBag className="w-5 h-5" />
                    <div>
                      <p className="font-semibold">✅ Successful Sale</p>
                      <p className="text-xs text-green-600">This inquiry has been converted to a sale</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Convert to Sale - Show ONLY for responded inquiries with products who haven't been converted yet */}
              {selectedInquiry.product_id && 
               selectedInquiry.status === 'responded' && 
               !convertedInquiries.has(selectedInquiry.id) && (
                <div className="space-y-3">
                  <div className="card p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <p className="text-sm text-green-700 font-medium mb-3">
                      ✅ Ready to convert? Click below if customer completed the purchase:
                    </p>
                    <button
                      onClick={() => openSaleModal(selectedInquiry)}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Convert to Sale
                    </button>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {selectedInquiry.status === 'pending' && selectedInquiry.product_id && (
                <div className="card p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-start gap-2 text-yellow-700">
                    <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Next Step</p>
                      <p className="text-xs text-yellow-600">Mark as "Responded" after you contact the customer</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedInquiry.status === 'cancelled' && (
                <div className="space-y-3">
                  <div className="card p-4 bg-red-50 border-red-200">
                    <div className="flex items-center gap-2 text-red-700">
                      <X className="w-5 h-5" />
                      <div>
                        <p className="font-semibold">Inquiry Cancelled</p>
                        <p className="text-xs text-red-600">Customer did not proceed with purchase</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone - Delete Inquiry */}
              {!convertedInquiries.has(selectedInquiry.id) && (
                <div className="border-t border-neutral-200 pt-6">
                  <div className="card p-4 border-red-200 bg-red-50">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <X className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 mb-1">Danger Zone</h4>
                        <p className="text-sm text-red-700">
                          Delete this inquiry permanently. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                      disabled={deleting}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Delete Inquiry Permanently
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Protected Inquiry Badge */}
              {convertedInquiries.has(selectedInquiry.id) && (
                <div className="border-t border-neutral-200 pt-6">
                  <div className="card p-4 border-green-200 bg-green-50">
                    <div className="flex items-center gap-2 text-green-700">
                      <ShoppingBag className="w-5 h-5" />
                      <div>
                        <p className="font-semibold text-sm">Protected Inquiry</p>
                        <p className="text-xs text-green-600">Cannot be deleted - linked to a completed sale</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="text-sm text-neutral-500 text-center pt-4 border-t border-neutral-200">
                Received on {new Date(selectedInquiry.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Recording Modal */}
      {showSaleModal && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold">Record Sale</h2>
                  <p className="text-sm text-neutral-500">Convert inquiry to completed sale</p>
                </div>
              </div>
              <button
                onClick={() => setShowSaleModal(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSale} className="p-6 space-y-6">
              {/* Customer Info (Read-only) */}
              <div className="card p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <h3 className="font-semibold text-sm text-blue-900 mb-2">Customer</h3>
                <p className="text-sm font-medium">{selectedInquiry.customer_name}</p>
                <p className="text-xs text-neutral-600">{selectedInquiry.customer_email}</p>
                {selectedInquiry.customer_phone && (
                  <p className="text-xs text-neutral-600">{selectedInquiry.customer_phone}</p>
                )}
              </div>

              {/* Product Info (Read-only) */}
              {selectedInquiry.products && (
                <div className="card p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <h3 className="font-semibold text-sm text-purple-900 mb-2">Product</h3>
                  <p className="text-sm font-medium">{selectedInquiry.products.name}</p>
                  <p className="text-xs text-neutral-600">
                    Listed Price: ₱{parseFloat(selectedInquiry.products.price).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Sale Amount */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Final Sale Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold">₱</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={saleFormData.sale_amount}
                    onChange={(e) => setSaleFormData({ ...saleFormData, sale_amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                    placeholder="Enter final sale price"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">Enter the actual sale amount (may differ from listed price)</p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={saleFormData.quantity}
                  onChange={(e) => setSaleFormData({ ...saleFormData, quantity: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold mb-2">Payment Method</label>
                <select
                  value={saleFormData.payment_method}
                  onChange={(e) => setSaleFormData({ ...saleFormData, payment_method: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                >
                  <option value="GCash">GCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="PayMaya">PayMaya</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Installment">Installment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold mb-2">Notes (Optional)</label>
                <textarea
                  value={saleFormData.notes}
                  onChange={(e) => setSaleFormData({ ...saleFormData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all resize-none"
                  placeholder="Add delivery notes, special instructions, etc."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowSaleModal(false)}
                  disabled={recordingSale}
                  className="flex-1 px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingSale}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {recordingSale ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Recording...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      Record Sale
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
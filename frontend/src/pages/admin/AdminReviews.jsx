import { useEffect, useState } from 'react';
import { Star, Plus, X, Upload, Trash2, ShoppingBag, Edit2, ImageIcon, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const EMPTY_FORM = {
  customer_name: '',
  product_name: '',
  product_id: '',
  sale_id: '',
  description: '',
  rating: 5,
  is_featured: false,
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSalePickerModal, setShowSalePickerModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState({});
  const getToken = useAuthStore((state) => state.getToken);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = getToken();
      const [reviewsData, salesData] = await Promise.all([
        api.getReviews(),
        api.getAllSales(token),
      ]);
      setReviews(reviewsData.reviews || []);
      setSales(salesData.sales || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Image handling ──────────────────────────
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const currentCount = editingReview
      ? (editingReview.review_images?.length || 0) + imageFiles.length
      : imageFiles.length;
    const allowedCount = 5 - currentCount;
    if (allowedCount <= 0) return;
    const toAdd = files.slice(0, allowedCount);
    setImageFiles(prev => [...prev, ...toAdd]);
    const previews = toAdd.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId, reviewId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      const token = getToken();
      await api.deleteReviewImage(imageId, token);
      setReviews(prev => prev.map(r =>
        r.id === reviewId
          ? { ...r, review_images: r.review_images.filter(img => img.id !== imageId) }
          : r
      ));
      if (editingReview?.id === reviewId) {
        setEditingReview(prev => ({
          ...prev,
          review_images: prev.review_images.filter(img => img.id !== imageId)
        }));
      }
    } catch (err) {
      alert('Failed to delete image: ' + err.message);
    }
  };

  // ── Open modal helpers ──────────────────────
  const openAddModal = () => {
    setEditingReview(null);
    setFormData(EMPTY_FORM);
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const openEditModal = (review) => {
    setEditingReview(review);
    setFormData({
      customer_name: review.customer_name,
      product_name: review.product_name,
      description: review.description,
      rating: review.rating,
      is_featured: review.is_featured,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const openSalePicker = () => setShowSalePickerModal(true);

  const selectSale = (sale) => {
    setFormData(prev => ({
      ...prev,
      customer_name: sale.customer_name,
      product_name: sale.products?.name || prev.product_name,
      product_id: sale.product_id || '',
      sale_id: sale.id,
    }));
    setShowSalePickerModal(false);
  };

  // ── Submit ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = getToken();
      let review;

      if (editingReview) {
        const res = await api.updateReview(editingReview.id, formData, token);
        review = res.review;
      } else {
        const res = await api.createReview(formData, token);
        review = res.review;
      }

      // Upload new images if any
      if (imageFiles.length > 0) {
        await api.uploadReviewImages(review.id, imageFiles, token);
      }

      await loadData();
      setShowModal(false);
    } catch (err) {
      alert('Failed to save review: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    setDeletingId(id);
    try {
      const token = getToken();
      await api.deleteReview(id, token);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Toggle featured ─────────────────────────
  const handleToggleFeatured = async (review) => {
    setTogglingId(review.id);
    try {
      const token = getToken();
      await api.toggleReviewFeatured(review.id, !review.is_featured, token);
      setReviews(prev => prev.map(r =>
        r.id === review.id ? { ...r, is_featured: !r.is_featured } : r
      ));
    } catch (err) {
      alert('Failed to update: ' + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const totalImages = editingReview
    ? (editingReview.review_images?.length || 0) + imageFiles.length
    : imageFiles.length;

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`} />
    ));

  const featuredCount = reviews.filter(r => r.is_featured).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900">Reviews</h1>
          <p className="text-neutral-600 mt-1">Manage customer reviews & testimonials</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-accent-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add Review
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-neutral-500 mb-1">Total Reviews</p>
          <p className="text-3xl font-bold text-neutral-900">{reviews.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-neutral-500 mb-1">Featured</p>
          <p className="text-3xl font-bold text-primary-600">{featuredCount}</p>
        </div>
        <div className="card p-5 col-span-2 sm:col-span-1">
          <p className="text-sm text-neutral-500 mb-1">Avg Rating</p>
          <p className="text-3xl font-bold text-yellow-500">
            {reviews.length > 0
              ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
              : '—'}
          </p>
        </div>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="card p-12 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="card p-12 text-center">
          <Star className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No reviews yet</h3>
          <p className="text-neutral-500 mb-6">Add your first customer review</p>
          <button
            onClick={openAddModal}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all"
          >
            Add Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map(review => {
            const imgs = review.review_images || [];
            const idx = activeImageIndex[review.id] || 0;
            return (
              <div key={review.id} className="card overflow-hidden flex flex-col">
                {/* Image Carousel */}
                <div className="relative bg-neutral-100 aspect-[4/3]">
                  {imgs.length > 0 ? (
                    <>
                      <img
                        src={imgs[idx]?.image_url}
                        alt="Review"
                        className="w-full h-full object-cover"
                      />
                      {imgs.length > 1 && (
                        <>
                          <button
                            onClick={() => setActiveImageIndex(prev => ({
                              ...prev,
                              [review.id]: (idx - 1 + imgs.length) % imgs.length
                            }))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActiveImageIndex(prev => ({
                              ...prev,
                              [review.id]: (idx + 1) % imgs.length
                            }))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {imgs.map((_, i) => (
                              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? 'bg-white' : 'bg-white/50'}`} />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-neutral-300" />
                    </div>
                  )}
                  {/* Featured badge */}
                  {review.is_featured && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs font-semibold rounded-lg">
                      Featured
                    </span>
                  )}
                  {/* Image count badge */}
                  {imgs.length > 0 && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded-lg">
                      {imgs.length}/5
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-neutral-900">{review.customer_name}</p>
                      <p className="text-sm text-neutral-500">{review.product_name}</p>
                    </div>
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>
                  <p className="text-sm text-neutral-600 line-clamp-3 flex-1 mb-4">
                    "{review.description}"
                  </p>
                  <p className="text-xs text-neutral-400 mb-4">
                    {new Date(review.created_at).toLocaleDateString('en-PH', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-neutral-100">
                    {/* Toggle Featured */}
                    <button
                      onClick={() => handleToggleFeatured(review)}
                      disabled={togglingId === review.id}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                        review.is_featured
                          ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {review.is_featured
                        ? <ToggleRight className="w-4 h-4" />
                        : <ToggleLeft className="w-4 h-4" />
                      }
                      {review.is_featured ? 'Featured' : 'Feature'}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(review)}
                      className="p-2 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                      {deletingId === review.id
                        ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ───────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">
                {editingReview ? 'Edit Review' : 'Add Review'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Convert from sale banner */}
              {!editingReview && (
                <button
                  type="button"
                  onClick={openSalePicker}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-primary-300 bg-primary-50 hover:bg-primary-100 transition-all text-left"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-800">Convert from a Sale</p>
                    <p className="text-sm text-primary-600">Auto-fill customer & product from an existing sale</p>
                  </div>
                </button>
              )}

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={e => setFormData(p => ({ ...p, customer_name: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  placeholder="e.g. Maria Santos"
                />
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Product / Item Bought <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={e => setFormData(p => ({ ...p, product_name: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  placeholder="e.g. iPhone 14 Pro Max"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData(p => ({ ...p, rating: star }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`} />
                    </button>
                  ))}
                  <span className="ml-2 self-center text-sm text-neutral-500">{formData.rating}/5</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Customer Quote / Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
                  placeholder="What did the customer say about their purchase?"
                />
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <p className="font-semibold text-sm">Feature on Homepage</p>
                  <p className="text-xs text-neutral-500">Shows in the homepage reviews carousel</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, is_featured: !p.is_featured }))}
                  className={`relative w-12 h-6 rounded-full transition-all ${formData.is_featured ? 'bg-primary-600' : 'bg-neutral-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.is_featured ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold">
                    Review Photos <span className="text-neutral-400 font-normal">(max 5)</span>
                  </label>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${totalImages >= 5 ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-600'}`}>
                    {totalImages}/5
                  </span>
                </div>

                {/* Existing images (edit mode) */}
                {editingReview?.review_images?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editingReview.review_images.map(img => (
                      <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-neutral-200 group">
                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id, editingReview.id)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New image previews */}
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-primary-300 group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                {totalImages < 5 && (
                  <label className="flex items-center gap-3 p-4 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
                    <Upload className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-700">Click to upload photos</p>
                      <p className="text-xs text-neutral-500">JPG, PNG up to 5MB each · {5 - totalImages} remaining</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="flex-1 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-bold hover:from-primary-700 hover:to-accent-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingReview ? 'Save Changes' : 'Add Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Sale Picker Modal ──────────────────── */}
      {showSalePickerModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold">Select a Sale</h3>
                <p className="text-sm text-neutral-500">Auto-fill customer & product info</p>
              </div>
              <button onClick={() => setShowSalePickerModal(false)} className="p-2 rounded-lg hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {sales.length === 0 ? (
                <p className="text-center text-neutral-500 py-8">No sales recorded yet</p>
              ) : (
                sales.map(sale => (
                  <button
                    key={sale.id}
                    type="button"
                    onClick={() => selectSale(sale)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-neutral-200 hover:border-primary-400 hover:bg-primary-50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900 truncate">{sale.customer_name}</p>
                      <p className="text-sm text-neutral-500 truncate">{sale.products?.name || sale.product_name || 'Unknown product'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-green-600">₱{parseFloat(sale.sale_amount).toLocaleString()}</p>
                      <p className="text-xs text-neutral-400">{new Date(sale.created_at).toLocaleDateString()}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
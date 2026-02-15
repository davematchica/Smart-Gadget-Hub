import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const getToken = useAuthStore((state) => state.getToken);

  const [formData, setFormData] = useState({
    name: '',
    category: 'iPhones',
    price: '',
    description: '',
    availability: true,
    featured: false,
    stock_count: 0,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'iPhones',
      price: '',
      description: '',
      availability: true,
      featured: false,
      stock_count: 0,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description || '',
      availability: product.availability,
      featured: product.featured || false,
      stock_count: product.stock_count || 0,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limit to 5 images
    const selectedFiles = files.slice(0, 5);
    setImageFiles(selectedFiles);

    // Create previews
    const previews = selectedFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price greater than 0');
      return;
    }

    setSaving(true);

    try {
      const token = getToken();
      
      if (!token) {
        alert('You are not logged in. Please log in again.');
        setSaving(false);
        return;
      }

      // Prepare data with correct types
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        price: priceNum,
        description: formData.description.trim(),
        availability: Boolean(formData.availability),
        featured: Boolean(formData.featured),
        stock_count: parseInt(formData.stock_count) || 0,
      };

      console.log('Submitting product:', productData);

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData, token);
        alert('Product updated successfully!');
        
        // Upload images if any
        if (imageFiles.length > 0) {
          setUploadingImages(true);
          try {
            await uploadProductImages(editingProduct.id, imageFiles, token);
            alert('Images uploaded successfully!');
          } catch (imgError) {
            console.error('Image upload error:', imgError);
            alert('Product updated but some images failed to upload. You can add images later by editing the product.');
          }
          setUploadingImages(false);
        }
      } else {
        const result = await api.createProduct(productData, token);
        console.log('Create product result:', result);
        
        alert('Product added successfully!');
        
        // Only try to upload images if we have them
        // For now, skip image upload since backend isn't ready
        if (imageFiles.length > 0) {
          console.log('Images selected but upload not implemented yet:', imageFiles.length, 'images');
          alert('Product created! Image upload will be available once backend storage is configured.');
        }
      }
      
      await loadProducts();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  const uploadProductImages = async (productId, files, token) => {
    const { supabase } = await import('../../services/supabase');
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}/${Date.now()}_${i}.${fileExt}`;
      
      try {
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;
        console.log('Image uploaded:', publicUrl);

        // Save to database using API
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${productId}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            image_url: publicUrl,
            is_primary: i === 0,
            display_order: i
          })
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Failed to save image URL:', error);
          throw new Error(error.error || 'Failed to save image URL');
        }

        console.log(`Image ${i + 1} saved successfully`);
      } catch (error) {
        console.error(`Error uploading image ${i + 1}:`, error);
        throw error;
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = getToken();
      await api.deleteProduct(id, token);
      await loadProducts();
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product: ' + (error.message || 'Unknown error'));
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900">
            Products
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage your product catalog ({products.length} total)
          </p>
        </div>
        <button 
          onClick={openAddModal}
          className="btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="card p-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <p className="text-neutral-600">Loading products...</p>
          </div>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="card overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-neutral-700 text-sm">Product</th>
                  <th className="text-left p-4 font-semibold text-neutral-700 text-sm">Category</th>
                  <th className="text-left p-4 font-semibold text-neutral-700 text-sm">Price</th>
                  <th className="text-left p-4 font-semibold text-neutral-700 text-sm">Status</th>
                  <th className="text-right p-4 font-semibold text-neutral-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-neutral-900">{product.name}</div>
                    </td>
                    <td className="p-4">
                      <span className="badge badge-primary">{product.category}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-neutral-900">
                        ₱{parseFloat(product.price).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        product.availability 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-neutral-100">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 mb-1">{product.name}</h3>
                    <span className="badge badge-primary text-xs">{product.category}</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    product.availability 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {product.availability ? 'Available' : 'Out'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    ₱{parseFloat(product.price).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditModal(product)}
                      className="p-2 rounded-lg bg-blue-50 text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-12">
          <div className="text-center">
            <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {searchTerm ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Get started by adding your first product'
              }
            </p>
            {!searchTerm && (
              <button 
                onClick={openAddModal}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Your First Product
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., iPhone 15 Pro Max"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                  >
                    <option value="iPhones">iPhones</option>
                    <option value="Android">Android</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Price (₱) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="input resize-none"
                  placeholder="Describe your product..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Stock Count</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_count}
                  onChange={(e) => setFormData({ ...formData, stock_count: e.target.value })}
                  className="input"
                  placeholder="0"
                />
              </div>

              {/* Product Images Upload */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Product Images {!editingProduct && '(Optional)'}
                </label>
                <div className="space-y-3">
                  {/* Upload Button */}
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-xl hover:border-primary-400 hover:bg-primary-50/50 transition-all cursor-pointer group">
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-neutral-400 group-hover:text-primary-600 mb-2" />
                      <p className="text-sm text-neutral-600 group-hover:text-primary-700 font-medium">
                        Click to upload images
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        PNG, JPG up to 5 images
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border-2 border-neutral-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 bg-primary-600 text-white text-[10px] px-2 py-0.5 rounded">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show existing images when editing */}
                  {editingProduct && editingProduct.product_images?.length > 0 && (
                    <div>
                      <p className="text-xs text-neutral-500 mb-2">Current Images:</p>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {editingProduct.product_images.map((img) => (
                          <div key={img.id} className="relative aspect-square">
                            <img
                              src={img.image_url}
                              alt="Product"
                              className="w-full h-full object-cover rounded-lg border-2 border-neutral-200"
                            />
                            {img.is_primary && (
                              <div className="absolute bottom-1 left-1 bg-primary-600 text-white text-[10px] px-2 py-0.5 rounded">
                                Primary
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-neutral-500 mt-2">
                        Upload new images to replace current ones
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-semibold">Available for sale</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-semibold">Featured product</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary inline-flex items-center justify-center gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingProduct ? 'Update Product' : 'Add Product'}
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
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Star, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');

  const categories = ['All', 'iPhones', 'Android', 'Laptops', 'Accessories'];

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchTerm]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const data = await api.getProducts(params);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Browse Our Collection
          </h1>
          <p className="text-lg text-neutral-600">
            Find your perfect gadget from our curated selection
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="aspect-square bg-neutral-200 shimmer"></div>
                <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3">
                  <div className="h-3 sm:h-4 bg-neutral-200 shimmer rounded w-1/3"></div>
                  <div className="h-4 sm:h-6 bg-neutral-200 shimmer rounded"></div>
                  <div className="h-3 sm:h-4 bg-neutral-200 shimmer rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-neutral-600 text-lg">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, index }) {
  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/products/${product.id}`} className="group block">
        <div className="card card-hover overflow-hidden h-full">
          <div className="aspect-square bg-neutral-100 relative overflow-hidden">
            {primaryImage ? (
              <img
                src={primaryImage.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-4xl sm:text-6xl">📱</div>
              </div>
            )}
            {product.featured && (
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 px-2 py-0.5 sm:px-3 sm:py-1 bg-accent-500 text-white rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                <span className="hidden sm:inline">Featured</span>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            <div className="badge badge-primary text-[10px] sm:text-xs mb-2 sm:mb-3">
              {product.category}
            </div>
            <h3 className="font-display font-semibold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
            <p className="text-neutral-600 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2 hidden sm:block">
              {product.description}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <span className="text-lg sm:text-xl md:text-2xl font-display font-bold text-primary-600">
                ₱{parseFloat(product.price).toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm text-primary-600 font-semibold flex items-center gap-1">
                View
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
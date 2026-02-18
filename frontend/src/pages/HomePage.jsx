import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Zap, Heart, ArrowRight, Star, TrendingUp, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [seller, setSeller] = useState(null);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (featuredReviews.length <= 1) return;
    const timer = setInterval(() => {
      setReviewIndex(p => (p + 1) % featuredReviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredReviews]);

  const loadData = async () => {
    try {
      const [productsData, sellerData, reviewsData] = await Promise.all([
        api.getFeaturedProducts(),
        api.getSellerProfile(),
        api.getFeaturedReviews(),
      ]);
      setFeaturedProducts(productsData.products || []);
      setSeller(sellerData);
      setFeaturedReviews(reviewsData.reviews || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'iPhones', icon: '📱', gradient: 'from-purple-500 to-pink-500' },
    { name: 'Android', icon: '🤖', gradient: 'from-green-500 to-teal-500' },
    { name: 'Laptops', icon: '💻', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Accessories', icon: '🎧', gradient: 'from-orange-500 to-red-500' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Verified Seller',
      description: 'DTI Registered & Legitimate Business',
    },
    {
      icon: Zap,
      title: 'Fast Response',
      description: 'Quick inquiry processing & support',
    },
    {
      icon: Heart,
      title: 'Quality Assured',
      description: 'Only premium, authentic gadgets',
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-accent-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary-200 mb-6">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-700">Trusted by Tech Enthusiasts</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight"
            >
              iPhones, Laptops,{' '}
              <span className="gradient-text animate-gradient-x">
                iPads & More!
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto"
            >
              Your trusted source for premium gadgets. Curated by Ann Montenegro.
              Your trusted source for quality tech.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/products" className="btn-primary text-lg group">
                Browse Products
                <ArrowRight className="w-5 h-5 inline ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/contact" className="btn-secondary text-lg">
                Get in Touch
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
            >
              {[
                { value: '100+', label: 'Products' },
                { value: '500+', label: 'Happy Customers' },
                { value: '24/7', label: 'Support' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl md:text-4xl font-display font-bold text-primary-600 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-neutral-600">
              Find exactly what you're looking for
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, idx) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  to={`/products?category=${category.name}`}
                  className="group relative block"
                >
                  <div className="card card-hover p-8 text-center relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <div className="text-5xl mb-4">{category.icon}</div>
                    <h3 className="font-display font-semibold text-xl mb-2">
                      {category.name}
                    </h3>
                    <div className="flex items-center justify-center text-primary-600 font-semibold">
                      Explore
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 mb-4">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">Featured Products</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Trending Now
              </h2>
              <p className="text-lg text-neutral-600">
                Our most popular gadgets this month
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {featuredProducts.slice(0, 6).map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/products" className="btn-primary text-lg">
                View All Products
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-neutral-600">
              Your satisfaction is our priority
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="card p-8 text-center group hover:shadow-glow"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews Carousel ─────────────────── */}
      {featuredReviews.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="flex justify-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />)}
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">What Customers Say</h2>
              <p className="text-lg text-neutral-600">Real reviews from real buyers</p>
            </motion.div>

            {/* Carousel */}
            <div className="relative max-w-4xl mx-auto">
              <div className="overflow-hidden">
                <motion.div
                  key={reviewIndex}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
                >
                  {/* Image */}
                  {(() => {
                    const review = featuredReviews[reviewIndex];
                    const imgs = review?.review_images || [];
                    return (
                      <>
                        {imgs.length > 0 ? (
                          <div className="rounded-2xl overflow-hidden aspect-square shadow-xl">
                            <img
                              src={imgs[0]?.image_url}
                              alt={review?.customer_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 aspect-square flex items-center justify-center shadow-xl">
                            <Star className="w-24 h-24 text-primary-300" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex flex-col justify-center">
                          <Quote className="w-10 h-10 text-primary-200 mb-4" />
                          <p className="text-xl text-neutral-700 leading-relaxed italic mb-6">
                            "{review?.description}"
                          </p>
                          {/* Stars */}
                          <div className="flex gap-1 mb-4">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} className={`w-5 h-5 ${i < review?.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200'}`} />
                            ))}
                          </div>
                          {/* Customer info */}
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg font-bold">
                                {review?.customer_name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900">{review?.customer_name}</p>
                              <p className="text-sm text-primary-600 font-medium">Bought: {review?.product_name}</p>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              </div>

              {/* Navigation */}
              {featuredReviews.length > 1 && (
                <>
                  <button
                    onClick={() => setReviewIndex(p => (p - 1 + featuredReviews.length) % featuredReviews.length)}
                    className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-neutral-200 rounded-full shadow-lg flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setReviewIndex(p => (p + 1) % featuredReviews.length)}
                    className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-neutral-200 rounded-full shadow-lg flex items-center justify-center hover:border-primary-400 hover:text-primary-600 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Dots */}
                  <div className="flex justify-center gap-2 mt-8">
                    {featuredReviews.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setReviewIndex(i)}
                        className={`rounded-full transition-all ${i === reviewIndex ? 'w-6 h-2.5 bg-primary-600' : 'w-2.5 h-2.5 bg-neutral-300 hover:bg-primary-300'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* See all reviews link */}
            <div className="text-center mt-10">
              <Link
                to="/reviews"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-xl font-semibold hover:bg-primary-600 hover:text-white transition-all duration-300"
              >
                See All Reviews
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <Sparkles className="w-12 h-12 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to Find Your Perfect Gadget?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Browse our collection or get in touch for personalized recommendations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                Browse Products
              </Link>
              <Link to="/contact" className="px-8 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }) {
  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="card card-hover overflow-hidden h-full">
        {/* Image */}
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

        {/* Content */}
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
  );
}
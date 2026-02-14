import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Shield, Zap, MessageCircle } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import { api } from '../services/api';
import InquiryModal from '../components/InquiryModal';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showInquiry, setShowInquiry] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await api.getProduct(id);
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.product_images?.sort((a, b) => a.display_order - b.display_order) || [];

  return (
    <div className="py-12">
      <div className="container-custom">
        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {images.length > 0 ? (
              <>
                <Swiper
                  modules={[Navigation, Pagination, Thumbs]}
                  navigation
                  pagination={{ clickable: true }}
                  thumbs={{ swiper: thumbsSwiper }}
                  className="rounded-2xl overflow-hidden shadow-xl"
                >
                  {images.map((image) => (
                    <SwiperSlide key={image.id}>
                      <div className="aspect-square bg-neutral-100">
                        <img
                          src={image.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {images.length > 1 && (
                  <Swiper
                    modules={[Thumbs]}
                    onSwiper={setThumbsSwiper}
                    spaceBetween={10}
                    slidesPerView={4}
                    watchSlidesProgress
                    className="thumbs-swiper"
                  >
                    {images.map((image) => (
                      <SwiperSlide key={image.id}>
                        <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary-500 transition-colors">
                          <img
                            src={image.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </>
            ) : (
              <div className="aspect-square bg-neutral-100 rounded-2xl flex items-center justify-center">
                <div className="text-8xl">📱</div>
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="badge badge-primary mb-4">
                {product.category}
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                {product.name}
              </h1>
              <div className="text-4xl font-display font-bold text-primary-600 mb-6">
                ₱{parseFloat(product.price).toLocaleString()}
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-neutral">
              <h3 className="font-display font-semibold text-xl mb-3">Description</h3>
              <p className="text-neutral-600">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div>
                <h3 className="font-display font-semibold text-xl mb-3">Specifications</h3>
                <div className="glass rounded-xl p-6 space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-neutral-200 pb-2 last:border-0 last:pb-0">
                      <span className="text-neutral-600 font-medium">{key}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="flex items-center gap-2 py-3">
              {product.availability ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-semibold">In Stock</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-semibold">Out of Stock</span>
                </>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => setShowInquiry(true)}
                className="flex-1 btn-primary inline-flex items-center justify-center gap-2 text-base sm:text-lg py-3 sm:py-4"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Send Inquiry</span>
              </button>
              <Link 
                to="/contact" 
                className="flex-1 btn-secondary inline-flex items-center justify-center gap-2 text-base sm:text-lg py-3 sm:py-4"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Contact Seller</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-neutral-200 mt-6">
              <div className="flex items-center gap-3 p-4 glass rounded-xl">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm sm:text-base">Verified Seller</div>
                  <div className="text-xs text-neutral-600">DTI Registered</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 glass rounded-xl">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-accent-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm sm:text-base">Fast Response</div>
                  <div className="text-xs text-neutral-600">24/7 Support</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiry && (
        <InquiryModal
          product={product}
          onClose={() => setShowInquiry(false)}
        />
      )}
    </div>
  );
}
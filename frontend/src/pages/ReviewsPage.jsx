import { useEffect, useState } from 'react';
import { Star, ImageIcon, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { api } from '../services/api';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImages, setActiveImages] = useState({});
  const [lightbox, setLightbox] = useState(null); // { images, index }

  useEffect(() => {
    api.getReviews()
      .then(data => setReviews(data.reviews || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const nextImage = (reviewId, total) =>
    setActiveImages(p => ({ ...p, [reviewId]: ((p[reviewId] || 0) + 1) % total }));

  const prevImage = (reviewId, total) =>
    setActiveImages(p => ({ ...p, [reviewId]: ((p[reviewId] || 0) - 1 + total) % total }));

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200'}`} />
    ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <Star key={i} className="absolute text-white fill-white"
              style={{
                width: Math.random() * 16 + 8,
                height: Math.random() * 16 + 8,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1
              }}
            />
          ))}
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <div className="flex justify-center mb-4">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-8 h-8 text-yellow-300 fill-yellow-300" />
            ))}
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
            Customer Reviews
          </h1>
          <p className="text-primary-100 text-lg max-w-xl mx-auto">
            Real customers, real experiences. See what buyers are saying about their purchases from Ann's iGadgets.
          </p>
          {reviews.length > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)} average · {reviews.length} reviews
            </div>
          )}
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <Star className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 text-lg">No reviews yet. Check back soon!</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {reviews.map(review => {
              const imgs = review.review_images || [];
              const idx = activeImages[review.id] || 0;
              return (
                <div key={review.id} className="break-inside-avoid card overflow-hidden mb-6">
                  {/* Image */}
                  {imgs.length > 0 && (
                    <div className="relative bg-neutral-100">
                      <img
                        src={imgs[idx]?.image_url}
                        alt={`${review.customer_name}'s review`}
                        className="w-full object-cover cursor-zoom-in"
                        style={{ maxHeight: '320px' }}
                        onClick={() => setLightbox({ images: imgs, index: idx })}
                      />
                      {imgs.length > 1 && (
                        <>
                          <button onClick={() => prevImage(review.id, imgs.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all">
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button onClick={() => nextImage(review.id, imgs.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {imgs.map((_, i) => (
                              <button key={i} onClick={() => setActiveImages(p => ({ ...p, [review.id]: i }))}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white scale-125' : 'bg-white/50'}`} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-3">
                      {renderStars(review.rating)}
                    </div>

                    {/* Quote */}
                    <div className="relative mb-4">
                      <Quote className="w-6 h-6 text-primary-200 absolute -top-1 -left-1" />
                      <p className="text-neutral-700 text-sm leading-relaxed pl-5 italic">
                        {review.description}
                      </p>
                    </div>

                    {/* Customer */}
                    <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {review.customer_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 text-sm truncate">{review.customer_name}</p>
                        <p className="text-xs text-primary-600 font-medium truncate">Bought: {review.product_name}</p>
                      </div>
                      <p className="text-xs text-neutral-400 flex-shrink-0">
                        {new Date(review.created_at).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
            onClick={() => setLightbox(null)}
          >
            <ChevronLeft className="w-5 h-5 rotate-[-90deg]" />
          </button>
          <img
            src={lightbox.images[lightbox.index]?.image_url}
            alt="Review"
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
          {lightbox.images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                onClick={e => { e.stopPropagation(); setLightbox(p => ({ ...p, index: (p.index - 1 + p.images.length) % p.images.length })); }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                onClick={e => { e.stopPropagation(); setLightbox(p => ({ ...p, index: (p.index + 1) % p.images.length })); }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {lightbox.images.map((_, i) => (
                  <button key={i}
                    onClick={e => { e.stopPropagation(); setLightbox(p => ({ ...p, index: i })); }}
                    className={`w-2 h-2 rounded-full transition-all ${i === lightbox.index ? 'bg-white scale-125' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
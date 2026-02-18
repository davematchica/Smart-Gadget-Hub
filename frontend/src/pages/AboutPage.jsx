import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Heart, Users, Mail, Phone, MapPin, User } from 'lucide-react';
import { api } from '../services/api';

export default function AboutPage() {
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    loadSeller();
  }, []);

  const loadSeller = async () => {
    try {
      const data = await api.getSellerProfile();
      setSeller(data);
    } catch (error) {
      console.error('Error loading seller:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Profile */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Profile Picture */}
            <div className="mb-6 flex justify-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-white/10">
                {seller?.profile_picture_url ? (
                  <img
                    src={seller.profile_picture_url}
                    alt={seller.owner_name || 'Ann Montenegro'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/20 to-white/10">
                    <User className="w-16 h-16 text-white/50" />
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
              Meet {seller?.owner_name || 'Ann Montenegro'}
            </h1>
            <p className="text-xl text-primary-100 mb-2 font-semibold">
              {seller?.business_name || "Ann's iGadgets Online"}
            </p>
            <p className="text-lg text-primary-100/80 max-w-2xl mx-auto">
              Your trusted partner in premium gadgets
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-custom py-16 max-w-5xl">
        {/* Bio Section */}
        {seller && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-8 mb-12"
          >
            <h2 className="text-2xl font-display font-bold mb-4">About the Business</h2>
            <p className="text-neutral-700 leading-relaxed text-lg">
              {seller.description || seller.bio || "Welcome to Ann's iGadgets Online! We specialize in providing premium, authentic gadgets including iPhones, Android devices, laptops, and accessories. Every product is carefully curated to ensure quality and authenticity."}
            </p>

            {/* Contact Info Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {seller.email && (
                <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl border border-primary-200">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-neutral-600 font-medium">Email</div>
                    <a href={`mailto:${seller.email}`} className="text-sm font-semibold text-primary-700 hover:underline truncate block">
                      {seller.email}
                    </a>
                  </div>
                </div>
              )}
              
              {seller.phone && (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-neutral-600 font-medium">Phone</div>
                    <a href={`tel:${seller.phone}`} className="text-sm font-semibold text-green-700 hover:underline">
                      {seller.phone}
                    </a>
                  </div>
                </div>
              )}

              {seller.address && (
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-neutral-600 font-medium">Location</div>
                    <p className="text-sm font-semibold text-orange-700 truncate">
                      {seller.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Why Choose Us */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold text-center mb-10">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { 
                icon: Shield, 
                title: 'Verified Business', 
                description: 'DTI registered and legitimate online business',
                color: 'bg-blue-50 border-blue-200 text-blue-600'
              },
              { 
                icon: Award, 
                title: 'Quality Products', 
                description: 'Only authentic, premium gadgets from trusted sources',
                color: 'bg-purple-50 border-purple-200 text-purple-600'
              },
              { 
                icon: Heart, 
                title: 'Customer First', 
                description: 'Your satisfaction and trust are our top priorities',
                color: 'bg-pink-50 border-pink-200 text-pink-600'
              },
              { 
                icon: Users, 
                title: 'Trusted by Many', 
                description: 'Happy customers across the Philippines',
                color: 'bg-green-50 border-green-200 text-green-600'
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className={`card p-6 border-2 ${item.color.split(' ')[0]} ${item.color.split(' ')[1]}`}
              >
                <div className={`w-14 h-14 ${item.color.split(' ')[0]} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon className={`w-7 h-7 ${item.color.split(' ')[2]}`} />
                </div>
                <h3 className="font-display font-bold text-xl mb-2 text-neutral-900">{item.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Heart, Users } from 'lucide-react';
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
    <div className="py-12">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            About Smart GadgetHub
          </h1>
          <p className="text-lg text-neutral-600">
            Your trusted partner in premium gadgets
          </p>
        </motion.div>

        {seller && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-8 mb-12"
          >
            <div className="text-center mb-8">
              {seller.profile_image_url && (
                <img
                  src={seller.profile_image_url}
                  alt={seller.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-xl"
                />
              )}
              <h2 className="text-3xl font-display font-bold mb-2">{seller.name}</h2>
              <p className="text-neutral-600 font-semibold">{seller.business_name}</p>
            </div>

            <div className="prose prose-neutral max-w-none">
              <p className="text-neutral-600">{seller.bio}</p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {seller.dti_registration && (
                <div className="flex items-center gap-3 p-4 glass rounded-xl">
                  <Shield className="w-6 h-6 text-primary-600" />
                  <div>
                    <div className="text-sm text-neutral-600">DTI Registration</div>
                    <div className="font-semibold">{seller.dti_registration}</div>
                  </div>
                </div>
              )}
              {seller.email && (
                <div className="p-4 glass rounded-xl">
                  <div className="text-sm text-neutral-600">Email</div>
                  <a href={`mailto:${seller.email}`} className="font-semibold text-primary-600 hover:underline">
                    {seller.email}
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: Shield, title: 'Verified Business', description: 'DTI registered and legitimate' },
            { icon: Award, title: 'Quality Products', description: 'Only authentic gadgets' },
            { icon: Heart, title: 'Customer First', description: 'Your satisfaction matters' },
            { icon: Users, title: 'Trusted by Many', description: 'Happy customers nationwide' },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="card p-6"
            >
              <item.icon className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="font-display font-semibold text-xl mb-2">{item.title}</h3>
              <p className="text-neutral-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
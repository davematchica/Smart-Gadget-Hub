import { useEffect, useState } from 'react';
import { Package, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, inquiries: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const getToken = useAuthStore((state) => state.getToken);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = getToken();
      const [productsData, inquiriesData, pendingData] = await Promise.all([
        api.getProducts(),
        api.getInquiries(token),
        api.getInquiries(token, { status: 'pending' }),
      ]);
      setStats({
        products: productsData.products?.length || 0,
        inquiries: inquiriesData.inquiries?.length || 0,
        pending: pendingData.inquiries?.length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { 
      icon: Package, 
      label: 'Total Products', 
      value: stats.products, 
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
      link: '/admin/products'
    },
    { 
      icon: MessageSquare, 
      label: 'Total Inquiries', 
      value: stats.inquiries, 
      color: 'from-accent-500 to-accent-600',
      bgColor: 'bg-accent-50',
      link: '/admin/inquiries'
    },
    { 
      icon: TrendingUp, 
      label: 'Pending Inquiries', 
      value: stats.pending, 
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      link: '/admin/inquiries'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900">
            Dashboard
          </h1>
          <p className="text-neutral-600 mt-1">Welcome back! Here's your overview.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {cards.map((card, index) => (
          <Link
            key={card.label}
            to={card.link}
            className="group"
          >
            <div className="card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 ${card.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`w-7 h-7 bg-gradient-to-br ${card.color} bg-clip-text text-transparent`} 
                    style={{ 
                      filter: 'drop-shadow(0 0 8px currentColor)',
                      WebkitTextFillColor: 'transparent',
                      WebkitBackgroundClip: 'text'
                    }}
                  />
                </div>
                <div className={`text-4xl font-display font-bold bg-gradient-to-br ${card.color} bg-clip-text text-transparent`}>
                  {loading ? '...' : card.value}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-neutral-700 font-semibold">{card.label}</div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Welcome Card */}
      <div className="card p-8 bg-gradient-to-br from-primary-50 to-accent-50 border-primary-100">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-display font-bold mb-3 text-neutral-900">
              Welcome to Admin Panel 👋
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-6">
              Manage your products, handle customer inquiries, and update your seller profile from here.
              Use the navigation menu to access different sections of your admin panel.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/products"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Manage Products
              </Link>
              <Link
                to="/admin/inquiries"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                View Inquiries
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
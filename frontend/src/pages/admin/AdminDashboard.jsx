import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  MessageSquare, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Flame,
  Activity
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const getToken = useAuthStore((state) => state.getToken);

  useEffect(() => {
    loadDashboard();
    
    // Refresh dashboard every 30 seconds to show latest sales
    const interval = setInterval(() => {
      loadDashboard();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const token = getToken();
      const data = await api.getDashboardStats(token);
      console.log('Dashboard data received:', data); // Debug log
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadDashboard();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.stats?.totalProducts || 0,
      icon: Package,
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-600',
      description: `${stats?.stats?.availableProducts || 0} available`,
      link: '/admin/products'
    },
    {
      title: 'Total Inquiries',
      value: stats?.stats?.totalInquiries || 0,
      icon: MessageSquare,
      lightBg: 'bg-purple-50',
      textColor: 'text-purple-600',
      description: `${stats?.stats?.pendingInquiries || 0} pending`,
      link: '/admin/inquiries'
    },
    {
      title: 'Total Sales',
      value: stats?.stats?.totalSales || 0,
      icon: ShoppingBag,
      lightBg: 'bg-green-50',
      textColor: 'text-green-600',
      description: 'Completed orders',
      link: '/admin/products'
    },
    {
      title: 'Total Revenue',
      value: `₱${(stats?.stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      lightBg: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      description: 'All-time earnings',
      link: '/admin/products'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-2">
            Dashboard
          </h1>
          <p className="text-neutral-600">Welcome back! Here's your overview.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="card p-6 hover:shadow-lg transition-all hover:-translate-y-1 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.lightBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-sm font-semibold text-neutral-600 mb-1">{stat.title}</p>
            <p className="text-3xl font-bold text-neutral-900 mb-2">{stat.value}</p>
            <p className="text-xs text-neutral-500">{stat.description}</p>
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Inquired Products */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Most Inquired Products</h2>
              <p className="text-xs text-neutral-500">What customers are asking about</p>
            </div>
          </div>

          {stats?.topInquiredProducts?.length > 0 ? (
            <div className="space-y-3">
              {stats.topInquiredProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                  </div>
                  {product.product_images?.[0]?.image_url ? (
                    <img 
                      src={product.product_images[0].image_url} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-neutral-900 truncate">{product.name}</p>
                    <p className="text-xs text-neutral-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-600">{product.inquiry_count}</p>
                    <p className="text-xs text-neutral-400">inquiries</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Flame className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">No inquiry data yet</p>
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Best Selling Products</h2>
              <p className="text-xs text-neutral-500">Top performers by sales</p>
            </div>
          </div>

          {stats?.topSellingProducts?.length > 0 ? (
            <div className="space-y-3">
              {stats.topSellingProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                  </div>
                  {product.product_images?.[0]?.image_url ? (
                    <img 
                      src={product.product_images[0].image_url} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-neutral-900 truncate">{product.name}</p>
                    <p className="text-xs text-neutral-500">₱{parseFloat(product.price).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{product.total_sold}</p>
                    <p className="text-xs text-neutral-400">sold</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">No sales data yet</p>
              <p className="text-xs text-neutral-400 mt-1">Start recording sales to see analytics</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-neutral-900">Recent Activity</h2>
          </div>

          {stats?.recentInquiries?.length > 0 || stats?.recentSales?.length > 0 ? (
            <div className="space-y-2">
              {stats?.recentSales?.slice(0, 3).map((sale) => (
                <div key={sale.id} className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">
                      Sale completed: {sale.products?.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {sale.customer_name} • ₱{parseFloat(sale.sale_amount).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400 whitespace-nowrap">
                    {new Date(sale.sold_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {stats?.recentInquiries?.slice(0, 3).map((inquiry) => (
                <div key={inquiry.id} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                  <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">
                      New inquiry: {inquiry.products?.name || 'General'}
                    </p>
                    <p className="text-xs text-neutral-500">{inquiry.customer_name}</p>
                  </div>
                  <span className="text-xs text-neutral-400 whitespace-nowrap">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">No recent activity</p>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-bold text-neutral-900">Low Stock Alerts</h2>
          </div>

          {stats?.lowStockProducts?.length > 0 ? (
            <div className="space-y-2">
              {stats.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{product.name}</p>
                    <p className="text-xs text-neutral-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-yellow-600">{product.stock_count} left</p>
                    <p className="text-xs text-neutral-400">Restock soon</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-2" />
              <p className="text-sm text-green-600 font-medium">All products well stocked!</p>
              <p className="text-xs text-neutral-400 mt-1">No items running low</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/admin/products"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-neutral-200 hover:border-primary-400 hover:bg-primary-50 transition-all group"
          >
            <Package className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-neutral-700 group-hover:text-primary-700">Manage Products</span>
          </Link>
          <Link
            to="/admin/inquiries"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-neutral-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
          >
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-neutral-700 group-hover:text-purple-700">View Inquiries</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
import { supabaseAdmin } from '../config/supabase.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get total products
    const { count: totalProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get available products
    const { count: availableProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('availability', true);

    // Get featured products
    const { count: featuredProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('featured', true);

    // Get total inquiries
    const { count: totalInquiries } = await supabaseAdmin
      .from('inquiries')
      .select('*', { count: 'exact', head: true });

    // Get pending inquiries
    const { count: pendingInquiries } = await supabaseAdmin
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get total sales
    const { count: totalSales, error: salesCountError } = await supabaseAdmin
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from('sales')
      .select('sale_amount')
      .eq('status', 'completed');

    const totalRevenue = revenueData?.reduce((sum, sale) => sum + parseFloat(sale.sale_amount || 0), 0) || 0;

    // Get most inquired products (top 5)
    const { data: mostInquired, error: inquiryError } = await supabaseAdmin
      .rpc('get_most_inquired_products', { limit_count: 5 });

    // If RPC doesn't exist, fallback to manual query
    let topInquiredProducts = [];
    if (inquiryError) {
      const { data: inquiries } = await supabaseAdmin
        .from('inquiries')
        .select('product_id, products(id, name, category, price, product_images(image_url, is_primary))')
        .not('product_id', 'is', null);

      const productCounts = {};
      inquiries?.forEach(inq => {
        if (inq.product_id) {
          if (!productCounts[inq.product_id]) {
            productCounts[inq.product_id] = {
              product: inq.products,
              count: 0
            };
          }
          productCounts[inq.product_id].count++;
        }
      });

      topInquiredProducts = Object.values(productCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(item => ({
          ...item.product,
          inquiry_count: item.count
        }));
    } else {
      topInquiredProducts = mostInquired || [];
    }

    // Get top selling products (top 5)
    const { data: topSelling, error: salesError } = await supabaseAdmin
      .from('sales')
      .select('product_id, quantity, products(id, name, category, price, product_images(image_url, is_primary))')
      .eq('status', 'completed');

    let topSellingProducts = [];
    if (!salesError && topSelling) {
      const salesCounts = {};
      topSelling.forEach(sale => {
        if (sale.product_id) {
          if (!salesCounts[sale.product_id]) {
            salesCounts[sale.product_id] = {
              product: sale.products,
              totalSold: 0,
              revenue: 0
            };
          }
          salesCounts[sale.product_id].totalSold += sale.quantity || 1;
        }
      });

      topSellingProducts = Object.values(salesCounts)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5)
        .map(item => ({
          ...item.product,
          total_sold: item.totalSold
        }));
    }

    // Get recent activities (last 10 inquiries or sales)
    const { data: recentInquiries } = await supabaseAdmin
      .from('inquiries')
      .select('id, customer_name, created_at, status, products(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentSales } = await supabaseAdmin
      .from('sales')
      .select('id, customer_name, sale_amount, sold_at, products(name)')
      .order('sold_at', { ascending: false })
      .limit(5);

    // Get low stock products (stock < 5)
    const { data: lowStockProducts } = await supabaseAdmin
      .from('products')
      .select('id, name, stock_count, category')
      .lt('stock_count', 5)
      .eq('availability', true)
      .order('stock_count', { ascending: true })
      .limit(5);

    res.json({
      stats: {
        totalProducts: totalProducts || 0,
        availableProducts: availableProducts || 0,
        featuredProducts: featuredProducts || 0,
        totalInquiries: totalInquiries || 0,
        pendingInquiries: pendingInquiries || 0,
        totalSales: totalSales || 0,
        totalRevenue: totalRevenue || 0
      },
      topInquiredProducts: topInquiredProducts || [],
      topSellingProducts: topSellingProducts || [],
      recentInquiries: recentInquiries || [],
      recentSales: recentSales || [],
      lowStockProducts: lowStockProducts || []
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
};
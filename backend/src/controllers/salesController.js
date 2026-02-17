import { supabaseAdmin } from '../config/supabase.js';

export const createSale = async (req, res) => {
  try {
    const {
      inquiry_id,
      product_id,
      customer_name,
      customer_email,
      customer_phone,
      sale_amount,
      quantity = 1,
      payment_method,
      notes
    } = req.body;

    // Check if this inquiry already has a sale
    if (inquiry_id) {
      const { data: existingSale } = await supabaseAdmin
        .from('sales')
        .select('id')
        .eq('inquiry_id', inquiry_id)
        .single();

      if (existingSale) {
        return res.status(400).json({ 
          error: 'This inquiry has already been converted to a sale' 
        });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('sales')
      .insert({
        inquiry_id,
        product_id,
        customer_name,
        customer_email,
        customer_phone,
        sale_amount,
        quantity,
        payment_method,
        notes,
        status: 'completed'
      })
      .select()
      .single();

    if (error) throw error;

    // Update product stock if available
    if (product_id && quantity) {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('stock_count')
        .eq('id', product_id)
        .single();

      if (product && product.stock_count) {
        await supabaseAdmin
          .from('products')
          .update({ stock_count: Math.max(0, product.stock_count - quantity) })
          .eq('id', product_id);
      }
    }

    // Update inquiry status if linked
    if (inquiry_id) {
      await supabaseAdmin
        .from('inquiries')
        .update({ status: 'responded' })
        .eq('id', inquiry_id);
    }

    res.json({ sale: data, message: 'Sale created successfully' });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllSales = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('sales')
      .select(`
        *,
        products (
          id,
          name,
          category,
          price
        )
      `)
      .order('sold_at', { ascending: false });

    if (error) throw error;

    res.json({ sales: data });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from('sales')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ sale: data, message: 'Sale updated successfully' });
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    const { error} = await supabaseAdmin
      .from('sales')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ error: error.message });
  }
};
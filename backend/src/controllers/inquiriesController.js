import { supabase, supabaseAdmin } from '../config/supabase.js';

export const createInquiry = async (req, res) => {
  try {
    const {
      product_id,
      customer_name,
      customer_email,
      customer_phone,
      message
    } = req.body;

    const { data, error } = await supabase
      .from('inquiries')
      .insert([{
        product_id: product_id || null,
        customer_name,
        customer_email,
        customer_phone: customer_phone || null,
        message,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Inquiry submitted successfully',
      inquiry: data
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllInquiries = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('inquiries')
      .select(`
        *,
        products (
          id,
          name,
          category,
          price
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ inquiries: data });
  } catch (error) {
    console.error('Get all inquiries error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if inquiry has been converted to a sale
    const { data: sale } = await supabaseAdmin
      .from('sales')
      .select('id')
      .eq('inquiry_id', id)
      .single();

    if (sale) {
      return res.status(400).json({ 
        error: 'Cannot delete inquiry that has been converted to a sale' 
      });
    }

    const { error } = await supabaseAdmin
      .from('inquiries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({ error: error.message });
  }
};
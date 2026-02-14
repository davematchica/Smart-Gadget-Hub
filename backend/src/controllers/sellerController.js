import { supabase, supabaseAdmin } from '../config/supabase.js';

export const getSellerProfile = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('seller_profile')
      .select('*')
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateSellerProfile = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    // Get the existing profile first
    const { data: existingProfile, error: fetchError } = await supabase
      .from('seller_profile')
      .select('id')
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabaseAdmin
      .from('seller_profile')
      .update(updateData)
      .eq('id', existingProfile.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Update seller profile error:', error);
    res.status(500).json({ error: error.message });
  }
};
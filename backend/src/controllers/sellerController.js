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

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const file = req.file;

    // Get existing profile
    const { data: existingProfile } = await supabase
      .from('seller_profile')
      .select('id, profile_picture_path')
      .single();

    // Delete old image if exists
    if (existingProfile?.profile_picture_path) {
      await supabaseAdmin.storage
        .from('profile-pictures')
        .remove([existingProfile.profile_picture_path]);
    }

    // Upload new image
    const fileName = `ann-profile-${Date.now()}.${file.mimetype.split('/')[1]}`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('profile-pictures')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    // Update database
    const { data: updatedProfile, error: dbError } = await supabaseAdmin
      .from('seller_profile')
      .update({
        profile_picture_url: publicUrl,
        profile_picture_path: fileName,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingProfile.id)
      .select()
      .single();

    if (dbError) throw dbError;

    res.json(updatedProfile);
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove profile picture
export const removeProfilePicture = async (req, res) => {
  try {
    // Get existing profile
    const { data: existingProfile } = await supabase
      .from('seller_profile')
      .select('id, profile_picture_path')
      .single();

    // Delete image from storage
    if (existingProfile?.profile_picture_path) {
      await supabaseAdmin.storage
        .from('profile-pictures')
        .remove([existingProfile.profile_picture_path]);
    }

    // Update database
    const { data, error } = await supabaseAdmin
      .from('seller_profile')
      .update({
        profile_picture_url: null,
        profile_picture_path: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingProfile.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Remove profile picture error:', error);
    res.status(500).json({ error: error.message });
  }
};
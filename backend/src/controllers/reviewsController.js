import { supabase, supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

// GET all reviews (public)
export const getAllReviews = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`*, review_images(id, image_url, storage_path, display_order)`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const reviews = data.map(r => ({
      ...r,
      review_images: (r.review_images || []).sort((a, b) => a.display_order - b.display_order)
    }));

    res.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET featured reviews (public - for homepage)
export const getFeaturedReviews = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`*, review_images(id, image_url, storage_path, display_order)`)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    const reviews = data.map(r => ({
      ...r,
      review_images: (r.review_images || []).sort((a, b) => a.display_order - b.display_order)
    }));

    res.json({ reviews });
  } catch (error) {
    console.error('Get featured reviews error:', error);
    res.status(500).json({ error: error.message });
  }
};

// CREATE review (admin)
export const createReview = async (req, res) => {
  try {
    const {
      customer_name,
      product_name,
      product_id,
      sale_id,
      description,
      rating,
      is_featured
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert([{
        customer_name,
        product_name,
        product_id: product_id || null,
        sale_id: sale_id || null,
        description,
        rating: rating || 5,
        is_featured: is_featured || false
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ review: data });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: error.message });
  }
};

// UPLOAD review images (admin)
export const uploadReviewImages = async (req, res) => {
  try {
    const { id } = req.params;

    // Check existing image count
    const { data: existing } = await supabaseAdmin
      .from('review_images')
      .select('id')
      .eq('review_id', id);

    if (existing && existing.length >= 5) {
      return res.status(400).json({ error: 'Maximum 5 images per review' });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const allowedCount = 5 - (existing?.length || 0);
    const filesToUpload = files.slice(0, allowedCount);

    const uploadedImages = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const fileName = `${id}/${uuidv4()}-${file.originalname.replace(/\s/g, '-')}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('review-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseAdmin
        .storage
        .from('review-images')
        .getPublicUrl(fileName);

      const { data: imageRecord, error: dbError } = await supabaseAdmin
        .from('review_images')
        .insert([{
          review_id: id,
          image_url: publicUrl,
          storage_path: fileName,
          display_order: (existing?.length || 0) + i
        }])
        .select()
        .single();

      if (dbError) throw dbError;
      uploadedImages.push(imageRecord);
    }

    res.json({ images: uploadedImages });
  } catch (error) {
    console.error('Upload review images error:', error);
    res.status(500).json({ error: error.message });
  }
};

// UPDATE review (admin)
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, product_name, description, rating, is_featured } = req.body;

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update({
        customer_name,
        product_name,
        description,
        rating,
        is_featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ review: data });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: error.message });
  }
};

// TOGGLE featured (admin)
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_featured } = req.body;

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update({ is_featured, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ review: data });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE review image (admin)
export const deleteReviewImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const { data: image } = await supabaseAdmin
      .from('review_images')
      .select('storage_path')
      .eq('id', imageId)
      .single();

    if (image?.storage_path) {
      await supabaseAdmin.storage.from('review-images').remove([image.storage_path]);
    }

    const { error } = await supabaseAdmin
      .from('review_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete review image error:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE review (admin)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Get all images to delete from storage
    const { data: images } = await supabaseAdmin
      .from('review_images')
      .select('storage_path')
      .eq('review_id', id);

    if (images?.length > 0) {
      const paths = images.map(img => img.storage_path);
      await supabaseAdmin.storage.from('review-images').remove(paths);
    }

    const { error } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: error.message });
  }
};
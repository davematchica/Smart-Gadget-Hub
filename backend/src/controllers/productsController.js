import { supabase, supabaseAdmin } from '../config/supabase.js';

export const getAllProducts = async (req, res) => {
  try {
    const { category, availability, search, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          image_url,
          display_order,
          is_primary
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (availability !== undefined) {
      query = query.eq('availability', availability === 'true');
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      products: data,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          image_url,
          display_order,
          is_primary
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Sort images by display order
    if (data.product_images) {
      data.product_images.sort((a, b) => a.display_order - b.display_order);
    }

    res.json(data);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          image_url,
          display_order,
          is_primary
        )
      `)
      .eq('category', category)
      .eq('availability', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ products: data });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          image_url,
          display_order,
          is_primary
        )
      `)
      .eq('featured', true)
      .eq('availability', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({ products: data });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      description,
      specifications,
      availability = true,
      featured = false,
      stock_count = 0
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([{
        name,
        category,
        price,
        description,
        specifications,
        availability,
        featured,
        stock_count
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const addProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, is_primary = false, display_order = 0 } = req.body;

    // If this is set as primary, unset other primary images first
    if (is_primary) {
      await supabaseAdmin
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', id);
    }

    const { data, error } = await supabaseAdmin
      .from('product_images')
      .insert({
        product_id: id,
        image_url,
        is_primary,
        display_order
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ image: data, message: 'Image added successfully' });
  } catch (error) {
    console.error('Add product image error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const { error } = await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete product image error:', error);
    res.status(500).json({ error: error.message });
  }
};
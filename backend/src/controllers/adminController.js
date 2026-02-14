import { supabase, supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      user: data.user,
      session: data.session,
      access_token: data.session.access_token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const uploadProductImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Verify product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const uploadedImages = [];

    // Get current max display order
    const { data: existingImages } = await supabase
      .from('product_images')
      .select('display_order')
      .eq('product_id', productId)
      .order('display_order', { ascending: false })
      .limit(1);

    let displayOrder = existingImages && existingImages.length > 0
      ? existingImages[0].display_order + 1
      : 0;

    for (const file of files) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${productId}/${uuidv4()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('product-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin
        .storage
        .from('product-images')
        .getPublicUrl(fileName);

      // Save to database
      const isPrimary = displayOrder === 0;
      
      const { data: imageData, error: dbError } = await supabaseAdmin
        .from('product_images')
        .insert([{
          product_id: productId,
          image_url: publicUrl,
          display_order: displayOrder,
          is_primary: isPrimary
        }])
        .select()
        .single();

      if (!dbError) {
        uploadedImages.push(imageData);
        displayOrder++;
      }
    }

    res.status(201).json({
      message: 'Images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    console.error('Upload product image error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    // Get image data
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (fetchError || !image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Extract file path from URL
    const url = new URL(image.image_url);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf('product-images') + 1).join('/');

    // Delete from storage
    const { error: storageError } = await supabaseAdmin
      .storage
      .from('product-images')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (dbError) throw dbError;

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateImageOrder = async (req, res) => {
  try {
    const { images } = req.body;

    const updates = images.map(img =>
      supabaseAdmin
        .from('product_images')
        .update({ display_order: img.display_order })
        .eq('id', img.id)
    );

    await Promise.all(updates);

    res.json({ message: 'Image order updated successfully' });
  } catch (error) {
    console.error('Update image order error:', error);
    res.status(500).json({ error: error.message });
  }
};
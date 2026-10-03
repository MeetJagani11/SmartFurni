export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800';

/**
 * Reusable image error handler to prevent broken thumbnails
 * and prevent infinite onError loops.
 */
export const handleImageError = (e, fallbackSrc = DEFAULT_PRODUCT_IMAGE) => {
  if (!e || !e.target) return;
  e.target.onerror = null;
  if (e.target.src !== fallbackSrc) {
    e.target.src = fallbackSrc;
  }
};

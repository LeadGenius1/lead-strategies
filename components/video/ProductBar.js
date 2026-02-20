'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, X, ExternalLink } from 'lucide-react';

export default function ProductBar({ products = [], currentTime = 0 }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Show after 5 seconds of playback
  useEffect(() => {
    if (dismissed || products.length === 0) return;
    if (currentTime >= 5) {
      setVisible(true);
    }
  }, [currentTime, dismissed, products.length]);

  // Auto-rotate through products every 10 seconds
  useEffect(() => {
    if (!visible || products.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % products.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [visible, products.length]);

  const handleClick = useCallback((link) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  }, []);

  if (!visible || dismissed || products.length === 0) return null;

  const product = products[activeIndex];
  if (!product) return null;

  return (
    <div className="absolute bottom-14 left-0 right-0 z-20 px-3 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
        {/* Product Image or Icon */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/10"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
          </div>
        )}

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{product.title}</p>
          {product.description && (
            <p className="text-xs text-neutral-400 truncate">{product.description}</p>
          )}
        </div>

        {/* Price */}
        {product.price && (
          <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs rounded-full font-mono flex-shrink-0">
            {product.price}
          </span>
        )}

        {/* Shop Now Button */}
        <button
          type="button"
          onClick={() => handleClick(product.link)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-500/30 transition-all flex-shrink-0"
        >
          Shop Now
          <ExternalLink className="w-3 h-3" />
        </button>

        {/* Dismiss */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 text-neutral-600 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Dot indicators for multiple products */}
        {products.length > 1 && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1">
            {products.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeIndex ? 'bg-indigo-400' : 'bg-white/20'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

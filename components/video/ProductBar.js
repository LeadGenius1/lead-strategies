'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductBar({ products = [], visible = false, onDismiss }) {
  const [activeIndex, setActiveIndex] = useState(0);

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

  const prev = () => setActiveIndex((i) => (i - 1 + products.length) % products.length);
  const next = () => setActiveIndex((i) => (i + 1) % products.length);

  if (products.length === 0) return null;

  const product = products[activeIndex];
  if (!product) return null;

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="bg-black/80 backdrop-blur-sm border-t border-white/10 px-4 py-3 flex items-center gap-3">
        {/* Shopping Bag Icon */}
        <div className="flex-shrink-0">
          <ShoppingBag className="w-5 h-5 text-indigo-400" />
        </div>

        {/* Left Arrow (multiple products) */}
        {products.length > 1 && (
          <button
            type="button"
            onClick={prev}
            className="p-1 text-white/40 hover:text-white transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Product Image */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-12 h-12 rounded-lg object-cover bg-white/10 flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-white/30" />
          </div>
        )}

        {/* Title + Description */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{product.title}</p>
          {product.description && (
            <p className="text-xs text-white/50 truncate">{product.description}</p>
          )}
        </div>

        {/* Right Arrow (multiple products) */}
        {products.length > 1 && (
          <button
            type="button"
            onClick={next}
            className="p-1 text-white/40 hover:text-white transition-colors flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Price */}
        {product.price && (
          <span className="text-emerald-400 font-semibold text-sm flex-shrink-0">
            {product.price}
          </span>
        )}

        {/* Shop Now Button */}
        <button
          type="button"
          onClick={() => handleClick(product.link)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors flex-shrink-0"
        >
          Shop Now
          <ExternalLink className="w-3 h-3" />
        </button>

        {/* Dismiss */}
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 text-white/40 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

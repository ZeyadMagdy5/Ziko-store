import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { language } = useLanguage();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(255,255,255,0.05)] border border-gray-100 dark:border-gray-700 hover:border-accent/30 dark:hover:border-accent/40 transition-all duration-500 group"
    >
      <div className="relative overflow-hidden aspect-[4/5] bg-gray-100 dark:bg-gray-700">
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
              -{Math.round(product.discountPercentage)}%
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.button
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="group-hover:opacity-100 group-hover:scale-100 group-hover:y-0 transition-all duration-300 bg-white text-primary p-3 rounded-full hover:bg-accent hover:text-white shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            title={language === "ar" ? "أضف إلى السلة" : "Add to Cart"}
          >
            <Plus size={24} />
          </motion.button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-heading font-bold mb-1 dark:text-gray-100 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-accent">
              {(Number(product.price) || 0).toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
            </span>
            {(Number(product.originalPrice) || 0) > (Number(product.price) || 0) && (
              <span className="text-sm text-gray-400 line-through">
                {(Number(product.originalPrice) || 0).toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
              </span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            className="text-sm font-medium text-primary dark:text-white underline hover:text-accent dark:hover:text-accent decoration-2 underline-offset-4"
          >
            {language === "ar" ? "أضف إلى السلة" : "Add to Cart"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}


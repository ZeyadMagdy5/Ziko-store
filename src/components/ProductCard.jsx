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
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-accent/20 dark:hover:shadow-accent/40 border border-transparent hover:border-accent/40 dark:hover:border-accent/60 transition-all duration-300 group"
    >
      <div className="relative overflow-hidden aspect-[4/5] bg-gray-100 dark:bg-gray-700">
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
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
          <span className="text-lg font-bold text-accent">
            {product.price.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
          </span>
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


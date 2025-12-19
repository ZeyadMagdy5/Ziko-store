import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Sun, Moon, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { cn } from "../lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const isRtl = language === "ar";

  return (
    <nav
      className={cn(
        "fixed w-full z-50 transition-all duration-300 flex items-center",
        scrolled
          ? "bg-white/90 dark:bg-primary/90 backdrop-blur-md shadow-sm h-20"
          : "bg-transparent h-24"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-full">
        <Link to="/" className="flex items-center">
          <img src="/images/logo.png" alt="Ziko Store" className="h-14 w-auto object-contain" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="relative text-sm font-medium hover:text-accent transition-colors dark:text-gray-300">
            {language === "ar" ? "الرئيسية" : "Home"}
            {location.pathname === "/" && (
              <motion.div
                layoutId="underline"
                className="absolute left-0 top-full block h-[2px] w-full bg-accent mt-1"
              />
            )}
          </Link>
          <Link to="/products" className="relative text-sm font-medium hover:text-accent transition-colors dark:text-gray-300">
            {language === "ar" ? "المنتجات" : "Products"}
            {location.pathname === "/products" && (
              <motion.div
                layoutId="underline"
                className="absolute left-0 top-full block h-[2px] w-full bg-accent mt-1"
              />
            )}
          </Link>

          <button
            onClick={toggleLanguage}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold text-sm dark:text-white"
            title={language === "ar" ? "Switch to English" : "تغيير للعربية"}
          >
            {language === "ar" ? "EN" : "AR"}
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "dark" ? <Sun size={20} className="text-white" /> : <Moon size={20} />}
          </button>
          <Link to="/cart" className="relative p-2">
            <ShoppingBag size={24} className="dark:text-white" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold text-sm dark:text-white"
          >
            {language === "ar" ? "EN" : "AR"}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "dark" ? <Sun size={20} className="text-white" /> : <Moon size={20} />}
          </button>
          <Link to="/cart" className="relative p-2">
            <ShoppingBag size={24} className="dark:text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2">
            {isOpen ? <X size={24} className="dark:text-white" /> : <Menu size={24} className="dark:text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-primary border-t dark:border-gray-800"
          >
            <div className="flex flex-col p-4 gap-4">
              <Link to="/" className="text-lg font-medium dark:text-gray-200">
                {language === "ar" ? "الرئيسية" : "Home"}
              </Link>
              <Link to="/products" className="text-lg font-medium dark:text-gray-200">
                {language === "ar" ? "المنتجات" : "Products"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}


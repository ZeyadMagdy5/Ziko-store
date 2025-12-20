import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Sun, Moon } from "lucide-react";
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
        "fixed w-full z-[100] transition-all duration-300",
        scrolled
          ? "bg-white/95 dark:bg-primary/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className={cn(
        "container mx-auto px-4 md:px-6 flex items-center justify-between transition-all duration-300",
        scrolled ? "h-20" : "h-20 md:h-28"
      )}>
        <Link to="/" className="flex items-center transition-transform hover:scale-105">
          <img src="/images/logo.png" alt="Ziko Store" className="h-10 md:h-14 w-auto object-contain" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="relative text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors dark:text-gray-300">
            {language === "ar" ? "الرئيسية" : "Home"}
            {location.pathname === "/" && (
              <motion.div
                layoutId="underline"
                className="absolute left-0 -bottom-1 block h-[2px] w-full bg-accent"
              />
            )}
          </Link>
          <Link to="/products" className="relative text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors dark:text-gray-300">
            {language === "ar" ? "المنتجات" : "Products"}
            {location.pathname === "/products" && (
              <motion.div
                layoutId="underline"
                className="absolute left-0 -bottom-1 block h-[2px] w-full bg-accent"
              />
            )}
          </Link>
          <Link to="/collections" className="relative text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors dark:text-gray-300">
            {language === "ar" ? "المجموعات" : "Collections"}
            {location.pathname === "/collections" && (
              <motion.div
                layoutId="underline"
                className="absolute left-0 -bottom-1 block h-[2px] w-full bg-accent"
              />
            )}
          </Link>
          <Link to="/orders" className="relative text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors dark:text-gray-300">
            {language === "ar" ? "طلباتي" : "Orders"}
            {location.pathname === "/orders" && (
              <motion.div
                layoutId="underline"
                className="absolute left-0 -bottom-1 block h-[2px] w-full bg-accent"
              />
            )}
          </Link>

          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold text-xs dark:text-white"
              title={language === "ar" ? "Switch to English" : "تغيير للعربية"}
            >
              {language === "ar" ? "EN" : "AR"}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === "dark" ? <Sun size={18} className="text-white" /> : <Moon size={18} />}
            </button>

            <Link to="/cart" className="relative p-2 hover:text-accent transition-colors">
              <ShoppingBag size={22} className="dark:text-white" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold text-xs dark:text-white"
          >
            {language === "ar" ? "EN" : "AR"}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "dark" ? <Sun size={18} className="text-white" /> : <Moon size={18} />}
          </button>
          <Link to="/cart" className="relative p-2">
            <ShoppingBag size={20} className="dark:text-white" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-accent text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 ml-1 text-primary dark:text-white"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
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
            className="md:hidden bg-white dark:bg-primary border-t dark:border-gray-800 overflow-hidden shadow-xl"
          >
            <div className="flex flex-col p-6 gap-4">
              <Link
                to="/"
                className={cn(
                  "text-lg font-bold tracking-wide transition-colors py-2",
                  location.pathname === "/" ? "text-accent" : "dark:text-gray-200"
                )}
              >
                {language === "ar" ? "الرئيسية" : "Home"}
              </Link>
              <Link
                to="/products"
                className={cn(
                  "text-lg font-bold tracking-wide transition-colors py-2",
                  location.pathname === "/products" ? "text-accent" : "dark:text-gray-200"
                )}
              >
                {language === "ar" ? "المنتجات" : "Products"}
              </Link>
              <Link
                to="/collections"
                className={cn(
                  "text-lg font-bold tracking-wide transition-colors py-2",
                  location.pathname === "/collections" ? "text-accent" : "dark:text-gray-200"
                )}
              >
                {language === "ar" ? "المجموعات" : "Collections"}
              </Link>
              <Link
                to="/orders"
                className={cn(
                  "text-lg font-bold tracking-wide transition-colors py-2",
                  location.pathname === "/orders" ? "text-accent" : "dark:text-gray-200"
                )}
              >
                {language === "ar" ? "طلباتي" : "Orders"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}


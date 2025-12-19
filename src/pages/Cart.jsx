import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { pageVariants } from "../lib/animations";

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { language } = useLanguage();

    if (cart.length === 0) {
        return (
            <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="container mx-auto px-4 py-20 text-center"
            >
                <h2 className="text-3xl font-heading font-bold mb-6 dark:text-white">
                    {language === "ar" ? "سلة التسوق فارغة" : "Your Cart is Empty"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    {language === "ar" 
                        ? "يبدو أنك لم تقم بإضافة أي حقائب أنيقة بعد." 
                        : "Looks like you haven't added any elegant bags yet."}
                </p>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-primary dark:bg-white text-white dark:text-primary px-6 py-3 rounded-full hover:bg-accent dark:hover:bg-gray-200 transition-colors"
                >
                    {language === "ar" ? "متابعة التسوق" : "Continue Shopping"} <ArrowRight size={18} className={language === "ar" ? "rotate-180" : ""} />
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="container mx-auto px-4 md:px-6 py-12"
        >
            <h1 className="text-3xl font-heading font-bold mb-8 dark:text-white">
                {language === "ar" ? "سلة التسوق" : "Shopping Cart"}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="popLayout">
                        {cart.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm"
                            >
                                <div className="w-24 h-24 shrink-0 overflow-hidden rounded-md bg-gray-100">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-grow text-center sm:text-left rtl:sm:text-right">
                                    <h3 className="font-heading font-bold text-lg dark:text-white">{item.name}</h3>
                                    <p className="text-accent font-medium">
                                        {item.price.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors"
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-8 text-center font-medium dark:text-white">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"
                                    title={language === "ar" ? "إزالة المنتج" : "Remove Item"}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md sticky top-24">
                        <h2 className="text-xl font-bold mb-6 dark:text-white">
                            {language === "ar" ? "ملخص الطلب" : "Order Summary"}
                        </h2>

                        <div className="flex justify-between mb-4 text-gray-600 dark:text-gray-400">
                            <span>{language === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
                            <span>{cartTotal.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}</span>
                        </div>
                        <div className="flex justify-between mb-4 text-gray-600 dark:text-gray-400">
                            <span>{language === "ar" ? "الشحن" : "Shipping"}</span>
                            <span>{language === "ar" ? "مجاني" : "Free"}</span>
                        </div>
                        <div className="border-t dark:border-gray-700 pt-4 mb-6 flex justify-between font-bold text-lg dark:text-white">
                            <span>{language === "ar" ? "الإجمالي" : "Total"}</span>
                            <span>{cartTotal.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}</span>
                        </div>

                        <button className="w-full bg-accent hover:bg-yellow-600 text-white py-3 rounded-full font-bold transition-all transform hover:scale-[1.02] shadow-lg mb-4">
                            {language === "ar" ? "متابعة للدفع" : "Proceed to Checkout"}
                        </button>
                        <button
                            onClick={clearCart}
                            className="w-full text-gray-500 hover:text-red-500 text-sm underline transition-colors"
                        >
                            {language === "ar" ? "إفراغ السلة" : "Clear Cart"}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

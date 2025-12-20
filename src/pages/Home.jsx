import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowDown, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { pageVariants } from "../lib/animations";
import { fetchUserProducts, BASE_URL, resolveImageUrl } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();
    const { clearCart } = useCart();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Payment callback states
    const [paymentStatus, setPaymentStatus] = useState(null); // 'success' or 'error'
    const [paymentMessage, setPaymentMessage] = useState("");
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        // Check for payment callback parameters
        const success = searchParams.get('success');
        const errorOccured = searchParams.get('error_occured');
        const dataMessage = searchParams.get('data.message');
        const merchantOrderId = searchParams.get('merchant_order_id');

        // Only process if we have payment parameters and haven't processed them yet
        if (success !== null && !paymentStatus) {
            if (success === 'true') {
                // Payment successful
                setPaymentStatus('success');
                setPaymentMessage(language === "ar" ? "تم الدفع بنجاح! شكراً لطلبك." : "Payment successful! Thank you for your order.");
                clearCart();
                localStorage.removeItem('cart');

                // Clear message first, then query params after 5 seconds
                setTimeout(() => {
                    setPaymentStatus(null);
                    setPaymentMessage("");
                }, 5000);

                // Clear query params slightly after to avoid re-triggering
                setTimeout(() => {
                    setSearchParams({});
                }, 5100);
            } else if (errorOccured === 'true' || success === 'false') {
                // Payment failed
                setPaymentStatus('error');
                const errorMsg = dataMessage ? decodeURIComponent(dataMessage.replace(/\+/g, ' ')) : (language === "ar" ? "فشلت عملية الدفع" : "Payment failed");
                setPaymentMessage(errorMsg);
                setOrderId(merchantOrderId);

                // Auto redirect to cart with orderId after 3 seconds
                setTimeout(() => {
                    setPaymentStatus(null);
                    setPaymentMessage("");
                    setSearchParams({});
                    navigate(`/cart?orderId=${merchantOrderId}`);
                }, 3000);
            }
        }
    }, [searchParams, language, clearCart, navigate, setSearchParams, paymentStatus]);

    useEffect(() => {
        const loadFeatured = async () => {
            try {
                // Fetch products tailored for featured (e.g., first 3)
                // Assuming PageSize=3 for efficiency if the API supports it, otherwise slice locally
                const data = await fetchUserProducts({ PageSize: 3 });
                const items = Array.isArray(data) ? data : (data.items || data.data || []);

                const maps = items.slice(0, 3).map(p => {
                    // Extract image URL from the first image object if it exists
                    const firstImage = (Array.isArray(p.images) && p.images.length > 0) ? p.images[0] : null;
                    const imageSource = firstImage ? firstImage.imageUrl : null;

                    return {
                        id: p.id,
                        name: (language === "ar" ? p.arName : p.enName) || p.name || (language === "ar" ? "منتج غير مسمى" : "Unnamed Product"),
                        price: p.finalPrice || p.price,
                        image: resolveImageUrl(imageSource),
                        description: (language === "ar" ? p.arDescription : p.enDescription) || p.description || (language === "ar" ? "لا يوجد وصف" : "No description available")
                    };
                });
                setFeaturedProducts(maps);
            } catch (err) {
                console.error("Failed to load featured products", err);
            } finally {
                setLoading(false);
            }
        };
        loadFeatured();
    }, [language]);


    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col gap-16 pb-20"
        >
            {/* Payment Status Notification */}
            <AnimatePresence>
                {paymentStatus && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
                    >
                        <div className={`p-6 rounded-xl shadow-2xl ${paymentStatus === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                            }`}>
                            <div className="flex items-center gap-4">
                                {paymentStatus === 'success' ? (
                                    <CheckCircle size={32} className="shrink-0" />
                                ) : (
                                    <XCircle size={32} className="shrink-0" />
                                )}
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1">
                                        {paymentStatus === 'success'
                                            ? (language === "ar" ? "نجح الدفع!" : "Payment Successful!")
                                            : (language === "ar" ? "فشل الدفع" : "Payment Failed")
                                        }
                                    </h3>
                                    <p className="text-sm opacity-90">{paymentMessage}</p>
                                    {paymentStatus === 'error' && (
                                        <p className="text-xs mt-2 opacity-75">
                                            {language === "ar"
                                                ? "جاري إعادة التوجيه لإعادة المحاولة..."
                                                : "Redirecting to retry payment..."}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <section className="relative h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10" />
                    <img
                        src="/images/bag-1.png"
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center text-white flex flex-col items-center justify-center h-full">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-heading font-bold mb-6 bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent drop-shadow-2xl"
                    >
                        {language === "ar" ? "تميّزك يبدأ من هنا" : "Elegance Redefined"}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-light text-gray-200 drop-shadow-md"
                    >
                        {language === "ar"
                            ? "اكتشفي مجموعتنا الفاخرة من حقائب اليد المصنوعة يدوياً لتناسب الموضة ."
                            : "Discover our premium products of handbags designed to suit your style ."
                        }
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 bg-accent hover:bg-yellow-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-all transform hover:scale-105 shadow-xl"
                        >
                            {language === "ar" ? "تسوقي المنتجات" : "Shop products"} <ArrowRight size={20} className={language === "ar" ? "rotate-180" : ""} />
                        </Link>
                    </motion.div>

                </div>

                {/* Bouncing Arrow Down - Positioned at bottom center, responsive size and spacing */}
                <motion.div
                    className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 text-white"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <ArrowDown className="w-8 h-8 md:w-10 md:h-10" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Featured Section */}
            <section className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 dark:text-white">
                        {language === "ar" ? "مجموعة مميزة" : "Top Products"}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {language === "ar" ? "أجمل القطع مختارة خصيصاً لك." : "Handpicked elegance for you."}
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        {language === "ar" ? "جارِ التحميل..." : "Loading featured products..."}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                <div className="text-center mt-12">
                    <Link to="/products" className="inline-block border-b-2 border-primary dark:border-white pb-1 text-primary dark:text-white hover:text-accent dark:hover:text-accent hover:border-accent transition-colors">
                        {language === "ar" ? "عرض جميع المنتجات" : "View All Products"}
                    </Link>
                </div>
            </section>


        </motion.div>
    );
}


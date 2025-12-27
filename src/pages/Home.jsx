import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowDown, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import ProductCard from "../components/ProductCard";
import { pageVariants } from "../lib/animations";
import { fetchUserProducts, fetchUserCollections, BASE_URL, resolveImageUrl } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import { cn } from "../lib/utils";

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
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
        const simpleMessage = searchParams.get('message');
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
                const rawMsg = dataMessage || simpleMessage;
                const errorMsg = rawMsg ? decodeURIComponent(rawMsg.replace(/\+/g, ' ')) : (language === "ar" ? "فشلت عملية الدفع. يرجى المحاولة مرة أخرى." : "Payment failed. Please try again.");
                setPaymentMessage(errorMsg);
                setOrderId(merchantOrderId);

                // Auto redirect to cart with orderId after 4 seconds to allow user to read
                setTimeout(() => {
                    setPaymentStatus(null);
                    setPaymentMessage("");
                    setSearchParams({});
                    // Pass error message to cart page
                    navigate(`/cart?orderId=${merchantOrderId}&error=${encodeURIComponent(errorMsg)}`);
                }, 4000);
            }
        }
    }, [searchParams, language, clearCart, navigate, setSearchParams, paymentStatus]);

    useEffect(() => {
        const loadHomeData = async () => {
            try {
                setLoading(true);
                // Fetch products and collections in parallel
                const [productsData, collectionsData] = await Promise.all([
                    fetchUserProducts({ PageSize: 3 }),
                    fetchUserCollections({ PageSize: 10 })
                ]);

                // Extract products
                let productItems = [];
                if (Array.isArray(productsData)) {
                    productItems = productsData;
                } else if (productsData?.data && Array.isArray(productsData.data)) {
                    productItems = productsData.data;
                } else if (productsData?.data?.items && Array.isArray(productsData.data.items)) {
                    productItems = productsData.data.items;
                } else if (productsData?.items && Array.isArray(productsData.items)) {
                    productItems = productsData.items;
                }

                const maps = productItems.slice(0, 3).map(p => {
                    const firstImage = (p.images && Array.isArray(p.images) && p.images.length > 0) ? p.images[0] : null;
                    const imageSource = firstImage ? firstImage.imageUrl : null;

                    return {
                        id: p.id,
                        name: (language === "ar" ? p.arName : p.enName) || p.name || (language === "ar" ? "منتج غير مسمى" : "Unnamed Product"),
                        price: p.finalPrice || p.price,
                        originalPrice: p.price,
                        discountPercentage: p.discount ? p.discount.discountPercentage : null,
                        image: resolveImageUrl(imageSource),
                        description: (language === "ar" ? p.arDescription : p.enDescription) || p.description || (language === "ar" ? "لا يوجد وصف" : "No description available")
                    };
                });
                setFeaturedProducts(maps);

                // Extract collections
                let collectionItems = [];
                if (Array.isArray(collectionsData)) {
                    collectionItems = collectionsData;
                } else if (collectionsData?.data && Array.isArray(collectionsData.data)) {
                    collectionItems = collectionsData.data;
                } else if (collectionsData?.data?.items && Array.isArray(collectionsData.data.items)) {
                    collectionItems = collectionsData.data.items;
                } else if (collectionsData?.items && Array.isArray(collectionsData.items)) {
                    collectionItems = collectionsData.items;
                }

                setCollections(collectionItems.filter(c => c.isActive !== false));
            } catch (err) {
                console.error("Failed to load home data", err);
            } finally {
                setLoading(false);
            }
        };
        loadHomeData();
    }, [language]);

    const nextSlide = useCallback(() => {
        if (collections.length > 0) {
            setCurrentSlide((prev) => (prev + 1) % collections.length);
        }
    }, [collections.length]);

    const prevSlide = useCallback(() => {
        if (collections.length > 0) {
            setCurrentSlide((prev) => (prev - 1 + collections.length) % collections.length);
        }
    }, [collections.length]);

    useEffect(() => {
        if (collections.length > 1) {
            const timer = setInterval(nextSlide, 6000);
            return () => clearInterval(timer);
        }
    }, [collections.length, nextSlide]);

    const renderHero = () => {
        if (collections.length > 0) {
            const current = collections[currentSlide];
            const firstImg = (Array.isArray(current.images) && current.images.length > 0) ? current.images[0] : null;

            return (
                <section className="relative h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden bg-primary">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={current.id}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(_, info) => {
                                if (info.offset.x > 100) prevSlide();
                                else if (info.offset.x < -100) nextSlide();
                            }}
                            className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
                            <motion.img
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 6, ease: "easeOut" }}
                                src={resolveImageUrl(firstImg?.imageUrl)}
                                alt={current.enName}
                                className="w-full h-full object-cover pointer-events-none"
                            />
                        </motion.div>
                    </AnimatePresence>

                    <div className="relative z-10 container mx-auto px-4 md:px-8 text-white flex flex-col items-start justify-center h-full pointer-events-none">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current.id + "content"}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="max-w-2xl text-left rtl:text-right pointer-events-auto"
                            >
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-block px-4 py-1.5 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-widest mb-6 shadow-lg"
                                >
                                    {language === "ar" ? "مجموعة جديدة" : "New Collection"}
                                </motion.span>
                                <motion.h1
                                    className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-6 leading-tight drop-shadow-2xl"
                                >
                                    {(language === "ar" ? current.arName : current.enName)}
                                </motion.h1>
                                <motion.p
                                    className="text-xl md:text-2xl mb-10 font-light text-gray-200 drop-shadow-md leading-relaxed"
                                >
                                    {(language === "ar" ? current.arDescription : current.enDescription)}
                                </motion.p>
                                <motion.div className="flex flex-wrap gap-4">
                                    <Link
                                        to={`/products?collectionId=${current.id}`}
                                        className="inline-flex items-center gap-3 bg-white text-primary hover:bg-accent hover:text-white px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-105 shadow-xl group"
                                    >
                                        {language === "ar" ? "اكتشف المجموعة" : "Explore Collection"}
                                        <ArrowRight size={20} className={cn("transition-transform group-hover:translate-x-1", language === 'ar' && "rotate-180 group-hover:-translate-x-1")} />
                                    </Link>
                                    <Link
                                        to="/products"
                                        className="inline-flex items-center gap-3 bg-transparent border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-full text-lg font-bold transition-all backdrop-blur-sm"
                                    >
                                        {language === "ar" ? "كل المنتجات" : "All Products"}
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    {collections.length > 1 && (
                        <div className="absolute inset-x-0 bottom-12 z-20 container mx-auto px-4 md:px-8 flex items-center justify-between pointer-events-none">
                            <div className="flex gap-4 pointer-events-auto">
                                <button
                                    onClick={prevSlide}
                                    className="p-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-primary transition-all backdrop-blur-md"
                                    aria-label="Previous slide"
                                >
                                    <ChevronLeft size={24} className={language === 'ar' ? "rotate-180" : ""} />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="p-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-primary transition-all backdrop-blur-md"
                                    aria-label="Next slide"
                                >
                                    <ChevronRight size={24} className={language === 'ar' ? "rotate-180" : ""} />
                                </button>
                            </div>

                            {/* Indicators */}
                            <div className="flex gap-2 pointer-events-auto">
                                {collections.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-8 bg-accent" : "w-4 bg-white/30 hover:bg-white/50"}`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            );
        }

        // Fallback Default Hero
        return (
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
        );
    };

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
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md px-4"
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

            {renderHero()}

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

                {loading && featuredProducts.length === 0 ? (
                    <div className="text-center py-10">
                        {language === "ar" ? "جارِ التحميل..." : "Loading featured products..."}
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </motion.div>
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


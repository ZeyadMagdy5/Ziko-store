import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { pageVariants, staggerContainer, staggerItem } from "../lib/animations";
import { fetchUserCollections, resolveImageUrl } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";
import { ArrowRight } from "lucide-react";

export default function Collections() {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();

    useEffect(() => {
        const loadCollections = async () => {
            try {
                const data = await fetchUserCollections({ PageSize: 100 });

                let items = [];
                if (Array.isArray(data)) {
                    items = data;
                } else if (data?.data && Array.isArray(data.data)) {
                    items = data.data;
                } else if (data?.data?.items && Array.isArray(data.data.items)) {
                    items = data.data.items;
                } else if (data?.items && Array.isArray(data.items)) {
                    items = data.items;
                }

                console.log("Collections API response:", data);
                console.log("Extracted collections:", items);
                setCollections(items);
            } catch (err) {
                console.error("Failed to load collections", err);
            } finally {
                setLoading(false);
            }
        };
        loadCollections();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
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
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 dark:text-white">
                    {language === "ar" ? "مجموعاتنا" : "Our Collections"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    {language === "ar"
                        ? "اكتشف مجموعاتنا المختلفة المصممة لتناسب كل الأذواق والمناسبات."
                        : "Explore our diverse collections designed to suit every style and occasion."}
                </p>
            </motion.div>

            {collections.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-xl text-gray-500 dark:text-gray-400">
                        {language === "ar" ? "لا توجد مجموعات متاحة حالياً." : "No collections available at the moment."}
                    </p>
                    <Link to="/products" className="inline-block mt-6 text-accent font-bold hover:underline">
                        {language === "ar" ? "مشاهدة كل المنتجات" : "View All Products"}
                    </Link>
                </div>
            ) : (
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {collections.map((collection) => {
                        const firstImg = (Array.isArray(collection.images) && collection.images.length > 0) ? collection.images[0] : null;
                        return (
                            <motion.div
                                key={collection.id}
                                variants={staggerItem}
                                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500"
                            >
                                <div className="aspect-[16/10] overflow-hidden">
                                    <img
                                        src={resolveImageUrl(firstImg?.imageUrl)}
                                        alt={collection.enName}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                                </div>

                                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                    <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">
                                        {language === "ar" ? collection.arName : collection.enName}
                                    </h2>
                                    <p className="text-sm text-gray-200 line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                        {language === "ar" ? collection.arDescription : collection.enDescription}
                                    </p>
                                    <Link
                                        to={`/products?collectionId=${collection.id}`}
                                        className="flex items-center gap-2 text-accent font-bold uppercase tracking-wider text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 transform translate-y-4 group-hover:translate-y-0"
                                    >
                                        {language === "ar" ? "تسوق الآن" : "Shop Now"} <ArrowRight size={16} className={language === 'ar' ? "rotate-180" : ""} />
                                    </Link>
                                </div>

                                {/* Invisible link overlay for the whole card */}
                                <Link to={`/products?collectionId=${collection.id}`} className="absolute inset-0 z-10" />
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </motion.div>
    );
}

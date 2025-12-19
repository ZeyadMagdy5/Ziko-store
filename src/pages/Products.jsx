import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { pageVariants, staggerContainer, staggerItem } from "../lib/animations";
import { fetchUserProducts, fetchUserCollections, BASE_URL, resolveImageUrl } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useLanguage();

  // Fetch Collections
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const data = await fetchUserCollections({ PageSize: 50 });
        const items = Array.isArray(data) ? data : (data.items || data.data || []);
        setCollections(items);
      } catch (err) {
        console.error("Failed to load collections", err);
      }
    };
    loadCollections();
  }, []);

  // Fetch Products
  useEffect(() => {
    let ignore = false;
    const loadProducts = async () => {
      setLoading(true);
      try {
        // Build params correctly - only include CollectionId if it's not null
        const params = { PageSize: 100 };
        if (selectedCollectionId !== null && selectedCollectionId !== undefined) {
          params.CollectionId = selectedCollectionId;
        }
        
        console.log("Loading products with params:", params);

        const data = await fetchUserProducts(params);
        if (ignore) return;

        console.log("Fetched products:", data);

        const items = Array.isArray(data) ? data : (data.items || data.data || []);

        const mappedProducts = items.map(p => {
          // Extract image URL from the first image object if it exists
          const firstImage = (Array.isArray(p.images) && p.images.length > 0) ? p.images[0] : null;
          const imageSource = firstImage ? firstImage.imageUrl : null;

          return {
            id: p.id,
            name: (language === "ar" ? p.arName : p.enName) || p.name || (language === "ar" ? "منتج غير مسمى" : "Unnamed Product"),
            price: p.finalPrice || p.price, // Use finalPrice if available
            image: resolveImageUrl(imageSource),
            description: (language === "ar" ? p.arDescription : p.enDescription) || p.description || (language === "ar" ? "لا يوجد وصف" : "No description available")
          };
        });

        setProducts(mappedProducts);
        setError(null);
      } catch (err) {
        if (ignore) return;
        console.error("Error loading products:", err);
        setError(language === "ar" ? "فشل تحميل المنتجات. يرجى المحاولة لاحقاً." : "Failed to load products. Please try again later.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [selectedCollectionId, language]);


  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-red-500">
        {error}
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
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-heading font-bold mb-4 dark:text-white">
            {language === "ar" ? "مجموعتنا" : "Our Collection"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            {language === "ar" 
                ? "استكشف مجموعتنا الحصرية من حقائب اليد الفاخرة، المصنوعة من أجود المواد واهتمام بالتفاصيل."
                : "Explore our exclusive range of premium handbags, crafted with the finest materials and attention to detail."
            }
        </p>

        {/* Collection Filter */}
        {collections.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setSelectedCollectionId(null)}
              className={`px-4 py-2 rounded-full transition-colors ${selectedCollectionId === null
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                }`}
            >
              {language === "ar" ? "الكل" : "All"}
            </button>
            {collections.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCollectionId(c.id)}
                className={`px-4 py-2 rounded-full transition-colors ${selectedCollectionId === c.id
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  }`}
              >
                {(language === "ar" ? c.arName : c.enName) || "Collection"}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        {/* Show loading spinner during filtering if needed, or just let the list update */}
        {loading && products.length === 0 ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            {language === "ar" ? "لا توجد منتجات في هذه المجموعة." : "No products found for this collection."}
          </div>
        ) : (
          products.map((product) => (
            <motion.div
              key={product.id}
              variants={staggerItem}
            >
              <ProductCard product={product} />
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
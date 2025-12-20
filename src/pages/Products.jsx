import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { pageVariants, staggerContainer, staggerItem } from "../lib/animations";
import { fetchUserProducts, fetchUserCollections, resolveImageUrl } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";
import { Search, Filter, Tag, X } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();

  // Handle Initial Collection ID from URL
  useEffect(() => {
    const colId = searchParams.get('collectionId');
    if (colId) {
      setSelectedCollectionId(Number(colId));
    } else {
      setSelectedCollectionId(null);
    }
  }, [searchParams]);

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
        const params = {
          PageSize: 100,
          IsActive: true
        };

        if (selectedCollectionId !== null && selectedCollectionId !== undefined && !isNaN(selectedCollectionId)) {
          params.CollectionId = selectedCollectionId;
        }

        if (searchQuery) {
          params.SearchName = searchQuery;
        }

        console.log("Fetching products with params:", params);
        const data = await fetchUserProducts(params);
        if (ignore) return;

        // Robust extraction from different possible API structures
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

        console.log("Original API response:", data);
        console.log("Extracted items array:", items);

        let mappedProducts = items.map(p => {
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

        // Local filter for discounts if API doesn't support IsDiscounted param directly
        if (onlyDiscounted) {
          mappedProducts = mappedProducts.filter(p => (p.discountPercentage && p.discountPercentage > 0));
        }

        console.log("Setting products state with:", mappedProducts);
        setProducts(mappedProducts);
        setError(null);
      } catch (err) {
        if (ignore) return;
        console.error("Error in loadProducts:", err);
        setError(language === "ar" ? "فشل تحميل المنتجات. يرجى المحاولة لاحقاً." : "Failed to load products. Please try again later.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadProducts, 300); // Debounce search
    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [selectedCollectionId, searchQuery, onlyDiscounted, language]);

  const clearFilters = () => {
    setSelectedCollectionId(null);
    setSearchQuery("");
    setOnlyDiscounted(false);
    setSearchParams({});
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container mx-auto px-4 md:px-6 py-12"
    >
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <div className="lg:w-1/4 space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
              <Filter size={20} className="text-accent" />
              {language === "ar" ? "التصفية" : "Filters"}
            </h2>

            {/* Search */}
            <div className="mb-8 relative">
              <input
                type="text"
                placeholder={language === "ar" ? "البحث عن منتجات..." : "Search products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Discount Filter Toggle */}
            <button
              onClick={() => setOnlyDiscounted(!onlyDiscounted)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-8 ${onlyDiscounted
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <Tag size={18} />
                {language === "ar" ? "عليها خصم" : "On Sale"}
              </div>
              {onlyDiscounted && <X size={14} />}
            </button>

            {/* Collections List */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 px-2">
                {language === "ar" ? "المجموعات" : "Collections"}
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCollectionId(null);
                    setSearchParams({});
                  }}
                  className={`w-full text-left rtl:text-right px-4 py-2.5 rounded-xl transition-all ${selectedCollectionId === null
                    ? "bg-accent text-white font-bold shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                  {language === "ar" ? "الكل" : "All Products"}
                </button>
                {collections.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCollectionId(c.id);
                      setSearchParams({ collectionId: c.id });
                    }}
                    className={`w-full text-left rtl:text-right px-4 py-2.5 rounded-xl transition-all ${selectedCollectionId === c.id
                      ? "bg-accent text-white font-bold shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                  >
                    {(language === "ar" ? c.arName : c.enName) || "Collection"}
                  </button>
                ))}
              </div>
            </div>

            {(selectedCollectionId || searchQuery || onlyDiscounted) && (
              <button
                onClick={clearFilters}
                className="w-full mt-8 text-sm text-gray-400 hover:text-red-500 underline py-2"
              >
                {language === "ar" ? "إعادة تعيين الكل" : "Reset All Filters"}
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:w-3/4">
          {error ? (
            <div className="flex justify-center items-center h-64 text-red-500 font-bold">
              {error}
            </div>
          ) : (
            <div className="min-h-[300px]">
              {loading && products.length === 0 ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    {language === "ar" ? "لا توجد منتجات تطابق بحثك." : "No products match your search."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      layout
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
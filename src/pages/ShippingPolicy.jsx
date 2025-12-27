import { motion } from "framer-motion";
import { pageVariants } from "../lib/animations";
import { useLanguage } from "../context/LanguageContext";

export default function ShippingPolicy() {
    const { language } = useLanguage();

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="container mx-auto px-4 py-16 md:px-8 max-w-4xl"
        >
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-8 dark:text-white">
                {language === "ar" ? "سياسة التوصيل" : "Shipping Policy"}
            </h1>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                    {language === "ar" 
                        ? "مدة التوصيل تتراوح بين يومين إلى 4 أيام عمل. تكلفة التوصيل غير مشمولة في سعر المنتج. الأسعار المدرجة على الموقع تشمل المنتج فقط، ولا تشمل الشحن."
                        : "Delivery takes 2 to 4 business days. Shipping cost is not included in the product price. Product prices listed on the website cover only the item and do not include shipping."
                    }
                </p>
            </div>
        </motion.div>
    );
}

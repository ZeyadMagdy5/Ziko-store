import { motion } from "framer-motion";
import { pageVariants } from "../lib/animations";
import { useLanguage } from "../context/LanguageContext";

export default function RefundPolicy() {
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
        {language === "ar" ? "سياسة الاسترجاع" : "Refund Policy"}
      </h1>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        {language === "ar" ? (
          <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            <li>الاسترجاع مسموح به فقط خلال 7 أيام من تاريخ الشراء.</li>
            <li>يُقبل الاسترجاع في حال وجود تلف في التصنيع أو عيب في المنتج فقط.</li>
            <li>لا يشمل الاسترجاع الحالات الأخرى مثل تغيير الرأي أو الاستخدام غير السليم للمنتج.</li>
          </ul>
        ) : (
          <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            <li>Refunds are accepted only within 7 days from the date of purchase.</li>
            <li>Refunds apply only in cases of manufacturing defects or product damage.</li>
            <li>Refunds do not cover other cases such as change of mind or improper use of the product.</li>
          </ul>
        )}
      </div>
    </motion.div>
  );
}

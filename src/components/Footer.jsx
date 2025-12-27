import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-yellow-600 to-accent dark:from-white dark:via-yellow-400 dark:to-accent bg-clip-text text-transparent animate-gradient">
              {language === "ar" ? " زيكو ستور" : "Ziko Store"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {language === "ar"
                ? "حقائب يد فاخرة مصنوعة بحب وجودة عالية. مصممة لتناسب الموضة وأبراز الجمال."
                : "Premium handbags crafted with elegance and sophistication. Designed for the modern woman who appreciates quality and style. "}
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 dark:text-white">
              {language === "ar" ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors">
                  {language === "ar" ? "الرئيسية" : "Home"}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors">
                  {language === "ar" ? "المتجر" : "Products"}
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors">
                  {language === "ar" ? "السلة" : "Cart"}
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors">
                  {language === "ar" ? "طلباتي" : "My Orders"}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 dark:text-white">
              {language === "ar" ? "السياسات" : "Policies"}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/refund-policy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors">
                  {language === "ar" ? "سياسة الاسترجاع" : "Refund Policy"}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors">
                  {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors">
                  {language === "ar" ? "سياسة التوصيل" : "Shipping Policy"}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 dark:text-white">
              <Link to="/contact-us" className="hover:text-accent transition-colors">
                {language === "ar" ? "تواصل معنا" : "Contact Us"}
              </Link>
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {language === "ar" ? "البريد الإلكتروني: zakizikozaki597@gmail.com" : "Email: zakizikozaki597@gmail.com"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === "ar" ? "الهاتف: 20 10 33569198" : "Phone: +20 10 33569198"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {language === "ar" ? "العنوان: المحلة الكبرى، الغربية، مصر." : "Address: Al-Mahalla Al-Kubra, Western Egypt."}
            </p>
          </div>
        </div>
        <div className="border-t dark:border-gray-800 pt-8 text-center">
          <p className="text-xs text-gray-500 mb-2">
            &copy; {new Date().getFullYear()} {language === "ar" ? "متجر زيكو. جميع الحقوق محفوظة." : "Ziko Store. All rights reserved."}
          </p>
          <p className="text-xs text-gray-400">
            {language === "ar" ? "تطوير بواسطة زياد مجدي و عمر جمال" : "Developed by Zeyad Magdy & Omar Gamal"}
          </p>
        </div>
      </div>
    </footer>
  );
}


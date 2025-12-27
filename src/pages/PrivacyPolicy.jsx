import { motion } from "framer-motion";
import { pageVariants } from "../lib/animations";
import { useLanguage } from "../context/LanguageContext";

export default function PrivacyPolicy() {
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
                {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
            </h1>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                    {language === "ar" 
                        ? "نحن نحترم خصوصيتك ونلتزم بحماية معلوماتك الشخصية. أي بيانات تقوم بمشاركتها معنا، مثل الاسم، البريد الإلكتروني، أو معلومات الدفع، تُستخدم فقط لتقديم الخدمة وتحسين تجربة المستخدم على الموقع. نحن لا نشارك معلوماتك مع أي طرف ثالث دون موافقتك، إلا إذا كان مطلوبًا قانونيًا. باستخدامك للموقع، فإنك توافق على جمع واستخدام بياناتك وفقًا لهذه السياسة."
                        : "We respect your privacy and are committed to protecting your personal information. Any data you share with us, such as your name, email, or payment information, is used solely to provide services and improve your experience on the website. We do not share your information with any third party without your consent, except where required by law. By using this website, you agree to the collection and use of your data as outlined in this policy."
                    }
                </p>
            </div>
        </motion.div>
    );
}

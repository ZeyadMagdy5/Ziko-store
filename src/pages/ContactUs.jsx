import { motion } from "framer-motion";
import { pageVariants } from "../lib/animations";
import { useLanguage } from "../context/LanguageContext";
import { MapPin } from "lucide-react";

export default function ContactUs() {
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
                {language === "ar" ? "اتصل بنا" : "Contact Us"}
            </h1>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-8">
                {/* Address */}
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 dark:bg-gray-700 rounded-lg">
                         <MapPin className="w-6 h-6 text-primary dark:text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2 dark:text-white">
                             {language === "ar" ? "العنوان" : "Address"}
                        </h3>
                        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                            {language === "ar" 
                                ? "المحلة الكبرى، الغربية، مصر."
                                : "Al-Mahalla Al-Kubra, Western Egypt."
                            }
                        </p>
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 dark:bg-gray-700 rounded-lg">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary dark:text-white"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2 dark:text-white">
                             {language === "ar" ? "البريد الإلكتروني" : "Email"}
                        </h3>
                        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                            zakizikozaki597@gmail.com
                        </p>
                    </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 dark:bg-gray-700 rounded-lg">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary dark:text-white"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2 dark:text-white">
                             {language === "ar" ? "الهاتف" : "Phone"}
                        </h3>
                        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 dir-ltr">
                            +20 10 33569198
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, CreditCard, Wallet, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { pageVariants } from "../lib/animations";
import { fetchUserOrderById, createUserOrder, createUserPayment } from "../lib/api";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Steps: 'cart', 'info', 'payment'
  const [step, setStep] = useState('cart');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [retryOrderDetails, setRetryOrderDetails] = useState(null);
  const [loadingRetry, setLoadingRetry] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [walletPhone, setWalletPhone] = useState("");


  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    const errorParam = searchParams.get('error');

    if (orderIdParam) {
      console.log("Payment retry detected. Order ID:", orderIdParam);
      const id = Number(orderIdParam);
      setOrderId(id);
      setStep('payment');
      fetchRetryDetails(id);
    }

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }

    // Clear query params after capturing
    if (orderIdParam || errorParam) {
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const fetchRetryDetails = async (id) => {
    setLoadingRetry(true);
    try {
      const response = await fetchUserOrderById(id);
      if (response.success) {
        setRetryOrderDetails(response.data);
        return response.data;
      } else {
        setError(response.message || "Failed to load order details for payment");
        return null;
      }
    } catch (err) {
      console.error("Fetch Retry Details Error:", err);
      setError(err.message || "Could not load order information");
      return null;
    } finally {
      setLoadingRetry(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Aggregate items using a dictionary to ensure unique IDs and clean quantities
      const itemsDictionary = cart.reduce((acc, item) => {
        const id = Number(item.id);
        acc[id] = (acc[id] || 0) + Number(item.quantity);
        return acc;
      }, {});

      // Transform back to the array format required by the DTO
      const items = Object.entries(itemsDictionary).map(([id, qty]) => ({
        productId: Number(id),
        quntity: qty
      }));

      const orderPayload = {
        address: formData.address,
        phone: formData.phone,
        items: items,
        name: formData.name
      };

      console.log("Submitting Order Payload:", orderPayload);

      const response = await createUserOrder(orderPayload);
      if (response.success) {
        setOrderId(response.data);
        setStep('payment');
      } else {
        setError(response.message || "Failed to create order");
      }
    } catch (err) {
      console.error("Order Creation Error:", err);
      // Check for specific "products do not exist" error
      if (err.message && (err.message.includes("products do not exist") || err.message.includes("some products do not exist"))) {
        setError(language === "ar"
          ? "عذراً، يحتوي طلبك على منتجات غير متوفرة حالياً (ربما تم حذفها). يرجى إفراغ السلة وإعادة المحاولة."
          : "Sorry, your cart contains unavailable products (they may have been deleted). Please clear your cart and try again.");
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const getPendingPaymentUrl = (order) => {
    if (!order) return null;
    let url = null;
    if (order.paymobTransactionObj) {
      let txn = order.paymobTransactionObj;
      if (typeof txn === 'string') try { txn = JSON.parse(txn); } catch(e){}
      if (txn && typeof txn === 'object') {
          url = txn.url || txn.iframe_url || txn.redirect_url || txn.payment_url;
      }
    }
    if (!url && order.payments && Array.isArray(order.payments)) {
        const last = order.payments[order.payments.length - 1];
        if (last && (last.status === 'pending' || last.status === 0)) {
            url = last.paymentUrl || last.redirectUrl || last.iframeUrl;
        }
    }
    return url;
  };

  const showPendingPaymentUI = (url) => {
    setError(
        <div className="flex flex-col gap-2 items-start text-sm">
          <span className="font-bold text-red-600">{language === "ar" ? "توجد عملية دفع معلقة." : "Payment is currently being processed."}</span>
          {url && (
            <a href={url} className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition w-full text-center">
              {language === "ar" ? "استكمال الدفع" : "Resume Transaction"}
            </a>
          )}
          <span className="text-xs text-gray-500">{language === "ar" ? "يرجى الانتظار بضع دقائق قبل المحاولة مرة أخرى." : "Please wait a few minutes before trying again."}</span>
        </div>
    );
  };

  const handlePayment = async () => {
    if (!paymentMethod) return;
    if (paymentMethod === 2 && !walletPhone) {
      setError(language === "ar" ? "يرجى إدخال رقم محفظة الهاتف" : "Please enter wallet phone number");
      return;
    }

    if (!orderId) {
      setError(language === "ar" ? "معرف الطلب مفقود" : "Order ID is missing");
      return;
    }

    // Pre-check for pending payment (Frontend Optimization)
    if (retryOrderDetails) {
       const pendingUrl = getPendingPaymentUrl(retryOrderDetails);
       // We only block if we have a valid URL to resume, otherwise we let the backend decide (maybe it expired)
       if (pendingUrl) {
           console.log("Pre-check found pending URL:", pendingUrl);
           showPendingPaymentUI(pendingUrl);
           return;
       }
    }

    setLoading(true);
    setError(null);

    try {
      const paymentPayload = {
        orderId: Number(orderId),
        paymentMethodId: Number(paymentMethod)
      };

      if (paymentMethod === 2) {
        paymentPayload.walletPhoneNumber = walletPhone;
      }

      console.log("Submitting Payment Payload:", paymentPayload);

      const response = await createUserPayment(paymentPayload);
      if (response.success && response.data.paymentUrl) {
        clearCart();
        localStorage.removeItem('cart');
        window.location.href = response.data.paymentUrl;
      } else {
        const msg = response.message?.toLowerCase() || "";
        if (msg.includes("pending") || msg.includes("completed")) {
           const updatedOrder = await fetchRetryDetails(Number(orderId));
           if (updatedOrder && (updatedOrder.paymentStatus === 1 || String(updatedOrder.paymentStatus).toLowerCase() === 'paid')) {
              clearCart();
              localStorage.removeItem('cart');
              window.location.href = '/orders';
              return;
           }
           
           const resumeUrl = getPendingPaymentUrl(updatedOrder);
           if (resumeUrl) {
               showPendingPaymentUI(resumeUrl);
           } else {
               showPendingPaymentUI(null);
           }
        } else {
           setError(response.message || "Failed to initiate payment");
        }
      }
    } catch (err) {
      console.error("Payment Error:", err);
      
      const msg = err.message?.toLowerCase() || "";
      if (msg.includes("pending") || msg.includes("completed")) {
         try {
           const updatedOrder = await fetchRetryDetails(orderId ? Number(orderId) : null);
           console.log("Updated Order for Retry:", updatedOrder);
           
           if (updatedOrder) {
             if (updatedOrder.paymentStatus === 1 || String(updatedOrder.paymentStatus).toLowerCase() === 'paid') {
                clearCart();
                localStorage.removeItem('cart');
                window.location.href = '/orders';
                return;
             }
             
             const resumeUrl = getPendingPaymentUrl(updatedOrder);
             if (resumeUrl) {
                 showPendingPaymentUI(resumeUrl);
             } else {
                 showPendingPaymentUI(null);
             }
           }
         } catch (innerErr) {
            console.error(innerErr);
            setError(err.message);
         }
      } else {
         setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step === 'cart') {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="container mx-auto px-4 py-20 text-center"
      >
        <h2 className="text-3xl font-heading font-bold mb-6 dark:text-white">
          {language === "ar" ? "سلة التسوق فارغة" : "Your Cart is Empty"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {language === "ar"
            ? "يبدو أنك لم تقم بإضافة أي حقائب أنيقة بعد."
            : "Looks like you haven't added any elegant bags yet."}
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-primary dark:bg-white text-white dark:text-primary px-6 py-3 rounded-full hover:bg-accent dark:hover:bg-gray-200 transition-colors"
        >
          {language === "ar" ? "متابعة التسوق" : "Continue Shopping"} <ArrowRight size={18} className={language === "ar" ? "rotate-180" : ""} />
        </Link>
      </motion.div>
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
      <div className="flex items-center gap-4 mb-8">
        {step !== 'cart' && (
          <button
            onClick={() => setStep(step === 'payment' ? 'info' : 'cart')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white"
          >
            <ArrowLeft size={24} className={language === "ar" ? "rotate-180" : ""} />
          </button>
        )}
        <h1 className="text-3xl font-heading font-bold dark:text-white">
          {step === 'cart' && (language === "ar" ? "سلة التسوق" : "Shopping Cart")}
          {step === 'info' && (language === "ar" ? "معلومات الشحن" : "Shipping Information")}
          {step === 'payment' && (language === "ar" ? "الدفع" : "Payment")}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {step === 'cart' && (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm"
                  >
                    <div className="w-24 h-24 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-grow text-center sm:text-left rtl:sm:text-right">
                      <h3 className="font-heading font-bold text-lg dark:text-white">{item.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 justify-center sm:justify-start">
                        <p className="text-accent font-medium">
                          {item.price.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                        </p>
                        {item.originalPrice > item.price && (
                          <p className="text-sm text-gray-400 line-through">
                            {item.originalPrice.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"
                      title={language === "ar" ? "إزالة المنتج" : "Remove Item"}
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {step === 'info' && (
            <form id="orderForm" onSubmit={handleCreateOrder} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium dark:text-gray-300">
                  {language === "ar" ? "الاسم الكامل" : "Full Name"}
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none"
                  placeholder={language === "ar" ? "أدخل اسمك" : "Enter your name"}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium dark:text-gray-300">
                  {language === "ar" ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none"
                  placeholder={language === "ar" ? "01xxxxxxxxx" : "01xxxxxxxxx"}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium dark:text-gray-300">
                  {language === "ar" ? "العنوان" : "Address"}
                </label>
                <textarea
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none"
                  placeholder={language === "ar" ? "عنوان الشحن بالتفصيل" : "Detailed shipping address"}
                ></textarea>
              </div>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm space-y-8">
                <h3 className="text-xl font-bold dark:text-white">
                  {language === "ar" ? "اختر طريقة الدفع" : "Choose Payment Method"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod(1)}
                    className={`flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all ${paymentMethod === 1
                      ? 'border-accent bg-accent/5 dark:bg-accent/10'
                      : 'border-gray-100 dark:border-gray-700 hover:border-accent/50'
                      }`}
                  >
                    <CreditCard size={40} className={paymentMethod === 1 ? 'text-accent' : 'dark:text-gray-400'} />
                    <span className={`font-bold ${paymentMethod === 1 ? 'text-accent' : 'dark:text-white'}`}>
                      {language === "ar" ? "بطاقة بنكية (فيزا / ماستر)" : "Credit Card (Visa / Master)"}
                    </span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod(2)}
                    className={`flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all ${paymentMethod === 2
                      ? 'border-accent bg-accent/5 dark:bg-accent/10'
                      : 'border-gray-100 dark:border-gray-700 hover:border-accent/50'
                      }`}
                  >
                    <Wallet size={40} className={paymentMethod === 2 ? 'text-accent' : 'dark:text-gray-400'} />
                    <span className={`font-bold ${paymentMethod === 2 ? 'text-accent' : 'dark:text-white'}`}>
                      {language === "ar" ? "محفظة إلكترونية" : "E-Wallet"}
                    </span>
                  </button>
                </div>

                {paymentMethod === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 pt-4 border-t dark:border-gray-700"
                  >
                    <label className="block text-sm font-medium dark:text-gray-300">
                      {language === "ar" ? "رقم محفظة الهاتف" : "Wallet Phone Number"}
                    </label>
                    <input
                      type="tel"
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none"
                      placeholder="01xxxxxxxxx"
                    />
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md sticky top-24">
            <h2 className="text-xl font-bold mb-6 dark:text-white">
              {language === "ar" ? "ملخص الطلب" : "Order Summary"}
            </h2>

            <div className="flex justify-between mb-4 text-gray-600 dark:text-gray-400">
              <span>{language === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
              <span>
                {retryOrderDetails
                  ? retryOrderDetails.finalPrice.toFixed(2)
                  : cartTotal.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
              </span>
            </div>

            <div className="border-t dark:border-gray-700 pt-4 mb-6 flex justify-between font-bold text-lg dark:text-white">
              <span>{language === "ar" ? "الإجمالي" : "Total"}</span>
              <span>
                {retryOrderDetails
                  ? retryOrderDetails.finalPrice.toFixed(2)
                  : cartTotal.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30 flex flex-col gap-2">
                <span>{error}</span>
                {(typeof error === 'string' && (error.includes("products") || error.includes("منتجات"))) && (error.includes("unavailable") || error.includes("غير متوفرة")) && (
                  <button
                    onClick={clearCart}
                    className="text-xs bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-700 dark:text-white px-2 py-1 rounded transition-colors w-fit self-end"
                  >
                    {language === "ar" ? "إفراغ السلة" : "Clear Cart"}
                  </button>
                )}
              </div>
            )}

            {step === 'cart' && (
              <button
                onClick={() => setStep('info')}
                className="w-full bg-accent hover:bg-yellow-600 text-white py-3 rounded-full font-bold transition-all transform hover:scale-[1.02] shadow-lg mb-4 flex items-center justify-center gap-2"
              >
                {language === "ar" ? "متابعة للدفع" : "Proceed to Checkout"}
                <ArrowRight size={18} className={language === "ar" ? "rotate-180" : ""} />
              </button>
            )}

            {step === 'info' && (
              <button
                form="orderForm"
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-yellow-600 text-white py-3 rounded-full font-bold transition-all transform hover:scale-[1.02] shadow-lg mb-4 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {language === "ar" ? "تأكيد الطلب" : "Confirm Order"}
                    <ArrowRight size={18} className={language === "ar" ? "rotate-180" : ""} />
                  </>
                )}
              </button>
            )}

            {step === 'payment' && (
              <button
                onClick={handlePayment}
                disabled={loading || !paymentMethod}
                className="w-full bg-accent hover:bg-yellow-600 text-white py-3 rounded-full font-bold transition-all transform hover:scale-[1.02] shadow-lg mb-4 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {language === "ar" ? "إتمام عملية الدفع" : "Complete Payment"}
                    <ArrowRight size={18} className={language === "ar" ? "rotate-180" : ""} />
                  </>
                )}
              </button>
            )}

            {step === 'cart' && (
              <button
                onClick={clearCart}
                className="w-full text-gray-500 hover:text-red-500 text-sm underline transition-colors"
              >
                {language === "ar" ? "إفراغ السلة" : "Clear Cart"}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

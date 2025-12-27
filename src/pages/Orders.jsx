import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Package, CreditCard, X, Loader2 } from "lucide-react";
import { fetchUserOrders, fetchUserOrderById, resolveImageUrl } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";
import { pageVariants } from "../lib/animations";

export default function Orders() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // UI states
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [currentPage, pageSize]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        pageSize: pageSize
      };

      const response = await fetchUserOrders(params);

      if (response.success) {
        setOrders(response.data || []);
        // Calculate total pages if pagination info is available
        // Assuming 10 items per page for now
        setTotalPages(Math.ceil((response.data?.length || 0) / pageSize));
      } else {
        setError(response.message || "Failed to load orders");
      }
    } catch (err) {
      setError(err.message || "An error occurred while loading orders");
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (orderId) => {
    setLoadingDetails(true);
    try {
      const response = await fetchUserOrderById(orderId);
      if (response.success) {
        setOrderDetails(response.data);
      }
    } catch (err) {
      console.error("Failed to load order details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    loadOrderDetails(order.id);
  };

  const toggleOrderExpand = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Arabic Translations Mapping for both Status and Payment
  const arabicTranslations = {
    // Order Statuses
    "pending": "قيد الانتظار", "0": "قيد الانتظار",
    "processing": "قيد التجهيز", "1": "قيد التجهيز",
    "shipped": "تم الشحن", "2": "تم الشحن",
    "delivered": "تم التوصيل", "3": "تم التوصيل",
    "cancelled": "ملغي", "4": "ملغي",
    "expired": "منتهي الصلاحية",

    // Payment Statuses
    "paid": "مدفوع",
    "unpaid": "غير مدفوع",
    "failed": "فشل الدفع",
    "completed": "مكتمل",
    "pending payment": "في انتظار الدفع"
  };

  const getStatusLabel = (status) => {
    if (!status) return "";
    const lowerStatus = status.toLowerCase();

    // Explicit mapping for "processing" status (typically ID 1)
    if (lowerStatus === 'processing' || lowerStatus === 'under preparation') {
      return language === "ar" ? "قيد التجهيز" : "Processing";
    }

    if (language === "ar") {
      return arabicTranslations[lowerStatus] || status;
    }
    return status;
  };

  // Badge Color for ORDER STATUS
  const getOrderStatusColor = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "pending") return "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700";
    if (s === "processing" || s === "under preparation") return "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700";
    if (s === "shipped") return "bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700";
    if (s === "delivered") return "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700";
    if (s === "cancelled" || s === "expired") return "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700";

    return "bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-300";
  };

  // Badge Color for PAYMENT STATUS
  const getPaymentStatusColor = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "paid" || s === "completed" || s === "success") return "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700";
    if (s === "failed") return "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700";
    if (s === "unpaid" || s === "pending") return "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700";

    return "bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-300";
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;
    if (dateString instanceof Date) return dateString;

    let str = String(dateString);
    if (!str || str.startsWith("0001")) return null;

    // Normalize ISO format (handle spaces and missing T)
    str = str.replace(' ', 'T');

    // If it's an ISO string without timezone info, assume UTC from server
    if (str.includes('T') && !str.includes('Z') && !str.match(/[+-]\d{2}:?\d{2}$/)) {
      str += 'Z';
    }

    const date = new Date(str);
    return isNaN(date.getTime()) || date.getFullYear() < 1980 ? null : date;
  };

  const formatDate = (dateString, showTime = true) => {
    const date = parseDate(dateString);
    if (!date) return language === "ar" ? "غير متوفر" : "N/A";

    return date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(showTime && {
        hour: '2-digit',
        minute: '2-digit'
      })
    });
  };

  // Helper to determine payment status from PaymobTransactionObj or fallback
  const getEffectivePaymentStatus = (order) => {
    if (!order) return 'unpaid';

    // 1. Try PaymobTransactionObj (Priority)
    if (order.paymobTransactionObj) {
      let transaction = order.paymobTransactionObj;
      // Handle case where it might be a JSON string
      if (typeof transaction === 'string') {
        try {
          transaction = JSON.parse(transaction);
        } catch (e) {
          console.error("Failed to parse PaymobTransactionObj", e);
          // Don't fallback yet, checking if we can assume anything? 
          // If parse fails, maybe fallback to paymobTransactionObj as is if it was object?
          // No, if it was string and failed, we have nothing.
        }
      }

      if (transaction && typeof transaction === 'object') {
        // Logic from requirements:
        // Success: true -> 'paid' (Green)
        // Success: false && Pending: false -> 'failed' (Red)
        // Pending: true -> 'unpaid' (Yellow) - mapped to 'unpaid' which renders yellow/pending

        if (transaction.success === true) return 'paid';
        if (transaction.pending === true) return 'unpaid';
        if (transaction.success === false && transaction.pending === false) return 'failed';

        // Implicit fallback for other cases? 
        // If success is false and pending is undefined? defaults to failed presumably.
        if (transaction.success === false) return 'failed';
      }
    }

    // 2. Fallback to existing paymentStatus
    if (order.paymentStatus !== undefined && order.paymentStatus !== null) {
      const s = String(order.paymentStatus).toLowerCase();
      if (['paid', 'completed', 'success', '1'].includes(s)) return 'paid';
      if (['failed', '2'].includes(s)) return 'failed';
      return 'unpaid';
    }

    // 3. Fallback to Payment History (Last payment)
    const paymentHistory = order.payments || order.orderPayments || order.paymentHistory;
    if (paymentHistory && paymentHistory.length > 0) {
      const lastPayment = paymentHistory[paymentHistory.length - 1];
      const s = String(lastPayment.status || "").toLowerCase();
      if (['paid', 'completed', 'success'].includes(s)) return 'paid';
      if (['failed'].includes(s)) return 'failed';
    }

    return 'unpaid';
  };

  // Helper to determine effective order status (Paid + Pending -> Processing)
  const getEffectiveOrderStatus = (order) => {
    if (!order) return "";
    let status = String(order.status || "").toLowerCase();
    const paymentStatus = getEffectivePaymentStatus(order);

    // FIX: If backend returns 'paid'/'completed' as order status (wrong usage), remap it based on payment.
    if (status === 'paid' || status === 'completed' || status === 'success') {
      if (paymentStatus === 'paid') return 'processing';
      return 'pending';
    }

    // Business Rule: If Paid and Pending -> Processing
    if (paymentStatus === 'paid' && (status === 'pending' || status === '0')) {
      return 'processing';
    }

    // Normalization: Map strings/IDs to standard keys for Badge Colors
    if (status === '1') return 'processing';
    if (status === '2') return 'shipped';
    if (status === '3') return 'delivered';
    if (status === '4') return 'cancelled';

    return status;
  };

  // Check if order can be paid again
  const canPayAgain = (order) => {
    if (!order) return false;

    // 1. Block if Cancelled
    const orderStatus = String(order.status || "").toLowerCase();
    if (orderStatus === 'cancelled' || orderStatus === '4') return false;

    // 2. Check Effective Payment Status
    const status = getEffectivePaymentStatus(order);

    // Allow if Unpaid or Failed
    return status === 'unpaid' || status === 'failed';
  };
  const handlePayAgain = (orderId) => {
    navigate(`/cart?orderId=${orderId}`);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container mx-auto px-4 md:px-6 py-12 max-w-5xl"
    >
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-heading font-bold mb-3 text-slate-900 dark:text-white">
          {language === "ar" ? "سجل الطلبات" : "Order History"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          {language === "ar"
            ? "تتبع حالة طلباتك ومشترياتك السابقة"
            : "Track the status of your orders and view past purchases"}
        </p>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-accent mb-4" size={48} strokeWidth={1.5} />
          <p className="text-slate-400 animate-pulse font-medium">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-8 rounded-3xl text-center border border-rose-100 dark:border-rose-800">
          <div className="bg-rose-100 dark:bg-rose-800/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} />
          </div>
          <h3 className="font-bold text-lg mb-2">{language === "ar" ? "حدث خطأ" : "Something went wrong"}</h3>
          <p>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-16 rounded-3xl text-center shadow-sm border border-slate-100 dark:border-gray-700">
          <div className="bg-slate-50 dark:bg-gray-700/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={48} className="text-slate-300 dark:text-gray-500" strokeWidth={1} />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white font-heading">
            {language === "ar" ? "لا توجد طلبات" : "No Orders Yet"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            {language === "ar"
              ? "لم تقم بأي طلبات بعد. تصفح منتجاتنا وابدأ التسوق!"
              : "You haven't placed any orders yet. Browse our collection and find something you love!"}
          </p>
          <button
            onClick={handleGoHome}
            className="px-8 py-3 bg-primary dark:bg-white text-white dark:text-primary rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            {language === "ar" ? "ابدأ التسوق" : "Start Shopping"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl shadow-xl dark:shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-2xl border border-gray-100 dark:border-gray-700/50 transition-all duration-300 group"
              >
                {/* Header / Summary Section */}
                <div className="p-6 md:p-8 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="bg-orange-50 dark:bg-gray-700/50 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        <Package className="w-7 h-7 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-xl dark:text-white flex items-center gap-2 mb-1">
                          {language === "ar" ? "طلب #" : "Order #"}{order.id}
                        </h3>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                            <span className="opacity-70 text-[10px] uppercase font-bold tracking-tight">{language === "ar" ? "تاريخ الطلب:" : "Ordered:"}</span>
                            {formatDate(order.createdAt || order.creationDate || order.createdDate || order.created)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 mt-2 md:mt-0">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{language === "ar" ? "الإجمالي" : "TOTAL"}</p>
                        <span className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
                          {(Number(order.finalPrice) || 0).toFixed(2)} <span className="text-sm font-sans font-medium text-slate-400">{language === "ar" ? "ج.م" : "EGP"}</span>
                        </span>
                      </div>

                      {/* Dual Badges Container */}
                      <div className="flex flex-wrap gap-2 justify-end mt-1">
                        {/* Order Status Badge */}
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${getOrderStatusColor(getEffectiveOrderStatus(order))}`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                          <span>{language === "ar" ? "حالة الطلب:" : "Status:"}</span>
                          <span className="uppercase">{getStatusLabel(getEffectiveOrderStatus(order))}</span>
                        </div>

                        {/* Payment Status Badge */}
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${getPaymentStatusColor(getEffectivePaymentStatus(order))}`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                          <span>{language === "ar" ? "الدفع:" : "Payment:"}</span>
                          <span className="uppercase">{getStatusLabel(getEffectivePaymentStatus(order))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Preview Strip */}
                {order.orderItems && order.orderItems.length > 0 && (
                  <div className="px-6 md:px-8 pb-8">
                    <div className="bg-slate-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-slate-100 dark:border-gray-700">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">
                        {language === "ar" ? "المنتجات" : "Products"} ({order.orderItems.length})
                      </p>
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {order.orderItems.map((item, index) => {
                          const productImage = item.product?.images?.[0]?.imageUrl;
                          const productName = language === "ar"
                            ? (item.product?.arName || item.productName)
                            : (item.product?.enName || item.productName);

                          return productImage ? (
                            <div key={index} className="relative shrink-0 group/item cursor-help" title={productName}>
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 shadow-sm transition-transform hover:-translate-y-1">
                                <img
                                  src={resolveImageUrl(productImage)}
                                  alt={productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {item.quantity > 1 && (
                                <span className="absolute -top-2 -right-2 bg-slate-900 dark:bg-white text-white dark:text-primary text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-gray-900 transform scale-90">
                                  {item.quantity}
                                </span>
                              )}
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Collapsible Details Section - (Content remains same, just wrapper) */}
                <AnimatePresence>
                  {expandedOrders.has(order.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-slate-50/80 dark:bg-black/20 border-t border-slate-100 dark:border-gray-700"
                    >
                      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* Delivery Info */}
                        <div className="space-y-5">
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                            <div className="w-1 h-6 bg-accent rounded-full"></div>
                            {language === "ar" ? "تفاصيل التوصيل" : "Delivery Details"}
                          </h4>
                          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-gray-700/50">
                              <span className="text-slate-500 text-sm font-medium">{language === "ar" ? "الاسم" : "Name"}</span>
                              <span className="font-semibold text-slate-800 dark:text-gray-200 text-sm">
                                {order.name || (language === "ar" ? "غير متوفر" : "N/A")}
                              </span>
                            </div>
                            <div className="flex justify-between items-start pb-4 border-b border-slate-50 dark:border-gray-700/50">
                              <span className="text-slate-500 text-sm font-medium">{language === "ar" ? "العنوان" : "Address"}</span>
                              <span className="font-semibold text-slate-800 dark:text-gray-200 text-sm max-w-[60%] text-right leading-relaxed">{order.address}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 text-sm font-medium">{language === "ar" ? "الهاتف" : "Phone"}</span>
                              <span className="font-semibold text-slate-800 dark:text-gray-200 text-sm font-mono tracking-wide">{order.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="space-y-5">
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                            <div className="w-1 h-6 bg-accent rounded-full"></div>
                            {language === "ar" ? "قائمة المنتجات" : "Items List"}
                          </h4>
                          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {order.orderItems?.map((item, index) => {
                              const productName = language === "ar"
                                ? (item.product?.arName || item.productName)
                                : (item.product?.enName || item.productName);
                              return (
                                <div key={index} className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 p-3 rounded-xl border border-slate-100 dark:border-gray-700 shadow-sm hover:border-accent/30 transition-colors">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-slate-800 dark:text-white line-clamp-1">{productName}</span>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                      <span className="bg-slate-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px]">x{item.quantity}</span>
                                      <span>{(item.unitPrice).toFixed(2)}</span>
                                    </div>
                                  </div>
                                  <span className="font-bold text-accent">
                                    {item.totalPrice.toFixed(2)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer / Actions */}
                <div className="p-4 md:p-6 bg-white dark:bg-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-gray-700 rounded-b-3xl">
                  <button
                    onClick={() => toggleOrderExpand(order.id)}
                    className="text-sm font-bold text-slate-500 hover:text-accent flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800"
                  >
                    {expandedOrders.has(order.id) ? (
                      <>{language === "ar" ? "إخفاء التفاصيل" : "Hide Details"} <ChevronUp size={16} strokeWidth={2.5} /></>
                    ) : (
                      <>{language === "ar" ? "عرض التفاصيل" : "Show Details"} <ChevronDown size={16} strokeWidth={2.5} /></>
                    )}
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {canPayAgain(order) && (
                      <button
                        onClick={() => handlePayAgain(order.id)}
                        className="flex-1 sm:flex-none px-6 py-3 bg-accent hover:bg-yellow-600 text-white rounded-xl transition-all shadow-lg shadow-accent/20 transform hover:-translate-y-0.5 font-bold text-sm flex items-center justify-center gap-2 border border-transparent"
                      >
                        <CreditCard size={18} />
                        {language === "ar" ? "ادفع الآن" : "Pay Now"}
                      </button>
                    )}
                    <button
                      onClick={() => handleOrderClick(order)}
                      className="flex-1 sm:flex-none px-6 py-3 bg-white dark:bg-gray-800 border-2 border-slate-200 dark:border-gray-600 text-slate-700 dark:text-gray-200 hover:border-accent hover:text-accent dark:hover:border-accent dark:hover:text-accent rounded-xl transition-all font-bold text-sm shadow-sm hover:shadow-md"
                    >
                      {language === "ar" ? "الفاتورة كاملة" : "Invoice"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {!loading && orders.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
          <div className="flex items-center gap-2">
            <label className="text-sm dark:text-gray-300">
              {language === "ar" ? "عدد العناصر:" : "Items per page:"}
            </label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === "ar" ? "السابق" : "Previous"}
            </button>
            <span className="px-4 py-2 dark:text-white">
              {language === "ar" ? "صفحة" : "Page"} {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={orders.length < pageSize}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === "ar" ? "التالي" : "Next"}
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 md:p-6"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto relative"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl md:text-2xl font-bold dark:text-white">
                    {language === "ar" ? "تفاصيل الطلب #" : "Order Details #"}{selectedOrder.id}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X size={24} className="dark:text-white" />
                  </button>
                </div>

                {loadingDetails ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-accent" size={40} />
                  </div>
                ) : orderDetails ? (
                  <div className="space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "الحالة:" : "Status:"}
                        </p>
                        <span className={`${getOrderStatusColor(getEffectiveOrderStatus(orderDetails))} px-3 py-1 rounded-full text-sm font-medium inline-block mt-1`}>
                          {getStatusLabel(getEffectiveOrderStatus(orderDetails))}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "حالة الدفع:" : "Payment Status:"}
                        </p>
                        <span className={`${getPaymentStatusColor(getEffectivePaymentStatus(orderDetails))} px-3 py-1 rounded-full text-sm font-medium inline-block mt-1`}>
                          {getStatusLabel(getEffectivePaymentStatus(orderDetails))}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "الإجمالي:" : "Total:"}
                        </p>
                        <p className="font-bold text-lg dark:text-white">
                          {orderDetails.finalPrice.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "الاسم:" : "Name:"}
                        </p>
                        <p className="dark:text-white font-medium">
                          {orderDetails.name || orderDetails.customerName || selectedOrder?.name || (language === "ar" ? "غير متوفر" : "N/A")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "تاریخ الطلب:" : "Created At:"}
                        </p>
                        <p className="dark:text-white">
                          {formatDate(orderDetails.createdAt || orderDetails.creationDate || orderDetails.createdDate || orderDetails.created)}
                        </p>
                      </div>
                      {getEffectivePaymentStatus(orderDetails) !== 'paid' && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {language === "ar" ? "ينتهي في:" : "Expires At:"}
                          </p>
                          <p className="dark:text-white">
                            {formatDate(orderDetails.expiresAt || orderDetails.expiryDate || orderDetails.expirationDate || orderDetails.expiryTime)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t dark:border-gray-700 pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {language === "ar" ? "العنوان:" : "Address:"}
                      </p>
                      <p className="dark:text-white">{orderDetails.address}</p>
                    </div>

                    <div className="border-t dark:border-gray-700 pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {language === "ar" ? "الهاتف:" : "Phone:"}
                      </p>
                      <p className="dark:text-white">{orderDetails.phone}</p>
                    </div>

                    {/* Order Items */}
                    <div className="border-t dark:border-gray-700 pt-4">
                      <h3 className="font-bold mb-3 dark:text-white">
                        {language === "ar" ? "عناصر الطلب:" : "Order Items:"}
                      </h3>
                      <div className="space-y-3">
                        {orderDetails.orderItems?.map((item, index) => {
                          const productName = language === "ar"
                            ? (item.product?.arName || item.productName)
                            : (item.product?.enName || item.productName);
                          const productImage = item.product?.images?.[0]?.imageUrl;

                          return (
                            <div key={index} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg flex gap-3 items-center">
                              {productImage && (
                                <div className="w-20 h-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                                  <img
                                    src={resolveImageUrl(productImage)}
                                    alt={productName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="font-medium dark:text-white">{productName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.quantity} × {item.unitPrice.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                                </p>
                              </div>
                              <p className="font-bold dark:text-white shrink-0">
                                {item.totalPrice.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Payment History */}
                    {orderDetails.payments && orderDetails.payments.length > 0 && (
                      <div className="border-t dark:border-gray-700 pt-4">
                        <h3 className="font-bold mb-3 flex items-center gap-2 dark:text-white">
                          <CreditCard size={20} />
                          {language === "ar" ? "سجل الدفع:" : "Payment History:"}
                        </h3>
                        <div className="space-y-2">
                          {orderDetails.payments.map((payment) => (
                            <div key={payment.id} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium dark:text-white">
                                    {payment.method}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {formatDate(payment.createdAt)}
                                  </p>
                                </div>
                                <span className={`${getPaymentStatusColor(payment.status)} px-3 py-1 rounded-full text-xs font-medium`}>
                                  {getStatusLabel(payment.status)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {language === "ar" ? "المبلغ:" : "Amount:"}
                                </span>
                                <span className="font-bold dark:text-white">
                                  {payment.amount.toFixed(2)} {payment.currency}
                                </span>
                              </div>
                              {payment.transactionId && (
                                <div className="flex justify-between text-sm mt-1">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {language === "ar" ? "معرف المعاملة:" : "Transaction ID:"}
                                  </span>
                                  <span className="dark:text-white">{payment.transactionId}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                    {language === "ar" ? "فشل تحميل التفاصيل" : "Failed to load details"}
                  </div>
                )}

                {/* Modal Footer with Actions */}
                <div className="mt-8 pt-6 border-t dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="w-full sm:w-auto">
                    {orderDetails && canPayAgain(orderDetails) && (
                      <button
                        onClick={() => handlePayAgain(orderDetails.id)}
                        className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 font-bold flex items-center justify-center gap-2"
                      >
                        <CreditCard size={20} />
                        {language === "ar" ? "دفع مرة أخرى" : "Pay Again"}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-full sm:w-auto px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-bold"
                  >
                    {language === "ar" ? "إغلاق" : "Close"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

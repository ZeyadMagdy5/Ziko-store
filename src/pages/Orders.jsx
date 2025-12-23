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

  const arabicTranslations = {
    "pending": "قيد الانتظار",
    "pending payment": "في انتظار الدفع",
    "pendingpayment": "في انتظار الدفع",
    "pending_payment": "في انتظار الدفع",
    "processing": "قيد المعالجة",
    "shipped": "تم الشحن",
    "delivered": "تم التوصيل",
    "cancelled": "ملغي",
    "expired": "منتهي الصلاحية",
    "paid": "مدفوع",
    "completed": "مكتمل",
    "failed": "فشل الدفع",
    "unpaid": "غير مدفوع"
  };

  const getStatusLabel = (status) => {
    if (!status) return "";
    const lowerStatus = status.toLowerCase();
    if (language === "ar") {
      return arabicTranslations[lowerStatus] || status;
    }
    return status;
  };

  const getStatusBadgeColor = (status) => {
    const statusLower = status?.toLowerCase() || "";
    // Soft pastel colors for easier reading (Light mode specific mainly, but works in dark mode as contrast is handled)
    if (["paid", "delivered", "completed"].includes(statusLower)) {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    }
    if (["pending", "processing", "pending payment", "pendingpayment", "pending_payment", "unpaid"].includes(statusLower)) {
      return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
    }
    if (["shipped"].includes(statusLower)) {
      return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    }
    if (["cancelled", "expired", "failed"].includes(statusLower)) {
      return "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
    }
    return "bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
  };

  const getPaymentStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (["completed", "paid"].includes(statusLower)) {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    }
    if (["pending", "pending payment", "pendingpayment", "pending_payment", "unpaid"].includes(statusLower)) {
      return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
    }
    if (["failed"].includes(statusLower)) {
      return "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
    }
    return "bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
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

  // Check if order can be paid again (Strictly if pending and (no payment or last failed))
  const canPayAgain = (order) => {
    if (!order) return false;

    // Condition 1: Trust the order status from the server
    // If the server says it's Pending, it's open for payment attempts
    const status = order.status || order.orderStatus || "";
    const statusLower = String(status).toLowerCase();

    const payableStatuses = [
      "pending",
      "pending payment",
      "pendingpayment",
      "pending_payment",
      "unpaid",
      "failed" // Sometimes the whole order status might be failed
    ];

    if (!payableStatuses.includes(statusLower)) return false;

    // Condition 2: Client-side clock check (Relaxed)
    // We only block if the server provided an expiration date that is explicitly in the past
    // However, if the status is still 'Pending', we should generally allow the attempt
    // because the server is the ultimate authority.
    const expiryDateStr = order.expiresAt || order.expiryDate || order.expirationDate || order.expiryTime;
    const expiresAt = parseDate(expiryDateStr);
    // Removed client-side expiration check to rely on server status

    // Condition 3: Check payment history
    // If there were attempts, allow retry if the last one wasn't successful
    const paymentHistory = order.payments || order.orderPayments || order.paymentHistory;
    if (paymentHistory && paymentHistory.length > 0) {
      const lastPayment = paymentHistory[paymentHistory.length - 1];
      const paymentStatusLower = String(lastPayment.status || "").toLowerCase();

      // If last attempt is already paid/completed, or still pending, don't show Pay Again
      // This prevents duplicate payments while one is being processed
      const blockedStatuses = ["paid", "completed", "success", "pending", "pending payment", "pendingpayment", "pending_payment"];
      if (blockedStatuses.includes(paymentStatusLower)) {
        return false;
      }

      // Otherwise, only show it if the status is explicitly failed or unpaid
      return ["failed", "unpaid"].includes(paymentStatusLower);
    }

    // No payment attempts yet - definitely allow payment
    return true;
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
                          {(order.expiresAt || order.expiryDate || order.expiryTime) && (String(order.status || "").toLowerCase().includes("pending")) && (
                            <p className="text-[10px] text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1">
                              <span className="opacity-70 uppercase tracking-tighter">{language === "ar" ? "ينتهي في:" : "Expires:"}</span>
                              {formatDate(order.expiresAt || order.expiryDate || order.expiryTime)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-t md:border-t-0 border-gray-100 dark:border-gray-700 pt-4 md:pt-0 mt-2 md:mt-0 justify-between md:justify-end">
                      <div className="text-right mr-4">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{language === "ar" ? "الإجمالي" : "TOTAL"}</p>
                        <span className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
                          {(Number(order.finalPrice) || 0).toFixed(2)} <span className="text-sm font-sans font-medium text-slate-400">{language === "ar" ? "ج.م" : "EGP"}</span>
                        </span>
                      </div>
                      <span className={`${getStatusBadgeColor(order.status)} px-5 py-2 rounded-full text-sm font-bold shadow-lg transition-transform hover:scale-105 active:scale-95`}>
                        {getStatusLabel(order.status)}
                      </span>
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

                {/* Collapsible Details Section */}
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
                        className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 font-bold text-sm flex items-center justify-center gap-2"
                      >
                        <CreditCard size={18} />
                        {language === "ar" ? "دفع مرة أخرى" : "Pay Again"}
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "الحالة:" : "Status:"}
                        </p>
                        <span className={`${getStatusBadgeColor(orderDetails.status)} px-3 py-1 rounded-full text-sm font-medium inline-block mt-1`}>
                          {getStatusLabel(orderDetails.status)}
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
                          {language === "ar" ? "تاریخ الطلب:" : "Created At:"}
                        </p>
                        <p className="dark:text-white">
                          {formatDate(orderDetails.createdAt || orderDetails.creationDate || orderDetails.createdDate || orderDetails.created)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "ينتهي في:" : "Expires At:"}
                        </p>
                        <p className="dark:text-white">
                          {formatDate(orderDetails.expiresAt || orderDetails.expiryDate || orderDetails.expirationDate || orderDetails.expiryTime)}
                        </p>
                      </div>
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

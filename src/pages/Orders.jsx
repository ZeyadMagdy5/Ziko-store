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
        "processing": "قيد المعالجة",
        "shipped": "تم الشحن",
        "delivered": "تم التوصيل",
        "cancelled": "ملغي",
        "expired": "منتهي الصلاحية",
        "paid": "مدفوع",
        "completed": "مكتمل",
        "failed": "فشل الدفع"
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
        if (["paid", "delivered", "completed"].includes(statusLower)) return "bg-green-500";
        if (["pending", "processing"].includes(statusLower)) return "bg-yellow-500";
        if (["shipped"].includes(statusLower)) return "bg-blue-500";
        if (["cancelled", "expired", "failed"].includes(statusLower)) return "bg-red-500";
        return "bg-gray-500";
    };

    const getPaymentStatusColor = (status) => {
        const statusLower = status?.toLowerCase() || "";
        if (["completed", "paid"].includes(statusLower)) return "bg-green-500";
        if (["pending"].includes(statusLower)) return "bg-yellow-500";
        if (["failed"].includes(statusLower)) return "bg-red-500";
        return "bg-gray-500";
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Check if order can be paid again (has failed payment or pending payment, and not expired)
    const canPayAgain = (order) => {
        const now = new Date();
        const expiresAt = new Date(order.expiresAt);
        const isExpired = now > expiresAt;
        const statusLower = order.status?.toLowerCase() || "";

        // Can't pay if order is expired, paid, delivered, cancelled, or shipped
        if (isExpired || statusLower === "paid" || statusLower === "delivered" ||
            statusLower === "cancelled" || statusLower === "expired" || statusLower === "shipped") {
            return false;
        }

        // Check if there are any payments
        if (!order.payments || order.payments.length === 0) {
            // No payments yet, can pay if order is pending
            return statusLower === "pending";
        }

        // Get the last payment
        const lastPayment = order.payments[order.payments.length - 1];
        const paymentStatusLower = lastPayment.status?.toLowerCase() || "";

        // Can pay again if last payment failed or is pending
        return paymentStatusLower === "failed" || paymentStatusLower === "pending";
    };

    const handlePayAgain = (orderId) => {
        navigate(`/cart?orderId=${orderId}`);
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="container mx-auto px-4 md:px-6 py-12"
        >
            <h1 className="text-3xl font-heading font-bold mb-8 dark:text-white">
                {language === "ar" ? "طلباتي" : "My Orders"}
            </h1>

            {/* Orders List */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-accent" size={40} />
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl text-center">
                    {error}
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800 p-12 rounded-xl text-center">
                    <Package size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold mb-2 dark:text-white">
                        {language === "ar" ? "لا توجد طلبات" : "No Orders Found"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {language === "ar" ? "لم تقم بأي طلبات بعد" : "You haven't placed any orders yet"}
                    </p>
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
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group"
                            >
                                {/* Header / Summary Section */}
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
                                                <Package className="w-6 h-6 text-accent" />
                                            </div>
                                            <div>
                                                <h3 className="font-heading font-bold text-lg dark:text-white flex items-center gap-2">
                                                    {language === "ar" ? "طلب #" : "Order #"}{order.id}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`${getStatusBadgeColor(order.status)} text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{language === "ar" ? "الإجمالي" : "Total"}</p>
                                                <span className="font-bold text-xl text-primary dark:text-white">
                                                    {(Number(order.finalPrice) || 0).toFixed(2)} <span className="text-sm text-gray-500">{language === "ar" ? "ج.م" : "EGP"}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Preview Strip */}
                                {order.orderItems && order.orderItems.length > 0 && (
                                    <div className="px-6 pb-6 border-b border-gray-100 dark:border-gray-700/50">
                                        <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
                                            {order.orderItems.map((item, index) => {
                                                const productImage = item.product?.images?.[0]?.imageUrl;
                                                const productName = language === "ar"
                                                    ? (item.product?.arName || item.productName)
                                                    : (item.product?.enName || item.productName);

                                                return productImage ? (
                                                    <div key={index} className="relative shrink-0 group/item">
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                                                            <img
                                                                src={resolveImageUrl(productImage)}
                                                                alt={productName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        {item.quantity > 1 && (
                                                            <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800">
                                                                {item.quantity}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : null;
                                            })}
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
                                            className="overflow-hidden bg-gray-50/50 dark:bg-gray-900/30"
                                        >
                                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 dark:border-gray-700">
                                                {/* Delivery Info */}
                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        {language === "ar" ? "تفاصيل التوصيل" : "Delivery Details"}
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="flex justify-between border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
                                                            <span className="text-gray-500">{language === "ar" ? "العنوان" : "Address"}</span>
                                                            <span className="font-medium dark:text-gray-200 line-clamp-1 max-w-[60%] text-right">{order.address}</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
                                                            <span className="text-gray-500">{language === "ar" ? "الهاتف" : "Phone"}</span>
                                                            <span className="font-medium dark:text-gray-200">{order.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Items List */}
                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        {language === "ar" ? "المنتجات" : "Items"} ({order.orderItems?.length || 0})
                                                    </h4>
                                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                                        {order.orderItems?.map((item, index) => {
                                                            const productName = language === "ar"
                                                                ? (item.product?.arName || item.productName)
                                                                : (item.product?.enName || item.productName);
                                                            return (
                                                                <div key={index} className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium dark:text-white line-clamp-1">{productName}</span>
                                                                        <span className="text-xs text-gray-500">x{item.quantity}</span>
                                                                    </div>
                                                                    <span className="font-bold dark:text-gray-200">
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
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => toggleOrderExpand(order.id)}
                                        className="text-sm font-bold text-gray-500 hover:text-accent flex items-center gap-1 transition-colors"
                                    >
                                        {expandedOrders.has(order.id) ? (
                                            <>{language === "ar" ? "إخفاء التفاصيل" : "Less Details"} <ChevronUp size={16} /></>
                                        ) : (
                                            <>{language === "ar" ? "عرض التفاصيل" : "More Details"} <ChevronDown size={16} /></>
                                        )}
                                    </button>

                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        {canPayAgain(order) && (
                                            <button
                                                onClick={() => handlePayAgain(order.id)}
                                                className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-bold text-sm flex items-center justify-center gap-2"
                                            >
                                                <CreditCard size={16} />
                                                {language === "ar" ? "دفع مرة أخرى" : "Pay Again"}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleOrderClick(order)}
                                            className="flex-1 sm:flex-none px-6 py-2.5 bg-white dark:bg-gray-800 border-2 border-accent text-accent hover:bg-accent hover:text-white rounded-xl transition-all font-bold text-sm"
                                        >
                                            {language === "ar" ? "الفاتورة كاملة" : "Full Invoice"}
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
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold dark:text-white">
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
                                                <span className={`${getStatusBadgeColor(orderDetails.status)} text-white px-3 py-1 rounded-full text-sm font-medium inline-block mt-1`}>
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
                                                    {language === "ar" ? "تاريخ الإنشاء:" : "Created At:"}
                                                </p>
                                                <p className="dark:text-white">{formatDate(orderDetails.createdAt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {language === "ar" ? "ينتهي في:" : "Expires At:"}
                                                </p>
                                                <p className="dark:text-white">{formatDate(orderDetails.expiresAt)}</p>
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
                                                                <span className={`${getPaymentStatusColor(payment.status)} text-white px-3 py-1 rounded-full text-xs font-medium`}>
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
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

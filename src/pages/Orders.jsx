import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Filter, ChevronDown, ChevronUp, Package, CreditCard, X, Loader2 } from "lucide-react";
import { fetchUserOrders, fetchUserOrderById } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";
import { pageVariants } from "../lib/animations";

export default function Orders() {
    const { language } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [statusFilter, setStatusFilter] = useState("");
    const [createdFrom, setCreatedFrom] = useState("");
    const [createdTo, setCreatedTo] = useState("");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // UI states
    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const orderStatuses = [
        { value: "", label: language === "ar" ? "جميع الحالات" : "All Statuses" },
        { value: "0", label: language === "ar" ? "قيد الانتظار" : "Pending" },
        { value: "1", label: language === "ar" ? "قيد المعالجة" : "Processing" },
        { value: "2", label: language === "ar" ? "تم الشحن" : "Shipped" },
        { value: "3", label: language === "ar" ? "تم التوصيل" : "Delivered" },
        { value: "4", label: language === "ar" ? "ملغي" : "Cancelled" },
        { value: "5", label: language === "ar" ? "منتهي الصلاحية" : "Expired" },
        { value: "6", label: language === "ar" ? "مدفوع" : "Paid" }
    ];

    useEffect(() => {
        loadOrders();
    }, [currentPage, pageSize, statusFilter, createdFrom, createdTo]);

    const loadOrders = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page: currentPage,
                pageSize: pageSize
            };

            if (statusFilter) params.status = statusFilter;
            if (createdFrom) params.createdFrom = createdFrom;
            if (createdTo) params.createdTo = createdTo;

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

    const clearFilters = () => {
        setStatusFilter("");
        setCreatedFrom("");
        setCreatedTo("");
        setCurrentPage(1);
    };

    const getStatusBadgeColor = (status) => {
        const statusLower = status?.toLowerCase() || "";
        if (statusLower === "paid" || statusLower === "delivered") return "bg-green-500";
        if (statusLower === "pending" || statusLower === "processing") return "bg-yellow-500";
        if (statusLower === "shipped") return "bg-blue-500";
        if (statusLower === "cancelled" || statusLower === "expired") return "bg-red-500";
        return "bg-gray-500";
    };

    const getPaymentStatusColor = (status) => {
        const statusLower = status?.toLowerCase() || "";
        if (statusLower === "completed" || statusLower === "paid") return "bg-green-500";
        if (statusLower === "pending") return "bg-yellow-500";
        if (statusLower === "failed") return "bg-red-500";
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

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={20} className="dark:text-white" />
                    <h2 className="text-lg font-bold dark:text-white">
                        {language === "ar" ? "تصفية النتائج" : "Filters"}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            {language === "ar" ? "الحالة" : "Status"}
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none"
                        >
                            {orderStatuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            {language === "ar" ? "من تاريخ" : "From Date"}
                        </label>
                        <input
                            type="date"
                            value={createdFrom}
                            onChange={(e) => setCreatedFrom(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                            {language === "ar" ? "إلى تاريخ" : "To Date"}
                        </label>
                        <input
                            type="date"
                            value={createdTo}
                            onChange={(e) => setCreatedTo(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            {language === "ar" ? "مسح الفلاتر" : "Clear Filters"}
                        </button>
                    </div>
                </div>
            </div>

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
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <h3 className="font-bold text-lg dark:text-white">
                                                    {language === "ar" ? "طلب #" : "Order #"}{order.id}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className={`${getStatusBadgeColor(order.status)} text-white px-4 py-1 rounded-full text-sm font-medium`}>
                                                {order.status}
                                            </span>
                                            <span className="font-bold text-lg dark:text-white">
                                                {order.finalPrice.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {language === "ar" ? "العنوان:" : "Address:"}
                                            </p>
                                            <p className="dark:text-white">{order.address}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {language === "ar" ? "الهاتف:" : "Phone:"}
                                            </p>
                                            <p className="dark:text-white">{order.phone}</p>
                                        </div>
                                    </div>

                                    {/* Order Items Toggle */}
                                    <button
                                        onClick={() => toggleOrderExpand(order.id)}
                                        className="flex items-center gap-2 text-accent hover:text-yellow-600 transition-colors mb-2"
                                    >
                                        {expandedOrders.has(order.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        <span className="font-medium">
                                            {language === "ar" ? "عناصر الطلب" : "Order Items"} ({order.orderItems?.length || 0})
                                        </span>
                                    </button>

                                    {/* Expanded Order Items */}
                                    <AnimatePresence>
                                        {expandedOrders.has(order.id) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                                                    {order.orderItems?.map((item, index) => (
                                                        <div key={index} className="flex justify-between items-center">
                                                            <div>
                                                                <p className="font-medium dark:text-white">{item.productName}</p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {language === "ar" ? "الكمية:" : "Quantity:"} {item.quantity} × {item.unitPrice.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                                                                </p>
                                                            </div>
                                                            <p className="font-bold dark:text-white">
                                                                {item.totalPrice.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* View Details Button */}
                                    <button
                                        onClick={() => handleOrderClick(order)}
                                        className="mt-4 w-full md:w-auto px-6 py-2 bg-accent hover:bg-yellow-600 text-white rounded-lg transition-colors font-medium"
                                    >
                                        {language === "ar" ? "عرض التفاصيل الكاملة" : "View Full Details"}
                                    </button>
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
                                                    {orderDetails.status}
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
                                            <div className="space-y-2">
                                                {orderDetails.orderItems?.map((item, index) => (
                                                    <div key={index} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium dark:text-white">{item.productName}</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {item.quantity} × {item.unitPrice.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                                                            </p>
                                                        </div>
                                                        <p className="font-bold dark:text-white">
                                                            {item.totalPrice.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                                                        </p>
                                                    </div>
                                                ))}
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
                                                                    {payment.status}
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

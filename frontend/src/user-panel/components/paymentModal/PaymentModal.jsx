import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Shield, Truck, Globe, ArrowLeft, Package, MapPin, DollarSign } from "lucide-react";
import { placeOrder, getHomePage } from "../../api/api";
import CustomAlert from "../Confirmationpopup/Alert";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, totalAmount, selectedItems } = location.state || {};


  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactionId, setTransactionId] = useState("");
  const [isCOD, setIsCOD] = useState(false);
  const [advancePaymentRequired, setAdvancePaymentRequired] = useState(false);
  const [customAdvanceAmount, setCustomAdvanceAmount] = useState(500); // Default advance amount
  const [language, setLanguage] = useState("english");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  });
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [orderResponse, setOrderResponse] = useState(null);

  useEffect(() => {
    if (!cartItems || !selectedItems || selectedItems.length === 0) {
      navigate('/cart');
    }

    const fetchPaymentMethods = async () => {
      try {
        const response = await getHomePage();
        if (response && response.paymentInfo && response.paymentInfo.method) {
          setPaymentMethods(response.paymentInfo.method);
          if (response.paymentInfo.method.length > 0) {
            setPaymentMethod(response.paymentInfo.method[0].getway);
          }
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    };

    fetchPaymentMethods();
  }, [cartItems, selectedItems, navigate]);

  const content = {
    english: {
      title: "Payment & Checkout",
      backToCart: "Back to Cart",
      orderSummary: "Order Summary",
      items: "items",
      subtotal: "Subtotal",
      shipping: "Shipping",
      free: "Free",
      total: "Total",
      manualPayment: "Manual Payment",
      manualInstructions: "Manual Payment Instructions",
      manualDesc: "Send money to our mobile banking accounts and provide the transaction ID.",
      transactionId: "Transaction ID",
      transactionIdPlaceholder: "Enter transaction ID",
      codLabel: "Cash On Delivery (COD)",
      codNote: "Note: Advance payment required for COD orders.",
      advancePayment: "Advance Payment Amount",
      advancePaymentDesc: "You can pay advance amount now and rest on delivery",
      defaultAdvance: "Default advance: ৳500",
      customAdvance: "Custom advance amount (৳)",
      dueOnDelivery: "Due on delivery",
      shippingAddress: "Shipping Address",
      fullName: "Full Name",
      phone: "Phone",
      address: "Address",
      city: "City",
      zipCode: "Zip Code",
      cancel: "Cancel",
      confirmOrder: "Confirm Order",
      orderSuccess: "Order placed successfully!",
      orderPlacedMsg: "Your order has been placed successfully.",
      paymentSummary: "Payment Summary",
      paidAmount: "Paid Amount",
      dueAmount: "Due Amount",
      paymentMethods: {
        bkash: "Bkash",
        nagad: "Nagad",
        rocket: "Rocket",
        bank: "Bank Transfer",
        card: "Credit/Debit Card"
      }
    },
    bangla: {
      title: "পেমেন্ট এবং চেকআউট",
      backToCart: "কার্টে ফিরে যান",
      orderSummary: "অর্ডার সংক্ষিপ্তসার",
      items: "আইটেম",
      subtotal: "উপমোট",
      shipping: "ডেলিভারি",
      free: "বিনামূল্যে",
      total: "মোট",
      manualPayment: "ম্যানুয়াল পেমেন্ট",
      manualInstructions: "ম্যানুয়াল পেমেন্ট নির্দেশাবলী",
      manualDesc: "আমাদের মোবাইল ব্যাংকিং অ্যাকাউন্টে টাকা পাঠান এবং লেনদেনের আইডি প্রদান করুন।",
      transactionId: "লেনদেনের আইডি",
      transactionIdPlaceholder: "লেনদেনের আইডি লিখুন",
      codLabel: "ক্যাশ অন ডেলিভারি (COD)",
      codNote: "দ্রষ্টব্য: COD অর্ডারের জন্য অগ্রিম পেমেন্ট প্রয়োজন।",
      advancePayment: "অগ্রিম পেমেন্ট পরিমাণ",
      advancePaymentDesc: "আপনি এখন অগ্রিম পরিমাণ পরিশোধ করতে পারেন এবং বাকি ডেলিভারিতে",
      defaultAdvance: "ডিফল্ট অগ্রিম: ৳৫০০",
      customAdvance: "কাস্টম অগ্রিম পরিমাণ (৳)",
      dueOnDelivery: "ডেলিভারিতে বকেয়া",
      shippingAddress: "ডেলিভারি ঠিকানা",
      fullName: "সম্পূর্ণ নাম",
      phone: "ফোন",
      address: "ঠিকানা",
      city: "শহর",
      zipCode: "পোস্ট কোড",
      cancel: "বাতিল",
      confirmOrder: "অর্ডার নিশ্চিত করুন",
      orderSuccess: "অর্ডার সফলভাবে স্থাপন!",
      orderPlacedMsg: "আপনার অর্ডার সফলভাবে স্থাপন করা হয়েছে।",
      paymentSummary: "পেমেন্ট সারসংক্ষেপ",
      paidAmount: "প্রদত্ত পরিমাণ",
      dueAmount: "বকেয়া পরিমাণ",
      paymentMethods: {
        bkash: "বিকাশ",
        nagad: "নগদ",
        rocket: "রকেট",
        bank: "ব্যাংক ট্রান্সফার",
        card: "ক্রেডিট/ডেবিট কার্ড"
      }
    }
  };

  const t = content[language];

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleCODChange = (e) => {
    setIsCOD(e.target.checked);
    setAdvancePaymentRequired(e.target.checked);
  };

  const handleTransactionIdChange = (e) => {
    setTransactionId(e.target.value);
  };

  const handleAdvanceAmountChange = (e) => {
    const amount = parseFloat(e.target.value) || 0;
    setCustomAdvanceAmount(amount);
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

 // Fixed handleConfirmOrder function in PaymentModal.jsx

const handleConfirmOrder = async () => {
  if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
    alert("Please provide a complete shipping address.");
    return;
  }

  if (!selectedItems || selectedItems.length === 0) {
    alert("Please select at least one item to proceed.");
    return;
  }

  const totalOrderAmount = calculateTotal();

  const orderData = {
    items: cartItems.filter((item) => selectedItems.includes(item._id)),
    shippingAddress,
    extraCharge: 0,
    fromCart: true,
  };

  // Handle COD vs Regular Payment
  if (isCOD) {
    // COD Order Logic
    
    // Validate advance amount
    if (customAdvanceAmount > totalOrderAmount) {
      alert("Advance amount cannot be greater than total order amount.");
      return;
    }
    if (customAdvanceAmount < 0) {
      alert("Advance amount cannot be negative.");
      return;
    }
    
    orderData.paidAmount = customAdvanceAmount;
    
    // For COD: paymentMethod should be the gateway used for advance payment
    if (customAdvanceAmount > 0 && paymentMethod) {
      // Advance payment made through payment gateway
      if (!transactionId.trim()) {
        alert("Please provide a transaction ID for advance payment.");
        return;
      }
      orderData.paymentMethod = paymentMethod; // bkash, nagad, rocket, etc.
      orderData.transactionId = transactionId;
    } else if (customAdvanceAmount > 0) {
      // Advance payment but no gateway selected
      alert("Please select a payment method for advance payment.");
      return;
    } else {
      // No advance payment - pure COD
      orderData.paymentMethod = 'cod'; // Only use 'cod' when no advance payment
    }
    
    // Mark as COD order regardless of advance payment
    orderData.isCOD = true; // Add flag to identify COD orders
    
  } else {
    // Regular Payment (Full payment)
    if (!transactionId.trim()) {
      alert("Please provide a transaction ID for manual payment.");
      return;
    }
    orderData.paymentMethod = paymentMethod; // bkash, nagad, rocket, etc.
    orderData.transactionId = transactionId;
  }

  try {
    const response = await placeOrder(orderData);
    setOrderResponse(response);
    setShowCustomAlert(true);
  } catch (error) {
    console.error("Error placing order:", error);
    alert("Error placing order. Please try again.");
  }
};

  const handleAlertConfirm = () => {
    navigate('/');
    setShowCustomAlert(false);
  };

  const calculateSubtotal = () => {
    if (!cartItems || !selectedItems) return 0;
    return cartItems
      .filter(item => selectedItems.includes(item._id))
      .reduce((total, item) => {
        const product = item.productId || item.product || item;
        const price = product?.finalPrice || product?.sellingPrice || item.price || 0;
        const quantity = item.quantity || 1;
        return total + (price * quantity);
      }, 0);
  };

  const calculateShipping = () => {
    if (!shippingAddress.city) return 0;
    return shippingAddress.city.toLowerCase() === 'dhaka' ? 60 : 120;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const calculateDueAmount = () => {
    if (!isCOD) return 0;
    return Math.max(0, calculateTotal() - customAdvanceAmount);
  };

  if (!cartItems || !selectedItems) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">No items selected</h2>
          <button
            onClick={() => navigate('/cart')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go back to Cart
          </button>
        </div>
      </div>
    );
  }

  const getMethodColor = (method) => {
    const methodKey = method.toLowerCase();
    switch(methodKey) {
      case 'bkash': return { bg: 'bg-pink-500', border: 'border-pink-500', bgLight: 'bg-pink-50' };
      case 'nagad': return { bg: 'bg-orange-500', border: 'border-orange-500', bgLight: 'bg-orange-50' };
      case 'rocket': return { bg: 'bg-purple-500', border: 'border-purple-500', bgLight: 'bg-purple-50' };
      case 'bank': return { bg: 'bg-blue-500', border: 'border-blue-500', bgLight: 'bg-blue-50' };
      case 'card': return { bg: 'bg-green-500', border: 'border-green-500', bgLight: 'bg-green-50' };
      default: return { bg: 'bg-gray-500', border: 'border-gray-500', bgLight: 'bg-gray-50' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="lg:text-3xl font-bold">{t.title}</h3>
            </div>
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5" />
              <div className="flex item-center gap-4 justify-center">
                <button
                  onClick={() => setLanguage(language === "english" ? "bangla" : "english")}
                  className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${
                    language === "english" ? "bg-blue-800" : "bg-green-600"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      language === "english" ? "translate-x-1" : "translate-x-4"
                    }`}
                  />
                </button>
                <div className="left-0 text-xs font-medium">
                  {language === "english" ? "EN" : "বাং"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h3 className="font-semibold text-xl mb-6 flex items-center text-gray-800">
                <Package className="w-6 h-6 mr-3 text-blue-600" />
                {t.orderSummary}
              </h3>

              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {cartItems
                  .filter(item => selectedItems.includes(item._id))
                  .map((item) => {
                    const product = item.productId || item.product || item;
                    const price = product?.finalPrice || product?.sellingPrice || item.price || 0;
                    const quantity = item.quantity || 1;

                    return (
                      <div key={item._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={product.thumbnail || product.image || '/placeholder-product.jpg'}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-product.jpg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {product.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {quantity} × ৳{price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          ৳{(price * quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>{t.subtotal} ({selectedItems.length} {t.items})</span>
                  <span>৳{calculateSubtotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>{t.shipping}</span>
                  <span className="text-blue-600">
                    {shippingAddress.city ? `৳${calculateShipping().toFixed(2)}` : '৳0.00'}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>{t.total}</span>
                    <span>৳{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* COD Payment Summary */}
                {isCOD && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                    <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {t.paymentSummary}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-yellow-700">
                        <span>{t.paidAmount} (Advance):</span>
                        <span className="font-medium">৳{customAdvanceAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-yellow-700">
                        <span>{t.dueAmount}:</span>
                        <span className="font-medium">৳{calculateDueAmount().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-600" />
                  <span>Secure SSL encrypted payment</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="space-y-8">
                <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
                  <h3 className="font-semibold text-lg text-blue-800 mb-3">{t.manualInstructions}</h3>
                  <p className="text-blue-700 mb-4">{t.manualDesc}</p>
                </div>

                {paymentMethods.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {paymentMethods.map((method) => {
                      const color = getMethodColor(method.getway);
                      const methodKey = method.getway.toLowerCase();
                      return (
                        <div
                          key={method._id || method.getway}
                          className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                            paymentMethod === method.getway
                              ? `${color.border} ${color.bgLight}`
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            id={method.getway}
                            name="payment-method"
                            value={method.getway}
                            checked={paymentMethod === method.getway}
                            onChange={handlePaymentMethodChange}
                            className="sr-only"
                          />
                          <label htmlFor={method.getway} className="cursor-pointer block text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-white text-xl ${color.bg}`}>
                              {method.getway.charAt(0).toUpperCase()}
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-2">
                              {t.paymentMethods[methodKey] || method.getway}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {method.getwaynumber}
                            </p>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                    <p className="text-yellow-700">No payment methods available. Please contact support.</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* COD Section */}
                  <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                    <label className="flex items-center cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={isCOD}
                        onChange={handleCODChange}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                      />
                      <span className="font-medium text-gray-700">{t.codLabel}</span>
                    </label>

                    {isCOD && (
                      <div className="ml-8 space-y-4">
                        <p className="text-sm text-yellow-700 mb-4">
                          <strong>{t.codNote.split(':')[0]}:</strong> {t.codNote.split(':')[1]}
                        </p>

                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {t.advancePayment}
                          </h4>
                          <p className="text-sm text-gray-600 mb-4">{t.advancePaymentDesc}</p>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{t.defaultAdvance}</span>
                              <button
                                onClick={() => setCustomAdvanceAmount(500)}
                                className={`px-3 py-1 rounded-md text-xs ${
                                  customAdvanceAmount === 500
                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                                }`}
                              >
                                Use Default
                              </button>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t.customAdvance}
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={calculateTotal()}
                                value={customAdvanceAmount}
                                onChange={handleAdvanceAmountChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter advance amount"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {t.dueOnDelivery}: ৳{calculateDueAmount().toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transaction ID for advance payment or regular payment */}
                  {((isCOD && customAdvanceAmount > 0 && paymentMethod) || (!isCOD && paymentMethod)) && (
                    <div>
                      <label htmlFor="transaction-id" className="block text-sm font-medium text-gray-700 mb-3">
                        {t.transactionId} *
                        {isCOD && customAdvanceAmount > 0 && (
                          <span className="text-xs text-gray-500 ml-2">(for advance payment)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        id="transaction-id"
                        value={transactionId}
                        onChange={handleTransactionIdChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder={t.transactionIdPlaceholder}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-10 bg-gray-50 p-6 rounded-xl">
                <h3 className="font-semibold text-xl mb-6 flex items-center text-gray-800">
                  <MapPin className="w-6 h-6 mr-3 text-blue-600" />
                  {t.shippingAddress}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="fullName"
                    placeholder={t.fullName + " *"}
                    value={shippingAddress.fullName}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder={t.phone + " *"}
                    value={shippingAddress.phone}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder={t.address + " *"}
                    value={shippingAddress.address}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:col-span-2"
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder={t.city + " *"}
                    value={shippingAddress.city}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder={t.zipCode}
                    value={shippingAddress.zipCode}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-6">
                <button
                  onClick={() => navigate('/cart')}
                  className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleConfirmOrder}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold shadow-lg text-lg"
                >
                  <CheckCircle className="w-6 h-6 inline mr-3" />
                  {t.confirmOrder}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCustomAlert && orderResponse && (
        <CustomAlert
          message={
            <div className="text-center">
              <div className="mb-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">{t.orderSuccess}</h3>
                <p className="text-gray-600">{t.orderPlacedMsg}</p>
              </div>
              
              {orderResponse.paymentSummary && (
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <h4 className="font-medium text-gray-800 mb-3">{t.paymentSummary}</h4>
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex justify-between">
                      <span>{t.total}:</span>
                      <span className="font-medium">৳{orderResponse.paymentSummary.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.paidAmount}:</span>
                      <span className="font-medium text-green-600">৳{orderResponse.paymentSummary.paidAmount?.toFixed(2)}</span>
                    </div>
                    {orderResponse.paymentSummary.dueAmount > 0 && (
                      <div className="flex justify-between">
                        <span>{t.dueAmount}:</span>
                        <span className="font-medium text-orange-600">৳{orderResponse.paymentSummary.dueAmount?.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          }
          onConfirm={handleAlertConfirm}
        />
      )}
    </div>
  );
};

export default PaymentPage;
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { CreditCard, CheckCircle, Shield, Truck, Globe, ArrowLeft, Package, MapPin } from "lucide-react";
import { placeOrder } from "../../api/api"; // Assuming you have an API function to place the order
import CustomAlert from "../Confirmationpopup/Alert"; // Import your custom alert

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, totalAmount, selectedItems } = location.state || {};

  const [selectedTab, setSelectedTab] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [transactionId, setTransactionId] = useState("");
  const [isCOD, setIsCOD] = useState(false);
  const [advancePaymentRequired, setAdvancePaymentRequired] = useState(false);
  const [language, setLanguage] = useState("english"); // Language state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  });
  const [showCustomAlert, setShowCustomAlert] = useState(false);

  // Redirect if no cart data
  useEffect(() => {
    if (!cartItems || !selectedItems || selectedItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, selectedItems, navigate]);

  // Language content
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
      cardPayment: "Card Payment",
      manualInstructions: "Manual Payment Instructions",
      manualDesc: "Send money to our mobile banking accounts and provide the transaction ID.",
      transactionId: "Transaction ID",
      transactionIdPlaceholder: "Enter transaction ID",
      codLabel: "Cash On Delivery (COD)",
      codNote: "Note: Advance payment required for COD orders.",
      cardInstructions: "Card Payment Instructions",
      cardDesc: "Use your debit/credit card for secure online payment.",
      payNowCard: "Pay Now with Card",
      shippingAddress: "Shipping Address",
      fullName: "Full Name",
      phone: "Phone",
      address: "Address",
      city: "City",
      zipCode: "Zip Code",
      cancel: "Cancel",
      confirmOrder: "Confirm Order",
      paymentMethods: {
        bkash: "Bkash",
        nagad: "Nagad",
        rocket: "Rocket"
      },
      instructions: {
        manual: "Send money to our mobile banking accounts and provide the transaction ID.",
        card: "Use your debit/credit card for secure online payment."
      },
      accountNumbers: {
        bkash: "Bkash: 01712-345678",
        nagad: "Nagad: 01812-345678", 
        rocket: "Rocket: 01912-345678"
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
      cardPayment: "কার্ড পেমেন্ট",
      manualInstructions: "ম্যানুয়াল পেমেন্ট নির্দেশাবলী",
      manualDesc: "আমাদের মোবাইল ব্যাংকিং অ্যাকাউন্টে টাকা পাঠান এবং লেনদেনের আইডি প্রদান করুন।",
      transactionId: "লেনদেনের আইডি",
      transactionIdPlaceholder: "লেনদেনের আইডি লিখুন",
      codLabel: "ক্যাশ অন ডেলিভারি (COD)",
      codNote: "দ্রষ্টব্য: COD অর্ডারের জন্য অগ্রিম পেমেন্ট প্রয়োজন।",
      cardInstructions: "কার্ড পেমেন্ট নির্দেশাবলী",
      cardDesc: "নিরাপদ অনলাইন পেমেন্টের জন্য আপনার ডেবিট/ক্রেডিট কার্ড ব্যবহার করুন।",
      payNowCard: "কার্ড দিয়ে পেমেন্ট করুন",
      shippingAddress: "ডেলিভারি ঠিকানা",
      fullName: "সম্পূর্ণ নাম",
      phone: "ফোন",
      address: "ঠিকানা",
      city: "শহর",
      zipCode: "পোস্ট কোড",
      cancel: "বাতিল",
      confirmOrder: "অর্ডার নিশ্চিত করুন",
      paymentMethods: {
        bkash: "বিকাশ",
        nagad: "নগদ",
        rocket: "রকেট"
      },
      instructions: {
        manual: "আমাদের মোবাইল ব্যাংকিং অ্যাকাউন্টে টাকা পাঠান এবং লেনদেনের আইডি প্রদান করুন।",
        card: "নিরাপদ অনলাইন পেমেন্টের জন্য আপনার ডেবিট/ক্রেডিট কার্ড ব্যবহার করুন।"
      },
      accountNumbers: {
        bkash: "বিকাশ: ০১৭১২-৩৪৫৬৭৮",
        nagad: "নগদ: ০১৮১২-৩৪৫৬৭৮",
        rocket: "রকেট: ০১৯১২-৩৪৫৬৭৮"
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

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

const handleConfirmOrder = async () => {
  if (
    !shippingAddress.fullName ||
    !shippingAddress.phone ||
    !shippingAddress.address ||
    !shippingAddress.city
  ) {
    alert("Please provide a complete shipping address.");
    return;
  }

  // Ensure selectedItems is defined and not empty
  if (!selectedItems || selectedItems.length === 0) {
    alert("Please select at least one item to proceed.");
    return;
  }

  console.log("Selected items:", selectedItems); // For debugging

  const orderData = {
    items: cartItems.filter((item) => selectedItems.includes(item._id)), // Only the selected items
    shippingAddress,
    paymentMethod: selectedTab === 0 ? (isCOD ? 'cod' : paymentMethod) : 'card', // Set payment method properly
    extraCharge: 0,
    fromCart: true,
  };

  // Add transactionId directly to orderData (not nested in paymentDetails)
  if (selectedTab === 0 && !isCOD) { // Manual payment and not COD
    if (!transactionId.trim()) {
      alert("Please provide a transaction ID for manual payment.");
      return;
    }
    orderData.transactionId = transactionId; // Add transactionId directly
  }

  // For COD, no transaction ID is needed
  if (isCOD) {
    orderData.paymentMethod = 'cod';
  }

  console.log("Order data being sent:", orderData); // Debug log

  try {
    // Sending the order data to backend via the placeOrder API
    const response = await placeOrder(orderData);
    console.log("Order placed:", response);

    // Show custom alert instead of the default confirm
    setShowCustomAlert(true); // Trigger the custom alert

  } catch (error) {
    console.error("Error placing order:", error);
    alert("Error placing order. Please try again.");
  }
};

  const handleAlertConfirm = () => {
    navigate('/'); // Navigate to home page
    setShowCustomAlert(false); // Close the custom alert
  };

  const handleAlertCancel = () => {
    setShowCustomAlert(false); // Close the custom alert
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
          
              <h3 className=" lg:text-3xl font-bold">{t.title}</h3>
            </div>
            
            {/* Language Toggle */}
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5" />
              <div className="flex item-center gap-4 justify-center">
                <button
                  onClick={() => setLanguage(language === "english" ? "bangla" : "english")}
                  className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none   ${
                    language === "english" ? "bg-blue-800" : "bg-green-600"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      language === "english" ? "translate-x-1" : "translate-x-4"
                    }`}
                  />
                </button>
                <div className="  left-0 text-xs font-medium">
                  {language === "english" ? "EN" : "বাং"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary - Left Side */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h3 className="font-semibold text-xl mb-6 flex items-center text-gray-800">
                <Package className="w-6 h-6 mr-3 text-blue-600" />
                {t.orderSummary}
              </h3>

              {/* Order Items */}
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

              {/* Order Total */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>{t.subtotal} ({selectedItems.length} {t.items})</span>
                  <span>৳{calculateSubtotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>{t.shipping}</span>
                  <span className="text-green-600">{t.free}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>{t.total}</span>
                    <span>৳{totalAmount?.toFixed(2) || calculateSubtotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-600" />
                  <span>Secure SSL encrypted payment</span>
                </div>
                <div className="flex items-center">
                  <Truck className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Free shipping on all orders</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form - Right Side */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Tabs selectedIndex={selectedTab} onSelect={(index) => setSelectedTab(index)}>
                <TabList className="flex bg-gray-100 rounded-xl p-1 mb-8">
                  <Tab className={`flex-1 py-4 px-6 text-center rounded-lg font-medium transition-all cursor-pointer ${
                    selectedTab === 0 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}>
                    <Shield className="w-5 h-5 inline mr-2" />
                    {t.manualPayment}
                  </Tab>
                  <Tab className={`flex-1 py-4 px-6 text-center rounded-lg font-medium transition-all cursor-pointer ${
                    selectedTab === 1 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}>
                    <CreditCard className="w-5 h-5 inline mr-2" />
                    {t.cardPayment}
                  </Tab>
                </TabList>

                {/* Manual Payment Tab */}
                <TabPanel>
                  <div className="space-y-8">
                    <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
                      <h3 className="font-semibold text-lg text-blue-800 mb-3">{t.manualInstructions}</h3>
                      <p className="text-blue-700 mb-4">{t.instructions.manual}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {['bkash', 'nagad', 'rocket'].map((method) => (
                        <div 
                          key={method}
                          className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                            paymentMethod === method 
                              ? method === 'bkash' 
                                ? 'border-pink-500 bg-pink-50' 
                                : method === 'nagad' 
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            id={method}
                            name="payment-method"
                            value={method}
                            checked={paymentMethod === method}
                            onChange={handlePaymentMethodChange}
                            className="sr-only"
                          />
                          <label htmlFor={method} className="cursor-pointer block text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-white text-xl ${
                              method === 'bkash' ? 'bg-pink-500' :
                              method === 'nagad' ? 'bg-orange-500' : 'bg-purple-500'
                            }`}>
                              {method === 'bkash' ? 'bK' : method === 'nagad' ? 'N' : 'R'}
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-2">{t.paymentMethods[method]}</h4>
                            <p className="text-xs text-gray-600">{t.accountNumbers[method]}</p>
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="transaction-id" className="block text-sm font-medium text-gray-700 mb-3">
                          {t.transactionId} *
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

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isCOD}
                            onChange={handleCODChange}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                          />
                          <span className="font-medium text-gray-700">{t.codLabel}</span>
                        </label>
                        {isCOD && (
                          <p className="text-sm text-yellow-700 mt-2 ml-8">
                            <strong>{t.codNote.split(':')[0]}:</strong> {t.codNote.split(':')[1]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabPanel>

                {/* Card Payment Tab */}
                <TabPanel>
                  <div className="space-y-8">
                    <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
                      <h3 className="font-semibold text-lg text-green-800 mb-3">{t.cardInstructions}</h3>
                      <p className="text-green-700">{t.instructions.card}</p>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={() => console.log("Redirecting to card payment gateway")}
                        className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 font-semibold shadow-lg text-lg"
                      >
                        <CreditCard className="w-6 h-6 inline mr-3" />
                        {t.payNowCard}
                      </button>
                    </div>
                  </div>
                </TabPanel>
              </Tabs>

              {/* Shipping Address */}
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

              {/* Footer Buttons */}
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

      {showCustomAlert && (
        <CustomAlert
          message="Your order has been placed successfully!"
          onConfirm={handleAlertConfirm}
        />
      )}
    </div>
  );
};

export default PaymentPage;
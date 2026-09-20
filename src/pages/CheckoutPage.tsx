import { useState } from 'react';
import {
  Store,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  MapPin,
  CreditCard,
  QrCode,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

export function CheckoutPage({ navigate }: CheckoutPageProps) {
  const { items, subtotal, deliveryFee, total, currency, clearCart } = useCart();
  const { user, addresses, defaultAddress } = useAuth();
  const { settings } = useSettings();

  const [orderType, setOrderType] = useState<'Pickup' | 'Delivery'>('Pickup');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Delivery Address Form
  const [houseShopNo, setHouseShopNo] = useState(defaultAddress?.houseShopNo || '');
  const [street, setStreet] = useState(defaultAddress?.street || '');
  const [city, setCity] = useState(defaultAddress?.city || 'Pune');
  const [state, setState] = useState(defaultAddress?.state || 'Maharashtra');
  const [pinCode, setPinCode] = useState(defaultAddress?.pinCode || '411001');

  const [paymentMethod, setPaymentMethod] = useState<'Cash on Pickup' | 'Pay on Delivery' | 'UPI / Online'>('Cash on Pickup');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-xs text-slate-500">Please add components to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/products')}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-colors"
        >
          Browse Components
        </button>
      </div>
    );
  }

  const effectiveDeliveryFee = orderType === 'Pickup' ? 0 : deliveryFee;
  const grandTotal = subtotal + effectiveDeliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName || !customerPhone || !customerEmail) {
      setErrorMsg('Please provide your name, phone number, and email.');
      return;
    }

    if (orderType === 'Delivery') {
      if (!houseShopNo || !street || !city || !pinCode) {
        setErrorMsg('Please fill in complete street address and PIN code.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload: any = {
        items,
        orderType,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        paymentMethod,
      };

      if (orderType === 'Delivery') {
        payload.deliveryAddress = {
          houseShopNo: houseShopNo.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          pinCode: pinCode.trim(),
        };
      }

      const res = await api.checkoutOrder(payload);
      await clearCart();
      navigate(`/orders/${res.order.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Checkout & Order Confirmation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Select between local store counter pickup or direct courier delivery
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Order Type Selection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Select Fulfillment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pickup Option */}
              <div
                onClick={() => {
                  setOrderType('Pickup');
                  setPaymentMethod('Cash on Pickup');
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  orderType === 'Pickup'
                    ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Store className="w-5 h-5 text-cyan-600" />
                    <span className="font-black text-sm text-slate-900">Store Pickup</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    FREE (₹0)
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your order will be prepared and can be collected from Kishan Electronics store pickup counter.
                </p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Ready within 30-45 minutes</span>
                </div>
              </div>

              {/* Delivery Option */}
              <div
                onClick={() => {
                  setOrderType('Delivery');
                  setPaymentMethod('Pay on Delivery');
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  orderType === 'Delivery'
                    ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-cyan-600" />
                    <span className="font-black text-sm text-slate-900">Doorstep Delivery</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600">
                    {deliveryFee === 0 ? 'FREE' : `${currency}${deliveryFee}`}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dispatched via local express courier directly to your home, hostel, or lab address.
                </p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Dispatched same day</span>
                </div>
              </div>
            </div>

            {/* Store pickup details notification */}
            {orderType === 'Pickup' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Pickup Location:</span>
                </div>
                <p className="text-emerald-800 pl-5">
                  {settings.shopName}, {settings.address}
                </p>
                <p className="text-[11px] text-emerald-700 pl-5">
                  Open: {settings.openingHours}
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Customer Contact Information */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Customer Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Email Address (for order receipts & tracking) *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Address Form (If Delivery selected) */}
          {orderType === 'Delivery' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Delivery Address</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Flat / Room / Shop No. *</label>
                  <input
                    type="text"
                    required
                    value={houseShopNo}
                    onChange={(e) => setHouseShopNo(e.target.value)}
                    placeholder="e.g. Room 402, Hostel B"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Street / Area / Landmark *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Near COEP Engineering College"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="411001"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payment Option */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px]">
                {orderType === 'Pickup' ? '3' : '4'}
              </span>
              <span>Payment Method</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {orderType === 'Pickup' && (
                <label className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="Cash on Pickup"
                    checked={paymentMethod === 'Cash on Pickup'}
                    onChange={() => setPaymentMethod('Cash on Pickup')}
                    className="text-cyan-600 accent-cyan-600 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-slate-900">Cash / Card on Store Pickup</span>
                    <p className="text-slate-500 text-[11px]">Pay at Kishan Electronics counter when collecting components.</p>
                  </div>
                </label>
              )}

              {orderType === 'Delivery' && (
                <label className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="Pay on Delivery"
                    checked={paymentMethod === 'Pay on Delivery'}
                    onChange={() => setPaymentMethod('Pay on Delivery')}
                    className="text-cyan-600 accent-cyan-600 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-slate-900">Cash on Delivery (COD)</span>
                    <p className="text-slate-500 text-[11px]">Pay cash or scan courier QR upon home delivery.</p>
                  </div>
                </label>
              )}

              <label className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="UPI / Online"
                  checked={paymentMethod === 'UPI / Online'}
                  onChange={() => setPaymentMethod('UPI / Online')}
                  className="text-cyan-600 accent-cyan-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-900">UPI / GPay / PhonePe / QR</span>
                  <p className="text-slate-500 text-[11px]">Direct shop UPI settlement on confirmation.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5 sticky top-24">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Order Summary ({items.length} Items)
            </h3>

            {/* Items List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1 text-xs">
              {items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 object-contain rounded-lg bg-slate-50 border border-slate-100 p-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Qty: {item.quantity} × {currency}{item.price}
                      </div>
                    </div>
                  </div>
                  <div className="font-extrabold text-slate-900 whitespace-nowrap">
                    {currency}{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Components Subtotal</span>
                <span className="font-semibold text-slate-900">{currency}{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fulfillment Fee ({orderType})</span>
                <span className="font-semibold text-slate-900">
                  {effectiveDeliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `${currency}${effectiveDeliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>Grand Total</span>
                <span>{currency}{grandTotal}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="checkout-confirm-place-order-btn"
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-700 active:scale-98 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-600/25"
            >
              <span>{submitting ? 'Reserving Components...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              By confirming, components will be instantly deducted from store stock. You will receive an official Order ID (KE-2026-XXXXXX) for collection tracking.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

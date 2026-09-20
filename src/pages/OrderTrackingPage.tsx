import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Store,
  Truck,
  MapPin,
  Phone,
  ArrowLeft,
  AlertCircle,
  XCircle,
  RotateCcw,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { useSettings } from '../context/SettingsContext';

interface OrderTrackingPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

const ORDER_STEPS: OrderStatus[] = [
  'Order Placed',
  'Confirmed',
  'Preparing',
  'Ready for Pickup / Shipped',
  'Delivered / Collected',
];

export function OrderTrackingPage({ orderId, navigate }: OrderTrackingPageProps) {
  const { settings } = useSettings();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await api.getOrder(orderId);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Retrieving order status & tracking...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Order not found</h2>
        <p className="text-xs text-slate-500">The requested order ID may be invalid or belongs to another account.</p>
        <button
          onClick={() => navigate('/products')}
          className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Catalogue
        </button>
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'Cancelled';
  const currentStepIndex = isCancelled ? -1 : ORDER_STEPS.indexOf(order.orderStatus);
  const canCancel = order.orderStatus === 'Order Placed' || order.orderStatus === 'Confirmed';

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await api.cancelOrder(order.id, cancelReason || 'Customer requested cancellation');
      setOrder(res.order);
      setShowCancelModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => navigate('/products')}
            className="text-xs text-cyan-600 hover:text-cyan-800 font-bold flex items-center space-x-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Order #{order.id}
            </h1>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                isCancelled
                  ? 'bg-rose-100 text-rose-800'
                  : order.orderStatus === 'Delivered / Collected'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-cyan-100 text-cyan-800'
              }`}
            >
              {order.orderStatus}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>

          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Visual Timeline Stepper */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
          Step-by-Step Order Progress
        </h3>

        {isCancelled ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold">This order has been cancelled</div>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Reason: {order.cancellationReason || 'Cancelled upon customer request'}. In-store inventory has been restored.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Desktop progress bar */}
            <div className="hidden sm:grid grid-cols-5 gap-2 relative">
              {/* Connecting line */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0">
                <div
                  className="h-full bg-cyan-600 transition-all duration-500"
                  style={{
                    width: `${Math.max(0, (currentStepIndex / (ORDER_STEPS.length - 1)) * 100)}%`,
                  }}
                ></div>
              </div>

              {ORDER_STEPS.map((step, idx) => {
                const isDone = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step} className="text-center relative z-10 space-y-2">
                    <div
                      className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-cyan-600 text-white ring-4 ring-cyan-100 shadow-sm'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div
                      className={`text-[11px] leading-snug font-bold ${
                        isCurrent
                          ? 'text-cyan-800 font-extrabold'
                          : isDone
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step === 'Ready for Pickup / Shipped'
                        ? order.orderType === 'Pickup'
                          ? 'Ready for Pickup'
                          : 'Shipped'
                        : step === 'Delivered / Collected'
                        ? order.orderType === 'Pickup'
                          ? 'Collected'
                          : 'Delivered'
                        : step}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile simplified timeline */}
            <div className="sm:hidden space-y-3">
              {ORDER_STEPS.map((step, idx) => {
                const isDone = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step} className="flex items-center space-x-3 text-xs">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        isDone ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`font-semibold ${
                        isCurrent ? 'text-cyan-800 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Fulfillment Notice */}
        {order.orderType === 'Pickup' ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 text-xs space-y-1.5">
            <div className="font-extrabold flex items-center space-x-2 text-emerald-900">
              <Store className="w-4 h-4 text-emerald-700" />
              <span>In-Store Pickup Counter Reservation</span>
            </div>
            <p className="text-emerald-900">
              Your components will be prepared and can be collected directly from Kishan Electronics counter.
            </p>
            <div className="text-[11px] text-emerald-800 font-medium pl-6">
              <div>📍 {order.pickupLocation || `${settings.shopName}, ${settings.address}`}</div>
              <div>⏰ Counter Hours: {settings.openingHours}</div>
              <div>📞 Enquiries: {settings.phone}</div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl text-cyan-950 text-xs space-y-1.5">
            <div className="font-extrabold flex items-center space-x-2 text-cyan-900">
              <Truck className="w-4 h-4 text-cyan-700" />
              <span>Doorstep Dispatch</span>
            </div>
            <p className="text-cyan-900">
              Deliver to:{' '}
              <span className="font-bold">
                {order.deliveryAddress?.houseShopNo}, {order.deliveryAddress?.street},{' '}
                {order.deliveryAddress?.city}, {order.deliveryAddress?.pinCode}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Ordered Components List & Financials */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
          Components in this Order ({order.items.length} Items)
        </h3>

        <div className="divide-y divide-slate-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-3 min-w-0">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=150&q=80'}
                  alt={item.productName}
                  className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{item.productName}</div>
                  <div className="text-[11px] font-mono text-cyan-800">SKU: {item.sku}</div>
                  <div className="text-[10px] text-slate-400">
                    {item.quantity} × {settings.currency}{item.price}
                  </div>
                </div>
              </div>
              <div className="font-extrabold text-sm text-slate-900 whitespace-nowrap">
                {settings.currency}{item.total}
              </div>
            </div>
          ))}
        </div>

        {/* Calculation Totals */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900">{settings.currency}{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Fulfillment ({order.orderType})</span>
            <span className="font-bold text-slate-900">
              {order.deliveryFee === 0 ? 'FREE' : `${settings.currency}${order.deliveryFee}`}
            </span>
          </div>
          <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
            <span>Total Amount</span>
            <span>{settings.currency}{order.total}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 pt-1">
            <span>Payment Method:</span>
            <span className="font-bold text-slate-800">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Payment Status:</span>
            <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Cancel Order #{order.id}?</h3>
            <p className="text-xs text-slate-600">
              Please share a reason for cancellation. In-store component reservations will be returned to stock immediately.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Changed project component requirements..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-2.5 rounded-xl text-xs"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Keep Order
              </button>
              <button
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

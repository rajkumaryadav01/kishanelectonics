import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  navigate: (path: string) => void;
}

export function CartDrawer({ navigate }: CartDrawerProps) {
  const {
    items,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    total,
    currency,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (!isCartOpen) return null;

  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const deliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-cyan-600" />
              <h2 className="font-extrabold text-base text-slate-900">Your Cart</h2>
              <span className="text-xs bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          <div className="px-5 py-3 bg-cyan-50/70 border-b border-cyan-100">
            <div className="text-xs font-semibold text-cyan-900 flex justify-between items-center mb-1.5">
              <span>
                {amountNeededForFreeDelivery > 0
                  ? `Add ${currency}${amountNeededForFreeDelivery} more for Free Delivery`
                  : 'You have unlocked Free Home Delivery!'}
              </span>
              <span className="text-[11px] text-cyan-700">{deliveryProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-cyan-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-600 transition-all duration-300 rounded-full"
                style={{ width: `${deliveryProgress}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-cyan-700 mt-1 flex items-center space-x-1">
              <Store className="w-3 h-3" />
              <span>In-store pickup at Kishan Electronics is always FREE!</span>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="font-bold text-slate-800 text-sm">Your cart is empty</div>
                <p className="text-xs text-slate-500 max-w-xs">
                  Explore our range of ICs, sensors, Arduino boards, and project kits to start building.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/products');
                  }}
                  className="mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Browse Components
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-3 flex gap-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=200&q=80'}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-contain bg-slate-50 border border-slate-200 p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[10px] font-mono text-cyan-800">{item.sku}</div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center rounded hover:bg-white text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 px-1">{item.quantity}</span>
                        <button
                          onClick={() => {
                            if (item.quantity >= item.stockQuantity) {
                              alert(`Maximum available in-store stock is ${item.stockQuantity} units.`);
                              return;
                            }
                            updateQuantity(item.id, item.quantity + 1);
                          }}
                          className="w-5 h-5 flex items-center justify-center rounded hover:bg-white text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-xs font-extrabold text-slate-900">
                        {currency}{item.price * item.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{currency}{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-slate-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `${currency}${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Estimated Total</span>
                  <span>{currency}{total}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  id="cart-checkout-btn"
                  onClick={handleCheckout}
                  className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-600/20 active:scale-98"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex justify-between items-center text-[11px] pt-1">
                  <button
                    onClick={clearCart}
                    className="text-slate-500 hover:text-rose-600 underline"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={closeCart}
                    className="text-cyan-700 hover:text-cyan-900 font-semibold"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

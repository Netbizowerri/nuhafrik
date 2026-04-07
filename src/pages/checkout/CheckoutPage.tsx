import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, ChevronLeft, CreditCard, MapPin, ShoppingBag, Truck, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { auth, db } from '../../lib/firebase';
import { useCartStore } from '../../store/useCartStore';
import { Button } from '../../components/ui/Button';
import { cn, formatCurrency } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { BRAND_NAME } from '../../lib/seo';

const checkoutSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  deliveryMethod: z.enum(['pickup', 'abuja_local', 'lagos', 'other_states']),
  address: z.string().min(10, 'Full address is required').optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const title = `Secure Checkout | ${BRAND_NAME}`;
  const description = 'Complete your Nuhafrik order with secure checkout, delivery options, and payment methods.';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    shouldUnregister: false,
    defaultValues: {
      deliveryMethod: 'abuja_local',
      email: '',
    },
  });

  const deliveryMethod = watch('deliveryMethod');
  const subtotal = getSubtotal();

  const deliveryFees = {
    pickup: 0,
    abuja_local: 1500,
    lagos: 2500,
    other_states: 3500,
  };

  const deliveryFee = deliveryFees[deliveryMethod as keyof typeof deliveryFees];
  const total = subtotal + deliveryFee;

  const onSubmit = async (data: CheckoutFormData) => {
    if (step === 1) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    const path = 'orders';
    try {
      const orderData = {
        order_number: `NUH-${Date.now().toString().slice(-8)}`,
        customer: {
          uid: auth.currentUser?.uid || 'anonymous',
          name: data.fullName,
          phone: data.phone,
          email: data.email || null,
        },
        items,
        pricing: {
          subtotal,
          delivery_fee: deliveryFee,
          discount: 0,
          total,
          currency: 'NGN',
        },
        delivery: {
          method: data.deliveryMethod,
          address: data.address || null,
          estimated_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
        payment_method: paymentMethod,
        status: 'confirmed',
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, path), orderData);
      clearCart();
      navigate(`/checkout/success/${docRef.id}`);
    } catch (error: any) {
      if (error.message?.includes('insufficient permissions')) {
        const errInfo = {
          error: error.message,
          operationType: 'create',
          path,
          authInfo: {
            userId: auth.currentUser?.uid || 'anonymous',
            email: auth.currentUser?.email || 'none',
            emailVerified: auth.currentUser?.emailVerified || false,
            isAnonymous: auth.currentUser?.isAnonymous || true,
          },
        };
        console.error('Firestore Error: ', JSON.stringify(errInfo));
        throw new Error(JSON.stringify(errInfo));
      }
      console.error('Error creating order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-shell empty-state">
        <Seo title={title} description={description} path="/checkout" noindex />
        <span className="icon-pill h-20 w-20">
          <ShoppingBag size={34} />
        </span>
        <h1 className="section-title">Your cart is empty.</h1>
        <p className="section-copy text-center">Add a few pieces before heading into checkout.</p>
        <Button onClick={() => navigate('/shop')} size="lg">
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="page-shell page-stack">
      <Seo title={title} description={description} path="/checkout" noindex />
      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => (step === 1 ? navigate(-1) : setStep(1))} className="btn-base btn-outline btn-sm">
              <ChevronLeft size={16} />
              Back
            </button>
            <div>
              <p className="eyebrow">Secure Checkout</p>
              <h1 className="page-title text-[clamp(var(--text-4xl),4vw,var(--text-5xl))]">{step === 1 ? 'Delivery details' : 'Payment details'}</h1>
            </div>
          </div>
          <button onClick={() => navigate('/shop')} className="btn-base btn-ghost btn-sm">
            Keep Shopping
          </button>
        </div>

        <div className="overflow-hidden rounded-full bg-[var(--color-primary-100)]">
          <div className={cn('h-2 rounded-full bg-[var(--color-primary)] transition-all duration-500', step === 1 ? 'w-1/2' : 'w-full')} />
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_25rem]">
        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className={cn('space-y-8', step !== 1 && 'hidden')}>
            <div className="surface-card p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="icon-pill">
                  <User size={18} />
                </span>
                <div>
                  <p className="eyebrow">Step 1</p>
                  <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Contact information</h2>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="field-group">
                  <input {...register('fullName')} placeholder=" " className="field" />
                  <label className="field-label">Full Name</label>
                  {errors.fullName ? <span className="field-error">{errors.fullName.message}</span> : null}
                </div>

                <div className="field-group">
                  <input {...register('phone')} placeholder=" " className="field" />
                  <label className="field-label">Phone Number</label>
                  {errors.phone ? <span className="field-error">{errors.phone.message}</span> : null}
                </div>

                <div className="field-group md:col-span-2">
                  <input {...register('email')} placeholder=" " className="field" />
                  <label className="field-label">Email Address (optional)</label>
                </div>
              </div>
            </div>

            <div className="surface-card p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="icon-pill">
                  <Truck size={18} />
                </span>
                <div>
                  <p className="eyebrow">Delivery</p>
                  <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Choose your delivery method</h2>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'pickup', label: 'Store pickup', sub: 'Collect from Kubwa, Abuja', icon: MapPin },
                  { id: 'abuja_local', label: 'Abuja delivery', sub: 'Same day or next day delivery', icon: Truck },
                  { id: 'lagos', label: 'Lagos delivery', sub: '2 to 4 business days', icon: Truck },
                  { id: 'other_states', label: 'Other states', sub: '3 to 6 business days', icon: Truck },
                ].map((method) => {
                  const Icon = method.icon;
                  const isActive = deliveryMethod === method.id;

                  return (
                    <label key={method.id} className={cn('choice-card', isActive && 'choice-card-active')}>
                      <input type="radio" {...register('deliveryMethod')} value={method.id} className="hidden" />
                      <span className="choice-card-icon">
                        <Icon size={18} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-base font-semibold text-[var(--color-text-primary)]">{method.label}</span>
                        <span className="mt-1 block text-sm text-[var(--color-text-secondary)]">{method.sub}</span>
                      </span>
                      <span className="text-sm font-semibold text-[var(--color-primary)]">
                        {deliveryFees[method.id as keyof typeof deliveryFees] === 0
                          ? 'Free'
                          : formatCurrency(deliveryFees[method.id as keyof typeof deliveryFees])}
                      </span>
                    </label>
                  );
                })}
              </div>

              {deliveryMethod !== 'pickup' ? (
                <div className="mt-5 field-group">
                  <textarea {...register('address')} rows={4} placeholder=" " className="field min-h-32 resize-none pt-6" />
                  <label className="field-label">Delivery Address</label>
                  {errors.address ? <span className="field-error">{errors.address.message}</span> : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className={cn('space-y-8', step !== 2 && 'hidden')}>
            <div className="surface-card p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="icon-pill">
                  <CreditCard size={18} />
                </span>
                <div>
                  <p className="eyebrow">Step 2</p>
                  <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Select payment method</h2>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'paystack', label: 'Paystack', icon: CreditCard, sub: 'Pay with card, bank, or USSD' },
                  { id: 'transfer', label: 'Cash transfer', icon: Building2, sub: 'Transfer to our bank account' },
                  { id: 'pod', label: 'Pay on delivery', icon: Truck, sub: 'Available for eligible orders' },
                ].map((method) => {
                  const Icon = method.icon;
                  const isActive = paymentMethod === method.id;
                  return (
                    <label key={method.id} className={cn('choice-card', isActive && 'choice-card-active')}>
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={isActive}
                        onChange={() => setPaymentMethod(method.id)}
                        className="hidden"
                      />
                      <span className="choice-card-icon">
                        <Icon size={18} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-base font-semibold text-[var(--color-text-primary)]">{method.label}</span>
                        <span className="mt-1 block text-sm text-[var(--color-text-secondary)]">{method.sub}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </form>

        <aside className="surface-card-dark summary-card">
          <div>
            <p className="eyebrow">Order Summary</p>
            <h2 className="mt-3 text-2xl font-bold">Review your items</h2>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.product_id}-${item.size}-${item.color}`} className="flex gap-4">
                <div className="overflow-hidden rounded-[var(--radius-lg)] bg-white/5">
                  <img
                    src={item.image_url}
                    alt={`${item.name} in your Nuhafrik checkout summary`}
                    className="h-20 w-16 object-cover"
                    referrerPolicy="no-referrer"
                    width="160"
                    height="200"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[rgba(255,250,242,0.55)]">
                    {item.size} / {item.color} / Qty {item.quantity}
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--color-primary)]">{formatCurrency(item.unit_price)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-sm text-[rgba(255,250,242,0.72)]">
              <span>Subtotal</span>
              <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-[rgba(255,250,242,0.72)]">
              <span>Delivery</span>
              <span className="font-semibold text-white">{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</span>
            </div>
            <div className="brand-divider bg-white/10" />
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-3xl font-black tracking-tight text-[var(--color-primary)]">{formatCurrency(total)}</span>
            </div>
          </div>

          <Button form="checkout-form" type="submit" isLoading={isSubmitting} size="lg" className="w-full">
            {step === 1 ? 'Continue to Payment' : 'Place Order'}
          </Button>

          <p className="text-xs uppercase tracking-[0.08em] text-[rgba(255,250,242,0.45)]">
            By placing your order, you agree to our terms and conditions.
          </p>
        </aside>
      </section>
    </div>
  );
};

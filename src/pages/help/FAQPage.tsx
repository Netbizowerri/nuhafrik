import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, CreditCard, HelpCircle, ShoppingBag, Truck } from 'lucide-react';
import { Seo } from '../../components/seo/Seo';
import { BRAND_NAME, absoluteUrl } from '../../lib/seo';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-[var(--color-border)] last:border-b-0">
    <button onClick={onClick} className="flex w-full items-center justify-between gap-4 py-5 text-left">
      <span className="text-lg font-semibold text-[var(--color-text-primary)]">{question}</span>
      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-[var(--color-primary)]">
        <ChevronDown size={20} />
      </motion.span>
    </button>
    <AnimatePresence>
      {isOpen ? (
        <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-5 text-sm leading-7 text-[var(--color-text-secondary)]">
          {answer}
        </motion.p>
      ) : null}
    </AnimatePresence>
  </div>
);

export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqCategories = [
    {
      title: 'Ordering & Account',
      icon: ShoppingBag,
      items: [
        {
          question: 'How do I place an order?',
          answer:
            "You can place an order directly through our website by adding items to your cart and proceeding to checkout. Alternatively, you can click the 'Order on WhatsApp' button on any product page to chat with us directly and place your order manually.",
        },
        {
          question: 'Do I need an account to shop?',
          answer:
            'No, you can check out as a guest. However, creating an account allows you to track your orders more easily, save your delivery information, and receive updates on new arrivals and exclusive offers.',
        },
      ],
    },
    {
      title: 'Payment',
      icon: CreditCard,
      items: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept secure online payments via Paystack, direct bank transfers, and cash on delivery for eligible orders.',
        },
        {
          question: 'Is it safe to use my card on your website?',
          answer: 'Yes. We use Paystack to process card payments, so sensitive financial information is not stored on our servers.',
        },
      ],
    },
    {
      title: 'Delivery & Tracking',
      icon: Truck,
      items: [
        {
          question: 'How long does delivery take?',
          answer: 'Abuja orders usually arrive within 24 to 48 hours. Nationwide shipping typically takes 3 to 5 business days.',
        },
        {
          question: 'How can I track my order?',
          answer: "After placing your order, visit the Orders section in your account or use your order ID to follow the current delivery status.",
        },
      ],
    },
  ];
  const title = `Fashion Store FAQs | ${BRAND_NAME}`;
  const description =
    'Get answers about ordering, payment, delivery, and account support at Nuhafrik before you shop or place your next order.';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqCategories.flatMap((category) =>
      category.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      }))
    ),
    url: absoluteUrl('/faq'),
  };

  return (
    <div className="page-shell page-stack">
      <Seo title={title} description={description} path="/faq" structuredData={structuredData} />
      <section className="hero-panel px-6 py-10 text-center md:px-10 md:py-14">
        <span className="icon-pill mx-auto h-20 w-20">
          <HelpCircle size={34} />
        </span>
        <p className="eyebrow mt-6">Frequently Asked Questions</p>
        <h1 className="page-title mt-4">Everything you need to know before you order.</h1>
      </section>

      <section className="space-y-8">
        {faqCategories.map((category, catIndex) => {
          const Icon = category.icon;
          return (
            <div key={category.title} className="surface-card p-6 md:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="icon-pill">
                  <Icon size={18} />
                </span>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{category.title}</h2>
              </div>
              {category.items.map((item, itemIndex) => {
                const globalIndex = catIndex * 10 + itemIndex;
                return (
                  <FAQItem
                    key={item.question}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openIndex === globalIndex}
                    onClick={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                  />
                );
              })}
            </div>
          );
        })}
      </section>
    </div>
  );
};

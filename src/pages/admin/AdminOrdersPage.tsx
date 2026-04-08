import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { Search } from 'lucide-react';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { cn, formatCurrency, formatDate } from '../../lib/utils';

const orderStatuses: Order['status'][] = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const ordersQuery = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        setOrders(snapshot.docs.map((orderDoc) => ({ id: orderDoc.id, ...orderDoc.data() } as Order)));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching admin orders:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredOrders = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch = !term || [
        order.order_number,
        order.customer.name,
        order.customer.phone,
        order.customer.email || '',
      ].some((value) => value?.toLowerCase().includes(term));

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    setUpdatingOrderId(orderId);

    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black tracking-tight text-[#1A1A1A]">Orders</h1>
        <p className="text-sm text-gray-500">Review customer orders, payment methods, and fulfillment status in one place.</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by order number, customer, phone, or email..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium capitalize focus:border-primary focus:outline-none"
        >
          <option value="all">All statuses</option>
          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Delivery</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Placed</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-8">
                      <div className="h-12 w-full rounded-lg bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="align-top transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{order.order_number}</span>
                        <span className="text-xs text-gray-500">{order.items.length} item(s)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex min-w-[12rem] flex-col">
                        <span className="font-medium text-gray-900">{order.customer.name}</span>
                        <span className="text-xs text-gray-500">{order.customer.phone}</span>
                        {order.customer.email ? <span className="text-xs text-gray-500">{order.customer.email}</span> : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-600">{order.payment_method.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4">
                      <div className="flex min-w-[12rem] flex-col">
                        <span className="capitalize text-gray-900">{order.delivery.method.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-gray-500">{order.delivery.address || 'Store pickup'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(order.pricing.total)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {order.created_at?.toDate ? formatDate(order.created_at.toDate()) : 'Pending'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        disabled={updatingOrderId === order.id}
                        onChange={(event) => handleStatusChange(order.id, event.target.value as Order['status'])}
                        className={cn(
                          'rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-wider focus:border-primary focus:outline-none',
                          order.status === 'delivered' && 'border-green-200 bg-green-50 text-green-700',
                          order.status === 'cancelled' && 'border-red-200 bg-red-50 text-red-700',
                          !['delivered', 'cancelled'].includes(order.status) && 'border-blue-200 bg-blue-50 text-blue-700'
                        )}
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-sm text-gray-500">
                    No orders found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

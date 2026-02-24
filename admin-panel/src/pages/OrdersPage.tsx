import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './OrdersPage.css';

const PAGE_SIZE = 20;

type OrderStatus = 'placed' | 'preparing' | 'out_for_delivery' | 'delivered';

type OrderItem = { juice_name: string; price: number };
type Profile = { name: string; email: string; phone: string };
type Order = {
  id: string;
  order_id: string;
  total: number;
  address: string;
  notes: string | null;
  status: OrderStatus;
  placed_at: string;
  updated_at: string;
  order_items: OrderItem[];
  profiles: Profile | Profile[] | null;
};

const STATUS_OPTIONS: OrderStatus[] = ['placed', 'preparing', 'out_for_delivery', 'delivered'];

function getProfile(o: Order): Profile | null {
  const p = o.profiles;
  return Array.isArray(p) ? p[0] ?? null : p;
}
const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Placed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export function OrdersPage() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
  }, [user, navigate]);

  const fetchOrders = useCallback(
    async (pageNum: number, append: boolean) => {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);

      let query = supabase
        .from('orders')
        .select(`
          id,
          order_id,
          total,
          address,
          notes,
          status,
          placed_at,
          updated_at,
          order_items(juice_name, price),
          profiles!user_id(name, email, phone)
        `)
        .order('placed_at', { ascending: sortBy === 'oldest' })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (search.trim().length >= 2) {
        query = query.or(
          `order_id.ilike.%${search.trim()}%,address.ilike.%${search.trim()}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        if (!append) setOrders([]);
      } else {
        const newOrders = (data ?? []) as Order[];
        setOrders((prev) => (append ? [...prev, ...newOrders] : newOrders));
        setHasMore(newOrders.length === PAGE_SIZE);
      }
      setLoading(false);
      setLoadingMore(false);
    },
    [sortBy, statusFilter, search]
  );

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    if (!user) return;
    setPage(0);
    setHasMore(true);
    fetchOrders(0, false);
  }, [user, sortBy, statusFilter, search, fetchOrders]);

  const loadNextPage = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchOrders(next, true);
  }, [page, loading, loadingMore, hasMore, fetchOrders]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadNextPage();
      },
      { rootMargin: '100px', threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadNextPage]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId);
    await supabase.from('orders').update({ status: newStatus }).eq('order_id', orderId);
    setOrders((prev) =>
      prev.map((o) => (o.order_id === orderId ? { ...o, status: newStatus } : o))
    );
    setUpdating(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  const formatPrice = (p: number) => `₹${p}`;

  if (authLoading) return <div className="orders-loading">Loading...</div>;

  return (
    <div className="orders-page">
      <header className="orders-header">
        <h1>SapJuice Orders</h1>
        <div className="header-actions">
          <span className="user-email">{user?.email}</span>
          <button type="button" onClick={handleLogout} className="btn-logout">
            Log out
          </button>
        </div>
      </header>

      <div className="orders-toolbar">
        <input
          type="search"
          placeholder="Search by order ID or address..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
          className="filter-select"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
          className="filter-select"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <main className="orders-main">
        {loading ? (
          <p className="orders-loading">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="orders-empty">No orders match your filters.</p>
        ) : (
          <>
          <div className="orders-grid">
            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <div className="order-header">
                  <strong className="order-id">{order.order_id}</strong>
                  <span className={`order-status order-status-${order.status}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                <div className="order-meta">
                  <p>
                    {getProfile(order)?.name ?? '—'} • {getProfile(order)?.email ?? '—'}
                  </p>
                  <p className="order-date">{formatDate(order.placed_at)}</p>
                </div>
                <p className="order-address">{order.address}</p>
                {order.notes && (
                  <p className="order-notes">Notes: {order.notes}</p>
                )}
                <ul className="order-items">
                  {order.order_items?.map((item, i) => (
                    <li key={i}>
                      {item.juice_name} — {formatPrice(item.price)}
                    </li>
                  ))}
                </ul>
                <p className="order-total">Total: {formatPrice(order.total)}</p>

                {(order.status === 'placed' ||
                  order.status === 'preparing' ||
                  order.status === 'out_for_delivery') && (
                  <div className="order-actions">
                    {order.status !== 'out_for_delivery' && (
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusUpdate(order.order_id, 'out_for_delivery')
                        }
                        disabled={updating === order.order_id}
                        className="btn-action"
                      >
                        {updating === order.order_id ? '…' : 'Mark Out for Delivery'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(order.order_id, 'delivered')}
                      disabled={updating === order.order_id}
                      className="btn-action btn-delivered"
                    >
                      {updating === order.order_id ? '…' : 'Mark Delivered'}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
          <div ref={loadMoreRef} className="load-more-sentinel">
            {loadingMore && <p className="orders-loading">Loading more...</p>}
            {!hasMore && orders.length > 0 && (
              <p className="orders-end">No more orders.</p>
            )}
          </div>
          </>
        )}
      </main>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import {
  FiCheck,
  FiCheckCircle,
  FiInbox,
  FiMail,
  FiPhone,
  FiSearch,
} from 'react-icons/fi';
import PageMeta from '../components/PageMeta';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import {
  formatDate,
  getEnquiries,
  markEnquiryRead,
} from '../services/api';

const initials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export default function Enquiries() {
  const { showToast } = useToast();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = () => {
    setLoading(true);
    getEnquiries()
      .then(setEnquiries)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const onReset = () => load();
    window.addEventListener('motora:data-reset', onReset);
    return () => window.removeEventListener('motora:data-reset', onReset);
  }, []);

  const unread = enquiries.filter((item) => !item.isRead).length;

  const filtered = useMemo(() => {
    return enquiries.filter((enquiry) => {
      if (filter === 'Unread' && enquiry.isRead) return false;
      if (filter === 'Read' && !enquiry.isRead) return false;
      if (search.trim()) {
        const haystack = `${enquiry.name} ${enquiry.email} ${enquiry.phone} ${enquiry.message}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [enquiries, filter, search]);

  const markRead = async (enquiry) => {
    if (enquiry.isRead) return;
    setBusyId(enquiry.id);
    try {
      const updated = await markEnquiryRead(enquiry.id);
      setEnquiries((current) => current.map((item) => (item.id === enquiry.id ? updated : item)));
      showToast('Enquiry marked as read.');
    } catch {
      showToast('Could not update the enquiry.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    const unreadItems = enquiries.filter((item) => !item.isRead);
    if (unreadItems.length === 0) return;
    setMarkingAll(true);
    try {
      await Promise.all(unreadItems.map((item) => markEnquiryRead(item.id)));
      setEnquiries((current) => current.map((item) => ({ ...item, isRead: true })));
      showToast('All enquiries marked as read.');
    } catch {
      showToast('Could not mark all enquiries as read.', 'error');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <>
      <PageMeta title="Customer Enquiries" description="Review contact form enquiries in the Motora demo admin panel." />

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-racing">Inbox</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Customer enquiries</h1>
          <p className="mt-1.5 text-xs text-ink/45">
            {enquiries.length} messages · {unread} unread
          </p>
        </div>
        {unread > 0 && (
          <button type="button" onClick={markAllRead} disabled={markingAll} className="btn-outline btn-sm w-fit bg-white">
            <FiCheckCircle size={13} /> {markingAll ? 'Marking…' : 'Mark all as read'}
          </button>
        )}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Total enquiries', value: enquiries.length, icon: FiMail },
          { label: 'Unread', value: unread, icon: FiInbox },
          { label: 'Read', value: enquiries.length - unread, icon: FiCheckCircle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3 rounded-card border border-ink/[0.06] bg-white p-4 shadow-soft">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-mist text-racing">
                <Icon size={15} />
              </span>
              <div>
                <p className="font-display text-lg font-extrabold">{item.value}</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-ink/35">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-card border border-ink/[0.06] bg-white shadow-soft">
        <div className="flex flex-col gap-3 border-b border-ink/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1.5">
            {['All', 'Unread', 'Read'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-3.5 py-2 text-[10px] font-semibold transition ${
                  filter === item ? 'bg-ink text-white' : 'bg-mist/60 text-ink/50 hover:bg-mist hover:text-ink'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="relative w-full sm:max-w-[240px]">
            <span className="sr-only">Search enquiries</span>
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" size={13} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search messages…"
              className="w-full rounded-xl border border-ink/10 bg-mist/50 py-2.5 pl-9 pr-3 text-xs focus:border-racing focus:bg-white focus:outline-none"
            />
          </label>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-32 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FiInbox}
              title={unread === 0 && filter === 'Unread' ? 'You’re all caught up' : 'No enquiries match'}
              description={
                unread === 0 && filter === 'Unread'
                  ? 'Every customer message has been read. New demo enquiries will appear here.'
                  : 'Try another filter or search term. Contact form submissions appear here instantly.'
              }
              action={
                <button type="button" onClick={() => { setFilter('All'); setSearch(''); }} className="btn-outline btn-sm">
                  Show all enquiries
                </button>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-ink/[0.06]">
            {filtered.map((enquiry) => (
              <article
                key={enquiry.id}
                className={`relative p-5 transition sm:p-6 ${enquiry.isRead ? 'bg-white' : 'bg-gold/[0.025]'}`}
              >
                {!enquiry.isRead && <span className="absolute left-0 top-0 h-full w-[3px] bg-racing" />}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex items-center gap-3 sm:block">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-xs font-bold ${enquiry.isRead ? 'bg-mist text-ink/45' : 'bg-ink text-white'}`}>
                      {initials(enquiry.name)}
                    </span>
                    <div className="sm:hidden">
                      <p className="text-xs font-semibold">{enquiry.name}</p>
                      <p className="mt-0.5 text-[10px] text-ink/35">{formatDate(enquiry.createdAt)}</p>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-semibold">{enquiry.name}</h2>
                          {!enquiry.isRead && <span className="rounded-full bg-racing px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">New</span>}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink/40">
                          <a href={`mailto:${enquiry.email}`} className="inline-flex items-center gap-1 transition hover:text-racing">
                            <FiMail size={10} /> {enquiry.email}
                          </a>
                          <a href={`tel:${enquiry.phone}`} className="inline-flex items-center gap-1 transition hover:text-racing">
                            <FiPhone size={10} /> {enquiry.phone}
                          </a>
                          <span className="hidden sm:inline">{formatDate(enquiry.createdAt)}</span>
                        </div>
                      </div>
                      {!enquiry.isRead && (
                        <button
                          type="button"
                          onClick={() => markRead(enquiry)}
                          disabled={busyId === enquiry.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-ink/45 transition hover:border-racing hover:text-racing"
                        >
                          <FiCheck size={11} /> {busyId === enquiry.id ? 'Saving…' : 'Mark read'}
                        </button>
                      )}
                      {enquiry.isRead && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-medium uppercase tracking-wider text-emerald-600">
                          <FiCheckCircle size={11} /> Read
                        </span>
                      )}
                    </div>
                    <p className="mt-3 rounded-xl bg-mist/50 px-4 py-3 text-xs leading-relaxed text-ink/60">
                      {enquiry.message}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <a
                        href={`mailto:${enquiry.email}?subject=Your%20Motora%20enquiry`}
                        className="text-[10px] font-semibold text-racing transition hover:underline"
                      >
                        Reply by email
                      </a>
                      <span className="text-ink/15">/</span>
                      <a href={`tel:${enquiry.phone}`} className="text-[10px] font-semibold text-ink/40 transition hover:text-ink">
                        Call customer
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 rounded-card border border-gold/15 bg-gold/[0.04] p-4 text-[10px] leading-relaxed text-ink/45">
        Demo note: these enquiries were submitted through the public contact form and are stored in
        your browser. Email and phone links are placeholders and do not send real messages.
      </div>
    </>
  );
}

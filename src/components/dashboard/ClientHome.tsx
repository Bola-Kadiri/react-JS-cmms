import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, ClipboardCheck, ClipboardList, Loader2, Wrench } from 'lucide-react';
import { api } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Home page for CLIENT accounts: their sites, totals and latest work, read-only.
 * Everything comes from endpoints the backend already scopes to the client's
 * own facilities (and with Alpha Mead's internal costs removed).
 */

type Listing<T> = T[] | { count?: number; results?: T[] };

const rowsOf = <T,>(data: Listing<T> | undefined): T[] =>
  !data ? [] : Array.isArray(data) ? data : data.results ?? [];

const countOf = <T,>(data: Listing<T> | undefined): number =>
  !data ? 0 : Array.isArray(data) ? data.length : data.count ?? data.results?.length ?? 0;

const useListing = <T,>(key: string, url: string) =>
  useQuery({
    queryKey: ['client-home', key],
    queryFn: async () => (await api.get<Listing<T>>(url)).data,
    staleTime: 60_000,
  });

const STATUS_STYLES: Record<string, string> = {
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const ClientHome = () => {
  const { user } = useAuth();
  const facilities = useListing<{ id: number; name: string; code: string }>('facilities', '/facility/api/api/facilities/');
  const requests = useListing<unknown>('requests', '/work/api/work-requests/');
  const orders = useListing<{
    id: number; slug: string; work_order_number: string; description: string;
    approval_status: string; work_status: string; facility_detail?: { name: string };
  }>('orders', '/work/api/work-orders/');
  const completions = useListing<unknown>('completions', '/work/api/work-order-completions/');

  const loading = facilities.isLoading || requests.isLoading || orders.isLoading || completions.isLoading;
  const closedOrders = rowsOf(orders.data).filter((o) => o.work_status === 'closed').length;

  const tiles = [
    { label: 'My sites', value: countOf(facilities.data), icon: Building2, to: null },
    { label: 'Work requests', value: countOf(requests.data), icon: ClipboardList, to: '/dashboard/work/requests' },
    { label: 'Work orders', value: countOf(orders.data), icon: Wrench, to: '/dashboard/work/orders' },
    { label: 'Completion certificates', value: countOf(completions.data), icon: ClipboardCheck, to: '/dashboard/work/work-order-completions' },
  ];

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold text-green-800">Welcome{user?.name ? `, ${user.name}` : ''}</h1>
        <p className="text-sm text-gray-600">
          A read-only view of the maintenance work Alpha Mead is carrying out at your sites.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-green-700" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiles.map(({ label, value, icon: Icon, to }) => {
              const body = (
                <Card className="border-green-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="rounded-full bg-green-50 p-3"><Icon className="h-6 w-6 text-green-700" /></div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                      <p className="text-sm text-gray-600">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
              return to ? <Link key={label} to={to}>{body}</Link> : <div key={label}>{body}</div>;
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border-green-200">
              <CardHeader><CardTitle className="text-green-800 text-lg">My sites</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {rowsOf(facilities.data).length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No sites are linked to your account yet. Please contact Alpha Mead.
                  </p>
                ) : (
                  rowsOf(facilities.data).map((f) => (
                    <div key={f.id} className="flex items-center justify-between border-b last:border-0 pb-2">
                      <span className="font-medium text-gray-900">{f.name}</span>
                      <span className="text-xs text-gray-500">{f.code}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-green-200 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-green-800 text-lg flex items-center justify-between">
                  Latest work orders
                  <span className="text-sm font-normal text-gray-500">{closedOrders} closed on this page</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rowsOf(orders.data).length === 0 ? (
                  <p className="text-sm text-gray-500">No work orders yet.</p>
                ) : (
                  rowsOf(orders.data).slice(0, 8).map((o) => (
                    <Link
                      key={o.id}
                      to={`/dashboard/work/orders/view/${o.slug}`}
                      className="flex items-center justify-between gap-3 border-b last:border-0 pb-2 hover:bg-green-50 rounded px-1"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">#{o.work_order_number}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {o.facility_detail?.name ? `${o.facility_detail.name} · ` : ''}{o.description || 'No description'}
                        </p>
                      </div>
                      <Badge variant="outline" className={o.work_status === 'closed'
                        ? 'bg-gray-100 text-gray-700 border-gray-200'
                        : STATUS_STYLES[o.approval_status] || 'bg-gray-100 text-gray-700'}>
                        {o.work_status === 'closed' ? 'Closed' : o.approval_status}
                      </Badge>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientHome;

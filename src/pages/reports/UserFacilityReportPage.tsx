// src/pages/reports/UserFacilityReportPage.tsx
import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { Spinner } from '@/components/Spinner';
import { useUserFacilityReportQuery } from '@/hooks/report/useReportQueries';
import { useFacilitiesQuery } from '@/hooks/facility/useFacilityQueries';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

const UserFacilityReportPage = () => {
  const { t } = useTypedTranslation('sidebar');
  const { hasNoAccess } = useFeatureAccess('report');

  const [search, setSearch] = useState('');
  const [facility, setFacility] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: facilitiesData } = useFacilitiesQuery();
  const facilityOptions = useMemo(
    () =>
      (facilitiesData?.results || []).map((f) => ({
        value: String(f.id),
        label: f.name,
      })),
    [facilitiesData?.results]
  );

  const {
    data = { count: 0, results: [] },
    isFetching,
    isError,
  } = useUserFacilityReportQuery({
    page,
    page_size: pageSize,
    search: search || undefined,
    facility: facility || undefined,
  });

  const totalPages = Math.max(1, Math.ceil(data.count / pageSize));

  if (hasNoAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('reports.userFacility')}</h1>
        <p className="text-sm text-muted-foreground">
          Which staff belong to which facility, plus their activity — logins, work
          requests, and item requests raised.
        </p>
      </div>

      <SearchFilter
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onFilter={(_key, value) => {
          setFacility(value);
          setPage(1);
        }}
        filters={[{ key: 'facility', label: 'Facility', options: facilityOptions }]}
        placeholder="Search user facility report..."
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>First name</TableHead>
                <TableHead>Last name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead className="text-right">Login count</TableHead>
                <TableHead className="text-right">Work request count</TableHead>
                <TableHead className="text-right">Visitor pass count</TableHead>
                <TableHead className="text-right">Item request count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isError ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-destructive">
                    Failed to load the report. Please try again.
                  </TableCell>
                </TableRow>
              ) : data.results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    {isFetching ? <Spinner text="Loading..." /> : 'No users found.'}
                  </TableCell>
                </TableRow>
              ) : (
                data.results.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.first_name}</TableCell>
                    <TableCell>{row.last_name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>
                      {row.facilities.length ? (
                        <div className="flex flex-wrap gap-1">
                          {row.facilities.map((name) => (
                            <Badge
                              key={name}
                              variant={row.facilities_inferred ? 'outline' : 'secondary'}
                              title={
                                row.facilities_inferred
                                  ? 'Inferred from this user\'s work request history — not an explicit facility assignment'
                                  : undefined
                              }
                            >
                              {name}
                              {row.facilities_inferred && (
                                <span className="ml-1 text-muted-foreground">(inferred)</span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground" title="No facility assignment, and no work request history to infer one from">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{row.login_count}</TableCell>
                    <TableCell className="text-right">{row.work_request_count}</TableCell>
                    <TableCell className="text-right">
                      {row.visitor_pass_count === null ? (
                        <span className="text-muted-foreground" title="No visitor-pass feature exists yet">
                          N/A
                        </span>
                      ) : (
                        row.visitor_pass_count
                      )}
                    </TableCell>
                    <TableCell className="text-right">{row.item_request_count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={data.count}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <p className="text-xs text-muted-foreground">
        <strong>Facility</strong> — a solid badge is an explicit assignment; an outlined
        "(inferred)" badge is derived from the user's own work request history because no
        explicit assignment exists yet; "Unassigned" means neither exists. <strong>Visitor
        pass count</strong> shows N/A system-wide — that feature hasn't been built. <strong>Item
        request count</strong> will read 0 for everyone until the Item Request feature has
        been used.
      </p>
    </div>
  );
};

export default UserFacilityReportPage;

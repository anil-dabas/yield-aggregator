import { useState, useEffect } from 'react';
import { fetchOpportunities } from '../api';
import { YieldOpportunity } from '../types';
import OpportunitiesTable from './OpportunitiesTable';

const AllOpportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setLoading(true);
        const data = await fetchOpportunities(currentPage, pageSize);
        setOpportunities(data.opportunities);
        setTotalItems(data.totalItems);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch opportunities');
      } finally {
        setLoading(false);
      }
    };
    loadOpportunities();
  }, [currentPage, pageSize]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
      <OpportunitiesTable
          opportunities={opportunities}
          title="All Yield Opportunities"
          totalItems={totalItems}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
      />
  );
};

export default AllOpportunities;
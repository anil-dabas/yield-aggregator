import { useState, useEffect } from 'react';
import { matchOpportunities } from '../api';
import { YieldOpportunity } from '../types';
import { useProfile } from '../context/ProfileContext';
import { useUser } from '../context/UserContext';
import OpportunitiesTable from './OpportunitiesTable';

const MyOpportunities: React.FC = () => {
  const { profile } = useProfile();
  const { user } = useUser();
  const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('MyOpportunities useEffect - user:', user, 'profile:', profile);
    const fetchMatchedOpportunities = async () => {
      if (!user) {
        setOpportunities([]);
        setTotalItems(0);
        setTotalPages(0);
        setLoading(false);
        return;
      }
      if (!profile) {
        setOpportunities([]);
        setTotalItems(0);
        setTotalPages(0);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await matchOpportunities(profile, currentPage, pageSize);
        setOpportunities(data.matchedOpportunities);
        setTotalItems(data.totalItems);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch matched opportunities');
      } finally {
        setLoading(false);
      }
    };
    fetchMatchedOpportunities();
  }, [profile, user, currentPage, pageSize]);

  if (!user) return <div className="error">You are not logged in. Please login first.</div>;
  if (!profile) return <div className="error">No profile saved. Please save your profile first.</div>;
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
      <OpportunitiesTable
          opportunities={opportunities}
          title="My Matched Opportunities"
          totalItems={totalItems}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
      />
  );
};

export default MyOpportunities;
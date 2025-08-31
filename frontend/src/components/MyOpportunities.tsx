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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('MyOpportunities useEffect - user:', user, 'profile:', profile); // Debug
    const fetchMatchedOpportunities = async () => {
      if (!user) {
        setOpportunities([]);
        setLoading(false);
        return;
      }
      if (!profile) {
        setOpportunities([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await matchOpportunities(profile);
        setOpportunities(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch matched opportunities');
      } finally {
        setLoading(false);
      }
    };
    fetchMatchedOpportunities();
  }, [profile, user]);

  if (!user) return <div className="error">You are not logged in. Please login first.</div>;
  if (!profile) return <div className="error">No profile saved. Please save your profile first.</div>;
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return <OpportunitiesTable opportunities={opportunities} title="My Matched Opportunities" />;
};

export default MyOpportunities;
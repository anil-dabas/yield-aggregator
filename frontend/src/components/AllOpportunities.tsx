import { useState, useEffect } from 'react';
import { fetchOpportunities } from '../api';
import { YieldOpportunity } from '../types';
import OpportunitiesTable from './OpportunitiesTable';
import {ERROR_MESSAGES} from "../../../src/constants.ts";

const AllOpportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setLoading(true);
        const data = await fetchOpportunities();
        setOpportunities(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || ERROR_MESSAGES.FAILED_TO_FETCH_OPPORTUNITIES);
      } finally {
        setLoading(false);
      }
    };
    loadOpportunities();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return <OpportunitiesTable opportunities={opportunities} title="All Yield Opportunities" />;
};

export default AllOpportunities;
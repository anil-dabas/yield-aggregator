import { useState, useEffect } from 'react';
import { matchOpportunities } from '../api';
import { UserProfile } from '../types';
import { useProfile } from '../context/ProfileContext';
import { useUser } from '../context/UserContext';
import { hardcodedUsers } from '../users';

const MyProfile: React.FC = () => {
  const { profile: savedProfile, setProfile } = useProfile();
  const { user } = useUser();
  const [formProfile, setFormProfile] = useState<UserProfile>(
      savedProfile || {
        walletBalance: user?.walletBalance || hardcodedUsers[0].walletBalance,
        riskTolerance: 7,
        maxAllocationPct: 25,
        investmentHorizon: 90,
      }
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    console.log('MyProfile useEffect - user:', user, 'savedProfile:', savedProfile); // Debug
    if (savedProfile) {
      setFormProfile(savedProfile);
    } else if (user) {
      setFormProfile({
        walletBalance: user.walletBalance,
        riskTolerance: 7,
        maxAllocationPct: 25,
        investmentHorizon: 90,
      });
    } else {
      setFormProfile({
        walletBalance: hardcodedUsers[0].walletBalance,
        riskTolerance: 7,
        maxAllocationPct: 25,
        investmentHorizon: 90,
      });
    }
  }, [savedProfile, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, id } = e.target;
    console.log('handleChange:', { name, value, id, formProfile }); // Debug
    setFormProfile((prev) => {
      const newProfile = {
        ...prev,
        [name]: name === 'walletBalance' ? { ...prev.walletBalance, [id]: value } : parseFloat(value) || 0,
      };
      console.log('New formProfile:', newProfile); // Debug
      return newProfile;
    });
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('handleSubmit:', formProfile); // Debug
    try {
      await matchOpportunities(formProfile);
      setProfile(formProfile);
      setSuccess('Profile saved and matched successfully');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      setSuccess(null);
    }
  };

  const handleConnectWallet = () => {
    console.log('Connect Wallet clicked'); // Debug
    document.dispatchEvent(new Event('showLoginForm'));
  };

  return (
      <div>
        <h2>My Profile</h2>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <div className="card">
          <div className="form-group">
            <label>ETH Balance</label>
            <input
                id="ETH"
                name="walletBalance"
                type="text"
                value={formProfile.walletBalance.ETH}
                onChange={handleChange}
                className="input"
                placeholder="Enter ETH balance"
            />
          </div>
          <div className="form-group">
            <label>SOL Balance</label>
            <input
                id="SOL"
                name="walletBalance"
                type="text"
                value={formProfile.walletBalance.SOL}
                onChange={handleChange}
                className="input"
                placeholder="Enter SOL balance"
            />
          </div>
          <div className="form-group">
            <label>USDC Balance</label>
            <input
                id="USDC"
                name="walletBalance"
                type="text"
                value={formProfile.walletBalance.USDC}
                onChange={handleChange}
                className="input"
                placeholder="Enter USDC balance"
            />
          </div>
          <div className="form-group">
            <label>Risk Tolerance (1-10)</label>
            <input
                name="riskTolerance"
                type="number"
                min="1"
                max="10"
                value={formProfile.riskTolerance}
                onChange={handleChange}
                className="input"
                placeholder="1-10"
            />
          </div>
          <div className="form-group">
            <label>Max Allocation (%)</label>
            <input
                name="maxAllocationPct"
                type="number"
                min="0"
                max="100"
                value={formProfile.maxAllocationPct}
                onChange={handleChange}
                className="input"
                placeholder="0-100"
            />
          </div>
          <div className="form-group">
            <label>Investment Horizon (days)</label>
            <input
                name="investmentHorizon"
                type="number"
                min="1"
                value={formProfile.investmentHorizon}
                onChange={handleChange}
                className="input"
                placeholder="Enter days"
            />
          </div>
          {user ? (
              <button onClick={handleSubmit} className="button">
                Match
              </button>
          ) : (
              <button onClick={handleConnectWallet} className="button connect">
                Connect Wallet
              </button>
          )}
        </div>
      </div>
  );
};

export default MyProfile;
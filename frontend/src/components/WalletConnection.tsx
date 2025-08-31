import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useProfile } from '../context/ProfileContext';
import { hardcodedUsers } from '../users';

interface WalletConnectionProps {
  setActiveTab: (tab: 'all' | 'profile' | 'matched') => void;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ setActiveTab }) => {
  const { user, login, logout } = useUser();
  const { setProfile } = useProfile();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleShowLogin = () => setShowLogin(true);
    document.addEventListener('showLoginForm', handleShowLogin);
    return () => document.removeEventListener('showLoginForm', handleShowLogin);
  }, []);

  const handleConnect = () => {
    setShowLogin(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      const foundUser = hardcodedUsers.find(
          (u) => u.username === username && u.password === password
      );
      if (foundUser) {
        setProfile({
          walletBalance: foundUser.walletBalance,
          riskTolerance: 7,
          maxAllocationPct: 25,
          investmentHorizon: 90,
        });
        setShowLogin(false);
        setUsername('');
        setPassword('');
        setError(null);
        setActiveTab('profile');
      }
    } else {
      setError('Invalid username or password');
    }
  };

  const handleDisconnect = () => {
    logout();
    setProfile({
      walletBalance: hardcodedUsers[0].walletBalance,
      riskTolerance: 7,
      maxAllocationPct: 25,
      investmentHorizon: 90,
    });
  };

  const handleCloseModal = () => {
    setShowLogin(false);
    setUsername('');
    setPassword('');
    setError(null);
  };

  return (
      <div>
        {user ? (
            <div className="wallet-status">
              <span>Connected: {user.walletAddress}</span>
              <button onClick={handleDisconnect} className="button disconnect">
                Disconnect
              </button>
            </div>
        ) : (
            <button onClick={handleConnect} className="button connect">
              Connect Wallet
            </button>
        )}
        {showLogin && (
            <div className="modal">
              <div className="modal-content">
                <h3>Login to Your Wallet</h3>
                {error && <div className="error">{error}</div>}
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input"
                        placeholder="Enter username"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input"
                        placeholder="Enter password"
                    />
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="button">
                      Login
                    </button>
                    <button
                        type="button"
                        onClick={handleCloseModal}
                        className="button disconnect"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
};

export default WalletConnection;
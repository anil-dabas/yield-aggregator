import { useState } from 'react';
import AllOpportunities from './components/AllOpportunities';
import MyProfile from './components/MyProfile';
import MyOpportunities from './components/MyOpportunities';
import WalletConnection from './components/WalletConnection';
import { ProfileProvider } from './context/ProfileContext';
import { UserProvider } from './context/UserContext';
import './index.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'profile' | 'matched'>('all');

  return (
      <UserProvider>
        <ProfileProvider>
          <div className="container">
            <header className="header">
              <h1>Yield Aggregation Service</h1>
              <WalletConnection setActiveTab={setActiveTab} />
            </header>
            <nav className="nav">
              <button
                  className={`nav-button ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
              >
                All Opportunities
              </button>
              <button
                  className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
              >
                My Profile
              </button>
              <button
                  className={`nav-button ${activeTab === 'matched' ? 'active' : ''}`}
                  onClick={() => setActiveTab('matched')}
              >
                My Opportunities
              </button>
            </nav>
            <main className="main">
              {activeTab === 'all' && <AllOpportunities />}
              {activeTab === 'profile' && <MyProfile />}
              {activeTab === 'matched' && <MyOpportunities />}
            </main>
          </div>
        </ProfileProvider>
      </UserProvider>
  );
};

export default App;
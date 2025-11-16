import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { SearchPage } from './components/SearchPage';
import { TrackingPage } from './components/TrackingPage';
import { ActiveTrackingPage } from './components/ActiveTrackingPage';
import { ProfilePage } from './components/ProfilePage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'search' | 'tracking' | 'profile' | 'active-tracking'>('search');
  const [selectedTracking, setSelectedTracking] = useState<string | null>(null);

  const handleNavigate = (page: 'search' | 'tracking' | 'profile') => {
    setCurrentPage(page);
    setSelectedTracking(null);
  };

  const handleViewTracking = (trackingId: string) => {
    setSelectedTracking(trackingId);
    setCurrentPage('active-tracking');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      
      <main className="pt-16">
        {currentPage === 'search' && <SearchPage />}
        {currentPage === 'tracking' && <TrackingPage onViewTracking={handleViewTracking} />}
        {currentPage === 'active-tracking' && selectedTracking && (
          <ActiveTrackingPage trackingId={selectedTracking} onBack={() => setCurrentPage('tracking')} />
        )}
        {currentPage === 'profile' && <ProfilePage />}
      </main>
    </div>
  );
}

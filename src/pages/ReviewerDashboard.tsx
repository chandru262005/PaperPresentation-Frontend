import NavBar from '../components/NavBar';
import ChatWindow from '../components/ChatWindow';
import FileManager from '../components/FileManager';

interface ReviewerDashboardProps {
  onLogout: () => void;
}

export default function ReviewerDashboard({ onLogout }: ReviewerDashboardProps) {
  return (
    <div className="grid grid-cols-[260px_1fr_320px] h-screen w-full overflow-hidden">
      {/* Left Column */}
      <aside className="h-full">
        <NavBar onLogout={onLogout} />
      </aside>

      {/* Middle Column */}
      <main className="h-full overflow-hidden">
        <ChatWindow />
      </main>

      {/* Right Column */}
      <aside className="h-full">
        <FileManager />
      </aside>
    </div>
  );
}
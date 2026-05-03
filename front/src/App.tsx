import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SkillAnalysis from './pages/SkillAnalysis';
import Mentors from './pages/Mentors';
import MockInterview from './pages/MockInterview';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/skill-analysis" element={<Layout><SkillAnalysis /></Layout>} />
        <Route path="/mentors" element={<Layout><Mentors /></Layout>} />
        <Route path="/mock-interview" element={<Layout><MockInterview /></Layout>} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/auth" element={<AuthLayout><Auth /></AuthLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

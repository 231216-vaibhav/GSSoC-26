import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';

// Lazy load pages for faster initial load
const Home = lazy(() => import('./pages/Home'));
const SkillAnalysis = lazy(() => import('./pages/SkillAnalysis'));
const Mentors = lazy(() => import('./pages/Mentors'));
const MockInterview = lazy(() => import('./pages/MockInterview'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Placements = lazy(() => import('./pages/Placements'));
const Auth = lazy(() => import('./pages/Auth'));

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/skill-analysis" element={<Layout><SkillAnalysis /></Layout>} />
          <Route path="/mentors" element={<Layout><Mentors /></Layout>} />
          <Route path="/mock-interview" element={<Layout><MockInterview /></Layout>} />
          <Route path="/dashboard" element={<Layout><UserDashboard /></Layout>} />
          <Route path="/user-profile" element={<Layout><UserProfile /></Layout>} />
          <Route path="/placements" element={<Layout><Placements /></Layout>} />
          <Route path="/auth" element={<AuthLayout><Auth /></AuthLayout>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

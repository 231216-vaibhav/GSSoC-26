import { Link } from 'react-router-dom';
import { Zap, Twitter, Linkedin, Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-400 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-xl text-white">Seek<span className="text-teal-400">Out</span></span>
            </div>
            <p className="text-sm leading-relaxed">Smart mentoring and skill mapping to accelerate your career journey.</p>
            <div className="flex gap-4 mt-5">
              {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-teal-500/20 hover:text-teal-400 flex items-center justify-center transition-colors">
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-3 text-sm">
              {['Skill Analysis', 'Mentor Matching', 'Mock Interviews', 'Dashboard'].map(item => (
                <li key={item}><Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-teal-400 transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">For Institutions</h4>
            <ul className="space-y-3 text-sm">
              {['For Colleges', 'For Bootcamps', 'Bulk Enrollment', 'Analytics'].map(item => (
                <li key={item}><Link to="/dashboard" className="hover:text-teal-400 transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-3 text-sm">
              {['About', 'Blog', 'Careers', 'Contact'].map(item => (
                <li key={item}><button className="hover:text-teal-400 transition-colors">{item}</button></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>&copy; 2026 SeekOut. All rights reserved.</p>
          <div className="flex gap-5">
            <button className="hover:text-teal-400 transition-colors">Privacy Policy</button>
            <button className="hover:text-teal-400 transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

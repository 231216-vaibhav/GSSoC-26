import { useState } from 'react';
import { Star, X, Calendar, Clock, CheckCircle, Users, Search } from 'lucide-react';
import { mentors, domains, Mentor } from '../data/mockData';

const times = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

function BookingModal({ mentor, onClose }: { mentor: Mentor; onClose: () => void }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [note, setNote] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleBook = () => {
    if (date && time) setConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
          <div className="flex items-center gap-4">
            <img src={mentor.avatar} alt={mentor.name} className="w-14 h-14 rounded-xl object-cover border-2 border-white/30" />
            <div>
              <h3 className="font-bold text-lg">{mentor.name}</h3>
              <p className="text-teal-100 text-sm">{mentor.role} at {mentor.company}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star size={12} className="fill-amber-300 text-amber-300" />
                <span className="text-xs text-teal-100">{mentor.rating} rating</span>
              </div>
            </div>
          </div>
        </div>

        {confirmed ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Session Booked!</h3>
            <p className="text-gray-500 text-sm mb-1">{mentor.name}</p>
            <p className="text-teal-600 font-semibold text-sm">{date} at {time}</p>
            {note && <p className="text-gray-400 text-xs mt-2 italic">"{note}"</p>}
            <p className="text-xs text-gray-400 mt-4">A confirmation will be sent to your email.</p>
            <button onClick={onClose} className="mt-6 w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:from-teal-600 hover:to-emerald-600 transition-all">
              Done
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Calendar size={14} className="text-teal-500" /> Select Date
              </label>
              <input
                type="date"
                min={today}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 focus:border-teal-400 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-teal-500" /> Select Time
              </label>
              <div className="grid grid-cols-4 gap-2">
                {times.map(t => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={`py-2 rounded-lg text-xs font-medium border-2 transition-all ${time === t ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-100 text-gray-600 hover:border-teal-200'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Session Note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="What do you want to focus on?"
                rows={2}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 focus:border-teal-400 focus:outline-none resize-none transition-colors"
              />
            </div>
            <button
              onClick={handleBook}
              disabled={!date || !time}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-teal-200"
            >
              Confirm Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Mentors() {
  const [domain, setDomain] = useState('All');
  const [search, setSearch] = useState('');
  const [booking, setBooking] = useState<Mentor | null>(null);

  const filtered = mentors.filter(m => {
    const matchDomain = domain === 'All' || m.domain === domain;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.skills.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
      m.company.toLowerCase().includes(search.toLowerCase());
    return matchDomain && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            <Users size={12} /> Expert Mentors
          </span>
          <h1 className="text-4xl font-bold text-gray-900">Find Your Perfect Mentor</h1>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">Connect with industry professionals who've been where you're going.</p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, skill, or company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-teal-400 focus:outline-none shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {domains.map(d => (
              <button
                key={d}
                onClick={() => setDomain(d)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${domain === d ? 'border-teal-500 bg-teal-500 text-white shadow-md' : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-6">{filtered.length} mentor{filtered.length !== 1 ? 's' : ''} found</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(mentor => (
            <div key={mentor.id} className="group bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-xl shadow-sm transition-all duration-300 overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-teal-500/10 to-emerald-500/10">
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white" />
                <div className="absolute bottom-3 left-5">
                  <img src={mentor.avatar} alt={mentor.name} className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md" />
                </div>
                <div className="absolute top-3 right-3">
                  <span className="text-xs bg-white/90 text-teal-700 font-semibold px-2.5 py-1 rounded-full shadow-sm">{mentor.domain}</span>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="font-bold text-gray-900">{mentor.name}</h3>
                    <p className="text-xs text-gray-500">{mentor.role}</p>
                    <p className="text-xs text-teal-600 font-medium">{mentor.company}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-gray-700">{mentor.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 my-3 leading-relaxed">{mentor.bio}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mentor.skills.map(s => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4 text-xs text-gray-400">
                  <span>{mentor.sessions} sessions completed</span>
                </div>

                <button
                  onClick={() => setBooking(mentor)}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md group-hover:shadow-teal-100"
                >
                  Book Session
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg font-medium">No mentors found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {booking && <BookingModal mentor={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}

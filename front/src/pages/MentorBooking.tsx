import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, CheckCircle2, ArrowRight, Sparkles, Send, MapPin, User, Mail, CalendarDays } from 'lucide-react';
import mentorsData from '../data/mentors.json';
import { Mentor, SessionType } from '../utils/mentorMatching';

export default function MentorBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [step, setStep] = useState(1);
  const [selectedSession, setSelectedSession] = useState<SessionType | null>(null);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [goalText, setGoalText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const found = (mentorsData as Mentor[]).find(m => m.id === Number(id));
    if (found) {
      setMentor(found);
      // Pre-select free session if available
      const freeSession = found.session_types.find(s => s.is_free);
      if (freeSession) setSelectedSession(freeSession);
      else if (found.session_types.length > 0) setSelectedSession(found.session_types[0]);
    }
  }, [id]);

  if (!mentor) return <div>Loading...</div>;

  const handleConfirm = () => {
    const booking = {
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorPhoto: mentor.photo,
      mentorCompany: mentor.company,
      session: selectedSession,
      day: selectedDay,
      slot: selectedSlot,
      goal: goalText,
      timestamp: new Date().toISOString()
    };
    
    // Store in localStorage
    const existing = JSON.parse(localStorage.getItem('mentor_bookings') || '[]');
    localStorage.setItem('mentor_bookings', JSON.stringify([...existing, booking]));
    
    setIsSuccess(true);
  };

  const timeSlots = [
    { time: '07:00 AM - 09:00 AM', booked: false },
    { time: '12:00 PM - 02:00 PM', booked: true },
    { time: '07:00 PM - 09:00 PM', booked: false },
    { time: '09:00 PM - 10:00 PM', booked: false }
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[48px] p-10 shadow-2xl shadow-emerald-200/50 border border-slate-100 text-center animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />
          
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">🎉 Session Confirmed!</h1>
          <p className="text-slate-400 font-bold text-sm mb-8">We've sent the details to your email.</p>

          <div className="bg-slate-50 rounded-[32px] p-8 mb-8 border border-slate-100">
            <img src={mentor.photo} alt="" className="w-20 h-20 rounded-full border-4 border-white shadow-lg mx-auto mb-4" />
            <h3 className="font-black text-slate-900 text-xl mb-1">{mentor.name}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{mentor.company}</p>
            
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session Type</p>
                  <p className="text-sm font-black text-slate-900">{selectedSession?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Date & Time</p>
                  <p className="text-sm font-black text-slate-900">{selectedDay}, {selectedSlot}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button className="w-full py-4 bg-emerald-50 text-emerald-600 font-black rounded-2xl flex items-center justify-center gap-2 border border-emerald-100 hover:bg-emerald-100 transition-all">
              <CalendarDays size={18} /> Add to Google Calendar
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(`/mentors/${id}`)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm mb-8 transition-colors"
        >
          <ChevronLeft size={18} /> Cancel Booking
        </button>

        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Progress Header */}
          <div className="bg-slate-900 p-8 text-white">
            <div className="flex items-center gap-4 mb-8">
              <img src={mentor.photo} alt={mentor.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700" />
              <div>
                <h2 className="font-black text-xl leading-none mb-1 uppercase tracking-tight">Booking session with {mentor.name.split(' ')[0]}</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{mentor.current_role} @ {mentor.company}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between relative px-4">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
              {[
                { step: 1, label: 'Select Session' },
                { step: 2, label: 'Schedule' },
                { step: 3, label: 'Confirm' }
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= item.step ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                    {item.step}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${step >= item.step ? 'text-emerald-400' : 'text-slate-600'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-10">
            {/* Step 1: Session Selection */}
            {step === 1 && (
              <div className="animate-slideInRight">
                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Step 1: Choose your path</h3>
                <p className="text-slate-400 font-bold text-sm mb-8 italic">Pick the session that best fits your immediate goal.</p>
                <div className="space-y-4">
                  {mentor.session_types.map(type => (
                    <div 
                      key={type.name} 
                      onClick={() => setSelectedSession(type)}
                      className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer flex justify-between items-center group relative overflow-hidden ${selectedSession?.name === type.name ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-50 bg-slate-50/50 hover:border-emerald-200'}`}
                    >
                      {type.is_free && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                          Recommended for first timers
                        </div>
                      )}
                      <div>
                        <h4 className={`font-black text-lg ${selectedSession?.name === type.name ? 'text-emerald-700' : 'text-slate-800'}`}>{type.name}</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{type.duration} MIN • One-on-one Session</p>
                        {type.is_free && <p className="text-xs text-emerald-600 font-bold mt-2">30 min intro call. Ask anything.</p>}
                      </div>
                      <div className="text-right">
                        {type.is_free ? (
                          <div className="flex flex-col items-end">
                            <span className="text-2xl font-black text-emerald-600 uppercase">FREE</span>
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">No payment needed</span>
                          </div>
                        ) : (
                          <p className="text-2xl font-black text-slate-900">₹{type.price}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  disabled={!selectedSession}
                  onClick={() => setStep(2)}
                  className="w-full mt-10 py-5 bg-emerald-500 disabled:opacity-50 text-white font-black rounded-[24px] shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  Continue to Schedule <ArrowRight size={20} />
                </button>
              </div>
            )}

            {/* Step 2: Schedule */}
            {step === 2 && (
              <div className="animate-slideInRight">
                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Step 2: When are you free?</h3>
                <p className="text-slate-400 font-bold text-sm mb-8 italic">Available days based on {mentor.name.split(' ')[0]}'s schedule.</p>
                
                <div className="mb-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Day</p>
                  <div className="flex flex-wrap gap-3">
                    {mentor.availability.map(day => (
                      <button 
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-8 py-5 rounded-3xl font-black border-2 transition-all ${selectedDay === day ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDay && (
                  <div className="animate-fadeIn">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Available Slots (IST)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {timeSlots.map(slot => (
                        <button 
                          key={slot.time}
                          disabled={slot.booked}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`px-6 py-4 rounded-2xl font-black text-sm border-2 transition-all flex justify-between items-center ${
                            selectedSlot === slot.time 
                            ? 'bg-slate-900 border-slate-900 text-white' 
                            : slot.booked 
                            ? 'bg-slate-50 border-slate-50 text-slate-300 cursor-not-allowed' 
                            : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200'
                          }`}
                        >
                          {slot.time}
                          {slot.booked && <span className="text-[8px] font-black bg-slate-200 text-slate-400 px-2 py-0.5 rounded uppercase">Booked</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-12">
                  <button onClick={() => setStep(1)} className="px-10 py-5 border-2 border-slate-100 rounded-[24px] font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">Back</button>
                  <button 
                    disabled={!selectedDay || !selectedSlot}
                    onClick={() => setStep(3)}
                    className="flex-1 py-5 bg-emerald-500 disabled:opacity-50 text-white font-black rounded-[24px] shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                  >
                    Set Session Goals <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Goals & Confirm */}
            {step === 3 && (
              <div className="animate-slideInRight">
                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Step 3: What's the goal?</h3>
                <p className="text-slate-400 font-bold text-sm mb-8 italic">Tell {mentor.name.split(' ')[0]} how they can help you today.</p>
                
                <textarea 
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="Example: I want to discuss my resume for Google SDE role and get feedback on my system design skills..."
                  className="w-full h-40 p-8 bg-slate-50 border-2 border-slate-100 rounded-[32px] focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700 font-bold resize-none mb-10 placeholder:text-slate-300"
                />

                <div className="bg-white border-2 border-emerald-100 rounded-[40px] p-8 mb-10 shadow-xl shadow-emerald-500/5 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Order Summary</p>
                    <h4 className="text-xl font-black text-slate-900">{selectedSession?.name}</h4>
                    <p className="text-xs font-bold text-slate-400 mt-1">{selectedDay} @ {selectedSlot}</p>
                  </div>
                  <div className="h-12 w-0.5 bg-slate-100 hidden md:block" />
                  <div className="text-center md:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total to Pay</p>
                    {selectedSession?.is_free ? (
                      <p className="text-3xl font-black text-emerald-600 uppercase">FREE</p>
                    ) : (
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{selectedSession?.price}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="px-10 py-5 border-2 border-slate-100 rounded-[24px] font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">Back</button>
                  <button 
                    disabled={!goalText.trim()}
                    onClick={handleConfirm}
                    className="flex-1 py-5 bg-emerald-500 disabled:opacity-50 text-white font-black rounded-[24px] shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                  >
                    Confirm Booking <Send size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

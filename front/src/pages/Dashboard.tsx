import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Award, Calendar, ChevronRight, CheckCircle, Clock, BarChart3, BookOpen, Star } from 'lucide-react';
import { userSkillData, roadmapSteps, mentors } from '../data/mockData';

const batchData = [
  { dept: 'Computer Science', students: 340, placed: 278, avg: 74 },
  { dept: 'Electronics', students: 210, placed: 145, avg: 62 },
  { dept: 'Mechanical', students: 180, placed: 98, avg: 54 },
  { dept: 'Information Tech', students: 290, placed: 231, avg: 79 },
];

const recentActivity = [
  { student: 'Priya R.', action: 'Completed Skill Analysis', time: '2h ago', icon: BarChart3, color: 'text-teal-500' },
  { student: 'Arjun S.', action: 'Booked session with Marcus Chen', time: '4h ago', icon: Calendar, color: 'text-blue-500' },
  { student: 'Neha K.', action: 'Completed Mock Interview', time: '6h ago', icon: Award, color: 'text-emerald-500' },
  { student: 'Rahul M.', action: 'Started Roadmap: System Design', time: '1d ago', icon: BookOpen, color: 'text-amber-500' },
  { student: 'Divya P.', action: 'Received job offer from Infosys', time: '1d ago', icon: Star, color: 'text-orange-500' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const overallPlaced = batchData.reduce((a, b) => a + b.placed, 0);
  const overallStudents = batchData.reduce((a, b) => a + b.students, 0);
  const placementRate = Math.round((overallPlaced / overallStudents) * 100);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-8 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Welcome back,</p>
            <h1 className="text-2xl font-bold text-gray-900">RVCE Placement Cell</h1>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 shadow-sm transition-colors">
              Export Report
            </button>
            <button
              onClick={() => navigate('/skill-analysis')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md hover:from-teal-600 hover:to-emerald-600 transition-all"
            >
              Bulk Skill Test <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Students', value: overallStudents.toString(), sub: 'Enrolled', icon: Users, color: 'from-teal-500 to-emerald-400' },
            { label: 'Placement Rate', value: `${placementRate}%`, sub: 'This academic year', icon: TrendingUp, color: 'from-cyan-500 to-teal-400' },
            { label: 'Sessions Booked', value: '1,240', sub: 'With mentors', icon: Calendar, color: 'from-emerald-500 to-green-400' },
            { label: 'Students Placed', value: overallPlaced.toString(), sub: 'Offer letters received', icon: Award, color: 'from-teal-600 to-cyan-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-sm`}>
                <stat.icon size={18} className="text-white" />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
              <div className="text-sm font-semibold text-gray-700 mt-0.5">{stat.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Batch placement */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <BarChart3 size={16} className="text-teal-500" /> Department-wise Placement
            </h3>
            <div className="space-y-4">
              {batchData.map(dept => (
                <div key={dept.dept}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="font-medium text-gray-700">{dept.dept}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs">{dept.placed}/{dept.students} placed</span>
                      <span className="font-bold text-gray-900">{dept.avg}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-1000"
                      style={{ width: `${dept.avg}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Clock size={16} className="text-teal-500" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <act.icon size={14} className={act.color} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{act.student}</p>
                    <p className="text-xs text-gray-500">{act.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Student Skill scores */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5">Avg Skill Scores (Batch)</h3>
            <div className="space-y-4">
              {userSkillData.filter(s => s.status !== 'not-tested').map(skill => (
                <div key={skill.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{skill.name}</span>
                    <span className="font-bold text-gray-900">{skill.score}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${skill.score >= 60 ? 'bg-gradient-to-r from-teal-400 to-emerald-400' : 'bg-gradient-to-r from-orange-400 to-red-400'}`}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Roadmap */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5">Student Journey Roadmap</h3>
            <div className="space-y-3">
              {roadmapSteps.map(step => (
                <div key={step.step} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${step.done ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400 border-2 border-dashed border-gray-200'}`}>
                    {step.done ? <CheckCircle size={14} /> : step.step}
                  </div>
                  <span className={`text-sm ${step.done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                    {step.title}
                  </span>
                  {step.done && <span className="ml-auto text-xs text-teal-600 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">Done</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Mentors */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5">Top Mentors for Your Batch</h3>
            <div className="space-y-4">
              {mentors.slice(0, 4).map(mentor => (
                <div key={mentor.id} className="flex items-center gap-3">
                  <img src={mentor.avatar} alt={mentor.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{mentor.name}</p>
                    <p className="text-xs text-gray-400 truncate">{mentor.domain} · {mentor.company}</p>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-gray-600">{mentor.rating}</span>
                  </div>
                </div>
              ))}
              <button onClick={() => navigate('/mentors')} className="w-full text-center text-teal-600 text-sm font-semibold hover:text-teal-700 transition-colors pt-1">
                View All Mentors →
              </button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="text-xl font-bold mb-1">Ready to run a batch skill assessment?</h3>
            <p className="text-teal-100 text-sm">Get granular skill heatmaps for your entire graduating batch in minutes.</p>
          </div>
          <button
            onClick={() => navigate('/skill-analysis')}
            className="shrink-0 bg-white text-teal-700 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors shadow-lg text-sm"
          >
            Launch Assessment
          </button>
        </div>
      </div>
    </div>
  );
}

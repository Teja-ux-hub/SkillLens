import { getDashboardStats } from "@/lib/hod-data";
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  CheckCircle2,
  FolderKanban,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Card } from "@/components/ui/card";

async function StatsCard({ icon: Icon, label, value, trend, color = "blue" }) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    green: "from-green-500/20 to-green-600/20 border-green-500/30",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
    orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30"
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className="text-xs text-gray-400 mt-2">{trend}</p>
          )}
        </div>
        <div className="p-3 bg-white/10 rounded-lg">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

async function RecentActivity({ students }) {
  const recentStudents = students
    .filter(s => s.lastActivity)
    .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
    .slice(0, 5);

  if (recentStudents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentStudents.map((student) => (
        <div
          key={student.userId}
          className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div>
            <p className="font-medium text-white">{student.name}</p>
            <p className="text-sm text-gray-400">{student.roadmap}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-white">{student.overallProgress}%</p>
            <p className="text-xs text-gray-400">
              {new Date(student.lastActivity).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

async function TopStudents({ students }) {
  const topStudents = students
    .filter(s => s.overallProgress > 0)
    .sort((a, b) => b.overallProgress - a.overallProgress)
    .slice(0, 5);

  if (topStudents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No progress data yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {topStudents.map((student, index) => (
        <div
          key={student.userId}
          className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center font-bold text-white">
            {index + 1}
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">{student.name}</p>
            <p className="text-sm text-gray-400">{student.testsCompleted} tests completed</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white">{student.overallProgress}%</p>
            <p className="text-xs text-gray-400">Avg: {student.avgTestScore}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

async function AtRiskStudents({ students }) {
  const atRisk = students.filter(s => s.status === "At Risk" || s.status === "Inactive");

  if (atRisk.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>All students on track</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {atRisk.slice(0, 5).map((student) => (
        <div
          key={student.userId}
          className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div>
              <p className="font-medium text-white">{student.name}</p>
              <p className="text-sm text-gray-400">{student.roadmap || "No roadmap"}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded">
              {student.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function HODDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of student progress and activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents}
          color="blue"
        />
        <StatsCard
          icon={TrendingUp}
          label="Active Students"
          value={stats.activeStudents}
          color="green"
        />
        <StatsCard
          icon={BookOpen}
          label="Following Roadmaps"
          value={stats.studentsWithRoadmaps}
          color="purple"
        />
        <StatsCard
          icon={CheckCircle2}
          label="Average Progress"
          value={`${stats.avgProgress}%`}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Tests Completed</p>
              <p className="text-2xl font-bold text-white">{stats.totalTests}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <FolderKanban className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Projects Completed</p>
              <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <RecentActivity students={stats.students} />
        </Card>

        {/* Top Students */}
        <Card className="bg-slate-800/50 border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Top Performers</h2>
          <TopStudents students={stats.students} />
        </Card>
      </div>

      {/* At Risk Students */}
      <Card className="bg-slate-800/50 border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          Students Needing Attention
        </h2>
        <AtRiskStudents students={stats.students} />
      </Card>
    </div>
  );
}

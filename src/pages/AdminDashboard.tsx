import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle2, AlertTriangle, TrendingUp, Users, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StatCard from '@/components/grievance/StatCard';
import GrievanceCard from '@/components/grievance/GrievanceCard';
import { mockGrievances, departmentStats, monthlyTrends } from '@/lib/mock-data';

const pieData = [
  { name: 'Submitted', value: 32, color: 'hsl(200, 80%, 50%)' },
  { name: 'Under Review', value: 28, color: 'hsl(38, 90%, 55%)' },
  { name: 'In Progress', value: 45, color: 'hsl(215, 70%, 28%)' },
  { name: 'Resolved', value: 120, color: 'hsl(165, 45%, 40%)' },
  { name: 'Closed', value: 20, color: 'hsl(210, 15%, 70%)' },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Central Grievance Management & Analytics</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard icon={FileText} label="Total Complaints" value="245" trend="+12% this month" />
            <StatCard icon={Clock} label="Pending" value="73" colorClass="text-accent" />
            <StatCard icon={CheckCircle2} label="Resolved" value="152" colorClass="text-secondary" trend="85% SLA met" />
            <StatCard icon={AlertTriangle} label="Escalated" value="20" colorClass="text-destructive" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            {/* Monthly Trends */}
            <div className="elevated-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Monthly Trends</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 45%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 45%)" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="submitted" stroke="hsl(215, 70%, 28%)" strokeWidth={2} dot={{ r: 4 }} name="Submitted" />
                  <Line type="monotone" dataKey="resolved" stroke="hsl(165, 45%, 40%)" strokeWidth={2} dot={{ r: 4 }} name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution */}
            <div className="elevated-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Stats */}
          <div className="elevated-card p-5 mb-8">
            <h3 className="font-heading font-semibold text-foreground mb-4">Department-wise Performance</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215, 15%, 45%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 45%)" />
                <Tooltip />
                <Legend />
                <Bar dataKey="resolved" fill="hsl(165, 45%, 40%)" radius={[4, 4, 0, 0]} name="Resolved" />
                <Bar dataKey="pending" fill="hsl(38, 90%, 55%)" radius={[4, 4, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent grievances */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-4">Recent Grievances</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockGrievances.slice(0, 3).map((g) => <GrievanceCard key={g.id} grievance={g} />)}
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

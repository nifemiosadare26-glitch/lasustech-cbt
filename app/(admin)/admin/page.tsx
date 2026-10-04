"use client";

import { Card, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, CalendarPlus, Settings, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const loginData = [
  { date: 'Sep 21', logins: 450 },
  { date: 'Sep 22', logins: 520 },
  { date: 'Sep 23', logins: 490 },
  { date: 'Sep 24', logins: 590 },
  { date: 'Sep 25', logins: 700 },
  { date: 'Sep 26', logins: 610 },
  { date: 'Sep 27', logins: 300 },
  { date: 'Sep 28', logins: 280 },
  { date: 'Sep 29', logins: 800 },
  { date: 'Sep 30', logins: 950 },
  { date: 'Oct 01', logins: 1100 },
  { date: 'Oct 02', logins: 1250 },
  { date: 'Oct 03', logins: 900 },
  { date: 'Oct 04', logins: 1284 },
];

const auditEvents = [
  { id: "req_9f8a", time: "10:42 AM", user: "N. Osadare", action: "Created session 2026/2027" },
  { id: "req_8b3c", time: "09:15 AM", user: "T. Bello", action: "Approved CSC 301 exam" },
  { id: "req_7d1e", time: "08:50 AM", user: "System", action: "Automated backup completed" },
  { id: "req_6c9f", time: "Yesterday", user: "A. Ibrahim", action: "Paused student exam (CSC/22/101)" },
  { id: "req_5e4d", time: "Yesterday", user: "N. Osadare", action: "Changed password rules" },
  { id: "req_4a2b", time: "Yesterday", user: "System", action: "Realtime sync reset" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight">System overview</h2>
          <p className="text-gray-500 text-[14px] mt-1">Monitor platform health and active sessions.</p>
        </div>
      </div>

      {/* 1. Stat Cards */}
      <div className="flex flex-wrap gap-4">
        <StatCard label="Active users" value="1,284" delta="+8% vs last week" href="/admin/users" />
        <StatCard label="Exams today" value="6" href="/admin/sessions" />
        <StatCard label="Open alerts" value="3" delta="2 critical" href="/admin/audit" />
        <StatCard label="Uptime this month" value="99.9%" href="/admin/settings" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Logins per day */}
        <Card title="Logins per day" className="col-span-1 lg:col-span-2">
          <div className="h-[260px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loginData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6B7587' }} 
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: '#EEF1F5' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E1E5EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="logins" radius={[4, 4, 0, 0]}>
                  {loginData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === loginData.length - 1 ? '#0B2A5B' : '#3B7BEA'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 3. System Health */}
        <Card title="System health">
          <div className="space-y-6 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-success" size={20} />
                <span className="text-[15px] font-medium text-gray-900">API Gateway</span>
              </div>
              <span className="text-[13px] text-gray-500 font-mono">12 ms</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-success" size={20} />
                <span className="text-[15px] font-medium text-gray-900">Database</span>
              </div>
              <span className="text-[13px] text-gray-500 font-mono">45 ms</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-warning" size={20} />
                <span className="text-[15px] font-medium text-gray-900">Realtime Socket</span>
              </div>
              <span className="text-[13px] text-warning font-mono">320 ms</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-success" size={20} />
                <span className="text-[15px] font-medium text-gray-900">File Storage</span>
              </div>
              <span className="text-[13px] text-gray-500 font-mono">80 ms</span>
            </div>
            <div className="pt-4 border-t border-gray-100 text-[13px] text-gray-500">
              Last checked 20 s ago
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 4. Recent audit events */}
        <Card title="Recent audit events" action={{ label: "View all", href: "/admin/audit" }} className="col-span-1 lg:col-span-2" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-[13px] font-semibold text-gray-900">Time</th>
                  <th className="px-4 py-3 text-[13px] font-semibold text-gray-900">User</th>
                  <th className="px-4 py-3 text-[13px] font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-[13px] text-gray-500">{event.time}</td>
                    <td className="px-4 py-3 text-[14px] text-gray-900 font-medium">{event.user}</td>
                    <td className="px-4 py-3 text-[14px] text-gray-700">{event.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 5. Quick actions */}
        <Card title="Quick actions">
          <div className="flex flex-col gap-3 mt-2">
            <Button variant="secondary" className="w-full justify-start h-12">
              <UserPlus className="mr-3 h-5 w-5 text-gray-500" />
              Add user
            </Button>
            <Button variant="secondary" className="w-full justify-start h-12">
              <CalendarPlus className="mr-3 h-5 w-5 text-gray-500" />
              Create session
            </Button>
            <Button variant="secondary" className="w-full justify-start h-12">
              <Settings className="mr-3 h-5 w-5 text-gray-500" />
              Open settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

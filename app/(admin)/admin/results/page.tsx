"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileCheck, Send, CheckCircle2, ShieldAlert } from "lucide-react";

const mockResults = [
  { id: "R1", code: "CSC 301", title: "Data Structures", scripts: 128, malpractices: 2, status: "Pending Publication" },
  { id: "R2", code: "MTH 201", title: "Mathematical Methods I", scripts: 215, malpractices: 0, status: "Published" },
  { id: "R3", code: "PHY 101", title: "General Physics", scripts: 450, malpractices: 14, status: "Under Review" },
];

export default function ResultsProcessing() {
  const [results, setResults] = React.useState(mockResults);
  const [search, setSearch] = React.useState("");
  const [toast, setToast] = React.useState<string | null>(null);

  const handlePublish = (id: string, code: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, status: "Published" } : r));
    setToast(`Results for ${code} have been successfully published to student portals!`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleResolveFlags = (id: string, code: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, malpractices: 0, status: "Pending Publication" } : r));
    setToast(`Flags for ${code} resolved. Result is now ready for publication.`);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = results.filter(r => 
    r.code.toLowerCase().includes(search.toLowerCase()) || 
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg border border-gray-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Results Processing</h2>
          <p className="text-[14px] text-gray-500 mt-1">Review finalized scores and publish to student portals.</p>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col" noPadding>
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course code or title..." 
              className="pl-9 h-9" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-0 outline outline-1 outline-gray-200 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Scripts Processed</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Malpractice Flags</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
                        <FileCheck size={18} />
                      </div>
                      <div>
                        <div className="font-mono text-[13px] font-medium text-blue-700">{res.code}</div>
                        <div className="text-[13px] text-gray-900">{res.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] font-semibold text-gray-900">{res.scripts}</td>
                  <td className="px-6 py-4">
                    {res.malpractices > 0 ? (
                      <span className="inline-flex items-center text-[13px] font-medium text-warning-ink gap-1.5"><ShieldAlert size={16}/> {res.malpractices} flagged</span>
                    ) : (
                      <span className="text-[13px] text-gray-500">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      res.status === 'Published' ? 'success' : 
                      res.status === 'Under Review' ? 'warning' : 'blue-solid'
                    }>{res.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {res.status === 'Pending Publication' && (
                      <Button 
                        size="sm" 
                        className="h-8 cursor-pointer"
                        onClick={() => handlePublish(res.id, res.code)}
                      >
                        <Send size={14} className="mr-2"/> Publish
                      </Button>
                    )}
                    {res.status === 'Published' && (
                      <Button variant="secondary" size="sm" className="h-8 text-success border-success/30 bg-success-tint/10" disabled>
                        <CheckCircle2 size={14} className="mr-2"/> Published
                      </Button>
                    )}
                    {res.status === 'Under Review' && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-8 cursor-pointer"
                        onClick={() => handleResolveFlags(res.id, res.code)}
                      >
                        Resolve Flags
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

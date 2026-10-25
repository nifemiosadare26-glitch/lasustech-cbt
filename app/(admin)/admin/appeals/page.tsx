"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, BarChart3, LayoutDashboard, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StudentAppealsDisabled() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
      <Card className="p-8 text-center space-y-6 border-slate-200 shadow-sm rounded-2xl bg-white">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-blue-600">
          <ShieldCheck size={32} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Result Appeals Not Permitted
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
            In accordance with official LASUSTECH Examination Regulations, CBT assessments are automatically scored and verified upon submission. Grade appeals for computer-based results are not permitted.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
          <p className="font-semibold text-slate-800">Academic Registry Examination Policy:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Examination scoring is automated using the institution question bank keys.</li>
            <li>Published candidate scores are final once approved and released.</li>
            <li>Students with login or exam access issues should be referred to ICT Support.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/admin/results">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              <BarChart3 size={16} className="mr-2" /> View Examination Results
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="secondary" className="w-full sm:w-auto">
              <LayoutDashboard size={16} className="mr-2" /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

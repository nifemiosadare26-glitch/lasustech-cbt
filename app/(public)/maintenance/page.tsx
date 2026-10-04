"use client";

import { Wrench, Clock } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench size={32} />
        </div>
        <h1 className="text-[24px] font-bold text-gray-900 mb-2">Under Maintenance</h1>
        <p className="text-[15px] text-gray-600 mb-6">
          The CBT portal is currently undergoing scheduled maintenance to improve system reliability and performance.
        </p>
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 inline-flex items-center gap-3">
          <Clock className="text-gray-400" size={20} />
          <div className="text-left">
            <p className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider">Estimated Completion</p>
            <p className="text-[14px] text-gray-700">Today at 18:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}

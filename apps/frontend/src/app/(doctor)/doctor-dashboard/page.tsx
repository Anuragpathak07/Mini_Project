import React from 'react';
import RadiologyUploader from '@/components/RadiologyUploader';

export default function DoctorDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Doctor Portal</h1>
            <p className="text-slate-500 mt-1">Manage your patients and review AI insights.</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl">
            Dr
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Upcoming Appointments</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center transition-all hover:border-emerald-200">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
                        P{i}
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">Patient #{202400 + i}</p>
                        <p className="text-sm text-slate-500">Follow-up Consultation • 10:${i * 15} AM</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </section>
            
            <section className="mt-6">
              <RadiologyUploader />
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">AI Assistant</h2>
              <div className="bg-slate-900 text-slate-50 p-5 rounded-xl border border-slate-800">
                <p className="text-sm font-medium mb-3">Recent Analysis Alerts</p>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-xs text-rose-400 font-semibold mb-1">High Priority</p>
                    <p className="text-sm text-slate-300">Patient #202402 has abnormal hemoglobin levels in recent upload.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import ReportUploader from '@/components/ReportUploader';

export default function PatientDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Welcome Back, Patient</h1>
            <p className="text-slate-500 mt-1">Here is the overview of your health records.</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
            P
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Recent Medical Reports</h2>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center transition-all hover:-translate-y-1 hover:shadow-md">
                <div>
                  <p className="font-medium text-slate-700">Blood Test Results</p>
                  <p className="text-sm text-slate-500">Oct 24, 2023</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Analysis</button>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center transition-all hover:-translate-y-1 hover:shadow-md">
                <div>
                  <p className="font-medium text-slate-700">Chest X-Ray</p>
                  <p className="text-sm text-slate-500">Oct 10, 2023</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Analysis</button>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-800">AI Health Insights</h2>
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">✨</span>
                  <h3 className="font-medium text-indigo-900">Your Latest Summary</h3>
                </div>
                <p className="text-sm text-indigo-800 leading-relaxed">
                  Your recent blood work shows that your cholesterol levels are slightly elevated. 
                  Your doctor recommends increasing your cardiovascular exercise and dietary fiber. 
                  All other metrics are within normal ranges.
                </p>
              </div>
            </div>
            
            <ReportUploader />
          </section>
        </div>
      </div>
    </div>
  );
}

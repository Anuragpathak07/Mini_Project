'use client';
import React, { useEffect, useState } from 'react';
import ReportUploader from '@/components/ReportUploader';
import ChatWidget from '@/components/ChatWidget';

export default function PatientDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchReports = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/v1/reports', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports);
        }
      } catch (e) {
        console.error("Failed to fetch reports");
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Welcome Back{user ? `, ${user.email.split('@')[0]}` : ''}</h1>
            <p className="text-slate-500 mt-1">Here is the overview of your health records.</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
            P
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Your Medical Reports</h2>
            <div className="space-y-3">
              {reports.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center text-slate-500 text-sm">
                  No historical reports available. Try uploading one!
                </div>
              ) : (
                reports.map(report => (
                  <div key={report.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center transition-all hover:-translate-y-1 hover:shadow-md">
                    <div>
                      <p className="font-medium text-slate-700">Medical Scan</p>
                      <p className="text-sm text-slate-500">{new Date(report.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium" onClick={() => alert(report.simplifiedResult)}>View Summary</button>
                  </div>
                ))
              )}
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
      
      {/* Floating Chatbot */}
      <ChatWidget />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  BarChart3, 
  Download, 
  FileText, 
  TrendingUp,
  Info
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement 
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import { formatCurrency } from '../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('/api/stats/analytics', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAnalytics();
  }, [user]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Financial Report - FinTrack Premium', 10, 10);
    doc.text(`User: ${user.name}`, 10, 20);
    doc.save('fintrack-report.pdf');
  };

  const exportCSV = () => {
    const csv = Papa.unparse([{ title: 'Sample', amount: 100, date: '2026-05-13' }]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'transactions.csv');
    link.click();
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Analyzing financial data...</div>;

  const barData = {
    labels: data?.monthlyExpenses.map(m => `Month ${m._id.month}`) || [],
    datasets: [{
      label: 'Expenses',
      data: data?.monthlyExpenses.map(m => m.total) || [],
      backgroundColor: '#0ea5e9',
      borderRadius: 12,
    }]
  };

  const pieData = {
    labels: data?.categorySpending.map(c => c._id) || [],
    datasets: [{
      data: data?.categorySpending.map(c => c.total) || [],
      backgroundColor: ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in pb-20 lg:pb-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed insights into your financial health.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all">
            <Download size={18} />
            <span>CSV</span>
          </button>
          <button onClick={downloadPDF} className="flex-1 lg:flex-none btn-primary shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 px-6 py-3">
            <FileText size={18} />
            <span>PDF Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-bold text-lg mb-8 tracking-tight">Monthly Spending</h3>
            <div className="h-[300px]">
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-primary-600 text-white border-none shadow-xl shadow-primary-500/20">
              <TrendingUp size={24} className="mb-4" />
              <p className="text-primary-100 text-[10px] font-bold uppercase tracking-widest">Top Spending</p>
              <h4 className="text-2xl font-bold mt-1 tracking-tight">{data?.categorySpending[0]?._id || 'N/A'}</h4>
              <p className="text-primary-100 text-xs mt-4">This category accounts for the majority of your outgoings.</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                  <Info size={20} />
                </div>
                <h4 className="font-bold text-sm">Smart Insight</h4>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Your spending is well-balanced. Consider moving 20% of your current income to high-interest savings.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-bold text-lg mb-8 tracking-tight">Distribution</h3>
            <div className="h-[250px]">
              <Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false, cutout: '75%' }} />
            </div>
          </div>
          <div className="card bg-slate-900 dark:bg-slate-800 text-white border-none">
            <h4 className="font-bold text-sm mb-4">Monthly Goal</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Savings Target</span>
                <span className="font-bold">75%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 w-[75%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

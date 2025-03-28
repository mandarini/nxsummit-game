import React, { useEffect, useState } from 'react';
import { supabase, type Attendee } from '../lib/supabase';
import { Download, RefreshCcw, ArrowLeft, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loadAttendees() {
    try {
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .order('points', { ascending: false });

      if (error) throw error;
      setAttendees(data || []);
    } catch (error) {
      toast.error('Failed to load attendees');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAttendees();
  }, []);

  const exportCsv = () => {
    const headers = ['Name', 'Email', 'Points', 'Checked In', 'Value'];
    const csvContent = [
      headers.join(','),
      ...attendees.map(a => [
        a.name,
        a.email,
        a.points,
        a.checked_in ? 'Yes' : 'No',
        a.value
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nx-summit-attendees.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/identify')}
              className="text-white hover:text-gray-200 flex items-center"
            >
              <ArrowLeft size={24} />
              <span className="ml-2">Back</span>
            </button>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/checkin')}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center"
            >
              <QrCode size={18} className="mr-2" />
              Check In Scanner
            </button>
            <button
              onClick={loadAttendees}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <RefreshCcw size={18} className="mr-2" />
              Refresh
            </button>
            <button
              onClick={exportCsv}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
            >
              <Download size={18} className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendees.map((attendee) => (
                  <tr key={attendee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{attendee.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendee.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{attendee.points}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        attendee.checked_in
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {attendee.checked_in ? 'Checked In' : 'Not Checked In'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendee.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
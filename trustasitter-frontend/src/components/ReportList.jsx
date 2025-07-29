import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FaUtensils, FaGamepad, FaBed, FaPills, FaRegEdit } from 'react-icons/fa';

const ICONS = {
  'Fed': <FaUtensils className="inline mr-1 text-blue-500" />,
  'Played': <FaGamepad className="inline mr-1 text-green-500" />,
  'Slept': <FaBed className="inline mr-1 text-purple-500" />,
  'Took medicine': <FaPills className="inline mr-1 text-pink-500" />,
  'Other': <FaRegEdit className="inline mr-1 text-gray-500" />,
};

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

const ReportList = ({ bookingId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/bookings/${bookingId}/reports`);
        setReports(response.data.reports);
      } catch (err) {
        setError('Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };
    if (bookingId) fetchReports();
  }, [bookingId]);

  if (loading) return <p className="text-gray-500">Loading reports...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!reports.length) return <div className="text-gray-400 m-0 text-center">No reports yet for this booking.</div>;

  const API_URL = "http://localhost:3000";

  return (
    <div className={`space-y-6${reports.length ? ' mt-4' : ''}`}>
      {reports.map((report) => (
        <div key={report.id} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-4 items-start border border-purple-100">
          {report.photo_url && (
            <img
              src={report.photo_url.startsWith('http') ? report.photo_url : `${API_URL}${report.photo_url}`}
              alt="Report"
              className="h-28 w-28 object-cover rounded-lg border-2 border-purple-100 shadow-md"
              style={{ minWidth: 80 }}
            />
          )}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              {Array.isArray(report.checklist) && report.checklist.map((item) => (
                <span key={item} className="inline-flex items-center bg-purple-50 border border-purple-200 rounded-full px-3 py-1 text-sm font-medium text-purple-700">
                  {ICONS[item] || null}{item}
                </span>
              ))}
            </div>
            {report.comment && (
              <div className="mb-2 text-gray-700">
                <span className="font-semibold">Comment:</span> {report.comment}
              </div>
            )}
            <div className="text-xs text-gray-400">
              {formatDate(report.created_at)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportList; 
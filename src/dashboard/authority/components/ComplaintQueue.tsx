import React, { useState, useEffect } from 'react';
import {
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  MapPin,
  Calendar,
  X,
  Trash2,
  ImageIcon
} from 'lucide-react';
import { ReportsService, type CivicReportItem } from '../../../services/reportsService';

interface ComplaintQueueProps {
  initialStatusFilter?: string;
  onOpenMapLocation?: (lat: number, lng: number) => void;
}

export const ComplaintQueue: React.FC<ComplaintQueueProps> = ({
  initialStatusFilter = 'All',
}) => {
  const [complaints, setComplaints] = useState<CivicReportItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [selectedComplaint, setSelectedComplaint] = useState<CivicReportItem | null>(null);

  const loadComplaints = () => {
    setComplaints(ReportsService.getReports());
  };

  useEffect(() => {
    loadComplaints();
    const handleUpdate = () => loadComplaints();
    window.addEventListener('civicfix_reports_updated', handleUpdate);
    return () => {
      window.removeEventListener('civicfix_reports_updated', handleUpdate);
    };
  }, []);

  // Filter complaints
  const filtered = complaints.filter((c) => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && !c.category.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
    if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;
    if (departmentFilter !== 'All' && !c.department.toLowerCase().includes(departmentFilter.toLowerCase())) return false;
    return true;
  });

  const handleUpdateStatus = (newStatus: CivicReportItem['status']) => {
    if (!selectedComplaint) return;
    ReportsService.updateStatus(selectedComplaint.id, newStatus);
    setSelectedComplaint((prev) => (prev ? { ...prev, status: newStatus } : null));
  };

  const handleAssignDepartment = (dept: CivicReportItem['department']) => {
    if (!selectedComplaint) return;
    const reports = ReportsService.getReports();
    const updated = reports.map((r) =>
      r.id === selectedComplaint.id ? { ...r, department: dept, status: 'Assigned' as const } : r
    );
    try {
      localStorage.setItem('civicfix_reports_data', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('civicfix_reports_updated'));
    } catch {
      // ignore
    }
    setSelectedComplaint((prev) => (prev ? { ...prev, department: dept, status: 'Assigned' } : null));
  };

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (window.confirm(`Delete complaint "${title}" permanently?`)) {
      ReportsService.deleteReport(id);
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint(null);
      }
    }
  };

  const getPriorityBadge = (priority: CivicReportItem['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
      case 'High':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: CivicReportItem['status']) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: CheckCircle2 };
      case 'In Progress':
      case 'Assigned':
        return { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: Clock };
      case 'Overdue':
        return { bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30', icon: AlertTriangle };
      case 'Rejected':
        return { bg: 'bg-slate-500/10 text-slate-500 border-slate-500/30', icon: XCircle };
      default:
        return { bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30', icon: Clock };
    }
  };

  return (
    <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] rounded-2xl p-5 shadow-sm space-y-4">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Complaint Queue
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-emerald-400 font-semibold border border-teal-500/20">
              {filtered.length} Active Records
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor, triage, assign, update, or delete civic issues across PMC municipal zones
          </p>
        </div>

        <button
          onClick={() => {
            setStatusFilter('All');
            setCategoryFilter('All');
            setPriorityFilter('All');
            setDepartmentFilter('All');
          }}
          className="text-xs font-semibold text-teal-600 dark:text-emerald-400 hover:underline self-start sm:self-auto cursor-pointer"
        >
          Reset Filters
        </button>
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 dark:bg-[#081220] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0F1E33] border border-slate-300 dark:border-[#1E355B] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="In Progress">In Progress</option>
            <option value="Overdue">Overdue</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0F1E33] border border-slate-300 dark:border-[#1E355B] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="All">All Categories</option>
            <option value="Road">Roads & Potholes</option>
            <option value="Light">Streetlights</option>
            <option value="Waste">Waste Management</option>
            <option value="Water">Water Supply</option>
            <option value="Drain">Drainage</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Priority
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0F1E33] border border-slate-300 dark:border-[#1E355B] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">🔴 Critical</option>
            <option value="High">🟠 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🔵 Low</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Department
          </label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0F1E33] border border-slate-300 dark:border-[#1E355B] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="All">All Departments</option>
            <option value="Roads">Roads & Infra</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Water">Water Dept</option>
            <option value="Electrical">Electrical</option>
            <option value="Public Works">Public Works</option>
          </select>
        </div>
      </div>

      {/* Responsive Data Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-[#081220] border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Complaint ID & Title</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
            {filtered.length > 0 ? (
              filtered.map((item) => {
                const statusBadge = getStatusBadge(item.status);
                const StatusIcon = statusBadge.icon;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#0F1E33]/60 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold font-mono text-slate-900 dark:text-white">
                        {item.trackingId}
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 font-semibold truncate max-w-[180px]">
                        {item.title}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{item.location}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                      {item.category}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                      {item.assignedTo}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        <span>{item.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                      {item.date}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedComplaint(item)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-700 text-teal-700 dark:text-emerald-300 hover:bg-teal-100 font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, item.id, item.title)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Complaint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                  No complaints matching the selected filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Complaint Detail & Status Action Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] rounded-3xl shadow-2xl p-6 space-y-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-teal-600 dark:text-emerald-400">
                  {selectedComplaint.trackingId}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedComplaint.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-[#0F1E33] text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-[#081220] rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {selectedComplaint.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-500" />
                    {selectedComplaint.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-teal-500" />
                    {selectedComplaint.reportedAgo}
                  </span>
                </div>
              </div>

              {/* Citizen info */}
              {selectedComplaint.image && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 font-mono uppercase">
                    <ImageIcon className="w-3.5 h-3.5 text-teal-500" />
                    Uploaded Photo Evidence:
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-48">
                    <img
                      src={selectedComplaint.image}
                      alt="Evidence"
                      className="w-full h-44 object-cover"
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#0F1E33]">
                  <span className="text-slate-400 block uppercase font-mono text-[9px]">Reported By</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedComplaint.citizenName}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#0F1E33]">
                  <span className="text-slate-400 block uppercase font-mono text-[9px]">Contact</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedComplaint.citizenPhone}</span>
                </div>
              </div>

              {/* Quick Status Workflow Action buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Update Official Workflow Status:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus('In Progress')}
                    className="py-2 px-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    Set In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Resolved')}
                    className="py-2 px-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Rejected')}
                    className="py-2 px-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition-colors cursor-pointer"
                  >
                    Reject Issue
                  </button>
                </div>
              </div>

              {/* Assign Department */}
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Reassign Responsible Department:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Roads & Infrastructure', 'Sanitation', 'Water Department', 'Electrical'] as const).map((dept) => (
                    <button
                      key={dept}
                      onClick={() => handleAssignDepartment(dept)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border text-left transition-colors cursor-pointer ${
                        selectedComplaint.department === dept
                          ? 'bg-teal-600 text-white border-teal-500'
                          : 'bg-slate-100 dark:bg-[#0F1E33] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-500'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={(e) => handleDelete(e, selectedComplaint.id, selectedComplaint.title)}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Complaint</span>
              </button>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#0F1E33] text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

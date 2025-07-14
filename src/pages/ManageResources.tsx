import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  FileText, 
  UserCog, 
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Shield,
  CreditCard
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

// Define interfaces for our data types
interface SpecialAccessRequest {
  id: number;
  userName: string;
  userEmail: string;
  requestType: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface RolePermissionRequest {
  id: number;
  userName: string;
  userEmail: string;
  currentRole: string;
  requestedRole: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface FinanceRequest {
  id: number;
  userName: string;
  userEmail: string;
  requestType: string;
  amount: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

type View = 'special-access' | 'roles-permissions' | 'finances';

export default function ManageResources() {
  const navigate = useNavigate();
  const { hasSpecialPermissions } = useUser();
  
  // State for data
  const [specialAccessRequests, setSpecialAccessRequests] = useState<SpecialAccessRequest[]>([]);
  const [rolePermissionRequests, setRolePermissionRequests] = useState<RolePermissionRequest[]>([]);
  const [financeRequests, setFinanceRequests] = useState<FinanceRequest[]>([]);
  
  // State for UI
  const [currentView, setCurrentView] = useState<View>('special-access');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<{type: string, id: number, action: 'approve' | 'reject'} | null>(null);

  // Redirect if user doesn't have special permissions
  useEffect(() => {
    if (!hasSpecialPermissions) {
      navigate('/teacher/dashboard');
    }
  }, [hasSpecialPermissions, navigate]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real app, these would be API calls to fetch real data
      // For now, we'll use mock data
      
      // Mock special access requests
      const mockSpecialAccessRequests: SpecialAccessRequest[] = [
        {
          id: 1,
          userName: 'John Smith',
          userEmail: 'john.smith@example.com',
          requestType: 'Admin Dashboard Access',
          requestDate: '2025-03-15',
          status: 'pending'
        },
        {
          id: 2,
          userName: 'Sarah Johnson',
          userEmail: 'sarah.johnson@example.com',
          requestType: 'Content Management Access',
          requestDate: '2025-03-16',
          status: 'approved'
        },
        {
          id: 3,
          userName: 'Michael Brown',
          userEmail: 'michael.brown@example.com',
          requestType: 'User Management Access',
          requestDate: '2025-03-17',
          status: 'rejected'
        },
        {
          id: 4,
          userName: 'Emily Davis',
          userEmail: 'emily.davis@example.com',
          requestType: 'Admin Dashboard Access',
          requestDate: '2025-03-18',
          status: 'pending'
        },
        {
          id: 5,
          userName: 'David Wilson',
          userEmail: 'david.wilson@example.com',
          requestType: 'Content Management Access',
          requestDate: '2025-03-19',
          status: 'pending'
        }
      ];
      
      // Mock role permission requests
      const mockRolePermissionRequests: RolePermissionRequest[] = [
        {
          id: 1,
          userName: 'Lisa Anderson',
          userEmail: 'lisa.anderson@example.com',
          currentRole: 'Teacher',
          requestedRole: 'Admin',
          requestDate: '2025-03-15',
          status: 'pending'
        },
        {
          id: 2,
          userName: 'Robert Taylor',
          userEmail: 'robert.taylor@example.com',
          currentRole: 'Learner',
          requestedRole: 'Teacher',
          requestDate: '2025-03-16',
          status: 'approved'
        },
        {
          id: 3,
          userName: 'Jennifer Martinez',
          userEmail: 'jennifer.martinez@example.com',
          currentRole: 'Parent',
          requestedRole: 'Teacher',
          requestDate: '2025-03-17',
          status: 'rejected'
        }
      ];
      
      // Mock finance requests
      const mockFinanceRequests: FinanceRequest[] = [
        {
          id: 1,
          userName: 'Thomas White',
          userEmail: 'thomas.white@example.com',
          requestType: 'Refund',
          amount: 150.00,
          requestDate: '2025-03-15',
          status: 'pending'
        },
        {
          id: 2,
          userName: 'Jessica Lee',
          userEmail: 'jessica.lee@example.com',
          requestType: 'Payment Extension',
          amount: 300.00,
          requestDate: '2025-03-16',
          status: 'approved'
        }
      ];
      
      setSpecialAccessRequests(mockSpecialAccessRequests);
      setRolePermissionRequests(mockRolePermissionRequests);
      setFinanceRequests(mockFinanceRequests);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load resource management data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = (type: string, id: number, action: 'approve' | 'reject') => {
    // In a real app, this would make an API call to update the status
    if (type === 'special-access') {
      setSpecialAccessRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, status: action === 'approve' ? 'approved' : 'rejected' } 
            : request
        )
      );
    } else if (type === 'role-permission') {
      setRolePermissionRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, status: action === 'approve' ? 'approved' : 'rejected' } 
            : request
        )
      );
    } else if (type === 'finance') {
      setFinanceRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, status: action === 'approve' ? 'approved' : 'rejected' } 
            : request
        )
      );
    }
    
    toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    setShowModal(null);
  };

  // Filter data based on search term and status filter
  const filteredSpecialAccessRequests = specialAccessRequests.filter(request => {
    const matchesSearch = 
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const filteredRolePermissionRequests = rolePermissionRequests.filter(request => {
    const matchesSearch = 
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.currentRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestedRole.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const filteredFinanceRequests = financeRequests.filter(request => {
    const matchesSearch = 
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch(status) {
      case 'pending':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            <span>Approved</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
            <XCircle className="h-3 w-3" />
            <span>Rejected</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading resource management data...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Navigation */}
      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <Users className="h-8 w-8" />
              <span className="text-xl font-bold">What-If Community</span>
            </Link>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl font-bold text-white">Manage Resources</h1>
            </div>
            
            <Link 
              to="/special/management"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Management</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Resource Management Platform</h2>
          <p className="text-xl text-gray-200">
            Manage special access requests, roles and permissions, and financial requests
          </p>
        </div>

        {/* View Selection Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setCurrentView('special-access')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              currentView === 'special-access'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Shield className="h-5 w-5" />
            <span>Special Access Requests</span>
          </button>
          
          <button
            onClick={() => setCurrentView('roles-permissions')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              currentView === 'roles-permissions'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <UserCog className="h-5 w-5" />
            <span>Roles & Permissions</span>
          </button>
          
          <button
            onClick={() => setCurrentView('finances')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              currentView === 'finances'
                ? 'bg-emerald-600/80 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <DollarSign className="h-5 w-5" />
            <span>Finance Requests</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                statusFilter === 'all'
                  ? 'bg-emerald-600/80 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-emerald-600/80 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600/80 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                statusFilter === 'rejected'
                  ? 'bg-emerald-600/80 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Rejected
            </button>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
            />
          </div>
        </div>

        {/* Special Access Requests View */}
        {currentView === 'special-access' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Special Access Requests</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-white">User</th>
                    <th className="text-left p-4 text-white">Request Type</th>
                    <th className="text-left p-4 text-white">Date</th>
                    <th className="text-left p-4 text-white">Status</th>
                    <th className="text-left p-4 text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSpecialAccessRequests.length > 0 ? (
                    filteredSpecialAccessRequests.map(request => (
                      <tr key={request.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{request.userName}</p>
                            <p className="text-sm text-gray-400">{request.userEmail}</p>
                          </div>
                        </td>
                        <td className="p-4 text-white">{request.requestType}</td>
                        <td className="p-4 text-white">{request.requestDate}</td>
                        <td className="p-4">{getStatusBadge(request.status)}</td>
                        <td className="p-4">
                          {request.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setShowModal({ type: 'special-access', id: request.id, action: 'approve' })}
                                className="px-3 py-1 bg-emerald-600/80 text-white rounded-lg text-sm hover:bg-emerald-500 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setShowModal({ type: 'special-access', id: request.id, action: 'reject' })}
                                className="px-3 py-1 bg-red-600/80 text-white rounded-lg text-sm hover:bg-red-500 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400">
                        No special access requests found. {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters.' : ''}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Roles & Permissions View */}
        {currentView === 'roles-permissions' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Roles & Permissions Requests</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-white">User</th>
                    <th className="text-left p-4 text-white">Current Role</th>
                    <th className="text-left p-4 text-white">Requested Role</th>
                    <th className="text-left p-4 text-white">Date</th>
                    <th className="text-left p-4 text-white">Status</th>
                    <th className="text-left p-4 text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRolePermissionRequests.length > 0 ? (
                    filteredRolePermissionRequests.map(request => (
                      <tr key={request.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{request.userName}</p>
                            <p className="text-sm text-gray-400">{request.userEmail}</p>
                          </div>
                        </td>
                        <td className="p-4 text-white">{request.currentRole}</td>
                        <td className="p-4 text-white">{request.requestedRole}</td>
                        <td className="p-4 text-white">{request.requestDate}</td>
                        <td className="p-4">{getStatusBadge(request.status)}</td>
                        <td className="p-4">
                          {request.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setShowModal({ type: 'role-permission', id: request.id, action: 'approve' })}
                                className="px-3 py-1 bg-emerald-600/80 text-white rounded-lg text-sm hover:bg-emerald-500 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setShowModal({ type: 'role-permission', id: request.id, action: 'reject' })}
                                className="px-3 py-1 bg-red-600/80 text-white rounded-lg text-sm hover:bg-red-500 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400">
                        No role and permission requests found. {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters.' : ''}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Finances View */}
        {currentView === 'finances' && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Finance Requests</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-white">User</th>
                    <th className="text-left p-4 text-white">Request Type</th>
                    <th className="text-left p-4 text-white">Amount</th>
                    <th className="text-left p-4 text-white">Date</th>
                    <th className="text-left p-4 text-white">Status</th>
                    <th className="text-left p-4 text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFinanceRequests.length > 0 ? (
                    filteredFinanceRequests.map(request => (
                      <tr key={request.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{request.userName}</p>
                            <p className="text-sm text-gray-400">{request.userEmail}</p>
                          </div>
                        </td>
                        <td className="p-4 text-white">{request.requestType}</td>
                        <td className="p-4 text-white">${request.amount.toFixed(2)}</td>
                        <td className="p-4 text-white">{request.requestDate}</td>
                        <td className="p-4">{getStatusBadge(request.status)}</td>
                        <td className="p-4">
                          {request.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setShowModal({ type: 'finance', id: request.id, action: 'approve' })}
                                className="px-3 py-1 bg-emerald-600/80 text-white rounded-lg text-sm hover:bg-emerald-500 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setShowModal({ type: 'finance', id: request.id, action: 'reject' })}
                                className="px-3 py-1 bg-red-600/80 text-white rounded-lg text-sm hover:bg-red-500 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400">
                        No finance requests found. {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters.' : ''}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(null)}
          />
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {showModal.action === 'approve' ? 'Approve Request' : 'Reject Request'}
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to {showModal.action} this request? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(null)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveReject(showModal.type, showModal.id, showModal.action)}
                className={`px-4 py-2 ${
                  showModal.action === 'approve' 
                    ? 'bg-emerald-600/80 hover:bg-emerald-500' 
                    : 'bg-red-600/80 hover:bg-red-500'
                } text-white rounded-lg transition-colors`}
              >
                {showModal.action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
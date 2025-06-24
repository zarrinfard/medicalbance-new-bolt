import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Search, Filter, Eye, CheckCircle, XCircle, FileText, Globe, Phone, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DoctorProfile, Document } from '../lib/supabase';

interface DoctorWithDocuments extends DoctorProfile {
  documents: Document[];
}

const AdminDashboard: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorWithDocuments[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorWithDocuments[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithDocuments | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const { data: doctorsData, error } = await supabase
        .from('doctor_profiles')
        .select(`
          *,
          documents (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDoctors(doctorsData || []);
      setFilteredDoctors(doctorsData || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on search and status
  useEffect(() => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialties.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.nationality.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'approved') {
        filtered = filtered.filter(doctor => doctor.is_approved);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(doctor => !doctor.is_approved);
      }
    }

    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, statusFilter]);

  const handleApprove = async (doctorId: string) => {
    try {
      const { error } = await supabase
        .from('doctor_profiles')
        .update({ is_approved: true })
        .eq('id', doctorId);

      if (error) throw error;

      await loadDoctors();
      setShowModal(false);
      setSelectedDoctor(null);
    } catch (error) {
      console.error('Error approving doctor:', error);
    }
  };

  const handleReject = async (doctorId: string) => {
    try {
      const { error } = await supabase
        .from('doctor_profiles')
        .update({ is_approved: false })
        .eq('id', doctorId);

      if (error) throw error;

      await loadDoctors();
      setShowModal(false);
      setSelectedDoctor(null);
    } catch (error) {
      console.error('Error rejecting doctor:', error);
    }
  };

  const openDoctorModal = (doctor: DoctorWithDocuments) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Approved</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
    }
  };

  const stats = {
    total: doctors.length,
    pending: doctors.filter(d => !d.is_approved).length,
    approved: doctors.filter(d => d.is_approved).length,
    rejected: 0 // We don't have a rejected status in the current schema
  };

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Doctors</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending Approval</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-500">Approved</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-500">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, specialty, or nationality..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialties</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {doctor.profile_image_url ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={doctor.profile_image_url} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm text-gray-700">{doctor.first_name[0]}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{doctor.first_name} {doctor.last_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.phone}</div>
                      <div className="text-sm text-gray-500">{doctor.nationality}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{doctor.specialties}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(doctor.is_approved)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doctor.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openDoctorModal(doctor)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!doctor.is_approved && (
                        <>
                          <button
                            onClick={() => handleApprove(doctor.id)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(doctor.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No doctors found matching your criteria.</div>
            </div>
          )}
        </div>

        {/* Doctor Detail Modal */}
        {showModal && selectedDoctor && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Doctor Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Profile Section */}
                  <div className="flex items-start space-x-4">
                    {selectedDoctor.profile_image_url ? (
                      <img 
                        className="h-20 w-20 rounded-full object-cover" 
                        src={selectedDoctor.profile_image_url} 
                        alt="" 
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xl text-gray-700">{selectedDoctor.first_name[0]}</span>
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {selectedDoctor.first_name} {selectedDoctor.last_name}
                      </h4>
                      <div className="mt-2">{getStatusBadge(selectedDoctor.is_approved)}</div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedDoctor.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedDoctor.nationality}</span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Medical Specialties</h5>
                    <p className="text-sm text-gray-600">{selectedDoctor.specialties}</p>
                  </div>

                  {/* Bio */}
                  {selectedDoctor.bio && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Bio</h5>
                      <p className="text-sm text-gray-600">{selectedDoctor.bio}</p>
                    </div>
                  )}

                  {/* Website & Social Media */}
                  {(selectedDoctor.website || selectedDoctor.social_media) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedDoctor.website && (
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a 
                            href={selectedDoctor.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {selectedDoctor.website}
                          </a>
                        </div>
                      )}
                      {selectedDoctor.social_media && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{selectedDoctor.social_media}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Documents */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Uploaded Documents</h5>
                    <div className="space-y-2">
                      {selectedDoctor.documents?.map((doc) => (
                        <div key={doc.id} className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{doc.file_name}</span>
                        </div>
                      ))}
                      {(!selectedDoctor.documents || selectedDoctor.documents.length === 0) && (
                        <p className="text-sm text-gray-500">No documents uploaded</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {!selectedDoctor.is_approved && (
                    <div className="flex space-x-4 pt-4 border-t">
                      <button
                        onClick={() => handleApprove(selectedDoctor.id)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Approve Doctor
                      </button>
                      <button
                        onClick={() => handleReject(selectedDoctor.id)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Reject Application
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
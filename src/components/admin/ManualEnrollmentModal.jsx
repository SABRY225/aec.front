import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { adminService } from '../../services/new-api';
import { XMarkIcon, UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const ManualEnrollmentModal = ({ isOpen, onClose, courseId, onEnrollSuccess }) => {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [reason, setReason] = useState('');
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setSearching(true);
        setError('');
        try {
            // using adminService.getUsers and passing searchQuery
            const response = await adminService.getUsers({ search: searchQuery, role: 'student', limit: 5 });
            setSearchResults(response.users || []);
            if (response.users?.length === 0) {
                setError('No students found matching your search.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to search users.');
        } finally {
            setSearching(false);
        }
    };

    const handleEnroll = async () => {
        if (!selectedUser) return;
        
        setEnrolling(true);
        setError('');
        try {
            await adminService.manualEnrollUserToCourse({
                userId: selectedUser._id,
                courseId,
                reason
            });
            onEnrollSuccess(selectedUser);
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to enroll student.');
        } finally {
            setEnrolling(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <UserPlusIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        Manual Enrollment
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-800/50">
                            {error}
                        </div>
                    )}

                    {!selectedUser ? (
                        <>
                            <form onSubmit={handleSearch} className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Search Student
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name, email, or phone..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-all"
                                    />
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={searching || !searchQuery.trim()}
                                    className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                                >
                                    {searching ? 'Searching...' : 'Search'}
                                </button>
                            </form>

                            {searchResults.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Search Results</h4>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                        {searchResults.map(user => (
                                            <div 
                                                key={user._id} 
                                                onClick={() => setSelectedUser(user)}
                                                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all flex items-center gap-3"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                                                    {user.firstName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold">
                                        {selectedUser.firstName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedUser.firstName} {selectedUser.lastName}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedUser(null)}
                                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                                >
                                    Change
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Reason for Manual Enrollment (Optional)
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="e.g., Paid via bank transfer, scholarship..."
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white min-h-[100px] resize-none transition-all"
                                ></textarea>
                            </div>
                        </div>
                    )}
                </div>

                {selectedUser && (
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEnroll}
                            disabled={enrolling}
                            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                            {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManualEnrollmentModal;

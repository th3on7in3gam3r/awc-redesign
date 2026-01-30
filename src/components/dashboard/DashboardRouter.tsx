import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardType } from '../../utils/navigation';

/**
 * Dashboard Router
 * Routes users to appropriate dashboard based on their role
 * 
 * TODO: Create specialized dashboard variants:
 * - ExecutiveDashboard (pastor, first_lady)
 * - OperationsDashboard (administrator)
 * - FinanceDashboard (finance)
 * - MinistryDashboard (ministry_leader)
 * - CheckinDashboard (checkin_team)
 */
export const DashboardRouter: React.FC = () => {
    const { user } = useAuth();

    if (!user) return null;

    const dashboardType = getDashboardType(user.role);

    // For now, show role-specific message until specialized dashboards are created
    return (
        <div className="p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {dashboardType.charAt(0).toUpperCase() + dashboardType.slice(1)} Dashboard
                </h1>
                <p className="text-gray-600">
                    Welcome, <span className="font-semibold">{user.name}</span> ({user.role})
                </p>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        🚧 Your personalized <strong>{dashboardType}</strong> dashboard is being prepared.
                        You have access to all features based on your role permissions.
                    </p>
                </div>
            </div>

            {/* Role-specific quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Your Role</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Dashboard Type</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2 capitalize">{dashboardType}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Access Level</h3>
                    <p className="text-2xl font-bold text-green-600 mt-2">Active</p>
                </div>
            </div>
        </div>
    );
};

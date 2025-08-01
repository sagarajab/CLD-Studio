import React, { useState, useEffect } from 'react';
import { getDataClient } from '../config/dataClientConfig';

const TBTUserAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    email: '',
    cognitoUserId: '',
    tbtAuthStatus: 'guest',
    accessLevel: 'guest'
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const dataClient = getDataClient();
      const { data } = await dataClient.models.TBTUser.list({
        limit: 100
      });
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const now = new Date().toISOString();
      const dataClient = getDataClient();
      const { data } = await dataClient.models.TBTUser.create({
        input: {
          ...newUser,
          amplifyAuthVerified: true,
          createdAt: now,
          lastLoginAt: now,
          lastActiveAt: now,
          currentSessionStart: now,
          totalLogins: 0,
          consecutiveLogins: 0,
          lastLoginStreak: 0,
          totalActiveTime: 0,
          totalIdleTime: 0,
          currentSessionActiveTime: 0,
          assignmentsCompleted: 0,
          assignmentsInProgress: 0,
          totalAssignmentScore: 0.0,
          averageAssignmentScore: 0.0,
          highestAssignmentScore: 0.0,
          diagramsCreated: 0,
          diagramsShared: 0,
          simulationsRun: 0,
          loopsIdentified: 0,
          learningLevel: 'beginner',
          skillsUnlocked: JSON.stringify([]),
          achievements: JSON.stringify([]),
          preferences: JSON.stringify({
            theme: 'light',
            autoSave: true,
            showGrid: true
          }),
          metadata: JSON.stringify({
            createdVia: 'admin_interface',
            source: 'manual_creation'
          })
        }
      });
      
      setUsers([...users, data]);
      setNewUser({ email: '', cognitoUserId: '', tbtAuthStatus: 'guest', accessLevel: 'guest' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const updateUserAccess = async (userId, newAccessLevel, newAuthStatus) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const dataClient = getDataClient();
      const { data } = await dataClient.models.TBTUser.update({
        input: {
          id: userId,
          accessLevel: newAccessLevel,
          tbtAuthStatus: newAuthStatus
        }
      });

      setUsers(users.map(u => u.id === userId ? data : u));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (loading) return <div className="p-4">Loading users...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">TBT User Management</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showCreateForm ? 'Cancel' : 'Add New User'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-gray-50 p-4 rounded mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New TBT User</h2>
          <form onSubmit={createUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cognito User ID</label>
                <input
                  type="text"
                  value={newUser.cognitoUserId}
                  onChange={(e) => setNewUser({...newUser, cognitoUserId: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Auth Status</label>
                <select
                  value={newUser.tbtAuthStatus}
                  onChange={(e) => setNewUser({...newUser, tbtAuthStatus: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="guest">Guest</option>
                  <option value="tbt">TBT</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Access Level</label>
                <select
                  value={newUser.accessLevel}
                  onChange={(e) => setNewUser({...newUser, accessLevel: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="guest">Guest</option>
                  <option value="tbt">TBT</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Create User
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auth Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logins</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.tbtAuthStatus === 'tbt' ? 'bg-green-100 text-green-800' :
                    user.tbtAuthStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.tbtAuthStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    value={user.accessLevel || 'guest'}
                    onChange={(e) => updateUserAccess(user.id, e.target.value, user.tbtAuthStatus)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="guest">Guest</option>
                    <option value="tbt">TBT</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.totalLogins || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => updateUserAccess(user.id, user.accessLevel, 'tbt')}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    Authorize TBT
                  </button>
                  <button
                    onClick={() => updateUserAccess(user.id, user.accessLevel, 'pending')}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    Pending
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Total Users: {users.length}
      </div>
    </div>
  );
};

export default TBTUserAdmin; 
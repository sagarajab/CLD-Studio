import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';

const TBTRegisteredStudentsAdmin = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');

  const client = generateClient();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const { data } = await client.models.TBTRegisteredStudents.list({
        limit: 1000
      });
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      const { data } = await client.models.TBTRegisteredStudents.create({
        input: {
          email: newEmail.trim()
        }
      });
      
      setStudents([...students, data]);
      setNewEmail('');
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student: ' + error.message);
    }
  };

  const addBulkStudents = async (e) => {
    e.preventDefault();
    if (!bulkEmails.trim()) return;

    const emails = bulkEmails.split('\n').map(email => email.trim()).filter(email => email);
    
    try {
      for (const email of emails) {
        await client.models.TBTRegisteredStudents.create({
          input: { email }
        });
      }
      
      setBulkEmails('');
      loadStudents(); // Reload the list
      alert(`Successfully added ${emails.length} students`);
    } catch (error) {
      console.error('Error adding bulk students:', error);
      alert('Error adding bulk students: ' + error.message);
    }
  };

  const removeStudent = async (studentId) => {
    if (!confirm('Are you sure you want to remove this student?')) return;

    try {
      await client.models.TBTRegisteredStudents.delete({
        input: { id: studentId }
      });
      
      setStudents(students.filter(s => s.id !== studentId));
    } catch (error) {
      console.error('Error removing student:', error);
      alert('Error removing student: ' + error.message);
    }
  };

  if (loading) {
    return <div className="p-4">Loading students...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">TBT Registered Students Management</h2>
      
      {/* Add Single Student */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Add Single Student</h3>
        <form onSubmit={addStudent} className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter student email"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Student
          </button>
        </form>
      </div>

      {/* Bulk Import */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Bulk Import Students</h3>
        <form onSubmit={addBulkStudents}>
          <textarea
            value={bulkEmails}
            onChange={(e) => setBulkEmails(e.target.value)}
            placeholder="Enter email addresses (one per line)"
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Import Students
          </button>
        </form>
      </div>

      {/* Students List */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          Registered Students ({students.length})
        </h3>
        
        {students.length === 0 ? (
          <p className="text-gray-500">No students registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => removeStudent(student.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TBTRegisteredStudentsAdmin; 
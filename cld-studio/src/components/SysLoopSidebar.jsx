import React, { useState } from 'react'

function SysLoopSidebar({ mode, loops }) {
  const [problemStatement, setProblemStatement] = useState('Describe the problem here...')

  return (
    <div className="sysloop-sidebar">
      {/* Problem Statement Section */}
      <div className="sidebar-section">
        <div className="section-title">Problem Statement</div>
        <textarea
          className="problem-textarea"
          value={problemStatement}
          onChange={(e) => setProblemStatement(e.target.value)}
          placeholder="Describe the problem here..."
        />
      </div>

      {/* Loops Section */}
      <div className="sidebar-section">
        <div className="section-title">Loops</div>
        {loops.length === 0 ? (
          <div className="no-loops">No loops found.</div>
        ) : (
          <table className="loops-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Length</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {loops.map((loop, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{loop.length}</td>
                  <td>
                    <span className={`loop-type ${loop.type.toLowerCase()}`}>
                      {loop.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default SysLoopSidebar 
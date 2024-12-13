//client\src\pages\DashboardPage.tsx
import { useUser, useClerk } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  lastEdited: string;
}

const DashboardPage = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: 'Project 1', lastEdited: '2024-03-20' },
    { id: '2', name: 'Project 2', lastEdited: '2024-03-19' },
  ]);

  const handleNewProject = () => {
    navigate('/editor/new');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="relative">
            <div 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-4 cursor-pointer"
            >
              <span className="text-gray-700">{user?.fullName}</span>
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                {user?.firstName?.[0] || 'U'}
              </div>
            </div>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div 
              key={project.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/editor/${project.id}`)}
            >
              <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
              <p className="text-sm text-gray-500 mt-2">Last edited: {project.lastEdited}</p>
            </div>
          ))}

          <div 
            onClick={handleNewProject}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="h-12 w-12 mx-auto rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="mt-2 block text-sm font-medium text-gray-900">Create New Project</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
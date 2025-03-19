"use client";
import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../components/teams/Sidebar';
import PlayerForm from '@/app/components/coach/PlayerForm';
import { showError, showSuccess } from '@/app/components/Toastr';
import { FaSpinner } from 'react-icons/fa';
import defaultImage from '../../public/default.jpg';
// Define the type for the coach data
interface Coach {
  id: number;
  image: string;
  first_name: string;
  last_name: string;
  email: string;
  number: string;
  countrycode: string;
  gender: string;
  sport: string;
  expectedCharge: string;
  status:string;
  position: string;
  team: string;
}

const Home: React.FC = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedCoach, setSelectedCoach] =useState<Coach | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showLicenseNoModal, setShowLicenseNoModal] = useState<boolean>(false);
  const [licenseKey, setLicenseKey] = useState<string>('');
  const limit = 10; // Items per page
  const [loadingKey, setLoadingKey] = useState<boolean>(false);
  const { data: session } = useSession();

  const fetchCoaches = async (page = 1, searchQuery = '') => {
    setLoading(true);

    try {
      const session = await getSession();
      const enterpriseId = session?.user?.club_id;
      const teamId = session?.user?.id;

      if (!enterpriseId) {
        console.error('Enterprise ID not found in session');
        return;
      }

      const response = await fetch(
        `/api/enterprise/player/signup?enterprise_id=${enterpriseId}&teamId=${teamId}&page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
      
      );

      if (!response.ok) {
        console.error('Failed to fetch coaches');
        return;
      }

      const data = await response.json();
      setCoaches(data.players);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleLicenseKeySubmit = async () => {
    try {
      const session = await getSession();
      const enterpriseId = session?.user?.id;

      if (!enterpriseId || !selectedCoach) {
        console.error('Missing required data');
        return;
      }

      const response = await fetch('/api/enterprise/player/updatestatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coach_id: selectedCoach.id,
          licenseKey: licenseKey,
         
          
        }),
      });

      if (response.ok) {
        showSuccess('License assigned successfully');
        fetchCoaches(currentPage, search);
        setShowLicenseNoModal(false);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Failed to Change Status';
        showError(errorMessage);
        setShowLicenseNoModal(true);
      }
    } catch (error) {
      console.error('Error assigning license:', error);
    } finally {
     
      setLicenseKey('');
    }
  };
  useEffect(() => {
    fetchCoaches(currentPage, search);
  }, [currentPage, search]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddCoachClick = () => {
    setShowModal(true); // Open the modal
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };
  const handleEnterLicense = (coach: Coach) => {
    handleLoadLicense();
    setSelectedCoach(coach);
    setShowLicenseNoModal(true);
  };
  const handleSubmitCoachForm = async (formData: any) => {
    try {
      const response = await fetch('/api/enterprise/player/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      fetchCoaches(currentPage, search);
      if (response.ok) {
        
         fetchCoaches(currentPage, search);  // Refresh data table
      } else {
        console.error('Failed to add Player');
      }
    } catch (error) {
      console.error('Error adding Player:', error);
    } finally {
      setShowModal(false);
    }
  };

  const handleLoadLicense = async () => {
        
    try {
        setLoadingKey(true);
        const userId= session?.user.id; 
        const response = await fetch("/api/fetchlicense", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId:userId,
                type:"Enterprise",
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch license");
        }
        setLoadingKey(false);
        const data = await response.json();
        setLicenseKey(data.licenseKey);
       
    } catch (error) {
        console.error("Error fetching license:", error);
        alert("Failed to assign license");
    }
};
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-auto">
        <div className="bg-white shadow-md rounded-lg p-6 h-auto">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search..."
              className="w-1/3 mb-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={handleSearchChange}
            />
            <button
              onClick={handleAddCoachClick}
              className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-700 rounded-lg"
            >
              Add Player
            </button>
          </div>

        
            <table className="w-full text-sm text-left text-gray-700 mt-4">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Sport</th>
                  <th>Team</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              {loading ? (
                 <tbody>
             <tr>
                  <th colSpan={9}>Loading....</th>
                  </tr>
                  </tbody>
          ) : (
              <tbody>
                {coaches.length > 0 ? (
                  coaches.map((coach) => (
                    <tr key={coach.id}>
                      <td className='text-center'> 
                      {coach.image === null || coach.image === '' ? (
                          <img
                            src={defaultImage.src}
                            className="rounded-full w-32 h-32 object-cover m-auto"
                            alt={`${coach.first_name} ${coach.last_name}`}
                          />
                        ) : (
                      <img
    src={coach.image} // Use defaultImage if coach.image is null or empty
    className="rounded-full w-32 h-32 object-cover m-auto"
    alt={`${coach.first_name} ${coach.last_name}`}
  />)}
                        {coach.first_name} {coach.last_name}</td>
                      <td>{coach.gender}</td>
                      <td>{coach.email}</td>
                      <td>{coach.countrycode}{coach.number}</td>
                      <td>{coach.sport}</td>
                      <td>{coach.team}</td>
                      <td>{coach.position}</td>
                      <td>{coach.status === 'Inactive' ? (
    <button className='bg-red px-4 py-2 rounded bg-red-500 text-white' onClick={() => handleEnterLicense(coach)}>
      {coach.status}
    </button>
  ) : (
    <button className='bg-red px-4 py-2 rounded bg-green-500 text-white'>
      {coach.status}
    </button>
  )}</td>
                      <td>

                        <a href={`/coach/${coach.id}`} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75" target='_blank'>Delete</a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>No Players added yet...</td>
                  </tr>
                )}
              </tbody>
               )}
            </table>
         

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-500'
              }`}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 text-sm ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-500'
              }`}
            >
              Next
            </button>
          </div>
        </div>
        {showLicenseNoModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg w-96">
              <h2 className="text-2xl font-semibold mb-4">Enter License Key</h2>
              <input
                type="text"
                className="w-full p-2 border rounded-lg mb-4"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="Enter License Key"
              />
                 {loadingKey ? (
                                            <>
                                                <p><FaSpinner className="animate-spin mr-2" /> Finding Key...</p>
                                            </>
                                        ) : (
                                            <>
                                               
                                            </>
                                        )}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowLicenseNoModal(false)}
                  className="px-4 py-2 bg-gray-300 text-black rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLicenseKeySubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg w-11/12 max-h-[100vh] overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 bg-white p-4 flex justify-between items-center border-b">
                <h2 className="text-2xl font-semibold text-gray-800">Add Player</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-xl text-gray-600 hover:text-gray-900"
                >
                  &times;
                </button>
              </div>
              <div className="pt-16 pb-4 overflow-y-auto max-h-[70vh]">
                <PlayerForm onSubmit={handleSubmitCoachForm} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;

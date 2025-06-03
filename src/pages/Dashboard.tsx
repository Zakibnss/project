import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { Association, Member, Competition } from '../types/database';
import { Plus, Users, Trophy } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [association, setAssociation] = useState<Association | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        // Load association
        const { data: assocData } = await supabase
          .from('associations')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setAssociation(assocData);

        if (assocData) {
          // Load members
          const { data: membersData } = await supabase
            .from('members')
            .select('*')
            .eq('association_id', assocData.id);
          
          setMembers(membersData || []);
        }

        // Load competitions
        const { data: competitionsData } = await supabase
          .from('competitions')
          .select('*')
          .gte('registration_deadline', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true });
        
        setCompetitions(competitionsData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Association Info */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Association</dt>
                      <dd className="text-lg font-medium text-gray-900">{association?.name || 'Loading...'}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-gray-400" />
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Members</h3>
                  </div>
                  <button className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flow-root">
                    <ul className="-my-4 divide-y divide-gray-200">
                      {members.map((member) => (
                        <li key={member.id} className="py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {member.first_name} {member.last_name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {member.type.charAt(0).toUpperCase() + member.type.slice(1)}
                                {member.grade && ` • Grade: ${member.grade}`}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Competitions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <Trophy className="h-6 w-6 text-gray-400" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Upcoming Competitions</h3>
                </div>
                <div className="mt-4">
                  <div className="flow-root">
                    <ul className="-my-4 divide-y divide-gray-200">
                      {competitions.map((competition) => (
                        <li key={competition.id} className="py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {competition.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {new Date(competition.date).toLocaleDateString()}
                                {' • '}
                                {competition.location}
                              </p>
                              <p className="text-xs text-gray-400">
                                Registration deadline: {new Date(competition.registration_deadline).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
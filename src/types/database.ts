export interface Association {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  type: 'adherent' | 'coach' | 'referee';
  grade?: string;
  association_id: string;
  created_at: string;
}

export interface Competition {
  id: string;
  name: string;
  date: string;
  location: string;
  registration_deadline: string;
  created_at: string;
}

export interface CompetitionRegistration {
  id: string;
  competition_id: string;
  member_id: string;
  weight: number;
  created_at: string;
}

export interface CompetitionResult {
  id: string;
  competition_id: string;
  poule_name: string;
  first_place_member_id?: string;
  second_place_member_id?: string;
  third_place_member_id?: string;
  fourth_place_member_id?: string;
  created_at: string;
}
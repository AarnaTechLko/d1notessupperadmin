// types/next-auth.d.ts
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // Add custom `id` field
      type: string; // Add custom `type` field (coach or player)
      name?: string | null;
      email?: string | null;
      image?: string | null;
      package_id?: string | null;
      club_id?: string | null;
      coach_id?: string | null;
      expectedCharge?: string | null;
      club_name?: string | null;
      added_by?: string | null;
      coachCurrency?: string | null;
      visibility?: string | null;
      teamId?: string | null;
      view_evaluation?: string | null;
      buy_evaluation?: string | null;
    }
  }
}

import React from 'react';
import { Subscription } from '@/lib/supabase/supabase.types';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import db from '@/lib/supabase/db';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import ModeToggle from '../global/mode-toggle';
import { LogOut, UserIcon } from 'lucide-react';
import LogoutButton from '../global/logout-button';

interface UserCardProps {
  subscription: Subscription | null;
}

const UserCard: React.FC<UserCardProps> = async ({ subscription }) => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;
  const response = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, user.id),
  });
  let avatarPath;
  if (!response) return;
  if (!response.avatarUrl) avatarPath = '';
  
  else {
    avatarPath = supabase.storage
      .from('avatars')
      .getPublicUrl(response.avatarUrl)?.data.publicUrl;
  }
  const profile = {
    ...response,
    avatarUrl: avatarPath,
  };
  console.log(avatarPath);

  return (
    <article
      className="hidden
      sm:flex 
      justify-between 
      items-center 
      px-4 
      py-2 
      
      dark:bg-Neutrals/neutrals-12
      rounded-3xl
  "
    >
      <aside className="flex justify-center items-center gap-2">
        <Avatar>
          <AvatarImage src={profile.avatarUrl} />
          <AvatarFallback>
            <UserIcon/>
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-foreground">
            {subscription?.status === 'active' ? 'Pro Plan' : 'Free Plan'}
          </span>
          <small
            className="w-[100px] 
          overflow-hidden 
          text-Neutrals/neutrals-7
          overflow-ellipsis
          "
          >
            {profile.email}
          </small>
        </div>
      </aside>
      <div className="flex items-center justify-center">
        <LogoutButton>
          <LogOut />
        </LogoutButton>
        <ModeToggle />
      </div>
    </article>
  );
};

export default UserCard;
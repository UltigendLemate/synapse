import { getCollaboratingWorkspaces, getFolders, getPrivateWorkspaces, getSharedWorkspaces, getUserSubscriptionStatus } from '@/lib/supabase/queries';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react'
import { twMerge } from 'tailwind-merge';
import WorkspaceDropdown from './workspace-dropdown';
import PlanUsage from './plan-usage';
import NativeNavigation from './native-navigation';
import { ScrollArea } from '../ui/scroll-area';
import FoldersDropdownList from './folders-dropdown-list';
import ModeToggle from '../global/mode-toggle';
import LogoutButton from '../global/logout-button';


interface SidebarProps {
    params: { workspaceId: string };
    className?: string;

}

const Sidebar: React.FC<SidebarProps> = async ({ params, className }) => {
    const supabase = createServerComponentClient({ cookies });
    //user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    //subscr
    const { data: subscriptionData, error: subscriptionError } = await getUserSubscriptionStatus(user.id);

    //folders
    const { data: workspaceFolderData, error: foldersError } = await getFolders(params.workspaceId);

    //error
    if (subscriptionError || foldersError) redirect('/dashboard');


    //get all different workspace private collab shared
    const [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces] = await Promise.all(
        [getPrivateWorkspaces(user.id), getCollaboratingWorkspaces(user.id), getSharedWorkspaces(user.id)]
    )


    return (
        <aside className={twMerge('hidden sm:flex sm:flex-col w-[280px] shrink-0 p-4 md:gap-4 !justify-between ', className)}>
            <div>
                <WorkspaceDropdown
                    defaultValue={[...privateWorkspaces, ...sharedWorkspaces, ...collaboratingWorkspaces]
                        .find((workspace) => workspace.id === params.workspaceId)}
                    privateWorkspaces={privateWorkspaces}
                    sharedWorkspaces={sharedWorkspaces}
                    collaboratingWorkspaces={collaboratingWorkspaces} />

                <PlanUsage foldersLength={workspaceFolderData?.length || 0} subscription={subscriptionData} />
                <NativeNavigation myWorkspaceId={params.workspaceId} />
                <ScrollArea className=" relative h-[450px]">
                    <div className="pointer-events-none w-full absolute bottom-0 h-20 bg-gradient-to-t from-background to-transparent z-40"
                    />
                    <FoldersDropdownList
                        workspaceFolders={workspaceFolderData || []}
                        workspaceId={params.workspaceId}
                    />
                </ScrollArea>
            </div>
            <ModeToggle/>
            <LogoutButton>Logout</LogoutButton>
        </aside>
    )
}

export default Sidebar
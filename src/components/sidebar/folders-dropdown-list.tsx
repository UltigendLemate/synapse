'use client'
import { useAppState } from '@/lib/providers/state-provider';
import { Folder } from '@/lib/supabase/supabase.types'
import React, { useEffect, useState } from 'react'
import TooltipComponent from '../global/tooltip-component';
import { PlusIcon } from 'lucide-react';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { v4 } from 'uuid';
import { create } from 'domain';
import { createNewFolder } from '@/lib/supabase/queries';
import { useToast } from '../ui/use-toast';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import Dropdown from './dropdown';
import useSupabaseRealtime from '@/lib/hooks/use-supabase-realtime';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';




interface FoldersDropdownListProps {
    workspaceFolders: Folder[] | [];
    workspaceId: string;
}
const FoldersDropdownList: React.FC<FoldersDropdownListProps> = ({ workspaceFolders, workspaceId }) => {
    

    useSupabaseRealtime();
    const { state, dispatch ,folderId } = useAppState();
    const [folders, setFolders] = useState<Folder[]>([]);
    const { subscription } = useSupabaseUser();
    // const {open, setOpen} = useSubscriptionModal();

    const { toast } = useToast();

    //set initial state to server state
    useEffect(() => {
        if (workspaceFolders.length) {
            dispatch({
                type: 'SET_FOLDERS',
                payload: {
                    workspaceId: workspaceId,
                    folders: workspaceFolders.map((folder) => ({
                        ...folder, files: state.workspaces.
                            find(workspace => workspace.id == workspaceId)
                            ?.folders.find((f) => f.id == folder.id)?.files || []
                    }))
                }

            })
        }
    }, [workspaceFolders, workspaceId])


    //set local state when server state changes
    useEffect(() => {
        setFolders(
            state.workspaces.find((workspace) => workspace.id === workspaceId)
                ?.folders || []
        );
    }, [state, workspaceId]);



    //add folder
    const addFolderHandler = async () => {

        const newFolder: Folder = {
            data: null,
            id: v4(),
            createdAt: new Date().toISOString(),
            title: 'Untitled',
            iconId: '📁',
            inTrash: null,
            workspaceId,
            bannerUrl: '',
        }

        dispatch({
            type: 'ADD_FOLDER',
            payload: {
                workspaceId,
                folder: { ...newFolder, files: [] }
            }
        })

        const { data, error } = await createNewFolder(newFolder);
        if (error) {
            toast({ title: 'Error', variant: 'destructive', description: 'Could not create folder' })
        }
        else {
            toast({ title: 'Success', description: 'Created folder' })
        }
    }


    return (
        <>
            <div
                className="flex sticky z-20 top-0 bg-background w-full h-10 group/title justify-between items-center pr-4 text-Neutrals/neutrals-8"
            >

                <span
                    className="text-Neutrals-8 
        font-bold 
        text-xs"
                >
                    FOLDERS
                </span>
                <TooltipComponent message="Create Folder" >
                    <PlusIcon onClick={addFolderHandler} size={16} className='group-hover/title:inline-block hidden cursor hover:dark:text-white' />

                </TooltipComponent>
            </div>

            <Accordion type="multiple" defaultValue={[folderId || '']} className='pb-20'>
                {folders.filter((folder)=> !folder.inTrash)
                .map((folder)=> (
                    <Dropdown key={folder.id} id={folder.id} listType='folder' iconId={folder.iconId} title={folder.title} />
                ))}
                    
                </Accordion>

        </>
    )
}

export default FoldersDropdownList
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import React, { useMemo, useState } from 'react'
import { useToast } from '../ui/use-toast';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { useAppState } from '@/lib/providers/state-provider';
import { useRouter } from 'next/navigation';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import clsx from 'clsx';
import { list } from 'postcss';
import EmojiPicker from '../global/emoji-picker';
import { createNewFile, updateFile, updateFolder } from '@/lib/supabase/queries';
import { Input } from '../ui/input';
import TooltipComponent from '../global/tooltip-component';
import { PlusIcon, Trash } from 'lucide-react';
import { v4 } from 'uuid';
import { File } from '@/lib/supabase/supabase.types';
interface DropdownProps {
    title: string;
    id: string;
    listType: 'folder' | 'file';
    iconId: string;
    children?: React.ReactNode;
    disabled?: boolean;
}


const Dropdown: React.FC<DropdownProps> = ({
    title,
    id,
    listType,
    iconId,
    children,
    disabled,
    ...props
}) => {
    const supabase = createClientComponentClient();
    const { toast } = useToast();
    const { user } = useSupabaseUser();
    const { state, dispatch, workspaceId, folderId } = useAppState();
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();

    //folder title synced with server and local


    //file title synced with server and local

    //navigate user to different page
    const navigatePage = (accordionId: string, type: string) => {
        if (type == 'folder') {
            router.push(`/dashboard/${workspaceId}/${accordionId}`);
        }
        if (type == 'file') {
            router.push(`/dashboard/${workspaceId}/${folderId}/${
                accordionId.split('folder')[1]
            }`);
        }

    }

    //add a file

    const addNewFile = async () => {
        if (!workspaceId) return;
        const newFile: File = {
            data: null,
            createdAt: new Date().toISOString(),
            title: 'Untitled',
            iconId: '📄',
            id: v4(),
            folderId: id,
            workspaceId,
            inTrash: null,
            bannerUrl: '',
        };
        dispatch({
            type: 'ADD_FILE',
            payload: { file: newFile, folderId: id, workspaceId },
        });
        const { data, error } = await createNewFile(newFile);
        if (error) {
            toast({
                title: 'Error',
                variant: 'destructive',
                description: 'Could not create a file',
            });
        } else {
            toast({
                title: 'Success',
                description: 'File created.',
            });
        }


    }

    //double click handler
    const handleDoubleClick = () => {
        // e.stopPropagation();
        setIsEditing(true);
    }

    //blur
    const handleBlur = async () => {
        if (!isEditing) return;
        setIsEditing(false);
        const fId = id.split('folder');
        if (fId?.length === 1) {
            if (!folderTitle) return;
            toast({
                title: 'Success',
                description: 'Folder title changed.',
            });
            await updateFolder({ title }, fId[0]);
        }

        if (fId.length === 2 && fId[1]) {
            if (!fileTitle) return;
            const { data, error } = await updateFile({ title: fileTitle }, fId[1]);
            if (error) {
                toast({
                    title: 'Error',
                    variant: 'destructive',
                    description: 'Could not update the title for this file',
                });
            } else
                toast({
                    title: 'Success',
                    description: 'File title changed.',
                });
        }

    }


    const folderTitleChange = (e: any) => {
        if (!workspaceId) return;
        if (title == e.target.value) return;
        const fid = id.split('folder');
        if (fid.length === 1) {
            dispatch({
                type: 'UPDATE_FOLDER',
                payload: {
                    folder: { title: e.target.value },
                    folderId: fid[0],
                    workspaceId,
                },
            });
        }
    };
    const fileTitleChange = (e: any) => {
        if (!workspaceId || !folderId) return;
        const fid = id.split('folder');
        if (fid.length === 2 && fid[1]) {
            dispatch({
                type: 'UPDATE_FILE',
                payload: {
                    file: { title: e.target.value },
                    folderId,
                    workspaceId,
                    fileId: fid[1],
                },
            });
        }
    };



    //onchange
    const onChangeEmoji = async (emoji: string) => {
        if (listType == 'folder') {
            if (!workspaceId) return;
            dispatch({
                type: 'UPDATE_FOLDER',
                payload: {
                    workspaceId,
                    folderId: id,
                    folder: {
                        iconId: emoji
                    }
                }
            })

            const { data, error } = await updateFolder({ iconId: emoji }, id);
            if (error) {
                toast({
                    title: 'Error',
                    variant: 'destructive',
                    description: 'Could not update icon',
                });
            } else {
                toast({
                    title: 'Success',
                    description: 'Icon Updated',
                });
            }
        }

        if (listType == 'file') {
            const fid = id.split('folder');
            if (!workspaceId || !fid[1]) return;
            dispatch({
                type: 'UPDATE_FILE',
                payload: {
                    workspaceId,
                    folderId: fid[0],
                    fileId: fid[1],
                    file: {
                        iconId: emoji
                    }
                }
            })

            const { data, error } = await updateFile({ iconId: emoji }, fid[1]);
            if (error) {
                toast({
                    title: 'Error',
                    variant: 'destructive',
                    description: 'Could not update icon',
                });
            } else {
                toast({
                    title: 'Success',
                    description: 'Icon Updated',
                });
            }
        }
    }

    //move to trash

    const moveToTrash = async () => {
        if ( !user?.email || !workspaceId) return;
        const pathId = id.split('folder');
        if (listType == 'folder') {
            dispatch({
                type : 'UPDATE_FOLDER',
                payload : {
                    folder : { inTrash : `Deleted by ${user?.email}`},
                    workspaceId : workspaceId,
                    folderId : pathId[0],
                }
            })
            const {data,error} = await updateFolder({ inTrash : `Deleted by ${user?.email}`}, pathId[0])
            if (error) {
                toast({
                    title: 'Error',
                    variant: 'destructive',
                    description: 'Could not move folder to trash',
                });
            } else {
                toast({
                    title: 'Success',
                    description: 'Moved folder to trash',
                });
            }
        }
        else{
            dispatch({
                type : 'UPDATE_FILE',
                payload : {
                    fileId : pathId[1],
                    file : { inTrash : `Deleted by ${user?.email}`},
                    workspaceId : workspaceId,
                    folderId : pathId[0],
                }
            })
            const {data,error} = await updateFile({ inTrash : `Deleted by ${user?.email}`}, pathId[1])
            if (error) {
                toast({
                    title: 'Error',
                    variant: 'destructive',
                    description: 'Could not move file to trash',
                });
            } else {
                toast({
                    title: 'Success',
                    description: 'Moved file to trash',
                });
            }

        }


    }

    const isFolder = listType === 'folder';

    const hoverStyles = useMemo(
        () =>
            clsx(
                ' hidden rounded-sm absolute right-0 top-0  items-center justify-center',
                {
                    'group-hover/file:block': listType === 'file',
                    'group-hover/folder:block': listType === 'folder',
                }
            ),
        [isFolder]
    );



    const folderTitle: string | undefined = useMemo(() => {
        if (listType == 'file') return;
        const stateTitle = state.workspaces.find((workspace) => workspace.id === workspaceId)
            ?.folders.find((folder) => folder.id === id)?.title || '';
        if (title == stateTitle || !stateTitle) return title;
        return stateTitle;
    }, [state, listType, workspaceId, id, title]);


    const fileTitle: string | undefined = useMemo(() => {
        if (listType == 'folder') return;
        const fileAndFolderId = id.split('folder');
        const stateTitle = state.workspaces.find((workspace) => workspace.id === workspaceId)
            ?.folders.find((folder) => folder.id === fileAndFolderId[0])
            ?.files.find((file) => file.id === fileAndFolderId[1])?.title || '';
        if (title == stateTitle || !stateTitle) return title;
        return stateTitle;
    }, [state, listType, workspaceId, id, folderId, title]);


    const groupIdentifier = useMemo(() => clsx(
        'dark:text-white whitespace-nowrap flex justify-between items-center w-full relative',
        {
            'group/folder': isFolder,
            'group/file': !isFolder,
        }
    ), [isFolder])

    const listStyles = useMemo(() => clsx('relative', {
        'border-none text-md': isFolder,
        'border-none ml-6 text-[16px] py-1': !isFolder,
    }), [isFolder])

    return (
        <AccordionItem value={id}
            className={listStyles}
            onClick={(e) => {
                e.stopPropagation();
                navigatePage(id, listType);
            }}
        >
            <AccordionTrigger id={listType} className='hover:no-underline p-2 dark:text-muted-foreground text-sm'
                disabled={listType == 'file'}>
                <div className={groupIdentifier}>
                    <div className='flex gap-4 justify-center items-center overflow-hidden'>
                        <div className="relative">
                            <EmojiPicker getvalue={onChangeEmoji}>{iconId}</EmojiPicker>
                        </div>

                        <input
                            type="text"
                            value={listType === 'folder' ? folderTitle : fileTitle}
                            className={clsx(
                                'outline-none overflow-hidden w-[140px] text-Neutrals/neutrals-7',
                                {
                                    'bg-muted cursor-text': isEditing,
                                    'bg-transparent cursor-pointer': !isEditing,
                                }
                            )}
                            readOnly={!isEditing}
                            onDoubleClick={handleDoubleClick}
                            onBlur={handleBlur}
                            onChange={
                                listType === 'folder' ? folderTitleChange : fileTitleChange
                            }
                        />
                    </div>
                    <div className={hoverStyles}>
                        <TooltipComponent message='Delete'>
                            <Trash size={15} onClick={moveToTrash} className='hover:dark:text-white dark:text-Neutrals/neutrals-6' />
                        </TooltipComponent>

                        {listType == 'folder' && !isEditing &&
                            <TooltipComponent message='Add File'>
                                <PlusIcon size={15} onClick={addNewFile} className='hover:dark:text-white dark:text-Neutrals/neutrals-6' />
                            </TooltipComponent>
                        }

                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                {state.workspaces
                    .find((workspace) => workspace.id === workspaceId)
                    ?.folders.find((folder) => folder.id === id)
                    ?.files.filter((file) => !file.inTrash)
                    .map((file) => {
                        const customFileId = `${id}folder${file.id}`;
                        return (
                            <Dropdown
                            
                                key={file.id}
                                title={file.title}
                                listType="file"
                                id={customFileId}
                                iconId={file.iconId}
                            />
                        );
                    })}
            </AccordionContent>
        </AccordionItem>
    )
}

export default Dropdown
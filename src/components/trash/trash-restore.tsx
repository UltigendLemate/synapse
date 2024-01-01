'use client';
import { appFoldersType, useAppState } from '@/lib/providers/state-provider';
import { File } from '@/lib/supabase/supabase.types';
import { FileIcon, FolderIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { deleteFile, deleteFolder, updateFile, updateFolder } from '@/lib/supabase/queries';
import { useRouter } from 'next/navigation';

const TrashRestore = () => {
    const { state, workspaceId, dispatch } = useAppState();
    const [folders, setFolders] = useState<appFoldersType[] | []>([]);
    const [files, setFiles] = useState<File[] | []>([]);
    const router = useRouter();
    
    const restoreFileHandler = async (dirType : 'folder'|'file', fileId : string='', folderId : string='') => {
        if (dirType == 'file') {
            if (!folderId || !workspaceId) return;
            dispatch({
                type: 'UPDATE_FILE',
                payload: {
                    workspaceId,
                    folderId,
                    fileId,
                    file: {
                        inTrash: ''
                    }
                }
            })
            await updateFile({ inTrash: '' }, fileId)
        }

        if (dirType == 'folder') {
            if (!workspaceId) return;
            dispatch({
                type: 'UPDATE_FOLDER',
                payload: {
                    workspaceId,
                    folderId: fileId,
                    folder: {
                        inTrash: ''
                    }
                }
            })
            await updateFolder({ inTrash: '' }, fileId)
        }
    }

    const deleteFileHandler = async (dirType : 'folder'|'file', fileId : string='', folderId : string='') => {
        if (dirType == 'file') {
            if (!folderId || !workspaceId) return;
            dispatch({
                type: 'DELETE_FILE',
                payload: {
                    workspaceId,
                    folderId,
                    fileId
                }
            })
            await deleteFile(fileId);
            // router.refresh();
            router.replace(`/dashboard/${workspaceId}`);

        }

        if (dirType == 'folder') {
            if (!workspaceId) return;
            dispatch({
                type: 'DELETE_FOLDER',
                payload: {
                    workspaceId,
                    folderId: fileId,
                }
            })
            await deleteFolder(fileId);
            router.replace(`/dashboard/${workspaceId}`);

        }
    }

    useEffect(() => {
        const stateFolders =
            state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.filter((folder) => folder.inTrash) || [];
        setFolders(stateFolders);

        let stateFiles: File[] = [];
        state.workspaces
            .find((workspace) => workspace.id === workspaceId)
            ?.folders.forEach((folder) => {
                folder.files.forEach((file) => {
                    if (file.inTrash) {
                        stateFiles.push(file);
                    }
                });
            });
        setFiles(stateFiles);
    }, [state, workspaceId]);

    return (
        <section>
            {!!folders.length && (
                <>
                    <h3>Folders</h3>
                    {folders.map((folder) => (
                        <Link
                            className="hover:bg-muted
            rounded-md
            p-2
            flex
            item-center
            justify-between"
                            href={`/dashboard/${folder.workspaceId}/${folder.id}`}
                            key={folder.id}
                        >
                            <article>
                                <div className="grid items-center grid-cols-2 !justify-around w-full  ">
                                    <div className='flex gap-2'>
                                        <FolderIcon />
                                        {folder.title}
                                    </div>
                                    <div className='flex gap-3 justify-end'>
                                        <Button variant='outline' onClick={()=>restoreFileHandler('folder',folder.id)}>Restore</Button>
                                        <Button variant='destructive' onClick={()=>deleteFileHandler('folder',folder.id)}>Delete</Button>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </>
            )}

            <Separator/>

            {!!files.length && (
                <>
                    <h3>Files</h3>
                    {files.map((file) => (
                        <Link
                            key={file.id}
                            className=" hover:bg-muted rounded-md p-2 flex items-center justify-between"
                            href={`/dashboard/${file.workspaceId}/${file.folderId}/${file.id}`}
                        >
                            <article>
                            <div className="grid items-center grid-cols-2 !justify-around w-full  ">
                                    <div className='flex gap-2'>
                                        <FileIcon />
                                        {file.title}
                                    </div>
                                    <div className='flex gap-3 justify-end'>
                                        <Button variant='outline' onClick={()=>restoreFileHandler('file',file.id,file.folderId)}>Restore</Button>
                                        <Button variant='destructive' onClick={()=>deleteFileHandler('file',file.id,file.folderId)}>Delete</Button>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </>
            )}
            {!files.length && !folders.length && (
                <div
                    className="
          text-muted-foreground
          absolute
          top-[50%]
          left-[50%]
          transform
          -translate-x-1/2
          -translate-y-1/2

      "
                >
                    No Items in trash
                </div>
            )}
        </section>
    );
};

export default TrashRestore;
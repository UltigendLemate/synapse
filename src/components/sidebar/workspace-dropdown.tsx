'use client'
import { useAppState } from '@/lib/providers/state-provider';
import { workspace } from '@/lib/supabase/supabase.types';
import React, { useEffect, useState } from 'react'
import { set } from 'zod';
import SelectedWorkspace from './selected-workspace';
import CustomDialogTrigger from '../global/custom-dialog-trigger';
import WorkspaceCreator from '../global/workspace-creator';

interface WorkspaceDropdownProps {
    privateWorkspaces: workspace[] | [];
    sharedWorkspaces: workspace[] | [];
    collaboratingWorkspaces: workspace[] | [];
    defaultValue: workspace | undefined;
}

const WorkspaceDropdown: React.FC<WorkspaceDropdownProps> =
    ({ privateWorkspaces, sharedWorkspaces, collaboratingWorkspaces, defaultValue }) => {
        const [selectedOption, setselectedOption] = useState(defaultValue);
        const [isOpen, setIsOpen] = useState(false);
        const { dispatch, state } = useAppState();

        useEffect(() => {
            if (!state.workspaces.length) {
                dispatch(
                    {
                        type: 'SET_WORKSPACES',
                        payload: {
                            workspaces: [...privateWorkspaces, ...sharedWorkspaces, ...collaboratingWorkspaces]
                                .map((workspace) => ({ ...workspace, folders: [] }))
                        }
                    }

                )
            }

        }, [privateWorkspaces, sharedWorkspaces, collaboratingWorkspaces])


        const handleSelect = (option: workspace) => {
            setselectedOption(option);
            setIsOpen(false);
        }

        useEffect(() => {
            const findSelectedWorkspace = state.workspaces.find(
                (workspace) => workspace.id === defaultValue?.id
            );
            if (findSelectedWorkspace) setselectedOption(findSelectedWorkspace);
        }, [state, defaultValue]);

        return (
            <div className='relative inline-block text-left'>
                <div>
                    <span onClick={() => setIsOpen(!isOpen)}>
                        {selectedOption ? <SelectedWorkspace workspace={selectedOption} /> :
                            ('Select a workspace')}
                    </span>
                </div>
                {isOpen && (
                    <div
                        className="origin-top-right
                    absolute
                    w-[280px]
                    rounded-md
                    shadow-md
                    z-50
                    h-[190px]
                    bg-black/10
                    backdrop-blur-lg
                    group
                    overflow-x-hidden
                    overflow-auto
                    border-[1px]
                    border-muted
                "
                    >
                        <div className="rounded-md flex flex-col">
                            <div className="!p-2">
                                {!!privateWorkspaces.length && (
                                    <>
                                        <p className="text-muted-foreground">Private</p>
                                        <hr></hr>
                                        {privateWorkspaces.map((option) => (
                                            <SelectedWorkspace
                                                key={option.id}
                                                workspace={option}
                                                onClick={handleSelect}
                                            />
                                        ))}
                                    </>
                                )}
                                {!!sharedWorkspaces.length && (
                                    <>
                                        <p className="text-muted-foreground">Shared</p>
                                        <hr />
                                        {sharedWorkspaces.map((option) => (
                                            <SelectedWorkspace
                                                key={option.id}
                                                workspace={option}
                                                onClick={handleSelect}
                                            />
                                        ))}
                                    </>
                                )}
                                {!!collaboratingWorkspaces.length && (
                                    <>
                                        <p className="text-muted-foreground">Collaborating</p>
                                        <hr />
                                        {collaboratingWorkspaces.map((option) => (
                                            <SelectedWorkspace
                                                key={option.id}
                                                workspace={option}
                                                onClick={handleSelect}
                                            />
                                        ))}
                                    </>
                                )}
                            </div>
                            <CustomDialogTrigger
                                header="Create A Workspace"
                                content={<WorkspaceCreator />}
                                description="Workspaces give you the power to collaborate with others. You can change your workspace privacy settings after creating the workspace too."
                            >
                                <div className='flex transition-all hover:bg-muted justify-center items-center gap-2 p-2 w-full'>
                                    <article className='text-slate-500 h-4 w-4 bg-slate-800 rounded-full flex items-center justify-center'>+</article>
                                    Create Workspace
                                </div>
                            </CustomDialogTrigger>
                        </div>



                    </div>

                )}
            </div>
        )
    }

export default WorkspaceDropdown
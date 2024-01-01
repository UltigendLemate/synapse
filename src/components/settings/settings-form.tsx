'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useToast } from '../ui/use-toast'
import { useAppState } from '@/lib/providers/state-provider'
import { User, workspace } from '@/lib/supabase/supabase.types'
import { useRouter } from 'next/navigation'
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { addCollaborators, deleteWorkspace, findUser, getCollaborators, removeCollaborators, updateWorkspace, updateuser } from '@/lib/supabase/queries'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Separator } from '../ui/separator'
import { v4 } from 'uuid'
import { set } from 'zod'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Lock, Plus, Share, Briefcase, User as UserIcon, PersonStandingIcon, LogOut, CreditCard, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button'
import CollaboratorSearch from '../global/collaborator-search'
import { ScrollArea } from '../ui/scroll-area'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog'
import LogoutButton from '../global/logout-button'
import Link from 'next/link'
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider'
import { postData } from '@/lib/utils'

const SettingsForm = () => {
    const { toast } = useToast()
    const { user, subscription } = useSupabaseUser();
    const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
    const supabase = createClientComponentClient();
    const router = useRouter();
    const { state, workspaceId, dispatch } = useAppState()
    const [permissions, setPermissions] = useState('private')
    const [collaborators, setCollaborators] = useState<User[] | []>([])
    const [openAlertMessage, setOpenAlertMessage] = useState(false)
    const [workspaceDetails, setWorkspaceDetails] = useState<workspace>();
    const titleTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const {open, setOpen} = useSubscriptionModal();
    const [loadingPortal, setLoadingPortal] = useState(false);

    //WIP payment scene

    //add collabs
    const addCollaborator = async (user: User) => {
        if (!workspaceId) return;
        if (subscription?.status !== 'active' && collaborators.length >= 2) {
            setOpen(true);
            return;
          }
        await addCollaborators([user], workspaceId);
        setCollaborators([...collaborators, user])
    }

    //remove collabs

    const removeCollaborator = async (user: User) => {
        if (!workspaceId) return;
        if (collaborators.length === 1) {
            setPermissions('private');
        }
        await removeCollaborators([user], workspaceId);
        setCollaborators(
            collaborators.filter((collaborator) => collaborator.id !== user.id)
        );
        router.refresh();
    }



    //onchange workspace and other onchanges
    const workspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!workspaceId || !e.target.value) return;
        dispatch({
            type: 'UPDATE_WORKSPACE',
            payload: { workspace: { title: e.target.value }, workspaceId },
        });
        if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
        titleTimerRef.current = setTimeout(async () => {
            await updateWorkspace({ title: e.target.value }, workspaceId);
        }, 500);
    };


    const onChangeWorkspaceLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {

        if (!workspaceId) return;
        const file = e.target.files?.[0];
        if (!file) return;
        const uuid = v4();
        setUploadingLogo(true);
        const { data, error } = await supabase.storage.from('workspace-logos')
            .upload(`workspaceLogo.${uuid}`, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (!error) {
            dispatch({
                type: 'UPDATE_WORKSPACE',
                payload: { workspace: { logo: data.path }, workspaceId },
            });
            await updateWorkspace({ logo: data.path }, workspaceId);
            setUploadingLogo(false);
        }
    }

    const onChangeProfilePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {

        if (!workspaceId) return;
        const file = e.target.files?.[0];
        if (!file) return;
        const uuid = v4();
        setUploadingProfilePic(true);
        const { data, error } = await supabase.storage.from('avatars')
            .upload(`avatar.${uuid}`, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (!error && user && supabaseUser) {
            await updateuser({ avatarUrl: data.path }, user.id);
            setSupabaseUser({
                ...supabaseUser, avatarUrl: data.path
            });
            setUploadingProfilePic(false);
        }
    }

    const redirectToCustomerPortal = async () => {
        setLoadingPortal(true);
        try {
          const { url, error } = await postData({
            url: '/api/create-portal-link',
          });
          console.log(url)
          window.location.assign(url);
        } catch (error) {
          console.log(error);
          setLoadingPortal(false);
        }
        setLoadingPortal(false);
      };

    const onPermissionsChange = (val: string) => {
        if (val === 'private') {
            setOpenAlertMessage(true);
        } else setPermissions(val);
    };


    //onclicks alerts
    const onClickAlertConfirm = async () => {
        if (!workspaceId || !collaborators.length) return;
        await removeCollaborators(collaborators, workspaceId);
        setPermissions('private');
        setOpenAlertMessage(false);
    }

    //fetching avatar details from supabase

    //getworkspace details
    useEffect(() => {
        const showingWorkspace = state.workspaces.find((workspace) => workspace.id === workspaceId);
        if (showingWorkspace) setWorkspaceDetails(showingWorkspace);
    }, [workspaceId, state]);


    //get collaborators
    useEffect(() => {
        if (!workspaceId) return;
        const currentCollabs = async () => {
            const response = await getCollaborators(workspaceId);
            let ownerUser;
            if (workspaceDetails)
                ownerUser = await findUser(workspaceDetails.workspaceOwner);
            console.log(response, '\n\n\n\n\n\n', ownerUser)
            if (response.length) {
                setPermissions('shared');
                if (ownerUser) {
                    setCollaborators([...response, ownerUser]);

                }


            }
        }
        currentCollabs();
    }, [workspaceId, workspaceDetails])

    useEffect(() => {
        if (user) {
            const dataUser = async () => {
                const response = await findUser(user.id)
                if (response)
                    setSupabaseUser(response);
            };
            dataUser();
        }
    }, [user, supabaseUser])






    return (
        <div className="flex gap-4 flex-col">
            <p className="flex items-center gap-2 mt-6">
                <Briefcase size={20} />
                Workspace
            </p>
            <Separator />

            <div className="flex flex-col gap-2">
                <Label
                    htmlFor="workspaceName"
                    className="text-sm text-muted-foreground"
                >
                    Name
                </Label>
                <Input
                    name="workspaceName"
                    value={workspaceDetails?.title}
                    placeholder="Workspace Name"
                    onChange={workspaceNameChange}
                />
                <Label
                    htmlFor="workspaceLogo"
                    className="text-sm text-muted-foreground"
                >
                    Workspace Logo
                </Label>
                <Input
                    name="workspaceLogo"
                    type="file"
                    accept="image/*"
                    placeholder="Workspace Logo"
                    onChange={onChangeWorkspaceLogo}
                    disabled={uploadingLogo || subscription?.status !== 'active'}
                />
                {subscription?.status !== 'active' && (
                    <small className="text-muted-foreground">
                        To customize your workspace, you need to be on a Pro Plan
                    </small>
                )}
            </div>

            <>
                <Label htmlFor="permissions">Pemissions</Label>

                <Select
                    onValueChange={onPermissionsChange}
                    value={permissions}
                >
                    <SelectTrigger className="w-full h-26 -mt-3">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="private">
                                <div
                                    className="p-2
                  flex
                  gap-4
                  justify-center
                  items-center
                "
                                >
                                    <Lock />
                                    <article className="text-left flex flex-col">
                                        <span>Private</span>
                                        <p>
                                            Your workspace is private to you. You can choose to share
                                            it later.
                                        </p>
                                    </article>
                                </div>
                            </SelectItem>
                            <SelectItem value="shared">
                                <div className="p-2 flex gap-4 justify-center items-center">
                                    <Share></Share>
                                    <article className="text-left flex flex-col">
                                        <span>Shared</span>
                                        <span>You can invite collaborators.</span>
                                    </article>
                                </div>
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {permissions === 'shared' && (
                    <div>
                        <CollaboratorSearch
                            existingCollaborators={collaborators}
                            getCollaborator={(user) => {
                                addCollaborator(user);
                            }}
                        >
                            <Button
                                type="button"
                                className="text-sm mt-4"
                            >
                                <Plus />
                                Add Collaborators
                            </Button>
                        </CollaboratorSearch>
                        <div className="mt-4">
                            <span className="text-sm text-muted-foreground">
                                Collaborators {collaborators.length || ''}
                            </span>
                            <ScrollArea
                                className="
            h-[120px]
            w-full
            rounded-md
            border
            border-muted-foreground/20"
                            >
                                {collaborators.length ? (
                                    collaborators.map((c) => (
                                        <div
                                            className="p-4  flex
                      justify-between
                      items-center
                      
                "
                                            key={c.id}
                                        >
                                            <div className="flex gap-4 items-center">
                                                <Avatar>
                                                    <AvatarImage src={c?.avatarUrl &&
                                                        supabase.storage.from('avatars').getPublicUrl(c.avatarUrl).data.publicUrl || ''} />
                                                    <AvatarFallback>PJ</AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className="text-sm 
                          gap-2
                          text-muted-foreground
                          overflow-hidden
                          overflow-ellipsis
                          max-w-[300px]
                        "
                                                >
                                                    {c.email}
                                                </div>
                                            </div>
                                            <Button
                                                variant="secondary"
                                                className=''

                                                onClick={() => removeCollaborator(c)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div
                                        className="absolute
                  right-0 left-0
                  top-0
                  bottom-0
                  flex
                  justify-center
                  items-center
                "
                                    >
                                        <span className="text-muted-foreground text-sm">
                                            You have no collaborators
                                        </span>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                )}

                {/* delete workspace */}
                <Alert variant={'destructive'}>
                    <AlertDescription>
                        Warning! deleting you workspace will permanantly delete all data
                        related to this workspace.
                    </AlertDescription>
                    <Button
                        type="submit"
                        size={'sm'}
                        variant={'destructive'}
                        className="mt-4 
            text-sm
            bg-destructive/40 
            border-2 
            border-destructive"
                        onClick={async () => {
                            if (!workspaceId) return;
                            await deleteWorkspace(workspaceId);
                            toast({ title: 'Successfully deleted your workspae' });
                            dispatch({ type: 'DELETE_WORKSPACE', payload: workspaceId });
                            router.replace('/dashboard');
                        }}
                    >
                        Delete Workspace
                    </Button>
                </Alert>

                <p className='flex items-center gap-2 mt-6 '>
                    <UserIcon size={20} /> Profile
                </p>
                <Separator />
                <div className="flex items-center">
                    <Avatar>
                        <AvatarImage src={supabaseUser &&
                            supabaseUser.avatarUrl &&
                            supabase.storage.from('avatars').getPublicUrl(supabaseUser.avatarUrl).data.publicUrl || ''}>

                        </AvatarImage>
                        <AvatarFallback>
                            <UserIcon size={20} />
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col ml-6">
                        <small className="text-muted-foreground cursor-not-allowed">
                            {user ? user.email : ''}
                        </small>
                        <Label
                            htmlFor="profilePicture"
                            className="text-sm text-muted-foreground"
                        >
                            Profile Picture
                        </Label>
                        <Input
                            name="profilePicture"
                            type="file"
                            accept="image/*"
                            placeholder="Profile Picture"
                            onChange={onChangeProfilePicture}
                            disabled={uploadingProfilePic}
                        />
                    </div>

                    <LogoutButton>
                        <div className="flex items-center">
                            <LogOut />
                        </div>
                    </LogoutButton>
                </div>

                <p className="flex items-center gap-2 mt-6">
                    <CreditCard size={20} /> Billing & Plan
                </p>
                <Separator />

                <p className="text-muted-foreground">
                    You are currently on a{' '}
                    {subscription?.status === 'active' ? 'Pro' : 'Free'} Plan
                </p>
                <Link
                    href="/"
                    target="_blank"
                    className="text-muted-foreground flex flex-row items-center gap-2"
                >
                    View Plans <ExternalLink size={16} />
                </Link>
                {subscription?.status === 'active' ? (
                    <div>
                        <Button
                            type="button"
                            size="sm"
                            variant={'secondary'}
                            disabled={loadingPortal}
                            className="text-sm"
                        onClick={redirectToCustomerPortal}
                        >
                            Manage Subscription
                        </Button>
                    </div>
                ) : (
                    <div>
                        <Button
                            type="button"
                            size="sm"
                            variant={'secondary'}
                            className="text-sm"
                            onClick={() => setOpen(true)}
                        >
                            Start Plan
                        </Button>
                    </div>
                )}
            </>

            <AlertDialog open={openAlertMessage}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDescription>Changing a Shared workspace to a Private workspace will remove all collaborators permanently</AlertDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter >
                        <AlertDialogCancel onClick={() => { setOpenAlertMessage(false) }}>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction onClick={onClickAlertConfirm}>
                            Confirm
                        </AlertDialogAction>

                    </AlertDialogFooter>
                </AlertDialogContent>

            </AlertDialog>

        </div>
    )
}

export default SettingsForm
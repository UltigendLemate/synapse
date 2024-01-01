'use client'
import { MAX_FOLDERS_FREE_PLAN } from '@/lib/constants';
import { useAppState } from '@/lib/providers/state-provider';
import { Subscription } from '@/lib/supabase/supabase.types';
import React, { useEffect } from 'react'
import { Progress } from '../ui/progress';
import { Diamond, Gem, GemIcon } from 'lucide-react';

interface PlanUsageProps {
    foldersLength: number ;
    subscription: Subscription | null;


}

const PlanUsage:React.FC<PlanUsageProps> = ({foldersLength,subscription}) => {
    const {workspaceId, state} = useAppState();
    const [usagePercentage, setUsagePercentage] = React.useState((foldersLength/MAX_FOLDERS_FREE_PLAN)*100);

    useEffect(() => {
        const stateFoldersLength = state.workspaces.find(
          (workspace) => workspace.id === workspaceId
        )?.folders.length;
        if (stateFoldersLength === undefined) return;
        setUsagePercentage((stateFoldersLength / MAX_FOLDERS_FREE_PLAN) * 100);
      }, [state, workspaceId]);



  return (
    <article className="mb-4">
      {subscription?.status !== 'active' && (
        <div
          className="flex 
          gap-2
          text-muted-foreground
          mb-2
          items-center
        "
        >
          
            <GemIcon className='w-4 h-4'/>
          
          <div
            className="flex 
        justify-between 
        w-full 
        items-center
        "
          >
            <div>Free Plan</div>
            <small>{usagePercentage.toFixed(0)}% / 100%</small>
          </div>
        </div>
      )}
      {subscription?.status !== 'active' && (
        <Progress
          value={usagePercentage}
          className="h-1"
        />
      )}
    </article>
  )
}

export default PlanUsage
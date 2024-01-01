import { File, Folder, workspace } from '@/lib/supabase/supabase.types';
import React from 'react'
import CustomDialogTrigger from '../global/custom-dialog-trigger';
import BannerUploadForm from './banner-upload-form';
import { dirname } from 'path';

interface bannerUploadProps {
    children : React.ReactNode;
    dirType : 'workspace' | 'folder' | 'file';
    id : string;
    className? : string;
}
const BannerUpload:React.FC<bannerUploadProps> = ({children,dirType,id,className}) => {
  return (
    <CustomDialogTrigger header='Upload Banner'
    content={
        <BannerUploadForm dirType={dirType} id={id}/>
    }
    className={className}>
        {children}
    </CustomDialogTrigger>
  )
}

export default BannerUpload
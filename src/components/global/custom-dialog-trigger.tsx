import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { desc } from 'drizzle-orm';


interface CustomDialogTriggerProps {
    header?: string;
    description?: string;

    className?: string;
    children: React.ReactNode;
    content?: React.ReactNode;
}
const CustomDialogTrigger: React.FC<CustomDialogTriggerProps> = ({ header, description, className, children, content }) => {
    return (
        <Dialog>
            <DialogTrigger className={clsx('', className)}>{children}</DialogTrigger>
            <DialogContent className='h-screen block sm:h-[440px] overflow-auto  w-full'>
                <DialogHeader>
                    <DialogTitle>{header}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>

    )
}

export default CustomDialogTrigger
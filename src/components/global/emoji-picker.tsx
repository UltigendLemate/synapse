'use client'
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
interface EmojiPickerProps{
    children : React.ReactNode;
    getvalue : (emoji: string) => void;

}
const EmojiPicker:React.FC<EmojiPickerProps> = ({children,getvalue}) => {
    const router = useRouter();
    const Picker = dynamic(() => import('emoji-picker-react'));
    const onClick = (selectedEmoji : any) => { 
        if (getvalue) {
            getvalue(selectedEmoji.emoji)
        }
    }

  return (
    <Popover>
        <PopoverTrigger className='cursor-pointer'>
        {children}
        </PopoverTrigger>

        <PopoverContent className='p-0 border-none'>
            <Picker onEmojiClick={onClick}/>

        </PopoverContent>
        
    </Popover>
  )
}

export default EmojiPicker
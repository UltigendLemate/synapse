import React from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
  
interface TooltipComponentProps {
    children: React.ReactNode;
    message: string;

}
const TooltipComponent:React.FC<TooltipComponentProps> = ({message,children}) => {
  return (
    <TooltipProvider>
  <Tooltip>
    <TooltipTrigger>{children}</TooltipTrigger>
    <TooltipContent>
      {message}
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

  )
}

export default TooltipComponent
import React from 'react'
import {   Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,} from '../ui/card'
import { cn } from '@/lib/utils';

type CardProps = React.ComponentProps<typeof Card>;
type CustomCardProps = CardProps & {
    // add custom props here
    cardHeader? : React.ReactNode;
    cardContent? : React.ReactNode;
    cardFooter? : React.ReactNode;
    };
const CustomCard:React.FC<CustomCardProps> = ({className, cardContent, cardHeader, cardFooter, ...props}) => {
  return (
    <Card
    className={cn("w-[380px]",className)} {...props}>
        <CardHeader>{cardHeader}</CardHeader>
        <CardContent className='grid gap-4'>{cardContent}</CardContent>
        <CardFooter>{cardFooter}</CardFooter>

    </Card>
  )
}

export default CustomCard
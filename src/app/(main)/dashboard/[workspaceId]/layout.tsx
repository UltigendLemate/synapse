import MobileSidebar from '@/components/sidebar/mobile-sidebar';
import Sidebar from '@/components/sidebar/sidebar';
import React from 'react'
interface LayoutProps {
    children : React.ReactNode;
    params : any;
}

const Layout : React.FC<LayoutProps> = ({children,params}) => {
  return (
    <main className=' flex h-screen w-screen'>
        <Sidebar params={params}/>
        <MobileSidebar>
          <Sidebar params ={params} className='w-screen inline-block sm:hidden'/>
        </MobileSidebar>
        
        <div className='dark:border-Neutrals/neutrals-12  border-l-[1px] w-full relative overflow-auto'>
        {children}
        <div className='w-full h-32 sm:h-20'></div>
        </div>
    </main>
  )
}

export default Layout
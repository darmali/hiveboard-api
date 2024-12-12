import { Icon, LoaderIcon } from '@/components/ui/icon';
import { Suspense } from 'react';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function LoginLayout({ children }: DashboardLayoutProps) {
  return (
    <Suspense fallback={
      <div className='flex-1 min-h-screen justify-center items-center'>
      <div className='text-2xl font-bold'><Icon as={LoaderIcon} className='animate-spin'/></div>
    </div>
    }>
      <div>{children}</div>
    </Suspense>
  );
}
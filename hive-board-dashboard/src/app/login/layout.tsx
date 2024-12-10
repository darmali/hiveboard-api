import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function LoginLayout({ children }: DashboardLayoutProps) {
  return <div>{children}</div>;
}

'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Server,
    FileText,
    Key,
    Terminal,
    Activity,
    Settings,
    LogOut,
    ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { PLAN_LIMITS } from '@/config/plans';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardSidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [collapsed, setCollapsed] = React.useState(false);

    // Navigation Items
    const items = [
        {
            title: 'Overview',
            href: '/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'Backend Systems',
            href: '/dashboard/systems',
            icon: Server,
        },
        {
            title: 'Forms',
            href: '/dashboard/forms',
            icon: FileText,
        },
        {
            title: 'Connectors',
            href: '/dashboard/connectors',
            icon: Key,
        },
        {
            title: 'API & Piko AI',
            href: '/dashboard/api',
            icon: Terminal,
        },
        {
            title: 'Settings',
            href: '/dashboard/settings',
            icon: Settings,
        },
    ];

    const SidebarContent = () => (
        <div className='flex h-full flex-col gap-4'>
            <div
                className={cn(
                    'flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6',
                    collapsed && 'justify-center px-2',
                )}
            >
                <Link
                    href='/'
                    className='flex items-center gap-2 font-semibold'
                >
                    {!collapsed && (
                        <div className='relative h-6 w-28'>
                            <Image
                                src='/PostPipe-Black.svg'
                                alt='PostPipe'
                                fill
                                sizes='112px'
                                className='dark:hidden object-contain object-left'
                            />
                            <Image
                                src='/PostPipe.svg'
                                alt='PostPipe'
                                fill
                                sizes='112px'
                                className='hidden dark:block object-contain object-left'
                            />
                        </div>
                    )}
                    {collapsed && <span className='font-bold text-xl'>P</span>}
                </Link>
                {!collapsed && (
                    <Button
                        variant='ghost'
                        size='icon'
                        className='ml-auto h-8 w-8 lg:hidden'
                    >
                        {/* Mobile close handled by Sheet */}
                    </Button>
                )}
            </div>

            <div className='flex-1 relative min-h-0 overflow-hidden my-2'>
                <div 
                    className='h-full overflow-y-auto overflow-x-hidden no-scrollbar'
                    style={{
                        maskImage: 'linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent)'
                    }}
                >
                    <nav className='grid items-start px-2 py-4 text-sm font-medium lg:px-4 gap-1'>
                        {items.map((item, index) => {
                            const Icon = item.icon;
                            const isActive =
                                pathname === item.href ||
                                (item.href !== '/dashboard' &&
                                    pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
                                        isActive
                                            ? 'bg-muted text-primary'
                                            : 'text-muted-foreground',
                                        collapsed && 'justify-center px-2',
                                    )}
                                    title={collapsed ? item.title : undefined}
                                >
                                    <Icon className='h-4 w-4 shrink-0' />
                                    {!collapsed && item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {!collapsed && user && (
                <div className='px-4 mt-auto mb-4'>
                    <div className='rounded-xl border bg-card text-card-foreground shadow-sm p-4 space-y-3'>
                        <div>
                            <p className='text-sm font-semibold'>Usage</p>
                            <p className='text-xs text-muted-foreground'>
                                {user.plan === 'enterprise' ? 'Unlimited Submissions' : `${user.monthlySubmissions || 0} / ${(PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS]?.submissions || PLAN_LIMITS.starter.submissions).toLocaleString()} Submissions`}
                            </p>
                        </div>
                        {user.plan !== 'enterprise' && (
                            <Progress 
                                value={Math.min(100, ((user.monthlySubmissions || 0) / (PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS]?.submissions || PLAN_LIMITS.starter.submissions)) * 100)} 
                                className='h-2 bg-muted-foreground/20' 
                            />
                        )}
                        {user.plan === 'starter' && (
                            <Link href="/pricing" className="block w-full">
                                <Button size="sm" className="w-full h-8 text-xs font-bold mt-1 bg-gradient-to-r from-violet-500 to-primary text-white border-0">Upgrade to Builder</Button>
                            </Link>
                        )}
                        {user.plan === 'builder' && (
                            <Link href="mailto:founder@postpipe.in" className="block w-full">
                                <Button variant="outline" size="sm" className="w-full h-8 text-xs font-bold mt-1">Contact Enterprise</Button>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <div className='border-t p-4'>
                <Button
                    variant='ghost'
                    className={cn(
                        'w-full justify-start gap-2 text-muted-foreground hover:text-destructive',
                        collapsed && 'justify-center px-0',
                    )}
                    onClick={logout}
                >
                    <LogOut className='h-4 w-4' />
                    {!collapsed && 'Log out'}
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div
                className={cn(
                    'hidden border-r bg-muted/40 md:block',
                    collapsed ? 'w-[70px]' : 'w-[220px] lg:w-[280px]',
                    className,
                )}
            >
                <SidebarContent />
                <div className='absolute top-3 -right-3 z-20 hidden md:block'>
                    <Button
                        variant='outline'
                        size='icon'
                        className='h-6 w-6 rounded-full border shadow-sm'
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <ChevronLeft
                            className={cn(
                                'h-3 w-3 transition-transform',
                                collapsed && 'rotate-180',
                            )}
                        />
                    </Button>
                </div>
            </div>

            {/* Mobile Sidebar (Sheet) - Trigger usually in Header, but can be managed here if layout passes trigger */}
        </>
    );
}

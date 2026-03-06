import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-background relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
            </div>
            <div className="relative z-10 w-full">
                <Outlet />
            </div>
        </div>
    );
}

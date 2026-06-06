import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div className="min-h-[100dvh] bg-canvas relative flex flex-col justify-center py-12 px-6 overflow-hidden">
            {/* Faint grid texture — quiet, not glassy */}
            <div
                className="absolute inset-0 z-0 opacity-[0.5] pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                    maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
                    WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
                }}
            />
            <div className="relative z-10 w-full">
                <Outlet />
            </div>
        </div>
    );
}

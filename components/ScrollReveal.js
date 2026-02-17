'use client';
import { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({ children, delay = 0, direction = 'up' }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const transforms = {
        up: 'translateY(24px)',
        down: 'translateY(-24px)',
        left: 'translateX(-24px)',
        right: 'translateX(24px)',
        scale: 'scale(0.97)',
    };

    return (
        <div
            ref={ref}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : transforms[direction],
                transition: `opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s, transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s`,
                willChange: 'opacity, transform',
            }}
        >
            {children}
        </div>
    );
}

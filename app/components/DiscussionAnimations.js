'use client';

import { motion } from 'framer-motion';

export default function DiscussionAnimations() {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 select-none">
            {/* Animated subtle gradient blobs */}
            <motion.div
                className="absolute top-[-120px] left-[-120px] w-[340px] h-[340px] rounded-full bg-gradient-to-br from-indigo-300/30 via-violet-200/20 to-blue-300/20 blur-2xl"
                animate={{ scale: [1, 1.1, 0.95, 1] }}
                transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-[-80px] right-[-120px] w-[220px] h-[220px] rounded-full bg-gradient-to-tr from-yellow-200/30 via-pink-200/30 to-indigo-100/20 blur-2xl"
                animate={{ scale: [1, 0.95, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 17, ease: "easeInOut" }}
            />
            {/* Wavy animated SVG at the top */}
            <motion.svg
                className="absolute top-0 left-0 w-full h-16"
                viewBox="0 0 1440 80"
                fill="none"
                preserveAspectRatio="none"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.3 }}
            >
                <motion.path
                    d="M0,40 Q360,10 720,40 T1440,40 V80 H0Z"
                    fill="url(#waveGradient)"
                />
                <defs>
                    <linearGradient id="waveGradient" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#a882fc" stopOpacity="0.21" />
                        <stop offset="1" stopColor="#fd8601" stopOpacity="0.16" />
                    </linearGradient>
                </defs>
            </motion.svg>
        </div>
    );
}

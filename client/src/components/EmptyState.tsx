import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiPlus } from 'react-icons/fi';

export const EmptyState = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const steps = [
        { num: '01', title: "List rewards", text: "Share your digital rewards." },
        { num: '02', title: "Earn credits", text: "Get paid instantly." },
        { num: '03', title: "Reinvest", text: "Acquire better rewards." },
    ];

    return (
        <div className="w-full max-w-5xl mx-auto py-24 px-6 flex flex-col items-center justify-center min-h-[60vh]">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-20"
            >
                <h2 className="text-6xl md:text-7xl font-sans font-bold tracking-tighter text-gray-900 dark:text-white mb-6">
                    The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Cycle</span>.
                </h2>
                <p className="text-xl md:text-2xl text-gray-400 font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
                    A self-sustaining economy of high-value digital assets. <br/>
                    Be the spark.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-4xl relative">
                {/* Minimal Connecting Line */}
                <div className="hidden md:block absolute top-8 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />

                {steps.map((step, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (i * 0.15), duration: 0.6 }}
                        className="relative group text-center md:text-left"
                    >
                        <div className="md:absolute -top-3 left-0 md:left-auto md:right-full pr-4 hidden">
                           {/* Decorative node if needed */}
                        </div>
                        
                        <div className="text-sm font-mono font-bold text-cyan-500 mb-4 opacity-80 tracking-widest">{step.num}</div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight group-hover:text-cyan-500 transition-colors duration-300">
                            {step.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{step.text}</p>
                    </motion.div>
                ))}
            </div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-24"
            >
                <button
                    onClick={() => isAuthenticated ? navigate('/rewards/create') : navigate('/signin')}
                    className="group flex items-center gap-4 px-8 py-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black transition-all hover:scale-105 active:scale-95"
                >
                    <span className="text-lg font-bold tracking-wide">
                        {isAuthenticated ? 'Create Listing' : 'Enter Economy'}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                         {isAuthenticated ? <FiPlus /> : <FiArrowRight />}
                    </div>
                </button>
            </motion.div>
        </div>
    );
}; 
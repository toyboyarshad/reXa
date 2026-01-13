import { PageLayout } from '../components/PageLayout';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiShield, FiHexagon } from 'react-icons/fi';
import { BiLayer } from 'react-icons/bi';

export const Wallet = () => {
    const { user } = useAuth();

    return (
        <PageLayout>
            <div className="max-w-5xl mx-auto space-y-12 pb-20">
                {/* Header */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4 pt-10"
                >
                    <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        Credit Vault
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Your platform power and trust-backed assets.</p>
                </motion.div>

                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Credits */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-premium"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                            <FiHexagon size={160} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-2 text-indigo-100/80 font-bold uppercase tracking-widest text-sm">
                                <FiHexagon size={20} />
                                <span>Available Credits</span>
                            </div>
                            <div className="text-6xl font-black tracking-tighter">
                                {user?.creditBalance?.toLocaleString() || '0'}
                            </div>
                            <div className="pt-4 flex items-center gap-3">
                                <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Spending Power</div>
                                <p className="text-xs text-white/60 font-medium">
                                    Use credits to unlock premium rewards.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Escrow */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group border-white/20 dark:border-white/5"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-gray-900 dark:text-white">
                            <FiShield size={160} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-sm">
                                <FiShield size={20} />
                                <span>Credits in Escrow</span>
                            </div>
                            <div className="text-6xl font-black tracking-tighter text-gray-900 dark:text-white">
                                {user?.escrowCredits?.toLocaleString() || '0'}
                            </div>
                            <div className="pt-4 flex items-center gap-3">
                                <div className="px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-500/20">Protected</div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium text-pretty max-w-[200px]">
                                    Locked until transactions complete.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Coming Soon / Info */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-[3rem] p-10 border-white/20 dark:border-white/5 relative z-10 text-center space-y-6"
                >
                    <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 mb-2">
                        <BiLayer size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Acquire More Power</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
                        Earn credits by selling high-quality digital assets, maintaining a high Trust Score, and resolving disputes fairly. 
                        <br/><span className="text-sm opacity-60 mt-2 block">(Credit purchase packs coming soon)</span>
                    </p>
                    <button disabled className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-400 font-black rounded-2xl cursor-not-allowed">
                        Buy Credits (Locked)
                    </button>
                </motion.div>
            </div>
        </PageLayout>
    );
};

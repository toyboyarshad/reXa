// File: client/src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { authApi } from "../services/api";
import { toast } from "react-hot-toast";
import { FiEdit2, FiSave, FiX, FiCheckCircle } from "react-icons/fi";
import { useRecoilState } from "recoil";
import {
  profileErrorState,
  profileLoadingState,
  profileState,
} from "../store/atoms";
import { PageLayout } from "../components/PageLayout";
import { motion } from "framer-motion";

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  points: number;
  redeemedRewards: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export const Profile = () => {
  const [profile, setProfile] = useRecoilState<UserProfile | any>(profileState);
  const [loading, setLoading] = useRecoilState<boolean>(profileLoadingState);
  const [error, setError] = useRecoilState<string>(profileErrorState);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(profile);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authApi.getProfile();
      setProfile(response.data);
      setEditedProfile(response.data);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to load profile";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile || !profile._id) fetchProfile();
    else setLoading(false);
  }, []);

  const handleUpdate = async () => {
    if (!editedProfile) return;
    try {
      setLoading(true);
      const response = await authApi.updateProfile({
        name: editedProfile.name,
        email: editedProfile.email,
      });
      setProfile(response.data);
      setEditedProfile(response.data);
      setIsEditing(false);
      toast.success("Profile updated");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update profile";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 dark:border-white border-t-transparent" />
      </div>
    );

  if (error || !profile)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {error || "Profile unavailable"}
      </div>
    );

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto py-20 px-6">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16"
        >
            {/* Minimal Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                        Identity.
                    </h1>
                    <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                        ID: {profile._id}
                    </p>
                </div>
                
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <FiEdit2 className="w-5 h-5" />
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><FiX /></button>
                        <button onClick={handleUpdate} className="p-3 rounded-full bg-black dark:bg-white text-white dark:text-black"><FiSave /></button>
                    </div>
                )}
            </div>

            {/* Main Info */}
            <div className="space-y-12">
                <div className="group">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Display Name</label>
                    {isEditing ? (
                        <input 
                            value={editedProfile?.name}
                            onChange={(e) => setEditedProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                            className="w-full text-3xl font-medium bg-transparent border-b border-gray-200 dark:border-gray-800 focus:border-cyan-500 outline-none pb-2 transition-colors"
                        />
                    ) : (
                        <div className="text-3xl font-medium text-gray-900 dark:text-white flex items-center gap-3">
                            {profile.name}
                            {profile.isVerified && <FiCheckCircle className="text-cyan-500 w-6 h-6" />}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Email Address</label>
                    <div className="text-2xl font-light text-gray-600 dark:text-gray-300 font-mono">
                        {profile.email}
                    </div>
                </div>
            </div>

            {/* Minimal Stats */}
            <div className="grid grid-cols-2 gap-12 pt-12 border-t border-gray-100 dark:border-gray-900">
                <div>
                    <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {profile.points.toLocaleString()}
                    </div>
                    <div className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Credit Balance</div>
                </div>
                <div>
                    <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {profile.redeemedRewards}
                    </div>
                    <div className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Acquisitions</div>
                </div>
            </div>
            
            <div className="text-center pt-20">
                 <div className="text-xs font-mono text-gray-300 dark:text-gray-700">
                    MEMBER SINCE {new Date(profile.createdAt).getFullYear()}
                 </div>
            </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Profile;

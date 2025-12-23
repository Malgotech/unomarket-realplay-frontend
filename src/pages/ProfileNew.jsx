import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../services/apiServices";
import Ownpost from "../components/content/Ownpost";

const ProfileNew = () => {
    const { userData } = useSelector((state) => state.user);
    const theme = useSelector((state) => state.theme.value);
    const isDarkMode = theme === "dark";

    const navigate = useNavigate();

    const [followingCount, setFollowingCount] = useState(0);
    const [followersCount, setFollowersCount] = useState(0);

    const fetchFollowCounts = async () => {
        try {
            const res = await fetchData(
                `api/user/follow/counts`
            );
            if (res.success) {
                setFollowingCount(res.followingCount);
                setFollowersCount(res.followersCount);
            }
        } catch (err) {
            console.error("Follow counts error:", err);
        }
    };

    useEffect(() => {

        fetchFollowCounts();

    }, []);

    return (
        <div className="w-full lg:max-w-[60%] border-l border-r border-black overflow-y-auto">
            <div className="p-4 border-b border-black">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img
                            src={userData?.user?.profileImage}
                            alt="profile"
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <h1
                            className={`text-[18px] font-medium ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                                }`}
                        >
                            {userData?.user?.username || "newuser"}
                        </h1>
                    </div>

                    <button
                        onClick={() => navigate("/profile/edit")}
                        className="h-8 px-4 text-sm font-semibold rounded-md bg-[#FF532A] text-white"
                    >
                        Edit
                    </button>
                </div>

                <div className="flex gap-6 mt-3">
                    <p
                        className={`text-sm font-semibold ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                            }`}
                    >
                        <span className="font-bold">{followersCount}</span> Followers
                    </p>

                    <p
                        className={`text-sm font-semibold ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
                            }`}
                    >
                        <span className="font-bold">{followingCount}</span> Following
                    </p>
                </div>
            </div>

            <Ownpost />
        </div>
    );
};

export default ProfileNew;

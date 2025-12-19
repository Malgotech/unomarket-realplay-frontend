import React from "react";

const MediaPost = () => {
  return (
    <div className="mt-4">
      <div className="flex gap-4">
        <img
          className="w-52 h-52 rounded-[19.68px] border-2 border-slate-300"
          src="https://placehold.co/201x201"
        />
        <div className="w-52 h-52 bg-zinc-800/20 rounded-[19.90px] border-2 border-zinc-800 flex justify-center items-center">
          <i className=" text-6xl ri-add-line"></i>
        </div>
      </div>

      <div className="w-full h-80 bg-neutral-100 rounded-lg mt-5">
        <textarea
          className="w-full h-full bg-transparent focus:outline-none text-zinc-800 placeholder:text-zinc-800 placeholder:font-semibold p-4 resize-none"
          placeholder="Body"
        />
      </div>
    </div>
  );
};

export default MediaPost;

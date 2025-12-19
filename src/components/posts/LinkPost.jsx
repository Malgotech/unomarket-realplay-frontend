import React from "react";

const LinkPost = () => {
  return (
    <div className="mt-4">
      <div className="w-full h-16 bg-neutral-100 rounded-lg flex items-center px-4">
        <input
          type="text"
          placeholder="Enter Link"
          className="w-full h-full bg-transparent focus:outline-none text-zinc-800 placeholder:text-zinc-800 placeholder:font-semibold"
        />
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

export default LinkPost;

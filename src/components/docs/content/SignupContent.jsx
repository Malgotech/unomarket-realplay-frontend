import React from "react";



const SignupContent = ({ isDarkMode }) => {
  return (
    <div className="prose max-w-none">
      <h1
        className={`text-3xl font-bold mb-6 ${isDarkMode ? "text-[#C5C5C5]" : "text-zinc-800"
          }`}
      >
        Sign-Up
      </h1>

      <div className="space-y-6">
        <p
          className={`text-base leading-relaxed ${isDarkMode ? "text-zinc-300" : "text-zinc-600"
            }`}
        >
          Soundbet offers a secure, email-only sign-up process to ensure user
          privacy and simplicity. Users provide a verified email address to
          receive a confirmation link, activating their account swiftly.
        </p>

        <p
          className={`text-base leading-relaxed ${isDarkMode ? "text-zinc-300" : "text-zinc-600"
            }`}
        >
          To enhance security, Soundbet mandates two-factor authentication (2FA)
          during registration, supporting authenticator apps to protect against
          unauthorized access. This robust measure safeguards user accounts and
          trading activities.
        </p>

        <p
          className={`text-base leading-relaxed ${isDarkMode ? "text-zinc-300" : "text-zinc-600"
            }`}
        >
          Once 2FA is set up, users can log in confidently and access Soundbet's
          prediction markets. The streamlined process prioritizes ease of use
          while maintaining high security standards, making it ideal for both
          new and experienced users.
        </p>
      </div>
    </div>
  );
};

export default SignupContent;

import React from 'react';

interface LogoProps {
  className?: string;
  size?: "small" | "medium" | "large";
}

const Logo = ({ className = "", size = "medium" }: LogoProps) => {
  const sizeClasses = {
    small: "h-8",
    medium: "h-10",
    large: "h-16",
  };

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} text-primary`}
        viewBox="0 0 80 80"
        fill="currentColor"
      >
        <path d="M40 0C17.9 0 0 17.9 0 40s17.9 40 40 40 40-17.9 40-40S62.1 0 40 0zm0 72c-17.6 0-32-14.4-32-32S22.4 8 40 8s32 14.4 32 32-14.4 32-32 32z" />
        <path d="M56 28H24c-2.2 0-4 1.8-4 4v16c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V32c0-2.2-1.8-4-4-4zm-4 8H44v8h-8v-8h-8v-4h24v4z" />
      </svg>
      <span className="font-bold text-neutral-900 ml-2 text-xl">Já Comprei</span>
    </div>
  );
};

export default Logo;

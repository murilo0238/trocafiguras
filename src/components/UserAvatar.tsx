interface UserAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  className?: string;
}

const UserAvatar = ({ avatarUrl, displayName, className = "w-10 h-10" }: UserAvatarProps) => {
  const initials = displayName
    ? displayName.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName || "Avatar"}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold select-none ${className}`}
    >
      <span className="text-[40%] leading-none">{initials}</span>
    </div>
  );
};

export default UserAvatar;

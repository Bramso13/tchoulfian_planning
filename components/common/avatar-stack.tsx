type Avatar = {
  name: string;
  avatarUrl: string;
};

type AvatarStackProps = {
  avatars: Avatar[];
  maxVisible?: number;
};

export function AvatarStack({ avatars, maxVisible = 2 }: AvatarStackProps) {
  const visibleAvatars = avatars.slice(0, maxVisible);
  const extraCount = avatars.length - visibleAvatars.length;

  return (
    <div className="flex -space-x-2">
      {visibleAvatars.map((avatar, index) => (
        <img
          key={index}
          src={avatar.avatarUrl}
          alt={avatar.name}
          title={avatar.name}
          className="h-8 w-8 rounded-full border-2 border-white object-cover"
        />
      ))}
      {extraCount > 0 ? (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-semibold text-slate-700">
          +{extraCount}
        </div>
      ) : null}
    </div>
  );
}




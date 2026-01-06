import { StatusBadge } from "@/components/common/status-badge";

type EmployeeCardProps = {
  name: string;
  role: string;
  avatarUrl: string;
  contract: string;
  status: {
    label: string;
    tone:
      | "emerald"
      | "amber"
      | "blue"
      | "rose"
      | "slate"
      | "violet"
      | "teal";
  };
  skills: string[];
  assignments: string;
  onClick?: () => void;
};

export function EmployeeCard({
  name,
  role,
  avatarUrl,
  contract,
  status,
  skills,
  assignments,
  onClick,
}: EmployeeCardProps) {
  return (
    <article
      onClick={onClick}
      className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md cursor-pointer"
    >
      <header className="flex items-center gap-4">
        <img
          src={avatarUrl}
          alt={name}
          className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-sm"
        />
        <div>
          <h3 className="text-base font-semibold text-slate-900">{name}</h3>
          <p className="text-sm text-slate-500">{role}</p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <StatusBadge label={status.label} tone={status.tone} />
        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
          {contract}
        </span>
        <span>{assignments}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600"
          >
            {skill}
          </span>
        ))}
      </div>
    </article>
  );
}






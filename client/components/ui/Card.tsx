import GlassCard from "./GlassCard";

export default function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <GlassCard compact>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</h2>
    </GlassCard>
  );
}

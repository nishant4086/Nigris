import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: number;
  withText?: boolean;
  subtext?: string;
  text?: string;
}

export default function Logo({ className = "", size = 32, withText = true, subtext, text = "Nigris" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
        <Image
          src="/logo.png"
          alt="Logo"
          width={size}
          height={size}
          className="object-contain w-auto h-auto"
          priority
        />
      </div>
      {withText && (
        <div>
          <span className="block text-base font-black tracking-tight text-slate-950 dark:text-white leading-tight">
            {text}
          </span>
          {subtext && (
            <span className="block text-[10px] font-semibold text-slate-400 leading-tight">
              {subtext}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

import Image from "next/image";
import logo from "../../public/logo.png";

export function Logo({
  className = "h-8 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={logo}
      alt="Chaos's Catacombs"
      priority={priority}
      className={className}
    />
  );
}

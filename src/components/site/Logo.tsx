import logo from "@/assets/pavitram-logo.png";
import { Link } from "@tanstack/react-router";

export function Logo({ className = "h-12 w-auto" }: { className?: string }) {
  return (
    <Link to="/" aria-label="Pavitram Diamond Jewellery — Home" className="inline-flex items-center">
      <img src={logo} alt="Pavitram Diamond Jewellery" className={className} />
    </Link>
  );
}

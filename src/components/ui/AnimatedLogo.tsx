import Image from "next/image";

export function AnimatedLogo() {
  return (
    <div className="landing-logo">
      <div className="relative w-72 h-72">
        <Image
          src="/Octo-5-transparent-lossy.gif"
          alt="Tambo AI"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}

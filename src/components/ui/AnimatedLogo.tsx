import Image from "next/image";

export function AnimatedLogo() {
  return (
    <div className="landing-logo">
      <div className="landing-logo-circle">
        <div className="landing-logo-inner">
          <Image
            src="/Octo-5-transparent-lossy.gif"
            alt="DevPilot"
            fill
            className="object-contain landing-logo-image"
            priority
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}

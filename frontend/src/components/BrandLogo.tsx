import medyraLogo from "../assets/logo/medyra-logo.png";

type BrandLogoProps = {
  className?: string;
};

export const BrandLogo = ({ className }: BrandLogoProps) => {
  return (
    <img
      src={medyraLogo}
      alt="Medyra logo"
      className={`object-contain ${className ?? ""}`}
    />
  );
};

type BrandLogoProps = {
  className?: string;
  alt?: string;
};

export default function BrandLogo({
  className = "",
  alt = "Uphar logo",
}: BrandLogoProps) {
  return (
    <img
      src="/uphar-monogram.png"
      alt={alt}
      className={`block h-10 w-auto object-contain ${className}`.trim()}
      loading="eager"
    />
  );
}

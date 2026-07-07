import Image from "next/image";

/**
 * Logotipo oficial de la iglesia Unión Pentecostal.
 * Variantes según el fondo: white (fondos azules), navy (fondos claros), gold (acentos).
 */
export default function Logo({
  variant = "white",
  size = 40,
  className = "",
}: {
  variant?: "white" | "navy" | "gold";
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={`/logo-${variant}.png`}
      alt="Logo de la iglesia Unión Pentecostal"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}

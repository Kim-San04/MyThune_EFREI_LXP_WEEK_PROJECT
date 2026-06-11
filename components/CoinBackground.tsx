/**
 * Subtle tiled texture of scattered coin outlines behind the landing page content.
 */
const COINS_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='480'%3E%3Cg fill='none' stroke-width='3'%3E%3Ccircle cx='60' cy='80' r='26' stroke='%23F59E0B' opacity='0.16'/%3E%3Ccircle cx='60' cy='80' r='17' stroke='%23F59E0B' opacity='0.16'/%3E%3Ccircle cx='380' cy='50' r='18' stroke='%23F59E0B' opacity='0.14'/%3E%3Ccircle cx='380' cy='50' r='11' stroke='%23F59E0B' opacity='0.14'/%3E%3Ccircle cx='230' cy='220' r='32' stroke='%23F97316' opacity='0.13'/%3E%3Ccircle cx='230' cy='220' r='21' stroke='%23F97316' opacity='0.13'/%3E%3Ccircle cx='100' cy='340' r='20' stroke='%23F59E0B' opacity='0.15'/%3E%3Ccircle cx='100' cy='340' r='13' stroke='%23F59E0B' opacity='0.15'/%3E%3Ccircle cx='410' cy='390' r='28' stroke='%23F97316' opacity='0.13'/%3E%3Ccircle cx='410' cy='390' r='18' stroke='%23F97316' opacity='0.13'/%3E%3Ccircle cx='300' cy='70' r='14' stroke='%23F59E0B' opacity='0.14'/%3E%3Ccircle cx='300' cy='70' r='9' stroke='%23F59E0B' opacity='0.14'/%3E%3Ccircle cx='30' cy='430' r='15' stroke='%23F97316' opacity='0.12'/%3E%3Ccircle cx='30' cy='430' r='10' stroke='%23F97316' opacity='0.12'/%3E%3C/g%3E%3C/svg%3E";

export default function CoinBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        backgroundImage: `url("${COINS_SVG}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "480px 480px",
      }}
      aria-hidden="true"
    />
  );
}

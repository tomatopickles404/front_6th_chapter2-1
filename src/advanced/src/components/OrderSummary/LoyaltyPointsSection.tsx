interface LoyaltyPointsSectionProps {
  loyaltyPoints: string;
  loyaltyPointsZero: string;
}

export function LoyaltyPointsSection({
  loyaltyPoints,
  loyaltyPointsZero,
}: LoyaltyPointsSectionProps) {
  return (
    <div id="loyalty-points" className="text-xs text-blue-400 mt-2 text-right">
      {Number(loyaltyPoints) > 0
        ? loyaltyPoints.replace('{points}', loyaltyPoints)
        : loyaltyPointsZero.replace('{points}', '0')}
    </div>
  );
}

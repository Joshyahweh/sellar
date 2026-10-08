import { StarFilledIcon } from "@/components/icons";

type StarRatingProps = {
  size: 16 | 20;
  value: number;
};

function Star({ size, fill }: { size: number; fill: number }) {
  const amount = Math.min(1, Math.max(0, fill));

  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }} aria-hidden>
      <StarFilledIcon size={size} color="#B7C3CC" />
      {amount > 0 ? (
        <span
          className="absolute top-0 left-0 overflow-hidden"
          style={{ width: size * amount, height: size }}
        >
          <StarFilledIcon size={size} color="#FF0C6D" />
        </span>
      ) : null}
    </span>
  );
}

export function StarRating({ size, value }: StarRatingProps) {
  const score = Math.min(5, Math.max(0, value));
  const label = Number.isInteger(score) ? `${score} out of 5 stars` : `${score.toFixed(1)} out of 5 stars`;

  return (
    <div className="flex items-center" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={size} fill={score - index} />
      ))}
    </div>
  );
}

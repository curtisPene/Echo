export const EchoLogo = ({ size = 24 }: { size?: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="24"
        cy="24"
        r="19"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.3"
      />
      <circle
        cx="24"
        cy="24"
        r="13.5"
        stroke="currentColor"
        strokeWidth="2.2"
        opacity="0.6"
      />
      <path
        d="M24 15.5a8.5 8.5 0 0 0-8.5 8.5c0 2.63 1.28 4.98 3.28 6.46-.14 1.15-.55 2.3-1.25 3.36a.4.4 0 0 0 .43.62c1.77-.5 3.28-1.28 4.5-2.2.8.17 1.65.26 2.54.26a8.5 8.5 0 0 0 0-17Z"
        fill="currentColor"
      />
    </svg>
  );
};

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
};

function svgProps({
  size = 24,
  color = "currentColor",
  className,
  style,
  ...rest
}: IconProps) {
  return {
    width: size,
    height: size,
    fill: "none" as const,
    className,
    style: { color, ...style },
    ...rest,
  };
}

/** vuesax/bold/profile-circle — exported from Figma */
export function ProfileCircleIcon({ size = 24, color = "#626262", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M22 12C22 6.49 17.51 2 12 2C6.49 2 2 6.49 2 12C2 14.9 3.25 17.51 5.23 19.34C5.23 19.35 5.23 19.35 5.22 19.36C5.32 19.46 5.44 19.54 5.54 19.63C5.6 19.68 5.65 19.73 5.71 19.77C5.89 19.92 6.09 20.06 6.28 20.2C6.35 20.25 6.41 20.29 6.48 20.34C6.67 20.47 6.87 20.59 7.08 20.7C7.15 20.74 7.23 20.79 7.3 20.83C7.5 20.94 7.71 21.04 7.93 21.13C8.01 21.17 8.09 21.21 8.17 21.24C8.39 21.33 8.61 21.41 8.83 21.48C8.91 21.51 8.99 21.54 9.07 21.56C9.31 21.63 9.55 21.69 9.79 21.75C9.86 21.77 9.93 21.79 10.01 21.8C10.29 21.86 10.57 21.9 10.86 21.93C10.9 21.93 10.94 21.94 10.98 21.95C11.32 21.98 11.66 22 12 22C12.34 22 12.68 21.98 13.01 21.95C13.05 21.95 13.09 21.94 13.13 21.93C13.42 21.9 13.7 21.86 13.98 21.8C14.05 21.79 14.12 21.76 14.2 21.75C14.44 21.69 14.69 21.64 14.92 21.56C15 21.53 15.08 21.5 15.16 21.48C15.38 21.4 15.61 21.33 15.82 21.24C15.9 21.21 15.98 21.17 16.06 21.13C16.27 21.04 16.48 20.94 16.69 20.83C16.77 20.79 16.84 20.74 16.91 20.7C17.11 20.58 17.31 20.47 17.51 20.34C17.58 20.3 17.64 20.25 17.71 20.2C17.91 20.06 18.1 19.92 18.28 19.77C18.34 19.72 18.39 19.67 18.45 19.63C18.56 19.54 18.67 19.45 18.77 19.36C18.77 19.35 18.77 19.35 18.76 19.34C20.75 17.51 22 14.9 22 12ZM16.94 16.97C14.23 15.15 9.79 15.15 7.06 16.97C6.62 17.26 6.26 17.6 5.96 17.97C4.44 16.43 3.5 14.32 3.5 12C3.5 7.31 7.31 3.5 12 3.5C16.69 3.5 20.5 7.31 20.5 12C20.5 14.32 19.56 16.43 18.04 17.97C17.75 17.6 17.38 17.26 16.94 16.97Z"
        fill="currentColor"
      />
      <path
        d="M12 6.93C9.93 6.93 8.25 8.61 8.25 10.68C8.25 12.71 9.84 14.36 11.95 14.42C11.98 14.42 12.02 14.42 12.04 14.42C12.06 14.42 12.09 14.42 12.11 14.42C12.12 14.42 12.13 14.42 12.13 14.42C14.15 14.35 15.74 12.71 15.75 10.68C15.75 8.61 14.07 6.93 12 6.93Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** vuesax/linear/arrow-down — exported from Figma */
export function ArrowDownIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M18.07 14.43L12 20.5L5.93 14.43"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 3.5V20.33"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** ant-design:star-filled — exported from Figma, fill #FF0C6D */
export function StarFilledIcon({ size = 20, color = "#FF0C6D", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 20 20">
      <path
        d="M17.7363 6.89648L12.7773 6.17578L10.5605 1.68164C10.5 1.55859 10.4004 1.45898 10.2773 1.39844C9.96875 1.24609 9.59375 1.37305 9.43945 1.68164L7.22266 6.17578L2.26367 6.89648C2.12695 6.91602 2.00195 6.98047 1.90625 7.07812C1.79055 7.19704 1.72679 7.35703 1.72899 7.52293C1.73119 7.68884 1.79916 7.84708 1.91797 7.96289L5.50586 11.4609L4.6582 16.4004C4.63833 16.5153 4.65104 16.6335 4.69491 16.7415C4.73877 16.8496 4.81203 16.9431 4.90638 17.0117C5.00073 17.0802 5.1124 17.1209 5.22871 17.1292C5.34502 17.1375 5.46133 17.113 5.56445 17.0586L10 14.7266L14.4355 17.0586C14.5566 17.123 14.6973 17.1445 14.832 17.1211C15.1719 17.0625 15.4004 16.7402 15.3418 16.4004L14.4941 11.4609L18.082 7.96289C18.1797 7.86719 18.2441 7.74219 18.2637 7.60547C18.3164 7.26367 18.0781 6.94727 17.7363 6.89648Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** FAQ plus — exported from Figma, stroke #283136 */
export function PlusIcon({ size = 16, color = "#283136", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 16 16">
      <path d="M8 1L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 8L1 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** FAQ / modal close X — exported from Figma */
export function MenuIcon({
  size = 24,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ color }}
      aria-hidden
    >
      <path
        d="M3 7H21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 12H21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 17H21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CrossIcon({
  size = 14,
  color = "currentColor",
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      className={className}
      style={{ color }}
      aria-hidden
    >
      <path
        d="M11.9497 2.05025L2.05025 11.9497"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M11.9497 11.9497L2.05025 2.05025"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Iconly/Regular/Light/Buy — exported from Figma */
export function BuyIcon({ size = 24, color = "#373535", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 20.0002 19.5417">
      <path
        d="M0.750123 0.750123L2.83012 1.11012L3.79312 12.5831C3.87012 13.5201 4.65312 14.2391 5.59312 14.2361H16.5021C17.3991 14.2381 18.1601 13.5781 18.2871 12.6901L19.2361 6.13212C19.3421 5.39912 18.8331 4.71912 18.1011 4.61312C18.0371 4.60412 3.16412 4.59912 3.16412 4.59912"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.1251 8.29502H14.8981"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.15442 17.7027C5.45542 17.7027 5.69842 17.9467 5.69842 18.2467C5.69842 18.5477 5.45542 18.7917 5.15442 18.7917C4.85342 18.7917 4.61042 18.5477 4.61042 18.2467C4.61042 17.9467 4.85342 17.7027 5.15442 17.7027Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.4347 17.7027C16.7357 17.7027 16.9797 17.9467 16.9797 18.2467C16.9797 18.5477 16.7357 18.7917 16.4347 18.7917C16.1337 18.7917 15.8907 18.5477 15.8907 18.2467C15.8907 17.9467 16.1337 17.7027 16.4347 17.7027Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Contact Us sparkle (Group 1, 35×35) */
export function SparkleIcon({ size = 35, color = "#296cf0", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 35 35">
      <path
        d="M17.5 2.5C17.5 9.5 25.5 17.5 25.5 17.5C25.5 17.5 17.5 25.5 17.5 32.5C17.5 25.5 9.5 17.5 9.5 17.5C9.5 17.5 17.5 9.5 17.5 2.5Z"
        fill="currentColor"
      />
      <path
        d="M28.5 8.5C28.5 10.8 31.2 13.5 31.2 13.5C31.2 13.5 28.5 16.2 28.5 18.5C28.5 16.2 25.8 13.5 25.8 13.5C25.8 13.5 28.5 10.8 28.5 8.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** vuesax/bold/location */
export function LocationIcon({ size = 24, color = "#FBFCFC", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M20.621 8.45c-1.05-4.62-5.08-6.7-8.62-6.7h-.01c-3.53 0-7.57 2.07-8.62 6.69-1.17 5.16 1.99 9.53 4.85 12.28a5.436 5.436 0 0 0 3.78 1.53c1.36 0 2.72-.51 3.77-1.53 2.86-2.75 6.02-7.11 4.85-12.27Zm-8.62 5.01a3.15 3.15 0 1 1 0-6.3 3.15 3.15 0 0 1 0 6.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** vuesax/bold/call-calling */
export function CallCallingIcon({ size = 24, color = "#FBFCFC", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M17.62 10.752a.77.77 0 01-.77-.77c0-.37-.37-1.14-.99-1.81-.61-.65-1.28-1.03-1.84-1.03a.77.77 0 01-.77-.77c0-.42.35-.77.77-.77 1 0 2.05.54 2.97 1.51.86.91 1.41 2.04 1.41 2.86 0 .43-.35.78-.78.78zM21.23 10.75a.77.77 0 01-.77-.77c0-3.55-2.89-6.43-6.43-6.43a.77.77 0 01-.77-.77c0-.42.34-.78.76-.78C18.42 2 22 5.58 22 9.98c0 .42-.35.77-.77.77zM11.05 14.95L9.2 16.8c-.39.39-1.01.39-1.41.01-.11-.11-.22-.21-.33-.32a28.414 28.414 0 01-2.79-3.27c-.82-1.14-1.48-2.28-1.96-3.41C2.24 8.67 2 7.58 2 6.54c0-.68.12-1.33.36-1.93.24-.61.62-1.17 1.15-1.67C4.15 2.31 4.85 2 5.59 2c.28 0 .56.06.81.18.26.12.49.3.67.56l2.32 3.27c.18.25.31.48.4.7.09.21.14.42.14.61 0 .24-.07.48-.21.71-.13.23-.32.47-.56.71l-.76.79c-.11.11-.16.24-.16.4 0 .08.01.15.03.23.03.08.06.14.08.2.18.33.49.76.93 1.28.45.52.93 1.05 1.45 1.58.1.1.21.2.31.3.4.39.41 1.03.01 1.43zM21.97 18.33a2.54 2.54 0 01-.25 1.09c-.17.36-.39.7-.68 1.02-.49.54-1.03.93-1.64 1.18-.01 0-.02.01-.03.01-.59.24-1.23.37-1.92.37-1.02 0-2.11-.24-3.26-.73s-2.3-1.15-3.44-1.98c-.39-.29-.78-.58-1.15-.89l3.27-3.27c.28.21.53.37.74.48.05.02.11.05.18.08.08.03.16.04.25.04.17 0 .3-.06.41-.17l.76-.75c.25-.25.49-.44.72-.56.23-.14.46-.21.71-.21.19 0 .39.04.61.13.22.09.45.22.7.39l3.31 2.35c.26.18.44.39.55.64.1.25.16.5.16.78z"
      />
    </svg>
  );
}

/** vuesax/linear/user */
export function UserIcon({ size = 20, color = "currentColor", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM20.59 22c0-3.87-3.85-7-8.59-7s-8.59 3.13-8.59 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** vuesax/linear/sms */
export function SmsIcon({ size = 20, color = "currentColor", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M17 20.5H7c-3 0-5-1.5-5-5v-7c0-3.5 2-5 5-5h10c3 0 5 1.5 5 5v7c0 3.5-2 5-5 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m17 9-3.13 2.5c-1.03.82-2.72.82-3.75 0L7 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** vuesax/linear/document-text */
export function DocumentTextIcon({ size = 20, color = "currentColor", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M21 7v10c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V7c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 4.5v2c0 1.1.9 2 2 2h2M8 13h4M8 17h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** vuesax/linear/message-text */
export function MessageTextIcon({ size = 20, color = "currentColor", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M16 2H8C4 2 2 4 2 8v13c0 .55.45 1 1 1h13c4 0 6-2 6-6V8c0-4-2-6-6-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 9.5h10M7 14.5h7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AtIcon({ size = 20, color = "currentColor", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M12 19.5A7.5 7.5 0 1 1 19.5 12v1.2a2.3 2.3 0 0 1-4.6 0V12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.2A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** vuesax/bold/card */
export function CardIcon({ size = 24, color = "#296cf0", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M22 7.548c0 .66-.54 1.2-1.2 1.2H3.2c-.66 0-1.2-.54-1.2-1.2v-.01c0-2.29 1.85-4.14 4.14-4.14h11.71c2.29 0 4.15 1.86 4.15 4.15ZM2 11.45v5.01c0 2.29 1.85 4.14 4.14 4.14h11.71c2.29 0 4.15-1.86 4.15-4.15v-5c0-.66-.54-1.2-1.2-1.2H3.2c-.66 0-1.2.54-1.2 1.2Zm6 5.8H6c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h2c.41 0 .75.34.75.75s-.34.75-.75.75Zm6.5 0h-4c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h4c.41 0 .75.34.75.75s-.34.75-.75.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** vuesax/bold/mobile */
export function MobileIcon({ size = 24, color = "#296cf0", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M16.24 2H7.76C5 2 4 3 4 5.81v12.38C4 21 5 22 7.76 22h8.47C19 22 20 21 20 18.19V5.81C20 3 19 2 16.24 2ZM12 19.3c-.96 0-1.75-.79-1.75-1.75s.79-1.75 1.75-1.75 1.75.79 1.75 1.75-.79 1.75-1.75 1.75Zm2-13.05h-4c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h4c.41 0 .75.34.75.75s-.34.75-.75.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** vuesax/bold/building */
export function BuildingIcon({ size = 24, color = "#296cf0", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M10.75 4.64 6.32 2.45c-2.39-1.17-4.35.02-4.35 2.64v14.84c0 1.14.95 2.07 2.11 2.07h7.42c.55 0 1-.45 1-1V7.41c0-1.05-.79-2.3-1.75-2.77Zm-1.78 9.11H5.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h3.47a.749.749 0 1 1 0 1.5Zm0-4H5.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h3.47a.749.749 0 1 1 0 1.5ZM22 18.04v1.46a2.5 2.5 0 0 1-2.5 2.5h-4.53c-.54 0-.97-.43-.97-.97v-2.16c1.07.13 2.2-.18 3.01-.83.68.55 1.55.88 2.5.88.93 0 1.8-.33 2.49-.88ZM22 15.05v.01a2.5 2.5 0 0 1-2.49 2.36 2.5 2.5 0 0 1-2.5-2.5c0 1.53-1.41 2.76-3.01 2.45V12c0-.64.59-1.12 1.22-.98l1.79.4.48.11 2.04.46c.49.1.94.27 1.33.52 0 .01.01.01.01.01.1.07.2.15.29.24.46.46.76 1.13.83 2.11 0 .06.01.12.01.18Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** vuesax/bold/scan-barcode */
export function ScanBarcodeIcon({ size = 24, color = "#296cf0", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M2 9.75c-.41 0-.75-.34-.75-.75V6.5c0-2.9 2.36-5.25 5.25-5.25H9c.41 0 .75.34.75.75s-.34.75-.75.75H6.5c-2.07 0-3.75 1.68-3.75 3.75V9c0 .41-.34.75-.75.75ZM22 9.75c-.41 0-.75-.34-.75-.75V6.5c0-2.07-1.68-3.75-3.75-3.75H15c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h2.5c2.89 0 5.25 2.35 5.25 5.25V9c0 .41-.34.75-.75.75ZM17.5 22.75H16c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.5c2.07 0 3.75-1.68 3.75-3.75V16c0-.41.34-.75.75-.75s.75.34.75.75v1.5c0 2.9-2.36 5.25-5.25 5.25ZM9 22.75H6.5c-2.89 0-5.25-2.35-5.25-5.25V15c0-.41.34-.75.75-.75s.75.34.75.75v2.5c0 2.07 1.68 3.75 3.75 3.75H9c.41 0 .75.34.75.75s-.34.75-.75.75Z"
        fill="currentColor"
      />
      <path
        d="M9 5.25H7c-1.14 0-1.75.6-1.75 1.75v2c0 1.15.61 1.75 1.75 1.75h2c1.14 0 1.75-.6 1.75-1.75V7c0-1.15-.61-1.75-1.75-1.75ZM17 5.25h-2c-1.14 0-1.75.6-1.75 1.75v2c0 1.15.61 1.75 1.75 1.75h2c1.14 0 1.75-.6 1.75-1.75V7c0-1.15-.61-1.75-1.75-1.75ZM9 13.25H7c-1.14 0-1.75.6-1.75 1.75v2c0 1.15.61 1.75 1.75 1.75h2c1.14 0 1.75-.6 1.75-1.75v-2c0-1.15-.61-1.75-1.75-1.75ZM17 13.25h-2c-1.14 0-1.75.6-1.75 1.75v2c0 1.15.61 1.75 1.75 1.75h2c1.14 0 1.75-.6 1.75-1.75v-2c0-1.15-.61-1.75-1.75-1.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** vuesax/bold/tick-circle */
export function TickCircleIcon({ size = 24, color = "#16a34a", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2Zm4.78 7.7-5.67 5.67a.75.75 0 0 1-1.06 0l-2.83-2.83a.754.754 0 0 1 0-1.06c.29-.29.77-.29 1.06 0l2.3 2.3 5.14-5.14c.29-.29.77-.29 1.06 0 .29.29.29.76 0 1.06Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** vuesax/linear/info-circle */
export function InfoCircleIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10ZM12 8v5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.995 16h.009"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** vuesax/linear/arrow-left */
export function ArrowLeftIcon({ size = 24, color = "#14181b", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M9.57 5.93L3.5 12l6.07 6.07M20.5 12H3.67"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** vuesax/linear/add */
export function AddIcon({ size = 16, color = "currentColor", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M6 12h12M12 18V6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** vuesax/linear/minus */
export function MinusIcon({ size = 16, color = "currentColor", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M6 12h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** vuesax/linear/edit-2 */
export function EditIcon({ size = 16, color = "currentColor", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="m13.26 3.6-8.21 8.69c-.31.33-.61.98-.67 1.43l-.37 3.24c-.13 1.17.71 1.97 1.87 1.77l3.22-.55c.45-.08 1.08-.41 1.39-.75l8.21-8.69c1.42-1.5 2.06-3.21-.15-5.3-2.2-2.07-3.87-1.34-5.29.16Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.89 5.05a6.126 6.126 0 0 0 5.45 5.15M3 22h18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** vuesax/linear/document-download */
export function DocumentDownloadIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M9 11v6l2-2M9 17l-2-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 10v5c0 5-2 7-7 7H9c-5 0-7-2-7-7V9c0-5 2-7 7-7h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 10h-4c-3 0-4-1-4-4V2l8 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** vuesax/linear/box */
export function BoxIcon({ size = 20, color = "currentColor", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M3.17 7.44 12 12.55l8.77-5.08M12 21.61V12.54"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.93 2.48 4.59 5.45c-1.21.67-2.2 2.35-2.2 3.73v5.65c0 1.38.99 3.06 2.2 3.73l5.34 2.97c1.14.63 3.01.63 4.15 0l5.34-2.97c1.21-.67 2.2-2.35 2.2-3.73V9.18c0-1.38-.99-3.06-2.2-3.73l-5.34-2.97c-1.15-.64-3.01-.64-4.15.01Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** vuesax/linear/lock */
export function LockIcon({ size = 20, color = "currentColor", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M6 10V8c0-3.31 1.69-6 6-6s6 2.69 6 6v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 22H7c-4 0-5-1-5-5v-2c0-4 1-5 5-5h10c4 0 5 1 5 5v2c0 4-1 5-5 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** vuesax/linear/logout */
export function LogoutIcon({ size = 20, color = "currentColor", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M8.9 7.56c.31-3.6 2.16-5.07 6.21-5.07h.13c4.47 0 6.26 1.79 6.26 6.26v6.52c0 4.47-1.79 6.26-6.26 6.26h-.13c-4.02 0-5.87-1.45-6.2-4.99M15 12H3.62"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.85 8.65 2.5 12l3.35 3.35"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** vuesax/linear/unlock */
export function UnlockIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg {...svgProps({ size, color, ...props })} viewBox="0 0 24 24">
      <path
        d="M17 22H7c-4 0-5-1-5-5v-2c0-4 1-5 5-5h10c4 0 5 1 5 5v2c0 4-1 5-5 5ZM6 10V8c0-3.31 1-6 6-6 4.5 0 6 2 6 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

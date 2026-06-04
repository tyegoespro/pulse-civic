// Icon paths extracted from src/icons/sprite.svg (Streamline Plump). Every icon
// uses `currentColor` so it inherits color from CSS. Pass size + color via props.

import React from 'react'

type Props = { size?: number; color?: string; style?: React.CSSProperties }

const wrap = (children: React.ReactNode, { size = 24, color = 'currentColor', style }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    style={{ color, display: 'block', flexShrink: 0, ...style }}
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
)

export const IconTrending: React.FC<Props> = (p) => wrap(
  <g>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M26.3063 3.05941c-1.0958 -0.30472 -2.0365 0.63727 -2.0957 1.77316 -0.137 2.62784 -0.6497 5.56493 -2.0696 7.49543 -0.6855 0.9321 -2.0101 1.1578 -2.8325 0.3439 -0.9092 -0.8999 -1.6116 -2.3018 -2.1479 -3.80654 -0.4748 -1.33217 -2.078 -1.9524 -3.1821 -1.06856C8.57324 12.1241 2.99829 18.7508 2.99829 27.677c0 11.9604 9.40291 17.325 21.00191 17.325 11.599 0 21.0019 -5.3646 21.0019 -17.325 0 -12.2217 -10.4513 -20.13263 -16.6085 -23.73272 -0.6671 -0.39002 -1.3684 -0.68498 -2.0873 -0.88487Z" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M23.2732 23.332c0.4609 -0.2265 0.9927 -0.2265 1.4536 0C26.6983 24.3007 32 27.39 32 32.6001c0 4.4183 -3.5817 6.4 -8 6.4s-8 -1.9817 -8 -6.4c0 -5.2101 5.3017 -8.2994 7.2732 -9.2681Z" />
  </g>, p
)

export const IconVerified: React.FC<Props> = (p) => wrap(
  <path fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" clipRule="evenodd" d="M43.696 9.135c0.98 1.336 0.762 3.135 -0.15 4.518 -8.535 12.93 -14.682 20.785 -18.083 24.85 -1.687 2.015 -4.617 2.163 -6.525 0.354A164.987 164.987 0 0 1 4.955 23.794c-1.21 -1.483 -1.46 -3.576 -0.282 -5.085 1.024 -1.312 2.193 -2.438 3.25 -3.33 1.753 -1.48 4.284 -1.144 5.86 0.524 4.863 5.152 7.794 8.75 7.794 8.75s4.818 -7.04 12.548 -17.87c1.197 -1.677 3.33 -2.458 5.132 -1.459 1.447 0.803 3.129 2.025 4.439 3.81Z" />,
  p
)

export const IconMegaphone: React.FC<Props> = (p) => wrap(
  <g>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m42.5 19 -3 0" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m8.5 19 3 0" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M25.5 2v3" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m13.479 6.98 2.12 2.122" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m37.52 6.98 -2.122 2.122" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M26.811 12.427c-8.819 7.698 -18.314 17.38 -21.687 20.87 -0.79 0.817 -1.042 2.008 -0.587 3.048 0.248 0.565 0.541 1.182 0.844 1.707 0.303 0.525 0.691 1.087 1.057 1.584 0.672 0.915 1.83 1.291 2.932 1.016 4.709 -1.177 17.842 -4.558 28.918 -8.346" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21.612 17.193s2.091 2.092 5.636 8.232c3.546 6.14 4.311 8.997 4.311 8.997" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m22.696 37.357 0.594 2.218a4.59 4.59 0 1 1 -8.87 2.376l-0.494 -1.848" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M26.046 11.1s2.397 2.621 7.166 10.882c4.77 8.26 5.841 11.647 5.841 11.647" />
  </g>, p
)

export const IconRefresh: React.FC<Props> = (p) => wrap(
  <g>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21.8399 3.11316c1.2851 -0.13367 2.4341 0.73444 2.4234 2.02646 -0.0068 0.82963 -0.1269 1.85537 -0.5002 2.99496 -0.3297 1.00663 -1.3114 1.59335 -2.3531 1.78511 -3.9823 0.73301 -7.6302 3.14171 -9.8135 6.92331 -3.10161 5.3722 -2.32595 11.9188 1.4587 16.3994 0.8591 -0.6612 1.6017 -1.2003 2.2336 -1.6376 1.3739 -0.9509 3.014 -0.0623 2.9902 1.6084 -0.0372 2.614 -0.3397 5.4548 -0.671 7.8372 -0.2038 1.4655 -1.4784 2.5351 -2.9571 2.4814 -2.4226 -0.0881 -5.29873 -0.2859 -7.8955 -0.7099 -1.63074 -0.2664 -2.21506 -2.0009 -1.05403 -3.1766 0.58593 -0.5934 1.3176 -1.298 2.22502 -2.1186 -5.53017 -6.5708 -6.65798 -16.1562 -2.11552 -24.024C9.30994 7.44214 15.3739 3.78575 21.8399 3.11316Z" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M26.1601 44.8864c-1.2851 0.1336 -2.4342 -0.7345 -2.4235 -2.0265 0.0069 -0.8296 0.127 -1.8554 0.5003 -2.995 0.3297 -1.0066 1.3114 -1.5933 2.3531 -1.7851 3.9823 -0.733 7.6302 -3.1417 9.8135 -6.9233 3.1016 -5.3721 2.3259 -11.9188 -1.4588 -16.3994 -0.8591 0.6612 -1.6016 1.2004 -2.2335 1.6377 -1.3739 0.9508 -3.014 0.0622 -2.9902 -1.6085 0.0372 -2.614 0.3396 -5.45482 0.6709 -7.83715 0.2038 -1.46553 1.4785 -2.53513 2.9571 -2.48139 2.4227 0.08804 5.2988 0.28583 7.8956 0.70991 1.6307 0.26632 2.215 2.0009 1.054 3.1766 -0.5859 0.59334 -1.3176 1.29791 -2.225 2.11853 5.5302 6.5708 6.658 16.1563 2.1155 24.024 -3.4991 6.0606 -9.5631 9.717 -16.029 10.3896Z" />
  </g>, p
)

export const IconCompliment: React.FC<Props> = (p) => wrap(
  <g>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3.156 41.45c0.04 1.47 0.906 2.79 2.343 3.097 0.923 0.197 2.105 0.358 3.501 0.358s2.578 -0.16 3.5 -0.358c1.438 -0.307 2.305 -1.628 2.344 -3.097 0.067 -2.496 0.156 -6.72 0.156 -11.545s-0.089 -9.049 -0.156 -11.544c-0.04 -1.47 -0.906 -2.79 -2.343 -3.097A16.776 16.776 0 0 0 9 14.905c-1.396 0 -2.578 0.162 -3.5 0.359 -1.438 0.307 -2.305 1.628 -2.344 3.097C3.089 20.856 3 25.08 3 29.905s0.089 9.049 0.156 11.545Z" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14.75 17.38c1.616 -3.539 3.461 -8.548 4.387 -11.648 0.5 -1.675 2.006 -2.875 3.747 -2.718 1.095 0.098 2.362 0.283 3.55 0.623 2.135 0.612 3.284 2.71 3.443 4.926 0.152 2.125 0.146 4.289 0.075 6.198 3.247 -0.305 6.432 -0.548 9.28 -0.696 3.04 -0.159 5.587 2.115 5.702 5.155 0.214 5.637 0.038 14.68 -2.554 21.702 -0.905 2.45 -3.317 3.908 -5.929 3.963 -8.501 0.18 -17.136 -0.873 -22.133 -1.631" />
  </g>, p
)

export const IconPothole: React.FC<Props> = (p) => wrap(
  <g>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m26.5 30 6.6071 0c1.9338 0 3.7036 -0.0615 4.8464 -0.1129 0.8585 -0.0387 1.6755 -0.3663 2.278 -0.9791 1.0159 -1.0333 2.6552 -2.8965 3.9897 -5.3308 0.5388 -0.9828 0.5388 -2.1716 0 -3.1544 -1.3344 -2.4343 -2.9737 -4.2975 -3.9896 -5.3309 -0.6026 -0.6128 -1.4196 -0.9403 -2.2782 -0.979C36.8106 14.0615 35.0409 14 33.1071 14L26.5 14" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M37 19.5h-5.5" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m34 24.5 -3 0" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m21.5 45 0 -21.5c0 -11.3473 0.0962 -16.29769 0.1692 -18.42119 0.0346 -1.00648 0.5224 -1.9187 1.5227 -2.03512C23.4257 3.01649 23.6937 3 24 3s0.5743 0.01649 0.8081 0.04369c1.0003 0.11642 1.4881 1.02864 1.5227 2.03511 0.073 2.12351 0.1692 7.0739 0.1692 18.4212l0 21.5" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m21.5 19 -6.6071 0c-1.9338 0 -3.7036 -0.0615 -4.8464 -0.1129 -0.85848 -0.0387 -1.67552 -0.3663 -2.27803 -0.9791 -1.01592 -1.0333 -2.65522 -2.8965 -3.98967 -5.3308 -0.53876 -0.9828 -0.53876 -2.1716 0 -3.15443 1.33444 -2.43429 2.97372 -4.2975 3.98964 -5.33082 0.60252 -0.61285 1.4196 -0.9404 2.27816 -0.97905C11.1894 3.06145 12.9591 3 14.8929 3L24 3" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 8.5h5.5" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m14 13.5 3 0" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 45h18" />
  </g>, p
)

export const IconGlobe: React.FC<Props> = (p) => wrap(
  <g>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 24.0005c1.62754 -3.5319 5.2418 -9.7491 8.687 -13.7016 1.2486 -1.43239 3.3774 -1.43239 4.626 0 3.4453 3.9525 7.0595 10.1697 8.687 13.7016" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19.0532 11.1778c2.0286 -2.77665 4.1877 -5.39778 6.2606 -7.35401 1.2411 -1.1713 3.1316 -1.1713 4.3728 0 0.2699 0.25471 0.5412 0.52069 0.8136 0.79682" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M41.9999 24c1.6568 0 3.0225 1.3508 2.7886 2.9911C43.3366 37.1723 34.5824 45 23.9999 45S4.6631 37.1723 3.21125 26.9911C2.97734 25.3508 4.343 24 5.99985 24l36.00005 0Z" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.5227 24c0.9954 1.7197 1.3303 3.5807 0.4772 5.5 -0.8713 1.9606 -2.5019 2.6873 -4.1475 3.4207 -1.7753 0.7913 -3.56806 1.5903 -4.44371 3.9545" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M24.4277 24c-0.1478 4.8843 3.0923 5.7434 5.8812 6.4828 1.6602 0.4402 3.1605 0.838 3.6911 2.0172 0.3907 1.1721 -0.4697 2.1915 -1.4512 3.3545 -1.5308 1.8138 -3.3564 3.9768 -1.1908 7.6126" />
  </g>, p
)

export const IconComments: React.FC<Props> = (p) => wrap(
  <g>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M24 3C12.402 3 3 12.402 3 24c0 3.802 1.01 7.367 2.777 10.443 -0.91 2.377 -1.768 5.137 -2.331 7.896a1.797 1.797 0 0 0 2.197 2.12c2.643 -0.626 5.325 -1.494 7.681 -2.371A20.902 20.902 0 0 0 24 45c11.598 0 21 -9.402 21 -21 0 -0.335 -0.008 -0.669 -0.023 -1" />
    <path stroke="currentColor" strokeLinejoin="round" strokeWidth="3" d="M45 12a9 9 0 1 1 -18 0 9 9 0 0 1 18 0Z" />
  </g>, p
)

export const IconArrowUp: React.FC<Props> = (p) => wrap(
  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M24 41V7M11 20l13 -13 13 13" />,
  p
)

export const PulseLogo: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    <rect width="32" height="32" rx="7" fill="#1A1A2E" />
    <polyline
      points="4,18 9,18 12,10 16,22 20,14 23,18 28,18"
      fill="none"
      stroke="#FF3366"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

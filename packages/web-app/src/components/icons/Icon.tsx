import React from 'react';

export type IconName = 
  | 'alert-triangle'
  | 'shield-alert'
  | 'map-pin'
  | 'calendar'
  | 'user'
  | 'check-circle'
  | 'x-circle'
  | 'filter'
  | 'chevron-down'
  | 'chevron-up'
  | 'phone'
  | 'clock'
  | 'eye'
  | 'trash'
  | 'edit'
  | 'plus'
  | 'minus'
  | 'x'
  | 'check'
  | 'info'
  | 'warning'
  | 'danger'
  | 'success';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  'aria-label'?: string;
}

const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 20, 
  className = '', 
  'aria-label': ariaLabel 
}) => {
  const iconProps = {
    width: size,
    height: size,
    className: `inline-block ${className}`,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-label': ariaLabel,
    role: ariaLabel ? 'img' : undefined
  };

  switch (name) {
    case 'alert-triangle':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <path d="M12 9v4"/>
          <path d="m12 17 .01 0"/>
        </svg>
      );
    
    case 'shield-alert':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
          <path d="M12 8v4"/>
          <path d="m12 16 .01 0"/>
        </svg>
      );

    case 'map-pin':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      );

    case 'calendar':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      );

    case 'user':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      );

    case 'check-circle':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22,4 12,14.01 9,11.01"/>
        </svg>
      );

    case 'x-circle':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="m15 9-6 6"/>
          <path d="m9 9 6 6"/>
        </svg>
      );

    case 'filter':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
        </svg>
      );

    case 'chevron-down':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      );

    case 'chevron-up':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <polyline points="18,15 12,9 6,15"/>
        </svg>
      );

    case 'phone':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      );

    case 'clock':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      );

    case 'eye':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      );

    case 'trash':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <polyline points="3,6 5,6 21,6"/>
          <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
        </svg>
      );

    case 'edit':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      );

    case 'plus':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      );

    case 'minus':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      );

    case 'x':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      );

    case 'check':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
      );

    case 'info':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      );

    case 'warning':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <path d="M12 9v4"/>
          <path d="m12 17 .01 0"/>
        </svg>
      );

    case 'danger':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      );

    case 'success':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22,4 12,14.01 9,11.01"/>
        </svg>
      );

    default:
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      );
  }
};

export default Icon;

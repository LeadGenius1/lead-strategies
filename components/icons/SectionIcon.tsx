'use client';

import {
  Target,
  Sparkles,
  Rocket,
  Shield,
  TrendingUp,
  Megaphone,
  MessageSquare,
  Mail,
  DollarSign,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

interface SectionIconProps {
  type: string;
  className?: string;
  size?: number;
}

export default function SectionIcon({ type, className = '', size = 20 }: SectionIconProps) {
  const iconProps = {
    className: `text-current ${className}`,
    size,
  };

  const icons: Record<string, React.ReactNode> = {
    hero: <Target {...iconProps} />,
    features: <Sparkles {...iconProps} />,
    cta: <Megaphone {...iconProps} />,
    testimonials: <MessageSquare {...iconProps} />,
    contact: <Mail {...iconProps} />,
    pricing: <DollarSign {...iconProps} />,
    faq: <HelpCircle {...iconProps} />,
  };

  const featureIcons: Record<string, React.ReactNode> = {
    'fast': <Rocket {...iconProps} />,
    'reliable': <Rocket {...iconProps} />,
    'secure': <Shield {...iconProps} />,
    'scalable': <TrendingUp {...iconProps} />,
  };

  return (
    <div className="flex items-center justify-center">
      {icons[type.toLowerCase()] || <Target {...iconProps} />}
    </div>
  );
}

export function FeatureIcon({ name }: { name: string }) {
  const iconProps = {
    className: 'text-current',
    size: 24,
  };

  const icons: Record<string, React.ReactNode> = {
    'fast': <Rocket {...iconProps} />,
    'reliable': <Rocket {...iconProps} />,
    'secure': <Shield {...iconProps} />,
    'scalable': <TrendingUp {...iconProps} />,
  };

  return (
    <div className="flex items-center justify-center">
      {icons[name.toLowerCase()] || <Sparkles {...iconProps} />}
    </div>
  );
}

export function StatusIcon({ status }: { status: 'success' | 'error' | 'warning' | 'info' }) {
  const iconProps = {
    size: 16,
  };

  const icons = {
    success: <Check className="text-green-400" {...iconProps} />,
    error: <X className="text-red-400" {...iconProps} />,
    warning: <AlertCircle className="text-yellow-400" {...iconProps} />,
    info: <AlertCircle className="text-blue-400" {...iconProps} />,
  };

  return icons[status];
}

export function DirectionIcon({ direction }: { direction: 'left' | 'right' }) {
  const iconProps = {
    size: 16,
    className: 'text-current',
  };

  return direction === 'left' ? <ArrowLeft {...iconProps} /> : <ArrowRight {...iconProps} />;
}

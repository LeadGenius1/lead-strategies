'use client';

import { 
  Mail, 
  MessageSquare, 
  MessageCircle, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Slack, 
  MessageCircleMore,
  Send,
  Globe
} from 'lucide-react';

interface ChannelIconProps {
  channel: string;
  className?: string;
  size?: number;
}

export default function ChannelIcon({ channel, className = '', size = 24 }: ChannelIconProps) {
  const iconProps = {
    className: `text-current ${className}`,
    size,
  };

  const channelIcons: Record<string, React.ReactNode> = {
    email: <Mail {...iconProps} />,
    sms: <MessageSquare {...iconProps} />,
    whatsapp: <MessageCircle {...iconProps} />,
    messenger: <Facebook {...iconProps} />,
    instagram: <Instagram {...iconProps} />,
    linkedin: <Linkedin {...iconProps} />,
    twitter: <Twitter {...iconProps} />,
    slack: <Slack {...iconProps} />,
    discord: <MessageCircleMore {...iconProps} />,
    telegram: <Send {...iconProps} />,
    webchat: <Globe {...iconProps} />,
  };

  return (
    <div className="flex items-center justify-center">
      {channelIcons[channel.toLowerCase()] || <MessageSquare {...iconProps} />}
    </div>
  );
}

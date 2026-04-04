import React from 'react';

export default function HeruLogo({ className = "h-10" }) {
  return (
    <img 
      src="https://utlxvkwdcpwvdnkthksk.supabase.co/storage/v1/object/public/heru-uploads/branding/logo-red.png"
      alt="HERU"
      className={className}
    />
  );
}
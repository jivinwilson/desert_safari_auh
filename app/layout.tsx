import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Bodoni_Moda, Hanken_Grotesk } from 'next/font/google';
import './globals.css';

const display = Bodoni_Moda({ subsets: ['latin'], style: ['normal', 'italic'], axes: ['opsz'], variable: '--font-bodoni' });
const body = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-hanken' });

export const metadata: Metadata = {
  title: 'Desert Safari AUH',
  description: 'Desert safaris from Abu Dhabi: dune bashing, sunset camps, BBQ dinners under the stars and overnight stays in the Empty Quarter.',
};

export const viewport: Viewport = { themeColor: '#0d0813', colorScheme: 'dark', viewportFit: 'cover' };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}

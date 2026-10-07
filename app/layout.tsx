import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond, Noto_Serif_KR } from 'next/font/google';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-serif' });
const kr = Noto_Serif_KR({ weight: ['400', '600'], preload: false, variable: '--font-kr' }); // Hangul glyphs

export const metadata: Metadata = { title: '보라해 · Songs for a Quiet Evening', description: 'A small room for the voice I love most.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${kr.variable}`}>
      <body>{children}</body>
    </html>
  );
}

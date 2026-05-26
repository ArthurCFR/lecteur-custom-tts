import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Texte vers Podcast',
  description: 'Convertissez votre texte en fichier audio MP3',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

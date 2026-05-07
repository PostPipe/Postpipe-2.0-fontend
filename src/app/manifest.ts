import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PostPipe',
    short_name: 'PostPipe',
    description: 'The Ultimate Next.js Backend Component Library',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/PostPipe-Black.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}

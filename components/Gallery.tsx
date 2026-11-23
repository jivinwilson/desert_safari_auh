'use client';

import dynamic from 'next/dynamic';
import { GALLERY } from '@/lib/gallery';

const Wall = dynamic(() => import('./GalleryWall'));

export default function Gallery() {
  return GALLERY.length ? <Wall /> : null;
}

export type GalleryItem = {
  src: string;
  w: number;
  h: number;
  alt: string;
  category: string;
  type?: 'video';
  poster?: string;
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  group?: string;
  feature?: 'full' | 'large';
};

// Only owner-authorized media belongs here, served from /public/images/gallery. The section stays hidden while this is empty.
export const GALLERY: GalleryItem[] = [];

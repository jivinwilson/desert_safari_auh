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
export const GALLERY: GalleryItem[] = [
  { src: '/images/gallery/sunsets/hero.webp', w: 1600, h: 2000, alt: 'Guest with arms open on a dune at sunset', category: 'Sunsets', feature: 'full' },
  { src: '/images/gallery/dunebashing/adv1.webp', w: 1440, h: 960, alt: 'Land Cruiser powering down a golden dune', category: 'Dune bashing' },
  { src: '/images/gallery/dunebashing/adv2.webp', w: 1440, h: 960, alt: 'Sand spraying as the 4x4 turns', category: 'Dune bashing' },
  { src: '/images/gallery/dunebashing/adv6.webp', w: 1440, h: 960, alt: 'Full sideways slide on the dunes', category: 'Dune bashing' },
  { src: '/images/gallery/dunebashing/adv8.webp', w: 1440, h: 960, alt: '4x4 far below the dune wall', category: 'Dune bashing' },
  { src: '/images/gallery/adventures/friends.webp', w: 1600, h: 1600, alt: 'Two friends sandboarding down a dune', category: 'Friends' },
  { src: '/images/gallery/couples/couple.webp', w: 1600, h: 1600, alt: 'Couple dancing on a dune at sunset', category: 'Couples' },
  { src: '/images/gallery/adventures/jump.webp', w: 1600, h: 2000, alt: 'Guest leaping against the sunset', category: 'Adventures' },
  { src: '/images/gallery/experiences/falcon.webp', w: 1600, h: 1998, alt: 'Guest holding a falcon', category: 'Experiences' },
  { src: '/images/gallery/adventures/cruiser.webp', w: 1600, h: 1600, alt: '4x4 on a dune crest', category: 'Adventures', feature: 'large' },
  { src: '/images/gallery/couples/dance.webp', w: 1600, h: 1998, alt: 'Couple dancing in the dunes', category: 'Couples' },
  { src: '/images/gallery/experiences/camel.webp', w: 1600, h: 2000, alt: 'Guest with a camel', category: 'Experiences' },
  { src: '/images/gallery/adventures/leap.webp', w: 1600, h: 1984, alt: 'Guest jumping on a dune', category: 'Adventures' },
  { src: '/images/gallery/sunsets/ridge.webp', w: 1600, h: 2000, alt: 'Guest on a dune ridge in morning light', category: 'Sunsets' },
  { src: '/images/gallery/experiences/tracks.webp', w: 1600, h: 1998, alt: 'Guest walking along 4x4 tracks at sunset', category: 'Experiences' },
  { src: '/images/gallery/portraits/floral.webp', w: 1600, h: 2000, alt: 'Guest in a floral dress on a dune', category: 'Portraits' },
  { src: '/images/gallery/experiences/man.webp', w: 1600, h: 1997, alt: 'Guest with a camel at camp', category: 'Experiences' },
  { src: '/images/gallery/portraits/rock.webp', w: 1600, h: 2000, alt: 'Guest on desert rocks at sunset', category: 'Portraits' },
  { src: '/images/gallery/portraits/dusk.webp', w: 1600, h: 1984, alt: 'Guest portrait at sunset', category: 'Portraits' },
  { src: '/images/gallery/families/p6_7.webp', w: 1600, h: 1600, alt: 'A family of five on the desert rocks', category: 'Families' },
  { src: '/images/gallery/families/p5_1.webp', w: 1080, h: 1080, alt: 'Brother and sister on the sandstone ridge', category: 'Families' },
  { src: '/images/gallery/families/p3_1.webp', w: 1080, h: 1440, alt: 'A little one running down the dune', category: 'Families' },
  { src: '/images/gallery/families/p5_6.webp', w: 1080, h: 1080, alt: 'Feeding the camels at camp', category: 'Families' },
  { src: '/images/gallery/families/p6_3.webp', w: 1600, h: 1600, alt: 'Brothers sharing a treat in the dunes', category: 'Families' },
  { src: '/images/gallery/families/p3_5.webp', w: 1080, h: 1440, alt: 'First handfuls of desert sand', category: 'Families' },
  { src: '/images/gallery/families/p6_10.webp', w: 1600, h: 1600, alt: 'Family portrait against the wind-carved rock', category: 'Families' },
  { src: '/images/gallery/families/p5_5.webp', w: 1080, h: 1080, alt: 'Arms wide on top of the rocks', category: 'Families' },
  { src: '/images/gallery/buggies/p2_12.webp', w: 1080, h: 668, alt: 'Dune buggy carving through the sand', category: 'Dune buggies' },
  { src: '/images/gallery/buggies/p2_13.webp', w: 1080, h: 669, alt: 'Buggy spraying sand on the descent', category: 'Dune buggies' },
  { src: '/images/gallery/portraits/p4_8.webp', w: 1377, h: 1784, alt: 'Guest resting on the warm sandstone', category: 'Portraits' },
  { src: '/images/gallery/fireshow/night01.webp', w: 1440, h: 1800, alt: 'Fire breather lighting up the night camp', category: 'Fire show' },
  { src: '/images/gallery/fireshow/night03.webp', w: 1440, h: 1796, alt: 'A column of fire against the desert night', category: 'Fire show' },
  { src: '/images/gallery/fireshow/night07.webp', w: 1440, h: 1800, alt: 'Fire show performer under the stars', category: 'Fire show' },
  { src: '/images/gallery/sunsets/sun1.webp', w: 1440, h: 1800, alt: 'Guest reaching for the last sun', category: 'Sunsets' },
  { src: '/images/gallery/sunsets/one1.webp', w: 1440, h: 1800, alt: 'A lone figure on dark wind-carved sand', category: 'Sunsets' },
  { src: '/images/gallery/families/old3.webp', w: 1080, h: 759, alt: 'A little explorer with wings on the dunes', category: 'Families' },
  { src: '/images/gallery/sunsets/old4.webp', w: 1080, h: 1350, alt: 'Hands raised against a red desert sky', category: 'Sunsets' },
  { src: '/images/gallery/sunsets/finale.webp', w: 1590, h: 1987, alt: 'Guest on a dune crest at sunset', category: 'Sunsets', feature: 'large' },
];

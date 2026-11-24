/*
 * Products shown in the animated hero arc on the Home page, in arc order.
 *
 * Each entry links a transparent image (src/assets/hero-section-*.png) to the
 * product's name in the shop. The name is matched to the catalog (upper/lower
 * case, accents and apostrophes don't matter), so clicking the image opens that
 * product and its price shows under the arc.
 *
 * To change the arc: add/remove/reorder entries here. Images are scaled
 * automatically, so a bit of transparent space around a bottle is fine.
 */
import khamrah from '../assets/hero-section-lattafakhamrah.png';
import aquaKiss from '../assets/hero-section-vsaquakiss.png';
import yara from '../assets/hero-section-lattafayara.png';
import loveSpell from '../assets/hero-section-vslovespell.png';
import amethyst from '../assets/hero-section-lattafaamethyst.png';
import bareVanilla from '../assets/hero-section-vsbarevanilla.png';
import asadBourbon from '../assets/hero-section-lattafaasad.png';
import cheirosa68 from '../assets/hero-section-cheirsosa68.png';
import herConfession from '../assets/hero-section-lattafaherconfession.png';
import velvetPetals from '../assets/hero-section-vsvelvetpetals.png';
import eclaire from '../assets/hero-section-lattafaeclaire.png';
import pureSeduction from '../assets/hero-section-pureseduction.png';
import ninePm from '../assets/hero-section -9pm.png';
import clubDeNuit from '../assets/hero-section-clubdenuitwoman.png';

export const HERO_PRODUCTS = [
  { name: 'Lattafa Khamrah', image: khamrah },
  { name: 'VS Aqua Kiss', image: aquaKiss },
  { name: 'Lattafa Yara', image: yara },
  { name: 'VS Love Spell', image: loveSpell },
  { name: "Lattafa Bade'e Al Oud Amethyst", image: amethyst },
  { name: 'VS Bare Vanilla La Creme', image: bareVanilla },
  { name: 'Lattafa Asad Bourbon', image: asadBourbon },
  { name: 'Cheirosa 68 Beija Flor', image: cheirosa68 },
  { name: 'Lattafa Her Confession', image: herConfession },
  { name: 'VS Velvet Petals Noir', image: velvetPetals },
  { name: 'Lattafa Eclaire', image: eclaire },
  { name: 'VS Pure Seduction La Creme', image: pureSeduction },
  { name: '9pm', image: ninePm },
  { name: 'Club De Nuit Woman', image: clubDeNuit },
];

/**
 * Phones: the hero is not at the top of the Home page but further down, in place of
 * the "Hero Carousel" banner (which is not shown on phones), and the intro doesn't play.
 */
export const HERO_MOBILE_QUERY = '(max-width: 639px)';

/** Lower-case, no accents/apostrophes, single spaces: "Bade'e  Al Oud" → "badee al oud". */
export const normalizeProductName = (name) =>
  String(name || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['‘’`´]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

import dhakaImg from '../assets/itinerary/dhaka.jpg';
import sylhetImg from '../assets/itinerary/sylhet.jpg';
import coxsbazarImg from '../assets/itinerary/coxsbazar.jpg';
import bandarbanImg from '../assets/itinerary/bandarban.webp';
import sajekImg from '../assets/itinerary/sajek.jpg';
import sundarbansImg from '../assets/itinerary/sundarbans.jpg';
import rangamatiImg from '../assets/itinerary/rangamati.jpg';
import comillaImg from '../assets/itinerary/comilla.jpg';

// Destination pool for the itinerary builder. Which of these actually show
// up in a generated itinerary is dynamic (decided server-side by
// backend/src/data/itineraryContent.js based on the questionnaire answers)
// — this file only maps a place name to its display photo/tagline.
const itineraryPlaces = {
  dhaka: {
    name: 'Dhaka',
    tagline: 'Culture & Heritage',
    image: dhakaImg
  },
  sylhet: {
    name: 'Sylhet',
    tagline: 'Tea Gardens & Hills',
    image: sylhetImg
  },
  coxsbazar: {
    name: "Cox's Bazar",
    tagline: "World's Longest Sea Beach",
    image: coxsbazarImg
  },
  bandarban: {
    name: 'Bandarban',
    tagline: 'Hill Tracts & Trekking',
    image: bandarbanImg
  },
  sajek: {
    name: 'Sajek Valley',
    tagline: 'Clouds Over the Hills',
    image: sajekImg
  },
  sundarbans: {
    name: 'Sundarbans',
    tagline: 'Mangrove Forest & Wildlife',
    image: sundarbansImg
  },
  rangamati: {
    name: 'Rangamati',
    tagline: 'Kaptai Lake & Hill Culture',
    image: rangamatiImg
  },
  comilla: {
    name: 'Comilla',
    tagline: 'Ancient Ruins & Countryside',
    image: comillaImg
  }
};

export default itineraryPlaces;

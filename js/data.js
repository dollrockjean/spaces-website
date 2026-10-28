/* Spaces Designer Homes — all default content.
   Everything the editor can change lives here, so a saved version is just this data plus changes. */

const IMG = 'assets/img/';

/* Photo library. Tags drive the search on "Our Projects". */
let PHOTOS = [
  // Saugatuck Living
  { id: 'saugatuck-drone', src: 'saugatuck-living-drone-view.jpg', project: 'saugatuck-living', town: 'Saugatuck', type: 'custom', cat: 'Aerial', tags: 'aerial drone lake lakefront outside' },
  { id: 'saugatuck-front', src: 'saugatuck-living-project-front-view.jpg', project: 'saugatuck-living', town: 'Saugatuck', type: 'custom', cat: 'FullFront', tags: 'front outside curb' },
  { id: 'saugatuck-side', src: 'saugatuck-living-project-side-view.jpg', project: 'saugatuck-living', town: 'Saugatuck', type: 'custom', cat: 'OtherAngles', tags: 'side outside' },
  { id: 'saugatuck-rear', src: 'saugatuck-living-project-rear-view.jpg', project: 'saugatuck-living', town: 'Saugatuck', type: 'custom', cat: 'OtherAngles', tags: 'back rear outside yard' },
  // Lowell Contemporary
  { id: 'lowell-front', src: 'lowell-contemporary-front-view.jpg', project: 'lowell-contemporary', town: 'Lowell', type: 'custom', cat: 'FullFront', tags: 'modern contemporary front outside' },
  { id: 'lowell-living', src: 'lowell-005.jpg', project: 'lowell-contemporary', town: 'Lowell', type: 'custom', cat: 'LivingAreas', tags: 'living room fireplace modern' },
  { id: 'lowell-dining', src: 'lowell-008.jpg', project: 'lowell-contemporary', town: 'Lowell', type: 'custom', cat: 'Kitchen', tags: 'dining table kitchen open' },
  { id: 'lowell-kitchen', src: 'lowell-009.jpg', project: 'lowell-contemporary', town: 'Lowell', type: 'custom', cat: 'Kitchen', tags: 'kitchen island white modern' },
  { id: 'lowell-kitchen2', src: 'lowell-015.jpg', project: 'lowell-contemporary', town: 'Lowell', type: 'custom', cat: 'Kitchen', tags: 'kitchen island stools hood' },
  { id: 'lowell-bed', src: 'lowell-016.jpg', project: 'lowell-contemporary', town: 'Lowell', type: 'custom', cat: 'Bedrooms', tags: 'bedroom primary suite' },
  { id: 'lowell-bath', src: 'lowell-018.jpg', project: 'lowell-contemporary', town: 'Lowell', type: 'custom', cat: 'SecondaryBaths', tags: 'bathroom vanity' },
  { id: 'lowell-bed2', src: 'lowell-025.jpg', project: 'lowell-contemporary', town: 'Lowell', type: 'custom', cat: 'Bedrooms', tags: 'bedroom guest' },
  { id: 'lowell-hall', src: 'lowell-002.jpg', project: 'lowell-contemporary', town: 'Lowell', type: 'custom', cat: 'IntFrontEntrance', tags: 'hallway entry' },
  { id: 'lowell-porch', src: 'lowell-030.jpg', project: 'lowell-contemporary', town: 'Lowell', type: 'custom', cat: 'OtherAngles', tags: 'screened porch patio covered outdoor living' },
  // Holland Cottage
  { id: 'holland-front', src: 'holland-cottage.jpg', project: 'holland-cottage', town: 'Holland', type: 'custom', cat: 'FullFront', tags: 'cottage white front outside ranch' },
  { id: 'holland-wide', src: 'holland-cottage-hero-image.jpg', project: 'holland-cottage', town: 'Holland', type: 'custom', cat: 'FullFront', tags: 'cottage white front outside wide' },
  { id: 'holland-kitchen', src: 'holland-cottage-kitchen.jpg', project: 'holland-cottage', town: 'Holland', type: 'custom', cat: 'Kitchen', tags: 'kitchen cabinets' },
  { id: 'holland-island', src: 'holland-cottage-kitchen-island-and-living.jpg', project: 'holland-cottage', town: 'Holland', type: 'custom', cat: 'Kitchen', tags: 'kitchen island living open' },
  { id: 'holland-dining', src: 'holland-cottage-kitchen-and-dining.jpg', project: 'holland-cottage', town: 'Holland', type: 'custom', cat: 'Kitchen', tags: 'kitchen dining' },
  { id: 'holland-fire', src: 'holland-cottage-living-room-fire-place.jpg', project: 'holland-cottage', town: 'Holland', type: 'custom', cat: 'LivingAreas', tags: 'living room fireplace' },
  { id: 'holland-wall', src: 'holland-cottage-custom-wall.jpg', project: 'holland-cottage', town: 'Holland', type: 'custom', cat: 'LivingAreas', tags: 'custom wall built-in millwork detail' },
  { id: 'holland-sun', src: 'holland-cottage-sun-room.jpg', project: 'holland-cottage', town: 'Holland', type: 'custom', cat: 'LivingAreas', tags: 'sunroom sun room windows' },
  { id: 'holland-mud', src: 'holland-cottage-mudroom.jpg', project: 'holland-cottage', town: 'Holland', type: 'custom', cat: 'Mudroom', tags: 'mudroom mud room lockers entry' },
  { id: 'holland-pantry', src: 'holland-cottage-pantry.jpg', project: 'holland-cottage', town: 'Holland', type: 'custom', cat: 'Kitchen', tags: 'pantry storage' },
  { id: 'holland-bed', src: 'holland-cottage-bedroom.jpg', project: 'holland-cottage', town: 'Holland', type: 'custom', cat: 'Bedrooms', tags: 'bedroom' },
  { id: 'holland-bath', src: 'holland-cottage-shower-and-bath.jpg', project: 'holland-cottage', town: 'Holland', type: 'custom', cat: 'SecondaryBaths', tags: 'bathroom shower tub' },
  // South Haven Living
  { id: 'southhaven-front', src: 'south-haven-living-front-of-house.jpg', project: 'south-haven-living', town: 'South Haven', type: 'custom', cat: 'FullFront', tags: 'front outside' },
  { id: 'southhaven-wide', src: 'south-haven-living-zoomed-out.jpg', project: 'south-haven-living', town: 'South Haven', type: 'custom', cat: 'Aerial', tags: 'outside lot wide' },
  { id: 'southhaven-kitchen', src: 'south-haven-living-kitchen-and-dining.jpg', project: 'south-haven-living', town: 'South Haven', type: 'custom', cat: 'Kitchen', tags: 'kitchen dining' },
  { id: 'southhaven-island', src: 'south-haven-living-kitchen-island.jpg', project: 'south-haven-living', town: 'South Haven', type: 'custom', cat: 'Kitchen', tags: 'kitchen island' },
  { id: 'southhaven-loft', src: 'south-haven-living-living-room-and-loft.jpg', project: 'south-haven-living', town: 'South Haven', type: 'custom', cat: 'LivingAreas', tags: 'living room loft vaulted' },
  { id: 'southhaven-fire', src: 'south-haven-living-fire-place.jpg', project: 'south-haven-living', town: 'South Haven', type: 'custom', cat: 'LivingAreas', tags: 'fireplace living' },
  { id: 'southhaven-overlook', src: 'south-haven-living-loft-overlook.jpg', project: 'south-haven-living', town: 'South Haven', type: 'custom', cat: 'LivingAreas', tags: 'loft overlook stairs' },
  { id: 'southhaven-bath', src: 'south-haven-living-bath-and-shower.jpg', project: 'south-haven-living', town: 'South Haven', type: 'custom', cat: 'SecondaryBaths', tags: 'bathroom shower' },
  // Spring Lake
  { id: 'springlake-front', src: 'springlake-front.jpg', project: 'spring-lake', town: 'Spring Lake', type: 'custom', cat: 'FullFront', tags: 'front outside' },
  { id: 'springlake-dining', src: 'spring-lake-dining-room.jpg', project: 'spring-lake', town: 'Spring Lake', type: 'custom', cat: 'LivingAreas', tags: 'dining room' },
  { id: 'springlake-shower', src: 'spring-lake-shower.jpg', project: 'spring-lake', town: 'Spring Lake', type: 'custom', cat: 'SecondaryBaths', tags: 'shower bathroom tile' },
  { id: 'springlake-lockers', src: '2025-11-img_3343.jpg', project: 'spring-lake', town: 'Spring Lake', type: 'custom', cat: 'Mudroom', tags: 'mudroom lockers built-in navy cabinet' },
  { id: 'springlake-stairs', src: '2025-11-img_3346-1.jpg', project: 'spring-lake', town: 'Spring Lake', type: 'custom', cat: 'LivingAreas', tags: 'staircase stairs railing' },
  // Muskegon Dune
  { id: 'muskegon-front', src: '2025-10-img_1031.jpg', project: 'muskegon-dune', town: 'Muskegon', type: 'custom', cat: 'Aerial', tags: 'dune lake aerial outside modern' },
  { id: 'muskegon-deck', src: '2025-10-img_1002.jpg', project: 'muskegon-dune', town: 'Muskegon', type: 'custom', cat: 'OtherAngles', tags: 'deck lake view water porch' },
  { id: 'muskegon-living', src: '2025-10-img_1006.jpg', project: 'muskegon-dune', town: 'Muskegon', type: 'custom', cat: 'LivingAreas', tags: 'living room lake view windows built-in' },
  { id: 'muskegon-kitchen', src: '2025-10-img_1009-1.jpg', project: 'muskegon-dune', town: 'Muskegon', type: 'custom', cat: 'Kitchen', tags: 'kitchen open shelves' },
  // Fennville Cottage (high-res print photos)
  { id: 'fennville-patio', src: 'p-fennville-patio.jpg', project: 'fennville-cottage', town: 'Fennville', type: 'custom', cat: 'OtherAngles', tags: 'patio fire pit stone steps outside woods' },
  { id: 'fennville-side', src: 'p-fennville-side.jpg', project: 'fennville-cottage', town: 'Fennville', type: 'custom', cat: 'OtherAngles', tags: 'outside yard modern cottage' },
  { id: 'fennville-porch', src: 'p-fennville-porch.jpg', project: 'fennville-cottage', town: 'Fennville', type: 'custom', cat: 'OtherAngles', tags: 'screened porch covered outdoor living woods' },
  { id: 'fennville-living', src: 'p-fennville-living.jpg', project: 'fennville-cottage', town: 'Fennville', type: 'custom', cat: 'LivingAreas', tags: 'living room fireplace tile' },
  { id: 'fennville-living2', src: 'p-fennville-living2.jpg', project: 'fennville-cottage', town: 'Fennville', type: 'custom', cat: 'LivingAreas', tags: 'living room open vaulted' },
  { id: 'fennville-kitchen', src: 'p-fennville-kitchen.jpg', project: 'fennville-cottage', town: 'Fennville', type: 'custom', cat: 'Kitchen', tags: 'kitchen pendant lights range' },
  { id: 'fennville-island', src: 'p-fennville-island.jpg', project: 'fennville-cottage', town: 'Fennville', type: 'custom', cat: 'Kitchen', tags: 'kitchen island stools' },
  { id: 'fennville-kitchen2', src: 'p-fennville-kitchen2.jpg', project: 'fennville-cottage', town: 'Fennville', type: 'custom', cat: 'Kitchen', tags: 'kitchen dining open' },
  { id: 'fennville-dining', src: 'p-fennville-dining.jpg', project: 'fennville-cottage', town: 'Fennville', type: 'custom', cat: 'LivingAreas', tags: 'dining room windows table' },
  { id: 'fennville-bath', src: 'p-fennville-bath.jpg', project: 'fennville-cottage', town: 'Fennville', type: 'custom', cat: 'SecondaryBaths', tags: 'bathroom vanity green cabinet brass' },
  { id: 'fennville-bed', src: 'p-fennville-bed.jpg', project: 'fennville-cottage', town: 'Fennville', type: 'custom', cat: 'Bedrooms', tags: 'bedroom green accent wall' },
  { id: 'fennville-tub', src: 'p-fennville-tub.jpg', project: 'fennville-cottage', town: 'Fennville', type: 'custom', cat: 'SecondaryBaths', tags: 'bathroom soaking tub shower' },
  { id: 'fennville-shower', src: 'p-fennville-shower.jpg', project: 'fennville-cottage', town: 'Fennville', type: 'custom', cat: 'OtherAngles', tags: 'outdoor shower siding' },
  // Pool House (high-res print photos)
  { id: 'pool-house', src: 'p-pool-house.jpg', project: 'pool-house', town: 'West Michigan', type: 'addition', cat: 'FullFront', tags: 'pool house outside backyard' },
  { id: 'pool-wide', src: 'p-pool-wide.jpg', project: 'pool-house', town: 'West Michigan', type: 'addition', cat: 'OtherAngles', tags: 'pool backyard trees lounge' },
  { id: 'pool-deck', src: 'p-pool-deck.jpg', project: 'pool-house', town: 'West Michigan', type: 'addition', cat: 'OtherAngles', tags: 'pool deck backyard' },
  { id: 'pool-kitchen', src: 'p-pool-kitchen.jpg', project: 'pool-house', town: 'West Michigan', type: 'addition', cat: 'Kitchen', tags: 'pool house kitchenette wood ceiling' },
  { id: 'pool-dining', src: 'p-pool-dining.jpg', project: 'pool-house', town: 'West Michigan', type: 'addition', cat: 'LivingAreas', tags: 'pool house dining wood ceiling' },
  { id: 'pool-living', src: 'p-pool-living.jpg', project: 'pool-house', town: 'West Michigan', type: 'addition', cat: 'LivingAreas', tags: 'pool house interior wood ceiling' },
  { id: 'pool-back', src: 'p-pool-back.jpg', project: 'pool-house', town: 'West Michigan', type: 'addition', cat: 'OtherAngles', tags: 'pool house back outside' },
  { id: 'pool-yard', src: 'p-pool-yard.jpg', project: 'pool-house', town: 'West Michigan', type: 'addition', cat: 'OtherAngles', tags: 'backyard lawn pool' },
  // Modern Farmhouse (high-res print photos)
  { id: 'farm-front', src: 'p-farm-front.jpg', project: 'modern-farmhouse', town: 'West Michigan', type: 'custom', cat: 'FullFront', tags: 'white farmhouse black windows garage front outside' },
  { id: 'farm-entry', src: 'p-farm-entry.jpg', project: 'modern-farmhouse', town: 'West Michigan', type: 'custom', cat: 'IntFrontEntrance', tags: 'entry foyer front door' },
  { id: 'farm-living', src: 'p-farm-living.jpg', project: 'modern-farmhouse', town: 'West Michigan', type: 'custom', cat: 'LivingAreas', tags: 'living room vaulted beams fireplace' },
  { id: 'farm-kitchen', src: 'p-farm-kitchen.jpg', project: 'modern-farmhouse', town: 'West Michigan', type: 'custom', cat: 'Kitchen', tags: 'kitchen island gold pendants beams' },
  { id: 'farm-island', src: 'p-farm-island.jpg', project: 'modern-farmhouse', town: 'West Michigan', type: 'custom', cat: 'Kitchen', tags: 'kitchen island white oak hood' },
  { id: 'farm-stairs', src: 'p-farm-stairs.jpg', project: 'modern-farmhouse', town: 'West Michigan', type: 'custom', cat: 'LivingAreas', tags: 'hall stairs dining' },
  { id: 'farm-mudroom', src: 'p-farm-mudroom.jpg', project: 'modern-farmhouse', town: 'West Michigan', type: 'custom', cat: 'Mudroom', tags: 'mudroom lockers built-in white oak' },
  { id: 'farm-powder', src: 'p-farm-powder.jpg', project: 'modern-farmhouse', town: 'West Michigan', type: 'custom', cat: 'SecondaryBaths', tags: 'powder room black marble' },
  { id: 'farm-bed', src: 'p-farm-bed.jpg', project: 'modern-farmhouse', town: 'West Michigan', type: 'custom', cat: 'Bedrooms', tags: 'primary bedroom beams' },
  { id: 'farm-bath', src: 'p-farm-bath.jpg', project: 'modern-farmhouse', town: 'West Michigan', type: 'custom', cat: 'MasterBath', tags: 'primary bathroom shower vanity tile' },
  { id: 'farm-bed2', src: 'p-farm-bed2.jpg', project: 'modern-farmhouse', town: 'West Michigan', type: 'custom', cat: 'Bedrooms', tags: 'bedroom black ceiling' },
  { id: 'farm-lower', src: 'p-farm-lower.jpg', project: 'modern-farmhouse', town: 'West Michigan', type: 'custom', cat: 'LivingAreas', tags: 'lower level family room' },
  { id: 'farm-bed3', src: 'p-farm-bed3.jpg', project: 'modern-farmhouse', town: 'West Michigan', type: 'custom', cat: 'Bedrooms', tags: 'bedroom arched headboard' },
  // Lakefront craftsman
  { id: 'lakefront-front', src: 'hero-image.jpg', project: 'more-work', town: 'West Michigan', type: 'custom', cat: 'FullFront', tags: 'lake front craftsman blue siding' },
  { id: 'lakefront-front2', src: 'guide-craftsman-front.jpg', project: 'more-work', town: 'West Michigan', type: 'custom', cat: 'FullFront', tags: 'craftsman front garage blue siding' },
  { id: 'wooded-drive', src: 'guide-wooded-drive.jpg', project: 'more-work', town: 'West Michigan', type: 'custom', cat: 'FullFront', tags: 'woods trees driveway outside' },
  { id: 'great-room', src: 'home3.jpg', project: 'more-work', town: 'West Michigan', type: 'custom', cat: 'LivingAreas', tags: 'great room stone fireplace two story windows' },
  { id: 'sunroom', src: 'sunroom-copy.jpg', project: 'more-work', town: 'West Michigan', type: 'addition', cat: 'LivingAreas', tags: 'sunroom addition brick wood ceiling' },
  // Remodels
  { id: 'remodel-bath', src: 'bathroom-remodel.jpg', project: 'remodels', town: 'West Michigan', type: 'remodel', cat: 'SecondaryBaths', tags: 'bathroom remodel' },
  { id: 'remodel-laundry', src: 'laundry-remodel.jpg', project: 'remodels', town: 'West Michigan', type: 'remodel', cat: 'Mudroom', tags: 'laundry room remodel' },
  { id: 'remodel-mud', src: 'mud-room-remodel.jpg', project: 'remodels', town: 'West Michigan', type: 'remodel', cat: 'Mudroom', tags: 'mudroom remodel lockers' },
  { id: 'remodel-pantry', src: 'pantry-remodel.jpg', project: 'remodels', town: 'West Michigan', type: 'remodel', cat: 'Kitchen', tags: 'pantry remodel storage' },
  { id: 'remodel-shower', src: 'golden-view07.jpg', project: 'remodels', town: 'West Michigan', type: 'remodel', cat: 'SecondaryBaths', tags: 'shower barn door bathroom remodel' },
  { id: 'remodel-kitchen', src: 'home8.jpg', project: 'remodels', town: 'West Michigan', type: 'remodel', cat: 'Kitchen', tags: 'kitchen remodel navy cabinets tile' },
  // Studio and design renders
  { id: 'studio-samples', src: 'marbel.jpg', project: 'studio', town: 'Grand Rapids', type: 'studio', cat: 'Other', tags: 'countertop samples quartz marble selections' },
  { id: 'yard-sign', src: 'guide-yard-sign.jpg', project: 'studio', town: 'West Michigan', type: 'studio', cat: 'FullFront', tags: 'sign brand' },
];
const photo = id => PHOTOS.find(p => p.id === id);
const photoSrc = id => { const p = photo(id); return p ? IMG + p.src : id; };

/* Room groups: the same 12 categories the Spaces photo sorter uses, so sorted Drive folders map straight in. */
const CATS = [
  ['FullFront', 'Front'], ['ExtFrontEntrance', 'Front entry'], ['OtherAngles', 'Outside & back'], ['Aerial', 'From above'],
  ['IntFrontEntrance', 'Entry'], ['LivingAreas', 'Living spaces'], ['Kitchen', 'Kitchen'], ['Mudroom', 'Mudroom & laundry'],
  ['MasterBath', 'Primary bath'], ['SecondaryBaths', 'Bathrooms'], ['Bedrooms', 'Bedrooms'], ['Other', 'More'],
];
const ROOMS = Object.fromEntries(CATS);
const KINDS = { custom: 'Custom homes', addition: 'Additions & pool houses', remodel: 'Remodels' };

/* The houses on Our Projects. Public names only, never client names or addresses. */
let PROJECTS = [
  { id: 'saugatuck-living', name: 'Saugatuck Living', town: 'Saugatuck', kind: 'custom', cover: 'saugatuck-drone' },
  { id: 'fennville-cottage', name: 'Fennville Cottage', town: 'Fennville', kind: 'custom', cover: 'fennville-patio' },
  { id: 'modern-farmhouse', name: 'Modern Farmhouse', town: 'West Michigan', kind: 'custom', cover: 'farm-front' },
  { id: 'lowell-contemporary', name: 'Lowell Contemporary', town: 'Lowell', kind: 'custom', cover: 'lowell-front', video: 'lowell-inside' },
  { id: 'holland-cottage', name: 'Holland Cottage', town: 'Holland', kind: 'custom', cover: 'holland-wide' },
  { id: 'south-haven-living', name: 'South Haven Living', town: 'South Haven', kind: 'custom', cover: 'southhaven-front' },
  { id: 'spring-lake', name: 'Spring Lake', town: 'Spring Lake', kind: 'custom', cover: 'springlake-front', video: 'springlake' },
  { id: 'muskegon-dune', name: 'Muskegon Dune', town: 'Muskegon', kind: 'custom', cover: 'muskegon-front' },
  { id: 'pool-house', name: 'Pool House', town: 'West Michigan', kind: 'addition', cover: 'pool-wide' },
  { id: 'remodels', name: 'Remodel highlights', town: 'West Michigan', kind: 'remodel', cover: 'remodel-kitchen' },
  { id: 'more-work', name: 'More Spaces homes', town: 'West Michigan', kind: 'custom', cover: 'lakefront-front' },
];
const project = id => PROJECTS.find(p => p.id === id);
const photosOf = id => PHOTOS.filter(p => p.project === id).sort((a, b) => CATS.findIndex(c => c[0] === a.cat) - CATS.findIndex(c => c[0] === b.cat));
const projName = p => (project(p.project) || {}).name || '';

/* Color themes. Brand colors first. */
const THEMES = {
  heritage: { name: 'Heritage', note: 'Navy, linen and gold. The brand guide look.', bg: '#F8F5EF', alt: '#EEE8DD', ink: '#20385A', soft: '#4A5D78', accent: '#B7942F', accentInk: '#765C17', deep: '#20385A', onDeep: '#EEE8DD', line: '#D9D0BF', dark: false },
  harbor: { name: 'Harbor Night', note: 'Deep Harbor blue with warm sand. Moody and rich.', bg: '#00293B', alt: '#06354A', ink: '#EEE8DD', soft: '#BFC9CF', accent: '#C8A96F', accentInk: '#D9BE86', deep: '#001D2A', onDeep: '#EEE8DD', line: '#1C4A5E', dark: true },
  lakeshore: { name: 'Lakeshore', note: 'Bright white with Lake Blue. Fresh and airy.', bg: '#FFFFFF', alt: '#EDF2F9', ink: '#20385A', soft: '#4F6683', accent: '#6893CC', accentInk: '#3E6BA6', deep: '#20385A', onDeep: '#F4F7FB', line: '#D5DEEA', dark: false },
  gallery: { name: 'Gallery White', note: 'Clean white and charcoal. Lets the photos lead.', bg: '#FFFFFF', alt: '#F3F2EF', ink: '#232A31', soft: '#5B636B', accent: '#B7942F', accentInk: '#86691C', deep: '#232A31', onDeep: '#F3F2EF', line: '#E2E0DB', dark: false },
  sand: { name: 'Warm Sand', note: 'Warm Sand and navy. Cozy and inviting.', bg: '#F4EDE0', alt: '#E8DAC0', ink: '#20385A', soft: '#5A5446', accent: '#B7942F', accentInk: '#6A5113', deep: '#2E3B4E', onDeep: '#F4EDE0', line: '#D8C6A4', dark: false },
};

/* Font pairs. Headline, body, small accent text. Google Fonts stand in for the brand fonts. */
const FONTS = {
  brand: { name: 'Brand', note: 'Closest free match to the brand guide', head: "'Bodoni Moda', 'Barton Modern D', Didot, serif", body: "'Montserrat', sans-serif", accent: "'Montserrat', sans-serif", load: 'Bodoni+Moda:ital,opsz,wght@0,6..96,400..600;1,6..96,400&family=Montserrat:ital,wght@0,400;0,500;0,600;1,400' },
  editorial: { name: 'Soft editorial', note: 'Elegant and light, like a magazine', head: "'Cormorant Garamond', serif", body: "'Lato', sans-serif", accent: "'Lato', sans-serif", load: 'Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Lato:wght@400;700' },
  modern: { name: 'Modern clean', note: 'Simple and current', head: "'Jost', sans-serif", body: "'Jost', sans-serif", accent: "'Jost', sans-serif", load: 'Jost:wght@300;400;500;600' },
  classic: { name: 'Timeless', note: 'Traditional and easy to read', head: "'Libre Baskerville', serif", body: "'Source Sans 3', sans-serif", accent: "'Source Sans 3', sans-serif", load: 'Libre+Baskerville:ital@0;1&family=Source+Sans+3:wght@400;600' },
  bold: { name: 'Bold display', note: 'Strong headlines with presence', head: "'Playfair Display', serif", body: "'Raleway', sans-serif", accent: "'Raleway', sans-serif", load: 'Playfair+Display:ital,wght@0,500;0,700;1,500&family=Raleway:wght@400;500;600' },
};

const LOGOS = {
  horizontal: { name: 'Side by side', file: 'logo-horizontal' },
  stacked: { name: 'Stacked', file: 'logo-stacked' },
  badge: { name: 'Round badge', file: 'badge' },
  icon: { name: 'House icon only', file: 'logo-icon' },
};

/* Home page sections, in the order from the client doc. Hero always stays first, footer always last. */
const SECTIONS = {
  trust: 'Why families choose us',
  intro: 'Who we are',
  paths: 'Big photo buttons',
  featured: 'Featured homes',
  process: 'Our 5-step process',
  video: 'Client video & reviews',
  convictions: 'What we believe',
  studio: 'Design Studio',
  blog: 'From the blog',
  contact: 'Contact us',
};

/* Ways the home page can speak. Each voice has its own words in DEFAULT_CONTENT.voice. */
const VOICES = {
  you: { name: 'Talks to you', note: 'Speaks right to the visitor: “we could build your home around the way you live.”' },
  story: { name: 'Our story', note: 'Warm and personal, about the Spaces team.' },
  facts: { name: 'Straight facts', note: 'Professional and to the point.' },
  simple: { name: 'Let the photos talk', note: 'Very few words. The pictures do the selling.' },
};

/* Background videos for the top of the home page (cut from Spaces' own drone footage). */
const VIDEOS = {
  'drone-holland': { name: 'Holland home', place: ['Lakeside home', 'Holland, Michigan'], note: 'Circles a lakeside home and its patio' },
  'holland-lake': { name: 'Holland lakeshore', place: ['Lakeshore flyover', 'Holland, Michigan'], note: 'A slow flight along the water' },
  saugatuck: { name: 'Saugatuck', place: ['Stone and glass home', 'Saugatuck, Michigan'], note: 'Up the drive to the front doors' },
  springlake: { name: 'Spring Lake', place: ['Family home', 'Spring Lake, Michigan'], note: 'Around a white two-story home' },
  southhaven: { name: 'South Haven', place: ['Porch and deck', 'South Haven, Michigan'], note: 'Front porch to back deck' },
  'lowell-inside': { name: 'Inside in Lowell', place: ['Inside the Lowell Contemporary', 'Lowell, Michigan'], note: 'Living room, dining and kitchen' },
};

/* What the top of the home page leads with. Picking one swaps in a matching set of photos. */
const SPOTLIGHTS = {
  all: { name: 'A bit of everything', clip: 'drone-holland', photos: ['fennville-patio', 'farm-front', 'saugatuck-drone', 'pool-wide', 'farm-living', 'muskegon-front'] },
  custom: { name: 'Custom homes', clip: 'saugatuck', photos: ['farm-front', 'fennville-patio', 'saugatuck-drone', 'muskegon-front', 'lowell-front', 'southhaven-front'] },
  lake: { name: 'Lakeshore living', clip: 'holland-lake', photos: ['saugatuck-drone', 'muskegon-deck', 'muskegon-front', 'muskegon-living', 'lakefront-front', 'southhaven-wide'] },
  inside: { name: 'Inside the homes', clip: 'lowell-inside', photos: ['farm-living', 'fennville-living2', 'farm-kitchen', 'lowell-kitchen2', 'southhaven-loft', 'fennville-dining'] },
  remodel: { name: 'Remodels & additions', clip: 'southhaven', photos: ['remodel-kitchen', 'pool-house', 'remodel-shower', 'sunroom', 'remodel-mud', 'pool-living'] },
};

const DEFAULT_SETTINGS = {
  theme: 'heritage',
  fonts: 'brand',
  logo: 'horizontal',
  textSize: 'normal',
  corners: 'square',
  motion: 'full',
  heroMode: 'video',
  heroPhotos: ['fennville-patio', 'farm-front', 'saugatuck-drone', 'pool-wide', 'farm-living', 'muskegon-front'],
  heroVideo: '',
  heroClip: 'random',
  clipStart: 'random',
  navClick: 'hub',
  headings: 'accent',
  projectView: 'folders',
  stickyContact: 'on',
  linkStyle: 'buttons',
  clientVideo: '',
  voice: 'you',
  spotlight: 'all',
  homeOrder: ['trust', 'intro', 'paths', 'featured', 'process', 'video', 'convictions', 'studio', 'blog', 'contact'],
  homeHidden: [],
};

const DEFAULT_CONTENT = {
  biz: {
    name: 'Spaces Designer Homes', phone: '616-682-7119', email: 'info@spacesdesignerhomes.com',
    street: '3624 29th St SE, #A', city: 'Grand Rapids, Michigan 49512',
    facebook: 'https://www.facebook.com/SpacesDesignerHomes', instagram: 'https://instagram.com/spacesdesignerhomes',
  },
  hero: {
    kicker: 'Custom homes, additions and remodels in West Michigan',
    title: 'Your Vision. Our Masterpiece.',
    button: 'Start your home',
    button2: 'See our homes',
  },
  /* The same page in four voices. Pick one in the cog (Words). Each can be edited on the page. */
  voice: {
    you: {
      sub: "You've pictured this home for years. We'll help you build it, from the first sketch to the day you get your keys.",
      button: 'Start your home',
      introTitle: 'We could build your home around the way you actually live.',
      introBody: "You bring the vision: the saved photos, the someday list, the way your family really uses a kitchen. We bring one team that listens first, puts real numbers on every choice, and stays with you long after move-in. You don't need to be a building expert. You just need to feel informed, and we make sure you always are.",
      pathsTitle: 'What are you dreaming about?',
      processTitle: "Here's how we'll build it together",
      processBody: "Five steps, one team. Before we break ground, you'll know what your home will look like, feel like and cost.",
      contactTitle: 'Tell us about your home',
      contactBody: "A conversation, not a sales pitch. Share a little about what you're picturing and we'll reach out to set up a time to talk.",
    },
    story: {
      sub: 'Custom homes, additions and remodels in West Michigan.',
      button: 'Start your home',
      introTitle: 'We build homes for the way you actually live.',
      introBody: "We're a West Michigan team, not a volume builder. From the first conversation at our studio to the day you get your keys, the same people walk every step with you. The homes on this page are real Spaces homes, built for families who knew what they wanted and trusted us to get it right, including the parts behind the walls.",
      pathsTitle: 'Where would you like to start?',
      processTitle: 'How building with us works',
      processBody: 'Five steps, one team. By the time we break ground, you already know what your home will look like, feel like and cost.',
      contactTitle: 'Let’s talk about your home',
      contactBody: 'A conversation, not a sales pitch. Tell us a little about what you have in mind and we will be in touch.',
    },
    facts: {
      sub: 'A boutique custom builder serving Grand Rapids and the Lakeshore since 2017.',
      button: 'Schedule a consultation',
      introTitle: 'Design and construction under one roof.',
      introBody: 'Spaces Designer Homes designs and builds fully custom homes, additions and remodels across West Michigan. An in-house designer, our own showroom and one dedicated team handle design, budgeting, selections and construction, so every decision is settled before we break ground. Every photo on this page is a finished Spaces project.',
      pathsTitle: 'Our services',
      processTitle: 'Our five-phase process',
      processBody: 'Vision, Plan & Budget, Guided Selections, Construction and Keyholder. One team carries your project through every phase.',
      contactTitle: 'Schedule a consultation',
      contactBody: 'Tell us about your project and timeline. We will follow up to set up a first meeting.',
    },
    simple: {
      sub: 'Custom homes. Additions. Remodels.',
      button: 'Start your home',
      introTitle: 'Custom means custom.',
      introBody: 'Every home here was designed and built by one Spaces team, for one family.',
      pathsTitle: 'Explore',
      processTitle: 'Five steps. One team.',
      processBody: 'You will know what your home looks like and costs before we break ground.',
      contactTitle: 'Let’s talk.',
      contactBody: 'Tell us what you are picturing.',
    },
  },
  intro: {
    photo: 'farm-kitchen',
    caption: 'Modern Farmhouse kitchen, built by Spaces',
  },
  trust: {
    items: [
      { icon: 'build', title: 'One team, start to finish', text: 'The people who design your home are the people who build it.' },
      { icon: 'plan', title: 'Real numbers first', text: 'Your price reflects decisions you made, not assumptions someone buried.' },
      { icon: 'home', title: 'Built on referrals', text: 'A West Michigan builder since 2017 that grows mostly by word of mouth.' },
      { icon: 'key', title: 'Keyholder care', text: 'Seasonal check-ins and a direct line for as long as you own your home.' },
    ],
  },
  paths: {
    title: 'Where would you like to start?',
    items: [
      { key: 'custom', label: 'Custom Homes', text: 'Built from your ideas, start to finish', photo: 'farm-front', route: 'custom-homes' },
      { key: 'additions', label: 'Additions', text: 'More room, without moving', photo: 'pool-house', route: 'additions' },
      { key: 'remodel', label: 'Remodeling', text: 'Kitchens, baths and whole homes', photo: 'remodel-kitchen', route: 'remodeling' },
      { key: 'projects', label: 'Our Projects', text: 'Search every home we have shared', photo: 'fennville-dining', route: 'projects' },
      { key: 'studio', label: 'Design Studio', text: 'Pick every finish in one place', photo: 'studio-samples', route: 'studio' },
      { key: 'team', label: 'Meet the Team', text: 'The people who will build with you', photo: 'farm-entry', route: 'team' },
    ],
  },
  featured: {
    title: 'Homes we have built',
    body: 'A few recent Spaces homes along the lakeshore and around Grand Rapids.',
    items: ['fennville-patio', 'farm-front', 'saugatuck-drone', 'pool-house', 'lowell-front', 'holland-front', 'southhaven-front', 'muskegon-front'],
  },
  process: {
    title: 'How building with us works',
    body: 'Five steps, one team. By the time we break ground, you already know what your home will look like, feel like and cost.',
    steps: [
      { title: 'Vision', text: 'We get to know your goals, your lot and your budget, then map out the road ahead before you commit to anything.' },
      { title: 'Plan & Budget', text: 'Our designers turn your ideas into a home with 2D and 3D plans, and put real numbers behind every choice.' },
      { title: 'Guided Selections', text: 'Choose finishes in our Design Studio, or let us bring samples to you. As simple or as detailed as you like.' },
      { title: 'Construction', text: 'A whole team, not one project manager, keeps your build moving. You are welcome on site the whole way.' },
      { title: 'Keyholder', text: 'Move-in is not goodbye. Seasonal check-ins, a one-year walkthrough and a direct line to the people who built your home.' },
    ],
  },
  video: {
    title: 'Hear it from our homeowners',
    caption: 'Client story video',
    poster: 'fennville-living',
  },
  reviews: [
    { name: 'G. Makowske', text: 'Fabulous experience from beginning to end. House was on budget, on time and is beautiful! We are 100% satisfied and will use them again.' },
    { name: 'D. Prahl', text: 'Building a new home from scratch can feel overwhelming, but the team at Spaces made the process pleasurable. Oh, and they finished ahead of schedule!' },
    { name: 'J. Black', text: 'Their versatile team listens to your family’s wants and needs, then offers creative ideas to help make the home of your dreams real. We couldn’t be happier.' },
    { name: 'S. Soderberg', text: 'Not only did they build a beautiful home, they made the process easy, timely and within budget. True professionals.' },
    { name: 'V. Hughes', text: 'It feels like a dream… but our dream came true. Thank you Spaces Designer Homes and the entire team, our home is perfect!' },
    { name: 'Rich and Veronica Hughs', text: 'Spaces has the best team on board, from the front lines on site work to everyone keeping everything within budget, and the best communication. Everyone we met during the build became like family.' },
    { name: 'R. Martemucci', text: 'We really enjoyed working with Spaces to remodel our home. We referred them to our friends!' },
    { name: 'Jamie Lynn', text: 'Beth is the best to work with. So incredibly helpful and inspiring. Highly recommend.' },
  ],
  convictions: {
    title: 'What we believe',
    photo: 'fennville-porch',
    items: [
      { title: 'Your vision', text: 'We listen first and ask the questions others skip. Then we build exactly what you pictured.' },
      { title: 'Old-fashioned respect', text: 'You are a person before you are a project. Homeowners, trades and teammates all get the same care.' },
      { title: 'Our word', text: 'We only make promises we intend to keep. If something goes wrong, you hear it from us first.' },
      { title: 'Plainspoken', text: 'Direct, complete and early. No builder jargon. Clear words are a form of respect.' },
      { title: 'Honest work', text: 'Framing, waterproofing and mechanicals get the same care as the parts that get photographed.' },
      { title: 'Stewardship', text: 'A home is one of the biggest trusts a family can give. We treat it that way.' },
    ],
  },
  studio: {
    title: 'The Spaces Design Studio',
    body: 'Our Grand Rapids studio is where your home stops being an idea. Sit down with your own designer, touch real samples and choose cabinets, counters, floors, tile and lighting, often in a single day.',
    button: 'Visit the studio',
    photo: 'studio-samples',
  },
  blogTeaser: { title: 'From the blog', body: 'Straight answers about building in West Michigan. Videos coming soon.' },
  contact: {
    title: 'Let’s talk about your home',
    body: 'A conversation, not a sales pitch. Tell us a little about what you have in mind and we will be in touch.',
    button: 'Send message',
  },
  footer: {
    blurb: 'Boutique custom homes, additions and remodels across Grand Rapids and the West Michigan lakeshore.',
    tagline: 'Your Vision. Our Masterpiece.',
  },
  pages: {
    custom: {
      title: 'Custom Homes', lead: 'A home built around you, not a plan you have to squeeze into.',
      photo: 'farm-front',
      body: 'Whether you have a few saved photos or a full plan, our in-house design team builds a fully custom 2D and 3D model of your home, so you can see it before a single board is cut. One team stays with you from contract to completion, and our direct-source pricing means no middleman markups and no hidden fees.',
      points: ['In-house design with 2D and 3D models', 'Real pricing before you commit', 'One team from first meeting to move-in', 'Keyholder care for as long as you own the home'],
      gallery: ['fennville-island', 'farm-living', 'lowell-kitchen', 'southhaven-loft', 'farm-bath', 'muskegon-living'],
    },
    additions: {
      title: 'Additions', lead: 'Love where you live, just need more of it?',
      photo: 'pool-wide',
      body: 'A sunroom, a primary suite, a bigger kitchen or a pool house. We design additions that look like they were always there, matching rooflines, materials and the feel of your home, and we plan the build around your family’s life.',
      points: ['Designs that match your home', 'Sunrooms, suites, garages and pool houses', 'Clear plan for living at home during the build', 'Permits and inspections handled for you'],
      gallery: ['pool-house', 'pool-living', 'sunroom', 'pool-deck', 'fennville-porch', 'lowell-porch'],
    },
    remodel: {
      title: 'Remodeling', lead: 'Life changes. Your home can change with it.',
      photo: 'remodel-kitchen',
      body: 'From one bathroom to a whole home, we plan and build remodels start to finish. Your personal designer helps you choose every material, and we are honest about what it costs before we begin. Prefer to do some of it yourself? We will gladly follow your lead.',
      points: ['Kitchens and baths', 'Laundry rooms, mudrooms and pantries', 'Whole-home renovations', 'Your own designer for every selection'],
      gallery: ['remodel-kitchen', 'remodel-bath', 'remodel-shower', 'remodel-mud', 'remodel-laundry', 'remodel-pantry'],
    },
    studio: {
      title: 'Design Studio', lead: 'Where your home stops being an idea.',
      photo: 'studio-samples',
      body: 'Picking materials at big-box stores is overwhelming. At the Spaces Design Studio you sit down with your own designer, see your home in 3D and hold the real samples in your hands. Many clients choose everything in one visit. Others take it room by room. Either way, nothing is ordered until you sign off.',
      steps: [
        { title: 'Bring your ideas', text: 'Saved photos, a Pinterest board or just a feeling. Every starting point works.' },
        { title: 'See it in 3D', text: 'Walk through a model of your rooms before anything is built.' },
        { title: 'Hold the real thing', text: 'Cabinets, hardware, floors, lighting, counters and tile, all in one room.' },
        { title: 'Sign off with confidence', text: 'You approve every choice and its price before we order a thing.' },
      ],
      materials: ['Cabinetry', 'Hardware', 'Flooring', 'Lighting', 'Countertops', 'Tile & backsplash', 'Plumbing fixtures', 'Paint & trim'],
      gallery: ['farm-island', 'farm-mudroom', 'studio-samples', 'holland-wall'],
    },
    about: {
      title: 'Our Story', lead: 'Building the home is the beginning of the story, not the end.',
      photo: 'wooded-drive',
      body: 'Spaces Designer Homes built its name by staying flexible through years that closed other builders’ doors, and by never settling on who we could become. What grew out of that is not one person’s brand. It is a team built so no client ever feels a gap, doing the hidden work as carefully as the work you can see, and measuring success by whether a family still loves their home years after the keys change hands.',
      mission: 'We listen with patience, design with purpose and build with conviction. We walk alongside each client from the first conversation, through the day they turn the key, and into the years that follow. We have known some of our homeowners for a decade. We intend to know them for the next one too.',
    },
    university: {
      title: 'Spaces University', lead: 'Coming soon',
      body: 'Free classes and guides for anyone thinking about building or remodeling: how budgets really work, how to pick a lot, what to ask any builder, and more. Leave your email and we will tell you when the first class opens.',
    },
  },
  team: [
    { id: 'tracy', name: 'Tracy Anderson', role: 'Owner', photo: '', bio: 'Tracy leads Spaces and stays personally involved in every home, from the first design meeting to the final walkthrough.', email: 'info@spacesdesignerhomes.com' },
    { id: 'beth', name: 'Beth', role: 'Design & Selections', photo: '', bio: 'Beth helps homeowners choose every finish in the Design Studio. Clients call her “so incredibly helpful and inspiring.”', email: 'info@spacesdesignerhomes.com' },
    { id: 'doug', name: 'Doug', role: 'Construction', photo: '', bio: 'Doug keeps builds on schedule and on budget, and makes sure the work behind the walls is done right.', email: 'info@spacesdesignerhomes.com' },
  ],
  faq: [
    { q: 'How much does a custom home cost in West Michigan?', a: 'A nicely appointed 3,000 square foot custom home typically runs around $750,000 all-in, including design, site costs and finishes. We give you a clear picture of where your budget goes before you commit to anything.' },
    { q: 'How long does it take to build?', a: 'Plan on 8 to 12 months of construction for a fully custom home, with design and selections adding time up front depending on how quickly decisions come together.' },
    { q: 'Do you charge by the square foot?', a: 'No. We price what actually goes into the home, not just the footprint, and break it down in plain numbers.' },
    { q: 'Do you do additions and remodels too?', a: 'Yes. Kitchens, baths, additions and whole-home renovations, at all price points.' },
    { q: 'Can I visit the job site?', a: 'Yes, and we encourage it. We just ask that visits be scheduled with our construction team for safety.' },
    { q: 'What happens after I move in?', a: 'Our Keyholder Program: seasonal check-ins, a one-year walkthrough we schedule for you, and a direct line to the people who built your home for as long as you own it.' },
  ],
  posts: [
    { id: 'what-does-it-cost', title: 'What does a custom home really cost in West Michigan?', date: '2026-10-14', photo: 'lowell-kitchen', excerpt: 'The honest number, and the three things that move it most.', body: 'A nicely appointed 3,000 square foot custom home in West Michigan typically runs around $750,000 all-in. Anyone who gives you a hard number before they understand your vision, your lot and your finishes is guessing.\n\nThree things drive the price, roughly in this order: your finishes and selections, your lot and the site work it needs, and how complex the design is. The same 3,000 square feet can swing six figures depending on what goes into it.\n\nThat is why we put real numbers on each of these before you commit. The price you approve should reflect decisions you made, not assumptions someone buried.' },
    { id: 'behind-the-walls', title: 'What is behind the walls matters most', date: '2026-09-30', photo: 'springlake-stairs', excerpt: 'Why framing, waterproofing and mechanicals get the same care as the kitchen.', body: 'A home has hundreds of details nobody will ever photograph. Framing. Waterproofing. Mechanicals. These are the places where builders quietly cut corners to save money, and where problems show up two years later.\n\nWe treat that hidden work exactly like the work you can see. You should never have to wonder what is behind your walls.' },
    { id: 'five-steps', title: 'Our five steps, from first idea to keys', date: '2026-09-12', photo: 'farm-living', excerpt: 'Vision, Plan & Budget, Guided Selections, Construction and Keyholder.', body: 'Every Spaces home follows the same five steps: Vision, Plan & Budget, Guided Selections, Construction and Keyholder.\n\nYou are never handed off to a stranger. The same team guides you through all of it, so by the time we break ground you already know what your home will look like, feel like and cost. Construction is almost the easy part.' },
  ],
};

const deepCopy = o => JSON.parse(JSON.stringify(o));

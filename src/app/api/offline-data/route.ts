import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// High-quality Costa Rican nature placeholder data to ensure the app is fully functional out-of-the-box
const MOCK_DATA = {
  version: 1,
  settings: {
    welcome_title_es: 'Explora el Bosque Lluvioso',
    welcome_title_en: 'Explore the Rainforest',
    welcome_subtitle_es: 'Cada paso es un nuevo descubrimiento.',
    welcome_subtitle_en: 'Every step is a new discovery.',
    map_image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop', // Beautiful rainforest path placeholder
  },
  categories: [
    {
      id: 'cat-mammals',
      slug: 'mamiferos',
      name_es: 'Mamíferos',
      name_en: 'Mammals',
      icon: '🐒',
      active: true,
      sort_order: 1,
    },
    {
      id: 'cat-birds',
      slug: 'aves',
      name_es: 'Aves',
      name_en: 'Birds',
      icon: '🐦',
      active: true,
      sort_order: 2,
    },
    {
      id: 'cat-amphibians',
      slug: 'anfibios',
      name_es: 'Anfibios',
      name_en: 'Amphibians',
      icon: '🐸',
      active: true,
      sort_order: 3,
    },
    {
      id: 'cat-insects',
      slug: 'insectos',
      name_es: 'Insectos',
      name_en: 'Insects',
      icon: '🦋',
      active: true,
      sort_order: 4,
    },
    {
      id: 'cat-plants',
      slug: 'plantas',
      name_es: 'Plantas',
      name_en: 'Plants',
      icon: '🌳',
      active: true,
      sort_order: 5,
    },
  ],
  points: [
    {
      id: 'p-1',
      number: 12,
      category_id: 'cat-mammals',
      name_es: 'Perezoso de tres dedos',
      name_en: 'Brown-throated Three-toed Sloth',
      scientific_name: 'Bradypus variegatus',
      description_es: 'El perezoso de tres dedos es el mamífero más emblemático de Costa Rica. Pasa casi toda su vida en las copas de los árboles, bajando solo una vez por semana.',
      description_en: 'The three-toed sloth is Costa Rica\'s most iconic mammal. It spends almost its entire life in the canopy, descending only once a week.',
      habitat_es: 'Bosques tropicales lluviosos y secos. Común en las ramas de árboles como el guarumo.',
      habitat_en: 'Tropical rainforests and dry forests. Common in the branches of trees like the cecropia.',
      diet_es: 'Hojas tiernas, brotes y frutos de árboles específicos.',
      diet_en: 'Tender leaves, shoots, and fruits of specific trees.',
      sabias_que_es: 'Los perezosos tienen un metabolismo extremadamente lento; les puede tomar hasta un mes digerir una sola comida.',
      sabias_que_en: 'Sloths have an extremely slow metabolism; it can take them up to a month to digest a single meal.',
      conservation_es: 'Preocupación menor, pero amenazados por la pérdida de hábitat y líneas eléctricas en zonas urbanas.',
      conservation_en: 'Least concern, but threatened by habitat loss and power lines in urbanizing areas.',
      main_image_url: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=600&auto=format&fit=crop', // Sloth
      gallery_urls: [
        'https://images.unsplash.com/photo-1519690889869-e49694ae0798?q=80&w=600&auto=format&fit=crop',
      ],
      active: true,
      map_x: 25.5,
      map_y: 40.0,
      ar_enabled: false,
    },
    {
      id: 'p-2',
      number: 5,
      category_id: 'cat-amphibians',
      name_es: 'Rana verde de ojos rojos',
      name_en: 'Red-eyed Tree Frog',
      scientific_name: 'Agalychnis callidryas',
      description_es: 'Una pequeña rana arborícola conocida por sus enormes ojos rojos brillantes. Sus colores actúan como un mecanismo de defensa para asustar depredadores.',
      description_en: 'A small tree frog known for its huge bright red eyes. Its colors act as a defense mechanism to startle predators.',
      habitat_es: 'Hojas de plantas en el sotobosque, cerca de charcas y ríos lentos.',
      habitat_en: 'Leaves of plants in the understory, near ponds and slow-moving streams.',
      diet_es: 'Insectos pequeños, principalmente moscas, polillas y grillos nocturnos.',
      diet_en: 'Small insects, primarily nocturnal flies, moths, and crickets.',
      sabias_que_es: 'No son venenosas; confían en su camuflaje verde brillante durante el día pegándose a las hojas y cerrando sus ojos.',
      sabias_que_en: 'They are not poisonous; they rely on their bright green camouflage during the day by clinging to leaves and closing their eyes.',
      conservation_es: 'Estable. Requieren bosques sanos con abundante agua limpia para reproducirse.',
      conservation_en: 'Stable. They require healthy forests with clean, standing water to breed.',
      main_image_url: 'https://images.unsplash.com/photo-1548232979-bf7b9a52fb8f?q=80&w=600&auto=format&fit=crop', // Frog
      gallery_urls: [],
      active: true,
      map_x: 60.2,
      map_y: 35.8,
      ar_enabled: false,
    },
    {
      id: 'p-3',
      number: 8,
      category_id: 'cat-birds',
      name_es: 'Tucán pico iris',
      name_en: 'Keel-billed Toucan',
      scientific_name: 'Ramphastos sulfuratus',
      description_es: 'El tucán pico iris destaca por su pico multicolor ligero pero fuerte. Es una de las aves más coloridas del bosque tropical costarricense.',
      description_en: 'The keel-billed toucan stands out for its lightweight but strong multicolored beak. It is one of the most colorful birds of the Costa Rican rainforest.',
      habitat_es: 'Dosel del bosque lluvioso y bordes de bosque.',
      habitat_en: 'Rainforest canopy and forest edges.',
      diet_es: 'Principalmente frutas silvestres, que tragan enteras, dispersando las semillas por el bosque.',
      diet_en: 'Primarily wild fruits, which they swallow whole, dispersing seeds throughout the forest.',
      sabias_que_es: 'A pesar de su gran tamaño, el pico está hecho de queratina esponjosa, lo que lo hace sumamente liviano y no interfiere con el vuelo.',
      sabias_que_en: 'Despite its large size, the beak is made of spongy keratin, making it extremely light and not interfering with flight.',
      conservation_es: 'Preocupación menor, vulnerable a la fragmentación del bosque y comercio de mascotas.',
      conservation_en: 'Least concern, vulnerable to forest fragmentation and pet trade.',
      main_image_url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?q=80&w=600&auto=format&fit=crop', // Toucan
      gallery_urls: [],
      active: true,
      map_x: 45.0,
      map_y: 65.2,
      ar_enabled: false,
    },
    {
      id: 'p-4',
      number: 21,
      category_id: 'cat-insects',
      name_es: 'Mariposa Morpho Azul',
      name_en: 'Blue Morpho Butterfly',
      scientific_name: 'Morpho peleides',
      description_es: 'Una de las mariposas más grandes del mundo, famosa por sus alas de un color azul metálico deslumbrante que brilla intensamente al volar.',
      description_en: 'One of the largest butterflies in the world, famous for its dazzling metallic blue wings that shimmer intensely as it flies.',
      habitat_es: 'Sotobosque húmedo, claros de bosque y orillas de ríos en elevaciones bajas.',
      habitat_en: 'Humid understory, forest clearings, and riverbanks at low elevations.',
      diet_es: 'Frutas fermentadas en descomposición, savia de árboles y hongos.',
      diet_en: 'Rotting fermented fruits, tree sap, and fungi.',
      sabias_que_es: 'El color azul de sus alas no es por pigmento, sino por la microestructura de sus escamas que reflejan la luz, creando un efecto iridiscente.',
      sabias_que_en: 'The blue color of its wings is not from pigment, but from the microstructure of its scales reflecting light, creating an iridescent effect.',
      conservation_es: 'No evaluada detalladamente, pero común en mariposarios de Costa Rica y amenazada por la deforestación.',
      conservation_en: 'Not evaluated in detail, but common in butterfly gardens of Costa Rica and threatened by deforestation.',
      main_image_url: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?q=80&w=600&auto=format&fit=crop', // Blue Morpho
      gallery_urls: [],
      active: true,
      map_x: 75.0,
      map_y: 72.0,
      ar_enabled: false,
    },
  ],
};

export async function GET() {
  try {
    // 1. Fetch current content version
    const { data: versionData } = await supabase
      .from('offline_versions')
      .select('version')
      .order('version', { ascending: false })
      .limit(1);

    const version = versionData && versionData.length > 0 ? versionData[0].version : MOCK_DATA.version;

    // 2. Fetch categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (catError) throw catError;

    // 3. Fetch points of interest
    const { data: points, error: ptError } = await supabase
      .from('points')
      .select('*')
      .eq('active', true)
      .order('number', { ascending: true });

    if (ptError) throw ptError;

    // 4. Fetch settings
    const { data: settingsData, error: setError } = await supabase
      .from('app_settings')
      .select('key, value');

    if (setError) throw setError;

    const settings: Record<string, string> = {};
    if (settingsData) {
      settingsData.forEach((row) => {
        settings[row.key] = row.value || '';
      });
    }

    // Merge database results
    return NextResponse.json({
      version,
      categories: categories && categories.length > 0 ? categories : MOCK_DATA.categories,
      points: points && points.length > 0 ? points : MOCK_DATA.points,
      settings: Object.keys(settings).length > 0 ? { ...MOCK_DATA.settings, ...settings } : MOCK_DATA.settings,
    });
  } catch (error) {
    console.error('API Error fetching offline package, returning mock fallback data:', error);
    // If Supabase is offline or not configured yet, return fallback mock data
    return NextResponse.json(MOCK_DATA);
  }
}

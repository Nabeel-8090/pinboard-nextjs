import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

// Load .env.local manually
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
envContent.split("\n").forEach((line) => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
});

const MONGO_URI = process.env.MONGO_URI;

const pinSchema = new mongoose.Schema(
  {
    user: String,
    title: String,
    description: String,
    tags: [String],
    image: { url: String },
    likes: [{ user: String }],
    comments: [
      {
        user: String,
        profileImage: String,
        comment: String,
        commentedOn: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Pin = mongoose.models.Pin || mongoose.model("Pin", pinSchema);

// 25 pins per category = 100 total
const pins = [
  // ───── CARS (25) ─────
  { title: "Ferrari 488 Spider", description: "The roar of a mid-engine V8 echoing through mountain roads.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800" } },
  { title: "Lamborghini Huracán", description: "Italian engineering at its finest — raw, aggressive, beautiful.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800" } },
  { title: "Porsche 911 GT3", description: "Track-bred precision wrapped in timeless design.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800" } },
  { title: "McLaren 720S", description: "Carbon fiber and aerodynamics pushed to the extreme.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" } },
  { title: "Aston Martin DB11", description: "British elegance meets supercar performance.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800" } },
  { title: "Bugatti Chiron", description: "1500 horsepower of pure engineering madness.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1566473965997-3de9c817e938?w=800" } },
  { title: "Ford Mustang GT500", description: "American muscle with a supercharged heart.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800" } },
  { title: "BMW M4 Competition", description: "The perfect blend of luxury and track performance.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=800" } },
  { title: "Mercedes AMG GT", description: "Handcrafted V8 power in a stunning silhouette.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800" } },
  { title: "Chevrolet Corvette C8", description: "Mid-engine revolution from the heart of America.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800" } },
  { title: "Rolls Royce Phantom", description: "The pinnacle of automotive luxury and craftsmanship.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800" } },
  { title: "Tesla Model S Plaid", description: "0-60 in under 2 seconds — the electric revolution.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800" } },
  { title: "Dodge Challenger Hellcat", description: "Supercharged V8 with 717 horses of pure fury.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800" } },
  { title: "Jaguar F-Type R", description: "Sleek British sports car with a thunderous exhaust note.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800" } },
  { title: "Alfa Romeo Giulia QV", description: "Italian passion distilled into a four-door sports sedan.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800" } },
  { title: "Nissan GT-R Nismo", description: "Godzilla — the legend that never gets old.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1591293835940-934a7c4f2d9b?w=800" } },
  { title: "Audi R8 V10", description: "A naturally aspirated V10 screaming to 8700 rpm.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800" } },
  { title: "Pagani Huayra", description: "Hand-built Italian art with a twin-turbo AMG heart.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800" } },
  { title: "Koenigsegg Agera RS", description: "The fastest production car ever recorded on public roads.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800" } },
  { title: "Maserati GranTurismo", description: "Grand touring Italian style with a Ferrari-derived engine.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800" } },
  { title: "Bentley Continental GT", description: "Handcrafted luxury with a W12 engine under the hood.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800" } },
  { title: "Lexus LFA", description: "A carbon fiber masterpiece with a 9000 rpm V10.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1471479917193-f00955256257?w=800" } },
  { title: "Honda NSX Type R", description: "Japan's answer to the supercar — precision over power.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800" } },
  { title: "Subaru WRX STI", description: "Rally-bred performance for the everyday enthusiast.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800" } },
  { title: "Toyota Supra MK5", description: "The legend reborn with BMW inline-six power.", tags: ["cars"], image: { url: "https://images.unsplash.com/photo-1621993202322-45b7de71f4e2?w=800" } },

  // ───── BIKES (25) ─────
  { title: "Ducati Panigale V4", description: "MotoGP technology brought to the streets.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800" } },
  { title: "Kawasaki Ninja H2R", description: "Supercharged track monster — 300+ horsepower.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800" } },
  { title: "Harley Davidson Fat Boy", description: "Classic American cruiser with iconic Milwaukee iron.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800" } },
  { title: "BMW S1000RR", description: "German precision in a superbike package.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800" } },
  { title: "Honda CBR1000RR Fireblade", description: "The original litre-class benchmark, refined over decades.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800" } },
  { title: "Yamaha YZF-R1M", description: "Electronics-laden superbike straight from the factory.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800" } },
  { title: "Suzuki GSX-R1000", description: "The Gixxer — a legend in the superbike world.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800" } },
  { title: "KTM 1290 Super Duke R", description: "The Beast — naked aggression on two wheels.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800" } },
  { title: "Triumph Speed Triple", description: "British naked bike with a triple-cylinder roar.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800" } },
  { title: "Aprilia RSV4 Factory", description: "V4 Italian superbike with championship DNA.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1600705722908-bde5e5e7e5e5?w=800" } },
  { title: "Indian Scout Bobber", description: "Stripped-down American style with modern reliability.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1558981285-6f0c68730b72?w=800" } },
  { title: "Ducati Monster 1200", description: "The naked bike that started a revolution.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800" } },
  { title: "Royal Enfield Interceptor", description: "Classic British-inspired twin for the modern rider.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800" } },
  { title: "Kawasaki Z900RS", description: "Retro styling with modern performance underneath.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800" } },
  { title: "Honda Africa Twin", description: "Adventure touring bike built for any terrain.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800" } },
  { title: "Yamaha MT-09", description: "Hyper naked with a crossplane triple engine.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800" } },
  { title: "Ducati Scrambler Desert Sled", description: "Off-road ready scrambler with Italian flair.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" } },
  { title: "BMW R1250GS Adventure", description: "The king of adventure touring motorcycles.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800" } },
  { title: "Harley Davidson Street Glide", description: "Long-haul touring comfort with iconic style.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800" } },
  { title: "MV Agusta Brutale 1000", description: "Italian art gallery on two wheels.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800" } },
  { title: "Kawasaki Versys 1000", description: "Versatile adventure tourer for long journeys.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800" } },
  { title: "Triumph Bonneville T120", description: "The most iconic British motorcycle ever made.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800" } },
  { title: "Honda Grom 125", description: "Tiny but mighty — the ultimate city commuter.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800" } },
  { title: "Suzuki V-Strom 1050XT", description: "Adventure touring with a beak and a big heart.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800" } },
  { title: "Zero SR/F Electric", description: "The future of motorcycling — silent, fast, clean.", tags: ["bikes"], image: { url: "https://images.unsplash.com/photo-1558981285-6f0c68730b72?w=800" } },

  // ───── BUILDINGS (25) ─────
  { title: "Burj Khalifa at Dusk", description: "The world's tallest building piercing the Dubai skyline.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800" } },
  { title: "Eiffel Tower at Night", description: "Paris's iron lady sparkling against the night sky.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800" } },
  { title: "Sydney Opera House", description: "Iconic sail-shaped shells on the edge of Sydney Harbour.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" } },
  { title: "Colosseum Rome", description: "Ancient Roman amphitheater standing for 2000 years.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800" } },
  { title: "Sagrada Familia", description: "Gaudí's unfinished masterpiece in Barcelona.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800" } },
  { title: "Empire State Building", description: "Art Deco icon towering over Midtown Manhattan.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800" } },
  { title: "Taj Mahal Sunrise", description: "A monument of eternal love glowing at dawn.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800" } },
  { title: "Big Ben Westminster", description: "London's most recognizable clock tower.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800" } },
  { title: "Petronas Twin Towers", description: "Twin steel giants dominating the Kuala Lumpur skyline.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800" } },
  { title: "Louvre Museum Paris", description: "The world's largest art museum in a stunning palace.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800" } },
  { title: "Flatiron Building NYC", description: "Triangular steel-frame skyscraper from 1902.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800" } },
  { title: "Hagia Sophia Istanbul", description: "Byzantine masterpiece that has stood for 1500 years.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800" } },
  { title: "Guggenheim Museum Bilbao", description: "Frank Gehry's titanium-clad deconstructivist marvel.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" } },
  { title: "Chrysler Building", description: "Art Deco crown jewel of the New York skyline.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800" } },
  { title: "Neuschwanstein Castle", description: "Fairy-tale castle perched in the Bavarian Alps.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800" } },
  { title: "One World Trade Center", description: "Freedom Tower rising above Lower Manhattan.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800" } },
  { title: "Parthenon Athens", description: "Ancient Greek temple dedicated to Athena.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800" } },
  { title: "Shanghai Tower", description: "China's tallest building with a twisting glass facade.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800" } },
  { title: "Alhambra Palace Granada", description: "Moorish palace complex with intricate geometric art.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" } },
  { title: "St. Basil's Cathedral", description: "Colorful onion domes on Moscow's Red Square.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800" } },
  { title: "Fallingwater House", description: "Frank Lloyd Wright's masterpiece built over a waterfall.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800" } },
  { title: "Lotus Temple Delhi", description: "Bahá'í House of Worship shaped like a blooming lotus.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800" } },
  { title: "Pompidou Centre Paris", description: "Inside-out architecture with exposed colorful pipes.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800" } },
  { title: "Marina Bay Sands", description: "Singapore's iconic three-tower hotel with a sky park.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800" } },
  { title: "Zaha Hadid MAXXI Museum", description: "Fluid concrete curves defining contemporary architecture.", tags: ["buildings"], image: { url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800" } },

  // ───── NATURE (25) ─────
  { title: "Aurora Borealis Iceland", description: "Dancing green lights painting the Arctic sky.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800" } },
  { title: "Grand Canyon Sunset", description: "Layers of red rock glowing in the golden hour.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800" } },
  { title: "Amazon Rainforest", description: "The lungs of the Earth — dense, green, alive.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800" } },
  { title: "Niagara Falls", description: "Thundering curtains of water on the US-Canada border.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1489447068241-b3490214e879?w=800" } },
  { title: "Mount Fuji Reflection", description: "Japan's sacred volcano mirrored in a still lake.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800" } },
  { title: "Sahara Desert Dunes", description: "Endless golden waves of sand under a blazing sun.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800" } },
  { title: "Great Barrier Reef", description: "The world's largest coral reef teeming with life.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800" } },
  { title: "Patagonia Torres del Paine", description: "Granite towers rising above the Patagonian steppe.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800" } },
  { title: "Antelope Canyon", description: "Slot canyon with flowing sandstone walls of light.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800" } },
  { title: "Plitvice Lakes Croatia", description: "Turquoise terraced lakes connected by waterfalls.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800" } },
  { title: "Milky Way Over Desert", description: "The galaxy stretching across a perfectly dark sky.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800" } },
  { title: "Cherry Blossoms Japan", description: "Pink sakura petals drifting in a spring breeze.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800" } },
  { title: "Banff National Park", description: "Turquoise glacial lakes surrounded by Rocky Mountain peaks.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800" } },
  { title: "Lofoten Islands Norway", description: "Dramatic peaks rising straight from the Arctic Ocean.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1520769945061-0a448c463865?w=800" } },
  { title: "Zhangjiajie Pillars", description: "Towering sandstone pillars that inspired Avatar's Pandora.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800" } },
  { title: "Tulip Fields Netherlands", description: "Endless rows of vibrant color across flat Dutch land.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1490750967868-88df5691cc5e?w=800" } },
  { title: "Victoria Falls Zimbabwe", description: "The smoke that thunders — Africa's greatest waterfall.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1489447068241-b3490214e879?w=800" } },
  { title: "Redwood Forest California", description: "Ancient giants reaching 100 meters into the sky.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800" } },
  { title: "Maldives Overwater Bungalow", description: "Crystal clear lagoon surrounding a paradise island.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800" } },
  { title: "Yellowstone Geysers", description: "Old Faithful erupting against a blue Wyoming sky.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800" } },
  { title: "Cappadocia Hot Air Balloons", description: "Colorful balloons floating over fairy chimney valleys.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1527004013197-933b977e7b3e?w=800" } },
  { title: "Fiordland New Zealand", description: "Milford Sound — where mountains meet the sea.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800" } },
  { title: "Lavender Fields Provence", description: "Purple rows stretching to the horizon in southern France.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800" } },
  { title: "Iguazu Falls Argentina", description: "275 waterfalls spanning nearly 3 km of jungle.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1489447068241-b3490214e879?w=800" } },
  { title: "Namib Desert Starscape", description: "One of Earth's oldest deserts under a billion stars.", tags: ["nature"], image: { url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800" } },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  await mongoose.connection.collection("pins").deleteMany({
    tags: { $in: ["cars", "bikes", "buildings", "nature"] },
  });
  console.log("Cleared existing seeded pins");

  const docs = pins.map((p) => ({
    ...p,
    user: "seed@pinboard.com",
    likes: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await mongoose.connection.collection("pins").insertMany(docs);
  console.log(`✅ Inserted ${docs.length} pins successfully`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

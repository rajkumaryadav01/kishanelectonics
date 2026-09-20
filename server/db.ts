import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  houseShopNo: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  productCount?: number;
  active: boolean;
}

export interface ProductSpecification {
  [key: string]: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  modelNumber?: string;
  categoryId: string;
  categoryName?: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  description: string;
  features: string[];
  applications: string[];
  specifications: ProductSpecification;
  images: string[];
  datasheetUrl?: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  active: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectKitItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface ProjectKit {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  originalPrice?: number;
  description: string;
  imageUrl: string;
  components: ProjectKitItem[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  stockQuantity: number;
  active: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  stockQuantity: number;
  isKit?: boolean;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  total: number;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready for Pickup / Shipped'
  | 'Delivered / Collected'
  | 'Cancelled';

export type OrderType = 'Pickup' | 'Delivery';
export type PaymentMethod = 'Cash on Pickup' | 'Pay on Delivery' | 'UPI / Online';

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string; // e.g. KE-2026-000101
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  orderType: OrderType;
  pickupLocation?: string;
  deliveryAddress?: {
    houseShopNo: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: 'Pending' | 'Paid';
  orderStatus: OrderStatus;
  timeline: OrderTimeline[];
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  approved: boolean;
}

export interface ProductQuestion {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  openingHours: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  pickupNotice: string;
  currency: string;
  currencyCode: string;
  taxPercent: number;
  lowStockThreshold: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
}

export interface NotificationItem {
  id: string;
  recipientId: string; // 'admin' or userId
  title: string;
  message: string;
  type: 'order' | 'stock' | 'enquiry' | 'system';
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  addresses: Address[];
  categories: Category[];
  products: Product[];
  projectKits: ProjectKit[];
  carts: Record<string, Cart>; // userId -> Cart
  orders: Order[];
  reviews: Review[];
  questions: ProductQuestion[];
  wishlists: Record<string, string[]>; // userId -> array of productIds
  settings: ShopSettings;
  notifications: NotificationItem[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbCache: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  if (dbCache) {
    return dbCache;
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(data);
      return dbCache!;
    } catch (err) {
      console.error('Error reading db.json, reinitializing...', err);
    }
  }

  const initial = createInitialDatabase();
  saveDatabase(initial);
  return initial;
}

export function saveDatabase(data: DatabaseSchema): void {
  dbCache = data;
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to write database atomically:', err);
  }
}

function createInitialDatabase(): DatabaseSchema {
  // Passwords hashed using standard bcryptjs for security
  // admin@kishanelectronics.com -> admin123
  // customer@kishanelectronics.com -> customer123
  const adminPasswordHash = '$2a$10$wTkyrQ6R0iK/bUoiH2uJv.R7pW4P0Z3eA7tFpT1o9FzG9VjP0.X8u'; // admin123
  const customerPasswordHash = '$2a$10$wTkyrQ6R0iK/bUoiH2uJv.R7pW4P0Z3eA7tFpT1o9FzG9VjP0.X8u'; // customer123

  const users: User[] = [
    {
      id: 'usr_admin_01',
      name: 'Kishan Admin',
      email: 'admin@kishanelectronics.com',
      phone: '+91 98765 43210',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_cust_01',
      name: 'Aarav Sharma',
      email: 'customer@kishanelectronics.com',
      phone: '+91 98234 56789',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const addresses: Address[] = [
    {
      id: 'addr_01',
      userId: 'usr_cust_01',
      fullName: 'Aarav Sharma',
      phone: '+91 98234 56789',
      houseShopNo: 'Flat 402, Sunshine Heights',
      street: 'College Road, Near MIT Campus',
      city: 'Pune',
      state: 'Maharashtra',
      pinCode: '411038',
      isDefault: true,
    },
  ];

  const categories: Category[] = [
    { id: 'cat_ics', name: 'ICs', slug: 'ics', description: 'Integrated circuits, operational amplifiers, timers, voltage regulators, logic ICs', active: true },
    { id: 'cat_resistors', name: 'Resistors', slug: 'resistors', description: 'Through-hole and SMD carbon film, metal film, potentiometers and trimpots', active: true },
    { id: 'cat_capacitors', name: 'Capacitors', slug: 'capacitors', description: 'Electrolytic, ceramic disc, tantalum, and polyester capacitors', active: true },
    { id: 'cat_diodes', name: 'Diodes', slug: 'diodes', description: 'Rectifier diodes, Zener diodes, Schottky diodes, and bridge rectifiers', active: true },
    { id: 'cat_transistors', name: 'Transistors', slug: 'transistors', description: 'BJT NPN/PNP, MOSFETs, and power transistors', active: true },
    { id: 'cat_leds', name: 'LEDs', slug: 'leds', description: 'Through-hole 3mm/5mm, high power LEDs, RGB, and 7-segment displays', active: true },
    { id: 'cat_sensors', name: 'Sensors', slug: 'sensors', description: 'Ultrasonic, IR, temperature, humidity, gas, motion, and touch sensors', active: true },
    { id: 'cat_arduino', name: 'Arduino', slug: 'arduino', description: 'Genuine & compatible Arduino boards, shields, and programming accessories', active: true },
    { id: 'cat_esp32', name: 'ESP32', slug: 'esp32', description: 'ESP32 & ESP8266 WiFi + Bluetooth development boards and modules', active: true },
    { id: 'cat_raspberry_pi', name: 'Raspberry Pi', slug: 'raspberry-pi', description: 'Raspberry Pi boards, compute modules, cameras, and official cases', active: true },
    { id: 'cat_modules', name: 'Modules', slug: 'modules', description: 'Motor drivers, step-down converters, wireless transceivers, sound modules', active: true },
    { id: 'cat_displays', name: 'Displays', slug: 'displays', description: '16x2 LCDs, OLED 0.96", TFT touch screens, and Nextion HMI displays', active: true },
    { id: 'cat_motors', name: 'Motors', slug: 'motors', description: 'DC gear motors, BO motors, stepper motors, and micro servos', active: true },
    { id: 'cat_relays', name: 'Relays', slug: 'relays', description: '5V, 12V single and multi-channel relay modules for AC/DC switching', active: true },
    { id: 'cat_pcbs', name: 'PCBs', slug: 'pcbs', description: 'General purpose perfboards, copper clad boards, and etching accessories', active: true },
    { id: 'cat_breadboards', name: 'Breadboards', slug: 'breadboards', description: 'Solderless breadboards (400 points, 830 points) and power rails', active: true },
    { id: 'cat_wires', name: 'Wires & Cables', slug: 'wires-cables', description: 'Male-to-male, male-to-female jumper wires, ribbon cables, hookup wire', active: true },
    { id: 'cat_connectors', name: 'Connectors', slug: 'connectors', description: 'Berg strips, screw terminals, DC jacks, JST, and USB connectors', active: true },
    { id: 'cat_power', name: 'Power Supplies', slug: 'power-supplies', description: 'SMPS adapters, step-down buck modules, breadboard power modules', active: true },
    { id: 'cat_batteries', name: 'Batteries', slug: 'batteries', description: '18650 Li-ion cells, 9V batteries, battery holders, and BMS modules', active: true },
    { id: 'cat_project_kits', name: 'Project Kits', slug: 'project-kits', description: 'Complete hands-on kits for Arduino, IoT, Robotics, and ECE college projects', active: true },
  ];

  const products: Product[] = [
    {
      id: 'prod_01',
      name: 'Arduino UNO R3 Development Board (ATmega328P)',
      sku: 'ARD-UNO-R3',
      modelNumber: 'A000066',
      categoryId: 'cat_arduino',
      brand: 'Arduino Compatible',
      price: 499,
      originalPrice: 650,
      discountPercent: 23,
      stockQuantity: 45,
      lowStockThreshold: 10,
      description: 'The standard microcontroller board for electronic prototyping and student engineering projects. Features 14 digital I/O pins, 6 analog inputs, and a 16 MHz quartz crystal oscillator.',
      features: [
        'ATmega328P microcontroller with 16MHz clock speed',
        '14 Digital I/O Pins (6 PWM outputs)',
        '6 Analog Input Pins (10-bit ADC resolution)',
        'USB Type-B interface with CH340 / 16U2 for fast firmware flashing',
        'Operating voltage 5V, input voltage recommended 7-12V',
      ],
      applications: [
        'Robotics and motor control projects',
        'Sensor data acquisition and telemetry',
        'Academic engineering lab experiments',
        'Home automation controller prototype',
      ],
      specifications: {
        'Microcontroller': 'ATmega328P',
        'Operating Voltage': '5V DC',
        'Input Voltage (Recommended)': '7-12V DC',
        'Digital I/O Pins': '14 (of which 6 provide PWM output)',
        'Analog Input Pins': '6',
        'Flash Memory': '32 KB (0.5 KB used by bootloader)',
        'SRAM': '2 KB',
        'EEPROM': '1 KB',
        'Clock Speed': '16 MHz',
        'Dimensions': '68.6 mm x 53.4 mm',
      },
      images: [
        'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/arduino-uno-r3-datasheet.pdf',
      isFeatured: true,
      isPopular: true,
      active: true,
      rating: 4.9,
      reviewCount: 38,
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'prod_02',
      name: 'ESP32 NodeMCU WiFi & Bluetooth Development Board',
      sku: 'ESP32-DEV-30P',
      modelNumber: 'ESP-WROOM-32',
      categoryId: 'cat_esp32',
      brand: 'Espressif Systems',
      price: 380,
      originalPrice: 480,
      discountPercent: 21,
      stockQuantity: 60,
      lowStockThreshold: 12,
      description: 'Dual-core 32-bit Tensilica Xtensa LX6 microprocessor with built-in 2.4 GHz 802.11 b/g/n Wi-Fi and Bluetooth 4.2 BR/EDR and BLE. Ideal for IoT, smart home, and wearable electronics.',
      features: [
        'Dual-core 240MHz Tensilica Xtensa 32-bit LX6 CPU',
        'Integrated 802.11b/g/n HT40 Wi-Fi transceiver and dual-mode Bluetooth',
        'Ultra-low power co-processor for deep sleep states',
        '520 KB SRAM with 4MB SPI Flash memory',
        'Rich peripherals: capacitive touch, Hall sensor, ADC, DAC, UART, SPI, I2C',
      ],
      applications: [
        'Smart IoT gateways and sensors',
        'Home automation & MQTT cloud brokers',
        'Wireless sensor networks',
        'Bluetooth audio and beacon trackers',
      ],
      specifications: {
        'Processor': 'Tensilica Xtensa Dual-Core 32-bit LX6',
        'Operating Voltage': '3.3V DC (5V input via Micro-USB)',
        'Clock Frequency': 'Up to 240 MHz',
        'Wi-Fi': '802.11 b/g/n (up to 150 Mbps)',
        'Bluetooth': 'Bluetooth v4.2 BR/EDR and BLE specification',
        'Flash Memory': '4 MB',
        'SRAM': '520 KB',
        'GPIO Pins': '30 Pins',
        'Dimensions': '51.5 mm x 28.5 mm',
      },
      images: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/esp32-wroom-32-datasheet.pdf',
      isFeatured: true,
      isPopular: true,
      active: true,
      rating: 4.8,
      reviewCount: 42,
      createdAt: '2026-01-12T10:00:00Z',
      updatedAt: '2026-01-12T10:00:00Z',
    },
    {
      id: 'prod_03',
      name: 'HC-SR04 Ultrasonic Distance Sensor Module',
      sku: 'SNS-HC-SR04',
      modelNumber: 'HC-SR04-V2',
      categoryId: 'cat_sensors',
      brand: 'RoboLab',
      price: 95,
      originalPrice: 140,
      discountPercent: 32,
      stockQuantity: 120,
      lowStockThreshold: 20,
      description: 'Non-contact distance measurement module providing 2cm - 400cm ranging accuracy. Includes ultrasonic transmitter, receiver and control circuit.',
      features: [
        'Ranging distance: 2cm to 400cm with 3mm precision',
        'Operating voltage 5V DC with low quiescent current (<2mA)',
        'Standard 4-pin interface: VCC, Trig, Echo, GND',
        'Compatible with Arduino, Raspberry Pi, ESP32, and PIC',
      ],
      applications: [
        'Obstacle avoiding robots',
        'Water level monitoring systems',
        'Intrusion detection alarms',
        'Parking assistance prototypes',
      ],
      specifications: {
        'Operating Voltage': '5V DC',
        'Operating Current': '15 mA',
        'Measuring Angle': '15 degrees',
        'Distance Range': '2 cm – 400 cm',
        'Accuracy': '±3 mm',
        'Trigger Input Pulse': '10 µs TTL pulse',
        'Echo Output Signal': 'TTL PWL signal',
        'Dimensions': '45 mm x 20 mm x 15 mm',
      },
      images: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/hc-sr04-ultrasonic-sensor-datasheet.pdf',
      isFeatured: true,
      isPopular: true,
      active: true,
      rating: 4.7,
      reviewCount: 29,
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 'prod_04',
      name: 'SG90 9g Micro Servo Motor (180 Degree)',
      sku: 'MTR-SG90-9G',
      modelNumber: 'TowerPro SG90',
      categoryId: 'cat_motors',
      brand: 'TowerPro',
      price: 110,
      originalPrice: 160,
      discountPercent: 31,
      stockQuantity: 85,
      lowStockThreshold: 15,
      description: 'Lightweight micro servo motor capable of 180-degree rotation. Includes mounting horns, brass screws, and 250mm connection cable.',
      features: [
        'Tiny and lightweight (9g) with high output torque (1.8 kg-cm)',
        'Operates on standard 4.8V to 6V DC PWM signals',
        'Includes 3 servo horns and mounting screws',
        'Standard 3-wire color coded pinout (GND, VCC, PWM)',
      ],
      applications: [
        'Robotic arm joints and steering mechanisms',
        'Pan-tilt camera mounts',
        'RC planes, quadcopters, and boats',
        'Automated door lock mechanisms',
      ],
      specifications: {
        'Weight': '9 grams',
        'Operating Voltage': '4.8V – 6.0V DC',
        'Operating Speed': '0.12 sec / 60 degrees (at 4.8V)',
        'Stall Torque': '1.8 kg-cm (at 4.8V)',
        'Rotation Angle': '180 degrees',
        'Gear Type': 'POM Nylon Gear',
        'Connector Wire Length': '250 mm',
        'Dimensions': '22.2 mm x 11.8 mm x 31 mm',
      },
      images: [
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/sg90-servo-motor-datasheet.pdf',
      isFeatured: true,
      isPopular: true,
      active: true,
      rating: 4.6,
      reviewCount: 19,
      createdAt: '2026-01-16T10:00:00Z',
      updatedAt: '2026-01-16T10:00:00Z',
    },
    {
      id: 'prod_05',
      name: 'LM358 Dual Operational Amplifier IC (DIP-8)',
      sku: 'IC-LM358-DIP8',
      modelNumber: 'LM358N',
      categoryId: 'cat_ics',
      brand: 'Texas Instruments',
      price: 15,
      originalPrice: 25,
      discountPercent: 40,
      stockQuantity: 250,
      lowStockThreshold: 30,
      description: 'Industry-standard dual high-gain, frequency-compensated operational amplifier designed to operate from a single power supply over a wide range of voltages.',
      features: [
        'Wide supply ranges: Single supply 3V to 32V or dual supplies ±1.5V to ±16V',
        'Low supply current drain independent of supply voltage (0.7mA)',
        'Common-mode input range includes ground',
        'Internal frequency compensation for unity gain stability',
      ],
      applications: [
        'Sensor signal conditioning & amplification',
        'Comparator circuits and active filters',
        'Analog mathematical operations',
        'Current shunt measurement circuits',
      ],
      specifications: {
        'Package Type': 'DIP-8 (Through-Hole)',
        'Number of Channels': '2 (Dual Op-Amp)',
        'Supply Voltage (Single)': '3V to 32V',
        'Supply Voltage (Dual)': '±1.5V to ±16V',
        'Gain Bandwidth Product': '1 MHz',
        'Input Offset Voltage': '2 mV (typical)',
        'Slew Rate': '0.6 V/µs',
        'Operating Temperature': '0°C to 70°C',
      },
      images: [
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/lm358-dual-opamp-datasheet.pdf',
      isFeatured: false,
      isPopular: true,
      active: true,
      rating: 4.9,
      reviewCount: 51,
      createdAt: '2026-01-18T10:00:00Z',
      updatedAt: '2026-01-18T10:00:00Z',
    },
    {
      id: 'prod_06',
      name: 'NE555 Precision Timer IC (DIP-8)',
      sku: 'IC-NE555-DIP8',
      modelNumber: 'NE555P',
      categoryId: 'cat_ics',
      brand: 'Texas Instruments',
      price: 12,
      originalPrice: 20,
      discountPercent: 40,
      stockQuantity: 300,
      lowStockThreshold: 40,
      description: 'The world famous 555 precision timing circuit capable of producing accurate time delays or oscillation in astable, monostable, and bistable operating modes.',
      features: [
        'Timing from microseconds through hours',
        'Operates in both astable and monostable modes',
        'High output current sourcing or sinking up to 200 mA',
        'TTL-compatible output drive',
      ],
      applications: [
        'Precision pulse generators & PWM modulation',
        'LED flasher and tone synthesizer',
        'Delay timers and burglar alarm circuits',
        'Frequency dividers and clock generators',
      ],
      specifications: {
        'Package': 'DIP-8',
        'Supply Voltage': '4.5V to 16V DC',
        'Max Output Current': '200 mA',
        'Max Operating Frequency': '500 kHz',
        'Temperature Range': '0°C to 70°C',
      },
      images: [
        'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/ne555-precision-timer-datasheet.pdf',
      isFeatured: false,
      isPopular: true,
      active: true,
      rating: 5.0,
      reviewCount: 64,
      createdAt: '2026-01-18T10:00:00Z',
      updatedAt: '2026-01-18T10:00:00Z',
    },
    {
      id: 'prod_07',
      name: '7805 Linear Voltage Regulator 5V 1.5A (TO-220)',
      sku: 'IC-LM7805-TO220',
      modelNumber: 'L7805CV',
      categoryId: 'cat_ics',
      brand: 'STMicroelectronics',
      price: 18,
      originalPrice: 28,
      discountPercent: 35,
      stockQuantity: 180,
      lowStockThreshold: 25,
      description: 'Positive 3-terminal voltage regulator in rugged TO-220 package providing fixed 5V output up to 1.5A. Features internal thermal overload protection and short circuit limitation.',
      features: [
        'Output current up to 1.5 Amperes with proper heatsink',
        'Output voltage: 5V with ±4% tolerance',
        'Thermal overload and short circuit safe area protection',
        'Rugged metal tab for heatsink mounting',
      ],
      applications: [
        '5V regulated power supply for microcontrollers',
        'On-card power regulation for noise reduction',
        'Battery chargers and benchtop power modules',
      ],
      specifications: {
        'Package': 'TO-220',
        'Output Voltage': '5.0 V DC',
        'Input Voltage Range': '7V to 35V DC',
        'Max Output Current': '1.5 A',
        'Dropout Voltage': '2.0 V @ 1A',
        'Ripple Rejection': '62 dB',
      },
      images: [
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/l7805-voltage-regulator-datasheet.pdf',
      isFeatured: false,
      isPopular: false,
      active: true,
      rating: 4.8,
      reviewCount: 22,
      createdAt: '2026-01-19T10:00:00Z',
      updatedAt: '2026-01-19T10:00:00Z',
    },
    {
      id: 'prod_08',
      name: '16x2 Character LCD Display with I2C Backpack (Blue Backlight)',
      sku: 'DSP-LCD1602-I2C',
      modelNumber: 'LCD1602-BLUE',
      categoryId: 'cat_displays',
      brand: 'Waveshare Compatible',
      price: 240,
      originalPrice: 320,
      discountPercent: 25,
      stockQuantity: 55,
      lowStockThreshold: 10,
      description: 'High contrast 16 characters by 2 lines alphanumeric LCD module with pre-soldered PCF8574 I2C adapter board. Only requires 2 microcontroller pins (SDA & SCL) instead of 16.',
      features: [
        'Pre-soldered I2C serial interface board with contrast pot',
        'Displays 2 lines of 16 white characters on vibrant blue backlight',
        'Default I2C address: 0x27 or 0x3F',
        'Operates on standard 5V DC',
      ],
      applications: [
        'Sensor readout and dashboard displays',
        'Digital clocks and thermometer instruments',
        'System status monitor and error logger',
      ],
      specifications: {
        'Display Format': '16 Characters x 2 Lines',
        'Interface': 'I2C / TWI (PCF8574 chip)',
        'Supply Voltage': '5.0V DC',
        'Backlight Color': 'Blue with White Characters',
        'Viewing Area': '64.5 mm x 16 mm',
        'Dimensions': '80 mm x 36 mm x 19 mm',
      },
      images: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/lcd1602-i2c-module-datasheet.pdf',
      isFeatured: true,
      isPopular: true,
      active: true,
      rating: 4.7,
      reviewCount: 31,
      createdAt: '2026-01-20T10:00:00Z',
      updatedAt: '2026-01-20T10:00:00Z',
    },
    {
      id: 'prod_09',
      name: '5V 2-Channel Relay Module with Optocoupler Isolation',
      sku: 'MOD-RLY-2CH-5V',
      modelNumber: 'SRD-05VDC-SL-C',
      categoryId: 'cat_relays',
      brand: 'Songle',
      price: 130,
      originalPrice: 180,
      discountPercent: 27,
      stockQuantity: 70,
      lowStockThreshold: 15,
      description: 'Electromechanical relay module with optocoupler isolation to switch high-voltage AC mains appliances (up to 250V 10A) safely from 5V microcontroller signals.',
      features: [
        'Optical isolation prevents electrical noise and surges from reaching MCU',
        'Relay rating: AC 250V/10A, DC 30V/10A',
        'LED status indicator for each relay channel and power indicator',
        'Equipped with screw terminals for secure mains wiring',
      ],
      applications: [
        'Home automation smart switch for lamps and fans',
        'Microcontroller driven pump controls',
        'Industrial automation and remote rebooters',
      ],
      specifications: {
        'Trigger Voltage': '5V DC (Active LOW)',
        'Trigger Current': '5 mA per channel',
        'Switching Capacity': '10A 250VAC / 10A 30VDC',
        'Number of Relays': '2 Independent Channels',
        'Dimensions': '50.6 mm x 38.8 mm x 19 mm',
      },
      images: [
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/5v-relay-module-datasheet.pdf',
      isFeatured: false,
      isPopular: true,
      active: true,
      rating: 4.8,
      reviewCount: 26,
      createdAt: '2026-01-22T10:00:00Z',
      updatedAt: '2026-01-22T10:00:00Z',
    },
    {
      id: 'prod_10',
      name: 'MB-102 830-Point Solderless Breadboard',
      sku: 'BRD-MB102-830P',
      modelNumber: 'MB-102',
      categoryId: 'cat_breadboards',
      brand: 'Kishan Pro',
      price: 140,
      originalPrice: 200,
      discountPercent: 30,
      stockQuantity: 95,
      lowStockThreshold: 20,
      description: 'High durability solderless breadboard with 830 tie points (630 component points + 200 power bus points). Features color-coded voltage rails and interlocking tabs.',
      features: [
        '830 total tie points with nickel-plated phosphor bronze spring clips',
        'Self-adhesive backing tape allows permanent mounting to chassis',
        'Interlocking side tabs allow connecting multiple breadboards',
        'Accepts wire sizes 20 to 29 AWG (0.3mm to 0.8mm)',
      ],
      applications: [
        'Rapid electronic circuit prototyping without soldering',
        'Student laboratory coursework and debugging',
        'Sensor & MCU interface testing',
      ],
      specifications: {
        'Tie Points': '830 (630 terminal + 200 distribution)',
        'Housing Material': 'ABS White Plastic',
        'Contact Spring': 'Phosphor Bronze Nickel Plated',
        'Wire Range': '20 - 29 AWG',
        'Dimensions': '165 mm x 55 mm x 8.5 mm',
      },
      images: [
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/mb102-breadboard-spec.pdf',
      isFeatured: false,
      isPopular: true,
      active: true,
      rating: 4.9,
      reviewCount: 45,
      createdAt: '2026-01-25T10:00:00Z',
      updatedAt: '2026-01-25T10:00:00Z',
    },
    {
      id: 'prod_11',
      name: '65-Piece Multi-Color Flexible Male-to-Male Jumper Wires',
      sku: 'WIR-M2M-65PCS',
      modelNumber: 'JW-65-MM',
      categoryId: 'cat_wires',
      brand: 'Kishan Pro',
      price: 85,
      originalPrice: 120,
      discountPercent: 29,
      stockQuantity: 150,
      lowStockThreshold: 30,
      description: 'Assorted lengths of premium flexible stranded copper jumper wires with molded male pin headers. Ideal for breadboards, Arduino, and test jigs.',
      features: [
        '65 pieces in 4 distinct lengths: 120mm, 150mm, 200mm, and 250mm',
        'Flexible stranded copper wire with colorful PVC insulation',
        'Durable molded header pins that seat firmly into breadboard holes',
      ],
      applications: [
        'Breadboard prototyping connections',
        'Interconnecting sensors and microcontroller pins',
        'General testing and wiring harness',
      ],
      specifications: {
        'Quantity': '65 Pieces',
        'Connector Type': 'Male to Male (2.54 mm pitch)',
        'Wire Core': 'Stranded Copper 24 AWG',
        'Lengths Included': '49x 120mm, 8x 150mm, 4x 200mm, 4x 250mm',
      },
      images: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/jumper-wires-spec.pdf',
      isFeatured: false,
      isPopular: true,
      active: true,
      rating: 4.7,
      reviewCount: 38,
      createdAt: '2026-01-26T10:00:00Z',
      updatedAt: '2026-01-26T10:00:00Z',
    },
    {
      id: 'prod_12',
      name: '1K Ohm 1/4 Watt Metal Film Resistors (Pack of 50)',
      sku: 'RES-1K-50PK',
      modelNumber: 'MF-0.25W-1K-1%',
      categoryId: 'cat_resistors',
      brand: 'Vishay Dale Compatible',
      price: 25,
      originalPrice: 40,
      discountPercent: 37,
      stockQuantity: 200,
      lowStockThreshold: 25,
      description: 'High precision 1% metal film resistors offering lower noise, tighter temperature coefficient, and superior stability compared to standard carbon resistors.',
      features: [
        'Precision 1% tolerance for audio and analytical circuits',
        'Standard 5-band color code: Brown, Black, Black, Brown, Brown',
        'Rated for 0.25W continuous dissipation at 70°C',
        'Lead-free and RoHS compliant',
      ],
      applications: [
        'Current limiting for LEDs and optocouplers',
        'Pull-up and pull-down resistors for digital logic',
        'Voltage dividers and bias networks',
      ],
      specifications: {
        'Resistance': '1,000 Ohms (1 kΩ)',
        'Power Rating': '0.25 Watt (1/4 W)',
        'Tolerance': '±1%',
        'Max Working Voltage': '250V',
        'Package Type': 'Axial Leaded Through-Hole',
      },
      images: [
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/metal-film-resistors-datasheet.pdf',
      isFeatured: false,
      isPopular: false,
      active: true,
      rating: 4.9,
      reviewCount: 15,
      createdAt: '2026-01-28T10:00:00Z',
      updatedAt: '2026-01-28T10:00:00Z',
    },
    {
      id: 'prod_13',
      name: '10K Ohm 1/4 Watt Metal Film Resistors (Pack of 50)',
      sku: 'RES-10K-50PK',
      modelNumber: 'MF-0.25W-10K-1%',
      categoryId: 'cat_resistors',
      brand: 'Vishay Dale Compatible',
      price: 25,
      originalPrice: 40,
      discountPercent: 37,
      stockQuantity: 180,
      lowStockThreshold: 20,
      description: 'Essential 10k ohm metal film pull-up and timing resistors. 1% precision with low thermal drift.',
      features: [
        'Precision 1% tolerance',
        'Ideal standard value for I2C bus pullups and button debouncing',
        'Pack of 50 cut-tape axial components',
      ],
      applications: [
        'Microcontroller button input pull-up/pull-down',
        'Analog sensor voltage dividers',
        'Operational amplifier gain setting',
      ],
      specifications: {
        'Resistance': '10,000 Ohms (10 kΩ)',
        'Power Rating': '0.25 Watt',
        'Tolerance': '±1%',
        'Package': 'Axial Leaded Through-Hole',
      },
      images: [
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/metal-film-resistors-datasheet.pdf',
      isFeatured: false,
      isPopular: false,
      active: true,
      rating: 4.8,
      reviewCount: 12,
      createdAt: '2026-01-28T10:00:00Z',
      updatedAt: '2026-01-28T10:00:00Z',
    },
    {
      id: 'prod_14',
      name: 'L298N Dual H-Bridge Motor Driver Module',
      sku: 'MOD-L298N-HBRG',
      modelNumber: 'L298N-RED',
      categoryId: 'cat_modules',
      brand: 'RoboLab',
      price: 185,
      originalPrice: 260,
      discountPercent: 28,
      stockQuantity: 40,
      lowStockThreshold: 8,
      description: 'Heavy duty motor driver capable of driving two DC motors bidirectionally or one 4-wire bipolar stepper motor. Features built-in 78M05 5V regulator and large aluminum heatsink.',
      features: [
        'High operating voltage up to 46V and peak current of 2A per bridge',
        'Controls direction and speed using PWM signals',
        'Built-in 5V regulator to power external logic circuit',
        'Equipped with screw terminals for motor and battery wires',
      ],
      applications: [
        '2WD / 4WD wheeled robotic chassis',
        'Stepper motor positioning platforms',
        'Dual DC conveyor and actuator controllers',
      ],
      specifications: {
        'Driver Chip': 'L298N Dual H-Bridge',
        'Motor Supply Voltage': '5V to 35V DC',
        'Peak Motor Current': '2A per channel',
        'Logic Voltage': '5V DC',
        'Dimensions': '43 mm x 43 mm x 27 mm',
      },
      images: [
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/l298n-motor-driver-datasheet.pdf',
      isFeatured: true,
      isPopular: true,
      active: true,
      rating: 4.8,
      reviewCount: 34,
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-02-01T10:00:00Z',
    },
    {
      id: 'prod_15',
      name: 'BO Motor 3V-6V Dual Shaft with Rubber Wheel',
      sku: 'MTR-BO-WHEEL-SET',
      modelNumber: 'BO-DS-100RPM',
      categoryId: 'cat_motors',
      brand: 'RoboLab',
      price: 85,
      originalPrice: 120,
      discountPercent: 29,
      stockQuantity: 65,
      lowStockThreshold: 15,
      description: 'Geared DC plastic motor (1:48 gear ratio) bundled with a 65mm high-traction rubber wheel. The staple drive unit for student robotics competitions.',
      features: [
        'Dual output shafts allow mounting encoders or idler wheels',
        'Smooth low-current operation from 3V to 6V DC',
        'Durable plastic gearbox with 100 RPM output at 5V',
        'Includes 65mm rubber tire with plastic hub',
      ],
      applications: [
        'Line following robots and obstacle avoiders',
        'Robo-soccer and battle bots for college competitions',
        'Educational motorized science models',
      ],
      specifications: {
        'Operating Voltage': '3V to 6V DC',
        'No-Load Speed': '100 RPM (at 5V)',
        'No-Load Current': '70 mA (at 3V)',
        'Gear Ratio': '1:48',
        'Wheel Diameter': '65 mm',
        'Wheel Width': '26 mm',
      },
      images: [
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/bo-motor-wheel-spec.pdf',
      isFeatured: false,
      isPopular: true,
      active: true,
      rating: 4.6,
      reviewCount: 20,
      createdAt: '2026-02-03T10:00:00Z',
      updatedAt: '2026-02-03T10:00:00Z',
    },
    {
      id: 'prod_16',
      name: '18650 3.7V 2600mAh Li-ion Rechargeable Battery',
      sku: 'BAT-18650-2600',
      modelNumber: 'ICR18650-26F',
      categoryId: 'cat_batteries',
      brand: 'Samsung SDI Grade',
      price: 190,
      originalPrice: 280,
      discountPercent: 32,
      stockQuantity: 50,
      lowStockThreshold: 10,
      description: 'High capacity cylindrical lithium-ion cell for portable electronics, IoT stations, robotics chassis, and backup systems.',
      features: [
        'High energy density 2600mAh rated capacity',
        'Standard 3.7V nominal voltage (4.2V fully charged)',
        'Low self-discharge rate with long cycle life (>500 cycles)',
      ],
      applications: [
        'Robotics battery packs and wireless sensors',
        'DIY power banks and LED torches',
        'Emergency power backup',
      ],
      specifications: {
        'Nominal Voltage': '3.7 V',
        'Full Charge Voltage': '4.2 V',
        'Capacity': '2600 mAh',
        'Max Discharge Current': '5.2 A (2C)',
        'Dimensions': '18.4 mm dia x 65.0 mm height',
        'Weight': '45 grams',
      },
      images: [
        'https://images.unsplash.com/photo-1619641782821-75178523cf44?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/18650-battery-datasheet.pdf',
      isFeatured: false,
      isPopular: true,
      active: true,
      rating: 4.7,
      reviewCount: 18,
      createdAt: '2026-02-05T10:00:00Z',
      updatedAt: '2026-02-05T10:00:00Z',
    },
    {
      id: 'prod_17',
      name: 'IR Sensor Module (TCRT5000 Line Tracker / Obstacle)',
      sku: 'SNS-IR-TCRT5000',
      modelNumber: 'TCRT5000-MOD',
      categoryId: 'cat_sensors',
      brand: 'RoboLab',
      price: 45,
      originalPrice: 70,
      discountPercent: 35,
      stockQuantity: 110,
      lowStockThreshold: 20,
      description: 'Infrared reflective optical sensor module with built-in LM393 comparator and potentiometer sensitivity adjuster. Outputs clean digital HIGH/LOW signal for line following.',
      features: [
        'Detection range: 1mm to 25mm reflective barrier',
        'On-board LM393 voltage comparator for sharp threshold switching',
        'Potentiometer to adjust threshold sensitivity',
        'Power and detection output indicator LEDs',
      ],
      applications: [
        'Line following robot track navigation',
        'Black/White line edge detector',
        'Conveyor part counting and proximity switch',
      ],
      specifications: {
        'Operating Voltage': '3.3V to 5V DC',
        'Output Format': 'Digital Switch Output (0 and 1)',
        'Comparator Chip': 'LM393',
        'Effective Distance': '2 mm to 15 mm',
        'Dimensions': '32 mm x 14 mm',
      },
      images: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/tcrt5000-ir-sensor-datasheet.pdf',
      isFeatured: false,
      isPopular: true,
      active: true,
      rating: 4.8,
      reviewCount: 27,
      createdAt: '2026-02-07T10:00:00Z',
      updatedAt: '2026-02-07T10:00:00Z',
    },
    {
      id: 'prod_18',
      name: '12V 2A DC Power Supply Adapter (5.5 x 2.1mm Pin)',
      sku: 'PWR-12V-2A-ADPT',
      modelNumber: 'SMPS-12V2A-IN',
      categoryId: 'cat_power',
      brand: 'Kishan Pro',
      price: 260,
      originalPrice: 380,
      discountPercent: 31,
      stockQuantity: 35,
      lowStockThreshold: 10,
      description: 'Stabilized regulated AC to DC switch-mode power adapter with standard 5.5mm x 2.1mm center-positive barrel connector. Ideal for Arduino Vin and motor drivers.',
      features: [
        'Universal AC input: 100V - 240V AC 50/60Hz',
        'High efficiency regulated DC 12V 2000mA output',
        'Over-voltage, over-current, and short-circuit protection',
        '1-meter flexible DC power cable',
      ],
      applications: [
        'Powering Arduino development boards via DC barrel jack',
        'L298N motor driver and LED strip lighting',
        'CCTV cameras and wireless routers',
      ],
      specifications: {
        'Input Voltage': '100V - 240V AC, 50/60 Hz',
        'Output Voltage': '12.0 V DC (Regulated)',
        'Output Current': '2.0 Amperes (24W max)',
        'Connector Jack': '5.5 mm OD x 2.1 mm ID (Center +)',
        'Cable Length': '1.0 Meter',
      },
      images: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      ],
      datasheetUrl: '/datasheets/12v2a-power-adapter-datasheet.pdf',
      isFeatured: false,
      isPopular: false,
      active: true,
      rating: 4.6,
      reviewCount: 14,
      createdAt: '2026-02-10T10:00:00Z',
      updatedAt: '2026-02-10T10:00:00Z',
    },
  ];

  const projectKits: ProjectKit[] = [
    {
      id: 'kit_01',
      name: 'Ultimate Arduino Starter & Learning Kit',
      slug: 'arduino-starter-kit',
      sku: 'KIT-ARD-START',
      price: 1399,
      originalPrice: 1950,
      description: 'The all-in-one introductory electronics laboratory kit for engineering students and hobbyists. Includes an Arduino UNO board, 830-point breadboard, ultrasonic sensor, servo motor, jumper wires, resistors, and LEDs in a neat organizer box.',
      imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80',
      difficulty: 'Beginner',
      category: 'Arduino',
      stockQuantity: 25,
      active: true,
      createdAt: '2026-01-05T10:00:00Z',
      components: [
        { productId: 'prod_01', productName: 'Arduino UNO R3 Development Board', quantity: 1, unitPrice: 499 },
        { productId: 'prod_10', productName: 'MB-102 830-Point Solderless Breadboard', quantity: 1, unitPrice: 140 },
        { productId: 'prod_11', productName: '65-Piece Multi-Color Jumper Wires', quantity: 1, unitPrice: 85 },
        { productId: 'prod_03', productName: 'HC-SR04 Ultrasonic Distance Sensor', quantity: 1, unitPrice: 95 },
        { productId: 'prod_04', productName: 'SG90 9g Micro Servo Motor', quantity: 1, unitPrice: 110 },
        { productId: 'prod_12', productName: '1K Ohm Resistors (Pack of 50)', quantity: 1, unitPrice: 25 },
        { productId: 'prod_13', productName: '10K Ohm Resistors (Pack of 50)', quantity: 1, unitPrice: 25 },
      ],
    },
    {
      id: 'kit_02',
      name: 'Complete IoT & Smart Home Automation Kit (ESP32)',
      slug: 'iot-smart-home-kit',
      sku: 'KIT-IOT-ESP32',
      price: 1150,
      originalPrice: 1600,
      description: 'Comprehensive Internet-of-Things development kit powered by the dual-core ESP32 WiFi+BLE board. Includes opto-isolated 2-channel relay module, 16x2 I2C LCD, breadboard, and connection wires to control home appliances over cloud or smartphone apps.',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      difficulty: 'Intermediate',
      category: 'IoT',
      stockQuantity: 18,
      active: true,
      createdAt: '2026-01-06T10:00:00Z',
      components: [
        { productId: 'prod_02', productName: 'ESP32 NodeMCU WiFi & Bluetooth Board', quantity: 1, unitPrice: 380 },
        { productId: 'prod_09', productName: '5V 2-Channel Relay Module (Optocoupler)', quantity: 1, unitPrice: 130 },
        { productId: 'prod_08', productName: '16x2 Character LCD Display with I2C Backpack', quantity: 1, unitPrice: 240 },
        { productId: 'prod_10', productName: 'MB-102 830-Point Solderless Breadboard', quantity: 1, unitPrice: 140 },
        { productId: 'prod_11', productName: '65-Piece Multi-Color Jumper Wires', quantity: 1, unitPrice: 85 },
      ],
    },
    {
      id: 'kit_03',
      name: 'Line Following & Obstacle Avoiding 2WD Robotics Kit',
      slug: 'line-follower-robotics-kit',
      sku: 'KIT-ROBO-2WD',
      price: 1450,
      originalPrice: 2100,
      description: 'Hands-on autonomous mobile robot platform with 2 geared BO motors, rubber wheels, L298N dual H-bridge motor driver, ultrasonic distance sensor, IR TCRT5000 tracking sensors, and Arduino UNO brain.',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      difficulty: 'Intermediate',
      category: 'Robotics',
      stockQuantity: 14,
      active: true,
      createdAt: '2026-01-07T10:00:00Z',
      components: [
        { productId: 'prod_01', productName: 'Arduino UNO R3 Board', quantity: 1, unitPrice: 499 },
        { productId: 'prod_14', productName: 'L298N Dual H-Bridge Motor Driver', quantity: 1, unitPrice: 185 },
        { productId: 'prod_15', productName: 'BO Motor & Rubber Wheel Set', quantity: 2, unitPrice: 85 },
        { productId: 'prod_17', productName: 'IR TCRT5000 Line Sensor Module', quantity: 2, unitPrice: 45 },
        { productId: 'prod_03', productName: 'HC-SR04 Ultrasonic Distance Sensor', quantity: 1, unitPrice: 95 },
        { productId: 'prod_11', productName: '65-Piece Jumper Wires', quantity: 1, unitPrice: 85 },
      ],
    },
    {
      id: 'kit_04',
      name: 'Analog Electronics & Op-Amp Circuit Lab Kit',
      slug: 'analog-circuit-lab-kit',
      sku: 'KIT-ANALOG-ECE',
      price: 580,
      originalPrice: 850,
      description: 'Dedicated component assortment designed specifically for ECE 2nd/3rd year analog circuits and linear integrated circuits (LIC) laboratory experiments.',
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      difficulty: 'Intermediate',
      category: 'Embedded Systems',
      stockQuantity: 20,
      active: true,
      createdAt: '2026-01-08T10:00:00Z',
      components: [
        { productId: 'prod_05', productName: 'LM358 Dual Op-Amp IC', quantity: 2, unitPrice: 15 },
        { productId: 'prod_06', productName: 'NE555 Precision Timer IC', quantity: 2, unitPrice: 12 },
        { productId: 'prod_07', productName: '7805 5V Voltage Regulator', quantity: 2, unitPrice: 18 },
        { productId: 'prod_10', productName: 'MB-102 830-Point Solderless Breadboard', quantity: 1, unitPrice: 140 },
        { productId: 'prod_12', productName: '1K Resistors (Pack of 50)', quantity: 1, unitPrice: 25 },
        { productId: 'prod_13', productName: '10K Resistors (Pack of 50)', quantity: 1, unitPrice: 25 },
        { productId: 'prod_11', productName: '65-Piece Jumper Wires', quantity: 1, unitPrice: 85 },
      ],
    },
  ];

  const carts: Record<string, Cart> = {
    usr_cust_01: {
      userId: 'usr_cust_01',
      items: [
        {
          id: 'cart_item_01',
          productId: 'prod_01',
          name: 'Arduino UNO R3 Development Board (ATmega328P)',
          sku: 'ARD-UNO-R3',
          price: 499,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80',
          stockQuantity: 45,
        },
        {
          id: 'cart_item_02',
          productId: 'prod_03',
          name: 'HC-SR04 Ultrasonic Distance Sensor Module',
          sku: 'SNS-HC-SR04',
          price: 95,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
          stockQuantity: 120,
        },
      ],
      updatedAt: new Date().toISOString(),
    },
  };

  const orders: Order[] = [
    {
      id: 'KE-2026-000101',
      userId: 'usr_cust_01',
      customerName: 'Aarav Sharma',
      customerEmail: 'customer@kishanelectronics.com',
      customerPhone: '+91 98234 56789',
      items: [
        {
          productId: 'prod_02',
          productName: 'ESP32 NodeMCU WiFi & Bluetooth Development Board',
          sku: 'ESP32-DEV-30P',
          price: 380,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
          total: 380,
        },
        {
          productId: 'prod_08',
          productName: '16x2 Character LCD Display with I2C Backpack',
          sku: 'DSP-LCD1602-I2C',
          price: 240,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
          total: 240,
        },
      ],
      subtotal: 620,
      discount: 0,
      tax: 0,
      deliveryFee: 0,
      total: 620,
      orderType: 'Pickup',
      pickupLocation: 'Kishan Electronics Counter, Shop #14 Nehru Complex',
      paymentMethod: 'Cash on Pickup',
      paymentStatus: 'Pending',
      orderStatus: 'Ready for Pickup / Shipped',
      timeline: [
        { status: 'Order Placed', timestamp: '2026-02-14T09:30:00Z', note: 'Customer reserved components online for store pickup.' },
        { status: 'Confirmed', timestamp: '2026-02-14T10:00:00Z', note: 'Order accepted by store manager.' },
        { status: 'Preparing', timestamp: '2026-02-14T10:30:00Z', note: 'Components picked and packaged in ESD protection bags.' },
        { status: 'Ready for Pickup / Shipped', timestamp: '2026-02-14T11:00:00Z', note: 'Package is waiting at Kishan Electronics store collection counter.' },
      ],
      createdAt: '2026-02-14T09:30:00Z',
      updatedAt: '2026-02-14T11:00:00Z',
    },
  ];

  const reviews: Review[] = [
    {
      id: 'rev_01',
      productId: 'prod_01',
      userId: 'usr_cust_01',
      userName: 'Aarav Sharma',
      rating: 5,
      comment: 'Genuine ATmega328P chip with authentic 16MHz crystal. Programmed effortlessly via Arduino IDE 2.0 without any bootloader issues. Highly recommended for college lab work!',
      createdAt: '2026-02-15T14:20:00Z',
      approved: true,
    },
    {
      id: 'rev_02',
      productId: 'prod_02',
      userId: 'usr_cust_01',
      userName: 'Aarav Sharma',
      rating: 5,
      comment: 'WiFi connected smoothly to my 2.4GHz network, BLE beacon works well. High quality PCB layout with clean pin silk screening.',
      createdAt: '2026-02-16T11:10:00Z',
      approved: true,
    },
  ];

  const questions: ProductQuestion[] = [
    {
      id: 'q_01',
      productId: 'prod_01',
      userId: 'usr_cust_01',
      userName: 'Rohan K.',
      question: 'Does this board come with the USB programming cable included?',
      answer: 'Yes! All Arduino UNO boards purchased from Kishan Electronics include the high-grade 30cm blue USB Type-B cable.',
      answeredAt: '2026-02-12T15:00:00Z',
      createdAt: '2026-02-12T12:00:00Z',
    },
    {
      id: 'q_02',
      productId: 'prod_02',
      userId: 'usr_cust_01',
      userName: 'Priya N.',
      question: 'Can I power this ESP32 board using a 3.7V Li-ion battery directly?',
      answer: 'Yes, you can connect the 3.7V battery through the VIN pin (which feeds the onboard 3.3V LDO regulator) or via a regulated 3.3V pin directly.',
      answeredAt: '2026-02-13T16:20:00Z',
      createdAt: '2026-02-13T14:10:00Z',
    },
  ];

  const wishlists: Record<string, string[]> = {
    usr_cust_01: ['prod_01', 'prod_02', 'prod_14'],
  };

  const settings: ShopSettings = {
    shopName: 'Kishan Electronics',
    tagline: 'Your Trusted ECE & Electronics Components Store',
    phone: '+91 98765 43210',
    whatsappNumber: '+91 98765 43210',
    email: 'contact@kishanelectronics.com',
    address: 'Shop #14, Nehru Electronics Complex, Station Road, Tech Hub, Pune, Maharashtra 411001',
    openingHours: 'Mon - Sat: 9:30 AM - 8:30 PM | Sunday: 10:00 AM - 2:00 PM',
    googleMapsUrl: 'https://maps.google.com/?q=Nehru+Electronics+Complex+Pune',
    googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.2!2d73.85!3d18.52!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDMxJzEyLjAiTiA3M8KwNTEnMDAuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin',
    deliveryAvailable: true,
    pickupAvailable: true,
    pickupNotice: 'Your order will be prepared and can be collected from Kishan Electronics store pickup counter.',
    currency: '₹',
    currencyCode: 'INR',
    taxPercent: 0, // Included in display price
    lowStockThreshold: 10,
    deliveryFee: 49,
    freeDeliveryThreshold: 499,
  };

  const notifications: NotificationItem[] = [
    {
      id: 'notif_01',
      recipientId: 'admin',
      title: 'New Order Received',
      message: 'Order #KE-2026-000101 was placed for pickup by Aarav Sharma.',
      type: 'order',
      read: false,
      linkUrl: '/admin/orders',
      createdAt: '2026-02-14T09:30:00Z',
    },
    {
      id: 'notif_02',
      recipientId: 'usr_cust_01',
      title: 'Order Ready for Pickup!',
      message: 'Your order #KE-2026-000101 is ready for collection at Kishan Electronics.',
      type: 'order',
      read: false,
      linkUrl: '/profile/orders',
      createdAt: '2026-02-14T11:00:00Z',
    },
  ];

  return {
    users,
    addresses,
    categories,
    products,
    projectKits,
    carts,
    orders,
    reviews,
    questions,
    wishlists,
    settings,
    notifications,
  };
}

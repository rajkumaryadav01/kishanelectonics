import { Router, Request, Response } from 'express';
import { getDatabase, saveDatabase, CartItem } from '../db';
import { optionalAuth, AuthenticatedRequest } from '../auth';

const router = Router();

interface ProjectRecommendation {
  id: string;
  category: string;
  title: string;
  tagline: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedBuildTime: string;
  circuitOverview: string;
  requiredComponents: {
    productSku: string;
    productName: string;
    recommendedQty: number;
    purpose: string;
  }[];
}

const PROJECT_TEMPLATES: ProjectRecommendation[] = [
  {
    id: 'proj_line_follower',
    category: 'Robotics',
    title: 'Autonomous Line Following Robot',
    tagline: 'Classic dual-sensor infrared track tracing vehicle',
    description: 'Build a mobile autonomous robotic car that tracks black lines on a white arena surface using two TCRT5000 IR reflective sensors, an L298N motor driver, and an Arduino UNO micro-controller.',
    difficulty: 'Beginner',
    estimatedBuildTime: '3-4 Hours',
    circuitOverview: 'IR sensors connect to digital inputs D2 and D3. L298N driver inputs connect to PWM pins D5, D6, D9, D10 to regulate dual DC motor speeds.',
    requiredComponents: [
      { productSku: 'ARD-UNO-R3', productName: 'Arduino UNO R3 Development Board', recommendedQty: 1, purpose: 'Main robot brain & decision loop' },
      { productSku: 'SNS-IR-TCRT5000', productName: 'IR Sensor Module (TCRT5000)', recommendedQty: 2, purpose: 'Detects line edges by reflected IR light' },
      { productSku: 'MOD-L298N-HBRG', productName: 'L298N Dual H-Bridge Motor Driver', recommendedQty: 1, purpose: 'Powers and reverses the two DC motors' },
      { productSku: 'MTR-BO-WHEEL-SET', productName: 'BO Motor 3V-6V with Rubber Wheel', recommendedQty: 2, purpose: 'Left and right drive propulsion' },
      { productSku: 'BAT-18650-2600', productName: '18650 3.7V 2600mAh Li-ion Battery', recommendedQty: 2, purpose: '7.4V battery pack power source' },
      { productSku: 'WIR-M2M-65PCS', productName: '65-Piece Flexible Jumper Wires', recommendedQty: 1, purpose: 'Point-to-point breadboard wiring' },
    ],
  },
  {
    id: 'proj_obstacle_avoider',
    category: 'Robotics',
    title: 'Smart Ultrasonic Obstacle Avoiding Rover',
    tagline: 'Self-navigating obstacle detection rover with sweeping servo eye',
    description: 'An intelligent autonomous vehicle that scans the forward path with an ultrasonic sensor mounted on a 180-degree servo motor. When an obstruction is within 20cm, it stops, looks left and right, and turns toward the clearest path.',
    difficulty: 'Intermediate',
    estimatedBuildTime: '4-5 Hours',
    circuitOverview: 'Ultrasonic trigger and echo connected to pins D11 and D12. SG90 servo connected to pin D9 for panoramic distance scanning.',
    requiredComponents: [
      { productSku: 'ARD-UNO-R3', productName: 'Arduino UNO R3 Development Board', recommendedQty: 1, purpose: 'Robot control algorithm' },
      { productSku: 'SNS-HC-SR04', productName: 'HC-SR04 Ultrasonic Distance Sensor', recommendedQty: 1, purpose: 'Measures obstacle distance in real time' },
      { productSku: 'MTR-SG90-9G', productName: 'SG90 9g Micro Servo Motor', recommendedQty: 1, purpose: 'Rotates ultrasonic sensor left and right' },
      { productSku: 'MOD-L298N-HBRG', productName: 'L298N Dual H-Bridge Motor Driver', recommendedQty: 1, purpose: 'High current motor driver bridge' },
      { productSku: 'MTR-BO-WHEEL-SET', productName: 'BO Motor with Rubber Wheel', recommendedQty: 2, purpose: 'Chassis drive motors' },
      { productSku: 'BAT-18650-2600', productName: '18650 3.7V 2600mAh Li-ion Battery', recommendedQty: 2, purpose: 'High current battery pack' },
      { productSku: 'WIR-M2M-65PCS', productName: '65-Piece Flexible Jumper Wires', recommendedQty: 1, purpose: 'Interconnect wiring harness' },
    ],
  },
  {
    id: 'proj_iot_weather',
    category: 'IoT',
    title: 'ESP32 Cloud Weather & Environment Station',
    tagline: 'Wireless MQTT & HTTP telemetry station with live LCD dashboard',
    description: 'Continuously logs ambient environmental metrics, displays live readings on an I2C LCD screen, and publishes telemetry packets to cloud dashboard platforms (Blynk, Adafruit IO, ThingSpeak).',
    difficulty: 'Intermediate',
    estimatedBuildTime: '2-3 Hours',
    circuitOverview: 'ESP32 connects via I2C to 16x2 LCD on GPIO21 (SDA) and GPIO22 (SCL). Operates on 5V USB or battery with WiFi telemetry.',
    requiredComponents: [
      { productSku: 'ESP32-DEV-30P', productName: 'ESP32 NodeMCU WiFi & Bluetooth Board', recommendedQty: 1, purpose: 'Dual-core WiFi transceiver and data processing' },
      { productSku: 'DSP-LCD1602-I2C', productName: '16x2 Character LCD with I2C Backpack', recommendedQty: 1, purpose: 'Local live status and temperature display' },
      { productSku: 'BRD-MB102-830P', productName: 'MB-102 830-Point Solderless Breadboard', recommendedQty: 1, purpose: 'Clean modular breadboard layout' },
      { productSku: 'RES-10K-50PK', productName: '10K Ohm Resistors (Pack of 50)', recommendedQty: 1, purpose: 'Sensor pull-up bus stabilization' },
      { productSku: 'WIR-M2M-65PCS', productName: '65-Piece Flexible Jumper Wires', recommendedQty: 1, purpose: 'Jumper wiring between modules' },
    ],
  },
  {
    id: 'proj_smart_home',
    category: 'Home Automation',
    title: 'WiFi / Bluetooth Smart Home Relay Controller',
    tagline: 'Voice & smartphone controlled AC appliance switching system',
    description: 'Safely switch 230V AC lights, fans, and socket loads via local web server, Bluetooth BLE terminal, or home automation MQTT integration with optocoupler electrical isolation.',
    difficulty: 'Intermediate',
    estimatedBuildTime: '3 Hours',
    circuitOverview: 'ESP32 GPIO triggers opto-isolated relay coils. Built-in optocouplers protect the microcontroller from inductive flyback spikes.',
    requiredComponents: [
      { productSku: 'ESP32-DEV-30P', productName: 'ESP32 NodeMCU WiFi & Bluetooth Board', recommendedQty: 1, purpose: 'Web server & BLE controller' },
      { productSku: 'MOD-RLY-2CH-5V', productName: '5V 2-Channel Relay Module (Optocoupler)', recommendedQty: 1, purpose: 'Switches 230V mains appliances safely' },
      { productSku: 'PWR-12V-2A-ADPT', productName: '12V 2A DC Power Supply Adapter', recommendedQty: 1, purpose: 'Reliable 24/7 continuous DC wall power' },
      { productSku: 'BRD-MB102-830P', productName: 'MB-102 830-Point Solderless Breadboard', recommendedQty: 1, purpose: 'Low voltage signal circuit board' },
      { productSku: 'WIR-M2M-65PCS', productName: '65-Piece Flexible Jumper Wires', recommendedQty: 1, purpose: 'Relay trigger and ground jumpers' },
    ],
  },
  {
    id: 'proj_analog_synth',
    category: 'Embedded Systems',
    title: '555 & LM358 Precision Tone Generator & Timer',
    tagline: 'Fundamental ECE LIC lab experiment for frequency modulation',
    description: 'Design and test variable duty cycle pulse generators, audio frequency generators, and active op-amp filters. Essential hands-on project for mastering analog waveform generation.',
    difficulty: 'Beginner',
    estimatedBuildTime: '2 Hours',
    circuitOverview: 'NE555 configured in astable multivibrator mode feeding LM358 active low-pass audio filter buffer.',
    requiredComponents: [
      { productSku: 'IC-NE555-DIP8', productName: 'NE555 Precision Timer IC (DIP-8)', recommendedQty: 2, purpose: 'Square wave astable oscillator' },
      { productSku: 'IC-LM358-DIP8', productName: 'LM358 Dual Op-Amp IC (DIP-8)', recommendedQty: 2, purpose: 'Active filtering and signal buffer' },
      { productSku: 'IC-LM7805-TO220', productName: '7805 5V Voltage Regulator', recommendedQty: 1, purpose: 'Clean regulated DC voltage rail' },
      { productSku: 'RES-1K-50PK', productName: '1K Ohm Resistors (Pack of 50)', recommendedQty: 1, purpose: 'Timing and gain setting' },
      { productSku: 'RES-10K-50PK', productName: '10K Ohm Resistors (Pack of 50)', recommendedQty: 1, purpose: 'Feedback networks' },
      { productSku: 'BRD-MB102-830P', productName: 'MB-102 Solderless Breadboard', recommendedQty: 1, purpose: 'Circuit testing canvas' },
      { productSku: 'WIR-M2M-65PCS', productName: '65-Piece Flexible Jumper Wires', recommendedQty: 1, purpose: 'Interconnect wires' },
    ],
  },
];

// GET /api/build-my-project/projects
router.get('/projects', (req: Request, res: Response) => {
  const { category } = req.query;
  const db = getDatabase();

  let projects = PROJECT_TEMPLATES;
  if (category && category !== 'all') {
    projects = projects.filter(
      (p) => p.category.toLowerCase() === String(category).toLowerCase()
    );
  }

  // Enrich required components with current product details, prices, and stock
  const enrichedProjects = projects.map((proj) => {
    let totalEstimatedCost = 0;
    let allInStock = true;

    const enrichedComponents = proj.requiredComponents.map((comp) => {
      const prod = db.products.find((p) => p.sku === comp.productSku && p.active);
      const price = prod ? prod.price : 0;
      const stock = prod ? prod.stockQuantity : 0;
      const isAvailable = stock >= comp.recommendedQty;

      if (!isAvailable) allInStock = false;
      totalEstimatedCost += price * comp.recommendedQty;

      return {
        ...comp,
        productId: prod?.id,
        price,
        inStock: isAvailable,
        currentStock: stock,
        imageUrl: prod?.images[0] || '',
      };
    });

    return {
      ...proj,
      totalEstimatedCost,
      allInStock,
      components: enrichedComponents,
    };
  });

  res.json(enrichedProjects);
});

// POST /api/build-my-project/add-all
router.post('/add-all', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.body;
  const proj = PROJECT_TEMPLATES.find((p) => p.id === projectId);

  if (!proj) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  const db = getDatabase();
  const cartKey = req.user?.userId || (req.headers['x-guest-id'] as string ? `guest_${req.headers['x-guest-id']}` : 'guest_default');

  if (!db.carts[cartKey]) {
    db.carts[cartKey] = { userId: cartKey, items: [], updatedAt: new Date().toISOString() };
  }

  const cart = db.carts[cartKey];
  const addedProducts: string[] = [];
  const skippedProducts: string[] = [];

  for (const comp of proj.requiredComponents) {
    const product = db.products.find((p) => p.sku === comp.productSku && p.active);
    if (!product || product.stockQuantity < comp.recommendedQty) {
      skippedProducts.push(comp.productName);
      continue;
    }

    const existingIndex = cart.items.findIndex((i) => i.productId === product.id && !i.isKit);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += comp.recommendedQty;
    } else {
      cart.items.push({
        id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: comp.recommendedQty,
        image: product.images[0] || '',
        stockQuantity: product.stockQuantity,
      });
    }
    addedProducts.push(`${product.name} (x${comp.recommendedQty})`);
  }

  cart.updatedAt = new Date().toISOString();
  saveDatabase(db);

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  res.json({
    message: `Added ${addedProducts.length} components for "${proj.title}" to your cart!`,
    addedCount: addedProducts.length,
    addedProducts,
    skippedProducts,
    cartItemsCount: cart.items.length,
    subtotal,
  });
});

export default router;

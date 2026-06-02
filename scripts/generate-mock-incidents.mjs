/**
 * Generates lib/mock-data.ts with India-wide deforestation + heritage tree incidents.
 * Run: node scripts/generate-mock-incidents.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const REASONS = [
  "road_widening",
  "metro_rail",
  "power_infra",
  "real_estate",
  "mining",
  "urban_beautification",
  "disaster_clearance",
  "illegal",
];

const STATUSES = ["ongoing", "completed", "halted"];
const CLEARANCES = ["cleared", "no_clearance", "under_review"];
const SOURCES = ["news", "rti", "crowdsourced", "scraped"];

/** @type {Array<Record<string, unknown>>} */
const INCIDENTS = [
  // —— Existing headline cases (kept, refined) ——
  { location_name: "Aarey Milk Colony", state: "Maharashtra", district: "Mumbai Suburban", lat: 19.076, lng: 72.8777, tree_count: 2147, species: ["Teak", "Mango", "Banyan"], reason_category: "metro_rail", reason_detail: "Mass tree felling for Metro Line 3 depot in urban forest patch", project_name: "Mumbai Metro Line 3", authority: "MMRCL", clearance_status: "cleared", ngt_case: "NGT/2019/001234", verified: true, status: "halted", source_type: "news", daysAgo: 320 },
  { location_name: "Bannerghatta Road Corridor", state: "Karnataka", district: "Bengaluru Urban", lat: 12.9716, lng: 77.5946, tree_count: 890, species: ["Neem", "Peepal"], reason_category: "road_widening", reason_detail: "NH-48 widening through urban forest patches", project_name: "NH-48 Six-Laning Bengaluru", authority: "NHAI", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "rti", daysAgo: 250 },
  { location_name: "Central Ridge Forest", state: "Delhi", district: "New Delhi", lat: 28.6139, lng: 77.209, tree_count: 412, species: ["Keekar", "Babul"], reason_category: "urban_beautification", reason_detail: "Landscaping for Central Vista redevelopment", project_name: "Central Vista Avenue", authority: "CPWD", clearance_status: "no_clearance", ngt_case: "NGT/2021/000567", verified: true, status: "ongoing", source_type: "news", daysAgo: 400 },
  { location_name: "Kerwa Forest Range", state: "Madhya Pradesh", district: "Bhopal", lat: 23.2599, lng: 77.4126, tree_count: 1560, species: ["Sal", "Teak", "Bamboo"], reason_category: "real_estate", reason_detail: "Forest land diversion for smart city expansion", project_name: "Bhopal Smart City Phase II", authority: "BDA Bhopal", clearance_status: "under_review", verified: false, status: "ongoing", source_type: "crowdsourced", daysAgo: 180 },
  { location_name: "Godda District Mining Belt", state: "Jharkhand", district: "Godda", lat: 24.7136, lng: 84.9833, tree_count: 4800, species: ["Sal", "Mahua"], reason_category: "mining", reason_detail: "Forest clearance for thermal power plant coal mining", project_name: "Adani Godda Thermal Power Plant", authority: "Adani Power", clearance_status: "cleared", ngt_case: "NGT/2020/000891", verified: true, status: "ongoing", source_type: "news", daysAgo: 500 },
  { location_name: "Mollem National Park Buffer", state: "Goa", district: "North Goa", lat: 15.2993, lng: 74.124, tree_count: 58900, species: ["Teak", "Ironwood", "Xylopia"], reason_category: "power_infra", reason_detail: "Major Western Ghats forest diversion for transmission corridor", project_name: "Goa-Tamnar Transmission Line", authority: "POWERGRID", clearance_status: "cleared", ngt_case: "NGT/2020/000456", verified: true, status: "halted", source_type: "news", daysAgo: 1200 },
  { location_name: "KBR National Park Buffer", state: "Telangana", district: "Hyderabad", lat: 17.385, lng: 78.4867, tree_count: 156, species: ["Banyan", "Peepal"], reason_category: "metro_rail", reason_detail: "Metro corridor near KBR Park buffer zone", project_name: "Hyderabad Metro Rail Phase 2", authority: "HMRL", clearance_status: "under_review", ngt_case: "NGT/2022/000345", verified: true, status: "halted", source_type: "news", daysAgo: 280 },
  { location_name: "Kaziranga Fringe Villages", state: "Assam", district: "Golaghat", lat: 26.2006, lng: 92.9376, tree_count: 890, species: ["Simul", "Hollock"], reason_category: "illegal", reason_detail: "Unauthorized tree felling near national park buffer", project_name: "Unknown commercial logging", authority: "Unknown", clearance_status: "no_clearance", ngt_case: "NGT/2024/000201", verified: false, status: "ongoing", source_type: "crowdsourced", daysAgo: 90 },

  // —— Heritage & sentinel trees ——
  { heritage: true, location_name: "Pillar 41 Heritage Banyan (Chevron)", state: "Telangana", district: "Ranga Reddy", lat: 17.312, lng: 78.412, tree_count: 1, species: ["Heritage Banyan (400+ years)"], reason_category: "road_widening", reason_detail: "Centuries-old heritage banyan threatened for highway expansion; citizen monument tree", project_name: "NH-163 Widening", authority: "NHAI", clearance_status: "under_review", ngt_case: "NGT/2023/000412", verified: true, status: "halted", source_type: "news", daysAgo: 200 },
  { heritage: true, location_name: "Cubbon Park Heritage Avenue", state: "Karnataka", district: "Bengaluru Urban", lat: 12.976, lng: 77.592, tree_count: 47, species: ["Rain Tree", "Gulmohar", "Heritage avenue trees"], reason_category: "metro_rail", reason_detail: "Heritage avenue trees removed for underground metro alignment near park", project_name: "Bengaluru Metro Blue Line", authority: "BMRCL", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 150 },
  { heritage: true, location_name: "Akshayvat Sacred Fig (Prayagraj)", state: "Uttar Pradesh", district: "Prayagraj", lat: 25.435, lng: 81.883, tree_count: 1, species: ["Sacred Peepal (Akshayvat)"], reason_category: "urban_beautification", reason_detail: "Ancient sacred fig tree damaged during corridor landscaping works", project_name: "Kumbh Mela Infrastructure", authority: "UP Govt", clearance_status: "no_clearance", verified: true, status: "halted", source_type: "news", daysAgo: 800 },
  { heritage: true, location_name: "College Street Heritage Banyan", state: "West Bengal", district: "Kolkata", lat: 22.576, lng: 88.365, tree_count: 3, species: ["Heritage Banyan", "Peepal"], reason_category: "road_widening", reason_detail: "Colonial-era avenue trees felled for tram corridor upgrade", project_name: "Kolkata Tram Corridor", authority: "Kolkata Municipal Corporation", clearance_status: "under_review", verified: true, status: "ongoing", source_type: "rti", daysAgo: 120 },
  { heritage: true, location_name: "Dukh Bhanjani Beri (Golden Temple)", state: "Punjab", district: "Amritsar", lat: 31.62, lng: 74.876, tree_count: 1, species: ["Sacred Ber (heritage)"], reason_category: "disaster_clearance", reason_detail: "Historic ber tree pruned/removed citing safety during plaza redevelopment", project_name: "Heritage Streetscape Amritsar", authority: "SGPC / MC Amritsar", clearance_status: "under_review", verified: true, status: "halted", source_type: "news", daysAgo: 400 },
  { heritage: true, location_name: "Thimmamma Marrimanu Grove Vicinity", state: "Andhra Pradesh", district: "Anantapur", lat: 14.02, lng: 77.58, tree_count: 12, species: ["Banyan grove", "Neem"], reason_category: "road_widening", reason_detail: "Trees near world's largest banyan canopy cleared for highway realignment", project_name: "NH-40 Expansion", authority: "NHAI", clearance_status: "cleared", ngt_case: "NGT/2022/000178", verified: true, status: "ongoing", source_type: "news", daysAgo: 600 },
  { heritage: true, location_name: "Chamundi Hill Sacred Grove", state: "Karnataka", district: "Mysuru", lat: 12.272, lng: 76.682, tree_count: 28, species: ["Sacred fig", "Neem", "Sandalwood"], reason_category: "urban_beautification", reason_detail: "Heritage trees on pilgrimage hill slope cleared for viewing deck", project_name: "Chamundi Tourism Circuit", authority: "Karnataka Tourism", clearance_status: "no_clearance", verified: false, status: "ongoing", source_type: "crowdsourced", daysAgo: 220 },
  { heritage: true, location_name: "Srinagar Boulevard Chinar Row", state: "Jammu and Kashmir", district: "Srinagar", lat: 34.084, lng: 74.797, tree_count: 145, species: ["Heritage Chinar"], reason_category: "urban_beautification", reason_detail: "Historic Chinar trees removed or heavily pruned for smart city road widening", project_name: "Srinagar Smart City Roads", authority: "SMC Srinagar", clearance_status: "under_review", verified: false, status: "ongoing", source_type: "news", daysAgo: 300 },
  { heritage: true, location_name: "Empress Garden Heritage Teak", state: "Maharashtra", district: "Pune", lat: 18.5, lng: 73.895, tree_count: 19, species: ["Heritage Teak", "Rain Tree"], reason_category: "real_estate", reason_detail: "Colonial-era garden trees felled for adjacent commercial tower compound", project_name: "Camp Area Redevelopment", authority: "PMC Pune", clearance_status: "no_clearance", verified: true, status: "ongoing", source_type: "rti", daysAgo: 95 },
  { heritage: true, location_name: "Manek Chowk Heritage Peepal", state: "Gujarat", district: "Ahmedabad", lat: 23.022, lng: 72.587, tree_count: 2, species: ["Heritage Peepal"], reason_category: "urban_beautification", reason_detail: "Old city heritage peepal removed for pedestrian plaza stone paving", project_name: "Heritage City Square", authority: "AMC Ahmedabad", clearance_status: "cleared", verified: true, status: "completed", source_type: "news", daysAgo: 450 },
  { heritage: true, location_name: "IIT Madras Heritage Banyan Cluster", state: "Tamil Nadu", district: "Chennai", lat: 12.991, lng: 80.233, tree_count: 8, species: ["Heritage Banyan"], reason_category: "power_infra", reason_detail: "Campus heritage banyans cut for underground cable corridor", project_name: "Campus Power Upgrade", authority: "IIT Madras / TNEB", clearance_status: "under_review", verified: true, status: "halted", source_type: "crowdsourced", daysAgo: 180 },
  { heritage: true, location_name: "Gwalior Fort Sacred Peepal", state: "Madhya Pradesh", district: "Gwalior", lat: 26.23, lng: 78.182, tree_count: 1, species: ["Sacred Peepal (fort heritage)"], reason_category: "disaster_clearance", reason_detail: "Monument-zone heritage tree felled citing fort wall stabilization", project_name: "ASI Fort Conservation", authority: "ASI", clearance_status: "cleared", verified: true, status: "completed", source_type: "news", daysAgo: 700 },
  { heritage: true, location_name: "Lucknow Residency Heritage Gulmohar", state: "Uttar Pradesh", district: "Lucknow", lat: 26.85, lng: 80.946, tree_count: 14, species: ["Heritage Gulmohar", "Ashoka"], reason_category: "urban_beautification", reason_detail: "Colonial Residency heritage trees removed for LED streetscape", project_name: "Smart Lucknow Lighting", authority: "Lucknow Smart City", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "rti", daysAgo: 160 },
  { heritage: true, location_name: "Udaipur Lake Pichola Heritage Trees", state: "Rajasthan", district: "Udaipur", lat: 24.572, lng: 73.683, tree_count: 22, species: ["Heritage Peepal", "Khejri"], reason_category: "urban_beautification", reason_detail: "Lakeside heritage trees cleared for promenade and hotel setback", project_name: "Lakefront Beautification", authority: "UIT Udaipur", clearance_status: "no_clearance", verified: false, status: "ongoing", source_type: "crowdsourced", daysAgo: 130 },
  { heritage: true, location_name: "Dehradun Sal Heritage Corridor", state: "Uttarakhand", district: "Dehradun", lat: 30.316, lng: 78.032, tree_count: 67, species: ["Heritage Sal", "Deodar"], reason_category: "road_widening", reason_detail: "Pre-independence sal avenue trees felled for highway expansion", project_name: "Dehradun-Mussoorie Road", authority: "PWD Uttarakhand", clearance_status: "cleared", ngt_case: "NGT/2023/000567", verified: true, status: "ongoing", source_type: "news", daysAgo: 240 },
  { heritage: true, location_name: "Tirupati Temple Heritage Avenue", state: "Andhra Pradesh", district: "Tirupati", lat: 13.628, lng: 79.419, tree_count: 35, species: ["Neem", "Peepal (temple heritage)"], reason_category: "road_widening", reason_detail: "Pilgrimage route heritage trees removed for queue complex expansion", project_name: "Tirupati Queue Complex", authority: "TTD", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 350 },
  { heritage: true, location_name: "Shillong Ward's Lake Heritage Oaks", state: "Meghalaya", district: "East Khasi Hills", lat: 25.578, lng: 91.893, tree_count: 11, species: ["Heritage Oak", "Rhododendron"], reason_category: "urban_beautification", reason_detail: "Colonial-era lake fringe trees cut for concrete embankment", project_name: "Ward's Lake Revamp", authority: "Shillong Municipal Board", clearance_status: "under_review", verified: true, status: "halted", source_type: "news", daysAgo: 200 },
  { heritage: true, location_name: "Bhubaneswar Ekamra Heritage Grove", state: "Odisha", district: "Khordha", lat: 20.244, lng: 85.834, tree_count: 41, species: ["Sacred fig", "Banyan (Ekamra heritage)"], reason_category: "metro_rail", reason_detail: "Heritage grove trees cleared for metro depot near temple precinct", project_name: "Bhubaneswar Metro", authority: "Odisha Metro", clearance_status: "under_review", ngt_case: "NGT/2024/000334", verified: true, status: "ongoing", source_type: "news", daysAgo: 110 },
  { heritage: true, location_name: "Nagpur Zero Mile Heritage Banyan", state: "Maharashtra", district: "Nagpur", lat: 21.146, lng: 79.088, tree_count: 1, species: ["Heritage Banyan (city marker)"], reason_category: "metro_rail", reason_detail: "City-centre heritage banyan transplanted/felled for metro station box", project_name: "Nagpur Metro", authority: "Maha Metro", clearance_status: "cleared", verified: true, status: "completed", source_type: "news", daysAgo: 900 },
  { heritage: true, location_name: "Kochi Marine Drive Heritage Rain Trees", state: "Kerala", district: "Ernakulam", lat: 9.931, lng: 76.267, tree_count: 24, species: ["Heritage Rain Tree"], reason_category: "road_widening", reason_detail: "Waterfront heritage rain trees removed for promenade widening", project_name: "Marine Drive Upgrade", authority: "Kochi Corporation", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "rti", daysAgo: 140 },

  // —— State coverage: deforestation & infrastructure ——
  { location_name: "Nahargarh Hills", state: "Rajasthan", district: "Jaipur", lat: 26.9124, lng: 75.7873, tree_count: 234, species: ["Khejri", "Neem"], reason_category: "road_widening", project_name: "Jaipur Ring Road Phase 3", authority: "PWD Rajasthan", clearance_status: "cleared", verified: false, status: "completed", source_type: "scraped", daysAgo: 600 },
  { location_name: "Coimbatore Western Ghats Foothills", state: "Tamil Nadu", district: "Coimbatore", lat: 11.0168, lng: 76.9558, tree_count: 678, species: ["Rosewood", "Teak"], reason_category: "power_infra", project_name: "TN Power Grid Upgrade", authority: "TANGEDCO", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "rti", daysAgo: 290 },
  { location_name: "East Kolkata Wetlands Fringe", state: "West Bengal", district: "Kolkata", lat: 22.5726, lng: 88.3639, tree_count: 320, species: ["Mangrove", "Sundari"], reason_category: "real_estate", project_name: "New Town IT Hub Extension", authority: "WBHIDCO", clearance_status: "no_clearance", ngt_case: "NGT/2023/000112", verified: false, status: "ongoing", source_type: "crowdsourced", daysAgo: 170 },
  { location_name: "Sukhna Lake Catchment", state: "Chandigarh", district: "Chandigarh", lat: 30.7333, lng: 76.7794, tree_count: 89, species: ["Eucalyptus", "Shisham"], reason_category: "urban_beautification", project_name: "Sukhna Lake Revitalization", authority: "Chandigarh Administration", clearance_status: "cleared", verified: true, status: "completed", source_type: "news", daysAgo: 450 },
  { location_name: "Lucknow-Kanpur Expressway Stretch", state: "Uttar Pradesh", district: "Lucknow", lat: 26.8467, lng: 80.9462, tree_count: 1240, species: ["Neem", "Peepal"], reason_category: "road_widening", project_name: "Lucknow-Kanpur Expressway", authority: "NHAI", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "rti", daysAgo: 210 },
  { location_name: "Surat Dumas Road", state: "Gujarat", district: "Surat", lat: 21.1702, lng: 72.8311, tree_count: 445, species: ["Mango", "Gulmohar"], reason_category: "road_widening", project_name: "Surat Coastal Road", authority: "Surat Municipal Corporation", clearance_status: "cleared", verified: false, status: "ongoing", source_type: "scraped", daysAgo: 270 },
  { location_name: "Patna Ganga Embankment", state: "Bihar", district: "Patna", lat: 25.5941, lng: 85.1376, tree_count: 178, species: ["Banyan", "Peepal"], reason_category: "disaster_clearance", project_name: "Ganga Embankment Reinforcement", authority: "Water Resources Dept Bihar", clearance_status: "cleared", verified: true, status: "completed", source_type: "news", daysAgo: 480 },
  { location_name: "Shimla Ridge Forest", state: "Himachal Pradesh", district: "Shimla", lat: 31.1048, lng: 77.1734, tree_count: 567, species: ["Deodar", "Oak"], reason_category: "road_widening", project_name: "Shimla Bypass Road", authority: "PWD Himachal", clearance_status: "under_review", ngt_case: "NGT/2024/000078", verified: false, status: "ongoing", source_type: "crowdsourced", daysAgo: 80 },
  { location_name: "Kochi Metro Extension", state: "Kerala", district: "Ernakulam", lat: 9.9312, lng: 76.2673, tree_count: 312, species: ["Coconut", "Jackfruit"], reason_category: "metro_rail", project_name: "Kochi Metro Phase II", authority: "KMRL", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 200 },
  { location_name: "Agra Yamuna Expressway Greenbelt", state: "Uttar Pradesh", district: "Agra", lat: 27.1767, lng: 78.0081, tree_count: 2100, species: ["Neem", "Keekar"], reason_category: "road_widening", project_name: "Yamuna Expressway Phase 2", authority: "YEIDA", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "rti", daysAgo: 550 },
  { location_name: "Pune-Mumbai Expressway Hill Section", state: "Maharashtra", district: "Pune", lat: 18.5204, lng: 73.8567, tree_count: 734, species: ["Teak", "Bamboo"], reason_category: "road_widening", project_name: "Mumbai-Pune Expressway Widening", authority: "MSRDC", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 380 },
  { location_name: "Chennai IT Corridor (OMR)", state: "Tamil Nadu", district: "Chennai", lat: 13.0827, lng: 80.2707, tree_count: 98, species: ["Rain Tree", "Gulmohar"], reason_category: "real_estate", project_name: "OMR IT Park Phase 4", authority: "CMDA", clearance_status: "no_clearance", verified: false, status: "ongoing", source_type: "scraped", daysAgo: 60 },
  { location_name: "Ranchi HEC Sector", state: "Jharkhand", district: "Ranchi", lat: 23.3441, lng: 85.3096, tree_count: 56, species: ["Sal", "Mahua"], reason_category: "illegal", project_name: "HEC Colony Expansion", authority: "Private developers", clearance_status: "no_clearance", verified: false, status: "ongoing", source_type: "crowdsourced", daysAgo: 100 },
  { location_name: "Varanasi Kashi Corridor", state: "Uttar Pradesh", district: "Varanasi", lat: 25.3176, lng: 82.9739, tree_count: 67, species: ["Peepal", "Banyan"], reason_category: "disaster_clearance", project_name: "Kashi Vishwanath Corridor", authority: "UP Govt", clearance_status: "cleared", verified: true, status: "completed", source_type: "news", daysAgo: 900 },
  { location_name: "Puducherry Coastal Road", state: "Puducherry", district: "Puducherry", lat: 11.9416, lng: 79.8083, tree_count: 34, species: ["Casuarina", "Coconut"], reason_category: "road_widening", project_name: "Puducherry Coastal Road", authority: "PWD Puducherry", clearance_status: "cleared", verified: false, status: "ongoing", source_type: "scraped", daysAgo: 320 },
  { location_name: "Gangtok NH-10 Corridor", state: "Sikkim", district: "East Sikkim", lat: 27.3389, lng: 88.6065, tree_count: 423, species: ["Rhododendron", "Oak"], reason_category: "road_widening", project_name: "NH-10 Gangtok Section", authority: "NHIDCL", clearance_status: "under_review", ngt_case: "NGT/2023/000890", verified: true, status: "ongoing", source_type: "rti", daysAgo: 190 },

  // —— Additional all-India coverage ——
  { location_name: "Araku Valley Coffee Forest", state: "Andhra Pradesh", district: "Alluri Sitharama Raju", lat: 18.327, lng: 82.877, tree_count: 1200, species: ["Coffee shade trees", "Teak"], reason_category: "mining", reason_detail: "Forest patches cleared for bauxite corridor access roads", project_name: "Araku Mining Access Roads", authority: "AP Mineral Development", clearance_status: "under_review", verified: false, status: "ongoing", source_type: "news", daysAgo: 140 },
  { location_name: "Vizag Steel Plant Greenbelt", state: "Andhra Pradesh", district: "Visakhapatnam", lat: 17.686, lng: 83.218, tree_count: 340, species: ["Casuarina", "Eucalyptus"], reason_category: "industrial_expansion", reason_category_override: "real_estate", project_name: "Vizag Industrial Corridor", authority: "RINL", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "rti", daysAgo: 220 },
  { location_name: "Itanagar Papum Reserve Fringe", state: "Arunachal Pradesh", district: "Papum Pare", lat: 27.084, lng: 93.605, tree_count: 2100, species: ["Hollock", "Bamboo"], reason_category: "road_widening", project_name: "Itanagar Highway", authority: "MoRTH", clearance_status: "cleared", verified: false, status: "ongoing", source_type: "news", daysAgo: 300 },
  { location_name: "Dibang Valley Hydel Site", state: "Arunachal Pradesh", district: "Dibang Valley", lat: 28.125, lng: 95.768, tree_count: 270000, species: ["Subtropical evergreen"], reason_category: "power_infra", project_detail: "Mass forest submergence for hydropower reservoir", project_name: "Etalin Hydroelectric Project", authority: "NHPC / JV", clearance_status: "under_review", ngt_case: "NGT/2020/000778", verified: true, status: "halted", source_type: "news", daysAgo: 800 },
  { location_name: "Hasdeo Arand Coal Blocks", state: "Chhattisgarh", district: "Surguja", lat: 23.12, lng: 82.95, tree_count: 250000, species: ["Sal", "Teak", "Mahua"], reason_category: "mining", reason_detail: "Dense forest diversion for coal mining in Hasdeo Arand", project_name: "Parsa East & Kete Basan Coal", authority: "Coal India / Adani", clearance_status: "cleared", ngt_case: "NGT/2024/000445", verified: true, status: "ongoing", source_type: "news", daysAgo: 120 },
  { location_name: "Bastar Iron Ore Corridor", state: "Chhattisgarh", district: "Bastar", lat: 19.1, lng: 81.95, tree_count: 8900, species: ["Sal", "Bamboo"], reason_category: "mining", project_name: "Bailadila Iron Ore Expansion", authority: "NMDC", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "rti", daysAgo: 400 },
  { location_name: "Gurugram Aravalli Foothills", state: "Haryana", district: "Gurugram", lat: 28.408, lng: 77.086, tree_count: 412, species: ["Dhau", "Khejri"], reason_category: "real_estate", project_name: "Dwarka Expressway", authority: "NHAI", clearance_status: "no_clearance", ngt_case: "NGT/2023/000289", verified: true, status: "halted", source_type: "news", daysAgo: 180 },
  { location_name: "Kalesar National Park Buffer", state: "Haryana", district: "Yamunanagar", lat: 30.45, lng: 77.62, tree_count: 156, species: ["Sal", "Shisham"], reason_category: "illegal", project_name: "Unauthorized quarry access", authority: "Unknown", clearance_status: "no_clearance", verified: false, status: "ongoing", source_type: "crowdsourced", daysAgo: 45 },
  { location_name: "Imphal Loktak Wetland Fringe", state: "Manipur", district: "Bishnupur", lat: 24.56, lng: 93.77, tree_count: 230, species: ["Phumdi vegetation", "Willow"], reason_category: "power_infra", project_name: "Loktak Downstream Project", authority: "NHPC", clearance_status: "under_review", verified: true, status: "ongoing", source_type: "news", daysAgo: 250 },
  { location_name: "Churachandpur Hill Forest", state: "Manipur", district: "Churachandpur", lat: 24.33, lng: 93.68, tree_count: 890, species: ["Oak", "Pine"], reason_category: "illegal", project_name: "Hill road expansion logging", authority: "Local contractors", clearance_status: "no_clearance", verified: false, status: "ongoing", source_type: "crowdsourced", daysAgo: 70 },
  { location_name: "Garo Hills Coal Belt", state: "Meghalaya", district: "West Garo Hills", lat: 25.52, lng: 90.22, tree_count: 3400, species: ["Subtropical broadleaf"], reason_category: "mining", project_name: "Rat-hole mining expansion", authority: "Private miners", clearance_status: "no_clearance", verified: false, status: "ongoing", source_type: "news", daysAgo: 500 },
  { location_name: "Mawphlang Sacred Grove Vicinity", state: "Meghalaya", district: "East Khasi Hills", lat: 25.45, lng: 91.78, tree_count: 18, species: ["Sacred grove trees"], reason_category: "road_widening", reason_detail: "Trees adjacent to UNESCO-nominated sacred grove cleared for road", project_name: "Shillong-Dawki Road", authority: "PWD Meghalaya", clearance_status: "under_review", heritage: true, verified: true, status: "halted", source_type: "news", daysAgo: 160 },
  { location_name: "Dampa Tiger Reserve Fringe", state: "Mizoram", district: "Mamit", lat: 23.55, lng: 92.35, tree_count: 670, species: ["Tropical evergreen"], reason_category: "illegal", project_name: "Jhum expansion logging", authority: "Unknown", clearance_status: "no_clearance", verified: false, status: "ongoing", source_type: "crowdsourced", daysAgo: 90 },
  { location_name: "Kohima Dzukou Foothills", state: "Nagaland", district: "Kohima", lat: 25.55, lng: 94.12, tree_count: 445, species: ["Rhododendron", "Oak"], reason_category: "road_widening", project_name: "Kohima-Dzukou Tourism Road", authority: "PWD Nagaland", clearance_status: "cleared", verified: false, status: "ongoing", source_type: "scraped", daysAgo: 200 },
  { location_name: "Simlipal Biosphere Fringe", state: "Odisha", district: "Mayurbhanj", lat: 21.72, lng: 86.42, tree_count: 1560, species: ["Sal", "Mahua"], reason_category: "mining", project_name: "Iron ore corridor", authority: "Odisha Mining", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 350 },
  { location_name: "Puri Konark Coastal Forest", state: "Odisha", district: "Puri", lat: 19.82, lng: 86.1, tree_count: 89, species: ["Casuarina", "Coconut"], reason_category: "road_widening", project_name: "Puri-Konark Marine Drive", authority: "Odisha PWD", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "rti", daysAgo: 130 },
  { location_name: "Ludhiana Bypass Greenbelt", state: "Punjab", district: "Ludhiana", lat: 30.9, lng: 75.85, tree_count: 520, species: ["Eucalyptus", "Poplar"], reason_category: "road_widening", project_name: "Ludhiana Ring Road", authority: "NHAI", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 280 },
  { location_name: "Ropar Wetland Fringe", state: "Punjab", district: "Rupnagar", lat: 31.02, lng: 76.52, tree_count: 78, species: ["Shisham", "Kikar"], reason_category: "urban_beautification", project_name: "Sutlej embankment works", authority: "Punjab WRD", clearance_status: "under_review", verified: false, status: "ongoing", source_type: "crowdsourced", daysAgo: 110 },
  { location_name: "Agartala Sepahijala Fringe", state: "Tripura", district: "Sepahijala", lat: 23.68, lng: 91.32, tree_count: 340, species: ["Sal", "Bamboo"], reason_category: "road_widening", project_name: "Agartala Bypass", authority: "MoRTH", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 190 },
  { location_name: "Jim Corbett Buffer Zone", state: "Uttarakhand", district: "Nainital", lat: 29.53, lng: 78.77, tree_count: 234, species: ["Sal", "Sheesham"], reason_category: "real_estate", project_name: "Resort corridor expansion", authority: "Private developers", clearance_status: "no_clearance", ngt_case: "NGT/2024/000112", verified: true, status: "halted", source_type: "news", daysAgo: 75 },
  { location_name: "Tehri Dam Catchment", state: "Uttarakhand", district: "Tehri Garhwal", lat: 30.38, lng: 78.48, tree_count: 12000, species: ["Deodar", "Oak"], reason_category: "power_infra", project_name: "Tehri Pumped Storage", authority: "THDC", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "rti", daysAgo: 600 },
  { location_name: "Sundarbans Mangrove Fringe", state: "West Bengal", district: "South 24 Parganas", lat: 21.95, lng: 88.9, tree_count: 4500, species: ["Sundari", "Gewa"], reason_category: "disaster_clearance", project_name: "Embankment reinforcement", authority: "Irrigation Dept WB", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 220 },
  { location_name: "Darjeeling Tea Estate Forest", state: "West Bengal", district: "Darjeeling", lat: 27.04, lng: 88.26, tree_count: 167, species: ["Oak", "Rhododendron"], reason_category: "road_widening", project_name: "Hill cart road widening", authority: "PWD WB", clearance_status: "cleared", verified: false, status: "ongoing", source_type: "scraped", daysAgo: 300 },
  { location_name: "Port Blair Mangrove Belt", state: "Andaman and Nicobar Islands", district: "South Andaman", lat: 11.62, lng: 92.72, tree_count: 890, species: ["Mangrove", "Beach almond"], reason_category: "real_estate", project_name: "Coastal tourism infrastructure", authority: "ANI Administration", clearance_status: "under_review", verified: false, status: "ongoing", source_type: "news", daysAgo: 180 },
  { location_name: "Silvassa Industrial Estate", state: "Dadra and Nagar Haveli and Daman and Diu", district: "Dadra and Nagar Haveli", lat: 20.27, lng: 73.02, tree_count: 234, species: ["Teak", "Bamboo"], reason_category: "real_estate", project_name: "Industrial plot expansion", authority: "UT Administration", clearance_status: "cleared", verified: false, status: "ongoing", source_type: "scraped", daysAgo: 400 },
  { location_name: "Leh Indus Valley Plantation", state: "Ladakh", district: "Leh", lat: 34.15, lng: 77.58, tree_count: 45, species: ["Poplar", "Willow"], reason_category: "urban_beautification", project_name: "Leh smart city landscaping", authority: "LAHDC Leh", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 150 },
  { location_name: "Kargil Drass Road Corridor", state: "Ladakh", district: "Kargil", lat: 34.55, lng: 76.12, tree_count: 12, species: ["Willow", "Poplar"], reason_category: "road_widening", project_name: "Zoji La tunnel approach", authority: "NHIDCL", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "rti", daysAgo: 320 },
  { location_name: "Kavaratti Coconut Grove", state: "Lakshadweep", district: "Lakshadweep", lat: 10.57, lng: 72.64, tree_count: 28, species: ["Coconut", "Pandanus"], reason_category: "urban_beautification", project_name: "Island airport approach beautification", authority: "Lakshadweep Admin", clearance_status: "cleared", verified: false, status: "completed", source_type: "news", daysAgo: 500 },
  { location_name: "Narmada Riverbank Satpura", state: "Madhya Pradesh", district: "Hoshangabad", lat: 22.75, lng: 77.72, tree_count: 3400, species: ["Teak", "Sal"], reason_category: "power_infra", project_name: "Narmada hydel cascade", authority: "MPPGCL", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "rti", daysAgo: 450 },
  { location_name: "Kanha-Pench Corridor", state: "Madhya Pradesh", district: "Mandla", lat: 22.2, lng: 80.6, tree_count: 780, species: ["Sal", "Bamboo"], reason_category: "road_widening", project_name: "Tiger corridor highway", authority: "NHAI", clearance_status: "under_review", ngt_case: "NGT/2023/000901", verified: true, status: "halted", source_type: "news", daysAgo: 200 },
  { location_name: "Indore Bypass Aravalli Patch", state: "Madhya Pradesh", district: "Indore", lat: 22.72, lng: 75.86, tree_count: 445, species: ["Bamboo", "Teak"], reason_category: "road_widening", project_name: "Indore Ring Road", authority: "NHAI", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 160 },
  { location_name: "Navi Mumbai Airport Influence Zone", state: "Maharashtra", district: "Raigad", lat: 18.98, lng: 73.12, tree_count: 12000, species: ["Mangrove", "Casuarina"], reason_category: "real_estate", project_name: "Navi Mumbai International Airport", authority: "CIDCO", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 400 },
  { location_name: "Tadoba Buffer Zone", state: "Maharashtra", district: "Chandrapur", lat: 20.25, lng: 79.35, tree_count: 567, species: ["Teak", "Bamboo"], reason_category: "mining", project_name: "Coal washery expansion", authority: "Western Coalfields", clearance_status: "under_review", verified: true, status: "ongoing", source_type: "rti", daysAgo: 130 },
  { location_name: "Jodhpur Aravalli Foothills", state: "Rajasthan", district: "Jodhpur", lat: 26.24, lng: 73.02, tree_count: 89, species: ["Khejri", "Rohida"], reason_category: "mining", project_name: "Sandstone quarry expansion", authority: "Private leaseholders", clearance_status: "no_clearance", verified: false, status: "ongoing", source_type: "crowdsourced", daysAgo: 55 },
  { location_name: "Ranthambore Corridor", state: "Rajasthan", district: "Sawai Madhopur", lat: 26.02, lng: 76.39, tree_count: 234, species: ["Dhok", "Babul"], reason_category: "road_widening", project_name: "Tourism highway", authority: "PWD Rajasthan", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 240 },
  { location_name: "Hyderabad ORR Phase 2", state: "Telangana", district: "Ranga Reddy", lat: 17.35, lng: 78.55, tree_count: 1890, species: ["Neem", "Banyan"], reason_category: "road_widening", project_name: "Outer Ring Road Expansion", authority: "HMDA", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 170 },
  { location_name: "Warangal Forest Fringe", state: "Telangana", district: "Warangal", lat: 17.97, lng: 79.6, tree_count: 456, species: ["Teak", "Bamboo"], reason_category: "illegal", project_name: "Unauthorized timber trade", authority: "Unknown", clearance_status: "no_clearance", verified: false, status: "ongoing", source_type: "crowdsourced", daysAgo: 40 },
  { location_name: "Munnar Cardamom Hills", state: "Kerala", district: "Idukki", lat: 10.09, lng: 77.06, tree_count: 890, species: ["Shola", "Eucalyptus"], reason_category: "power_infra", project_name: "High-voltage line through shola", authority: "KSEB", clearance_status: "under_review", verified: true, status: "ongoing", source_type: "news", daysAgo: 210 },
  { location_name: "Silent Valley Buffer", state: "Kerala", district: "Palakkad", lat: 11.08, lng: 76.45, tree_count: 120, species: ["Evergreen shola"], reason_category: "illegal", project_name: "Encroachment clearing", authority: "Forest Dept Kerala", clearance_status: "no_clearance", verified: true, status: "halted", source_type: "news", daysAgo: 90 },
  { location_name: "Jammu Pine Forest Belt", state: "Jammu and Kashmir", district: "Jammu", lat: 32.73, lng: 74.87, tree_count: 678, species: ["Chir Pine"], reason_category: "road_widening", project_name: "Jammu-Udhampur Highway", authority: "NHAI", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "rti", daysAgo: 280 },
  { location_name: "Dhanbad Coal Belt", state: "Jharkhand", district: "Dhanbad", lat: 23.8, lng: 86.43, tree_count: 8900, species: ["Sal", "Mahua"], reason_category: "mining", project_name: "BCCL expansion", authority: "BCCL", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 500 },
  { location_name: "Palamu Tiger Reserve Fringe", state: "Jharkhand", district: "Palamu", lat: 23.85, lng: 84.1, tree_count: 445, species: ["Sal", "Bamboo"], reason_category: "mining", project_name: "Limestone mining lease", authority: "Private lease", clearance_status: "under_review", verified: false, status: "ongoing", source_type: "crowdsourced", daysAgo: 85 },
  { location_name: "Guwahati Deepor Beel Fringe", state: "Assam", district: "Kamrup Metro", lat: 26.08, lng: 91.68, tree_count: 234, species: ["Wetland trees", "Bamboo"], reason_category: "real_estate", project_name: "Guwahati smart city fill", authority: "GMDA", clearance_status: "no_clearance", ngt_case: "NGT/2023/000156", verified: true, status: "halted", source_type: "news", daysAgo: 150 },
  { location_name: "Majuli River Island", state: "Assam", district: "Majuli", lat: 26.95, lng: 94.17, tree_count: 156, species: ["Neem", "Bamboo"], reason_category: "disaster_clearance", project_name: "Erosion control embankment", authority: "Water Resources Assam", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 320 },
  { location_name: "Girnar Forest Foothills", state: "Gujarat", district: "Junagadh", lat: 21.52, lng: 70.52, tree_count: 178, species: ["Babul", "Neem"], reason_category: "road_widening", project_name: "Girnar ropeway approach", authority: "Tourism Dept Gujarat", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 200 },
  { location_name: "Kutch Banni Grassland Fringe", state: "Gujarat", district: "Kutch", lat: 23.85, lng: 70.2, tree_count: 67, species: ["Acacia", "Prosopis"], reason_category: "power_infra", project_name: "Renewable energy park", authority: "GUVNL", clearance_status: "under_review", verified: false, status: "ongoing", source_type: "rti", daysAgo: 110 },
  { location_name: "Muzaffarpur Orchard Belt", state: "Bihar", district: "Muzaffarpur", lat: 26.12, lng: 85.38, tree_count: 890, species: ["Litchi", "Mango"], reason_category: "road_widening", project_name: "NH-28 Expansion", authority: "NHAI", clearance_status: "cleared", verified: true, status: "ongoing", source_type: "news", daysAgo: 260 },
  { location_name: "Valley of Flowers Approach", state: "Uttarakhand", district: "Chamoli", lat: 30.72, lng: 79.6, tree_count: 89, species: ["Rhododendron", "Oak"], reason_category: "road_widening", project_name: "Hemkund pilgrimage road", authority: "PWD Uttarakhand", clearance_status: "under_review", verified: true, status: "ongoing", source_type: "news", daysAgo: 180 },
];

function padId(n) {
  return String(n).padStart(12, "0");
}

function toIncident(raw, index) {
  const id = `00000000-0000-0000-0000-${padId(index + 1)}`;
  const daysAgo = raw.daysAgo ?? 200;
  const created = new Date(Date.now() - daysAgo * 86400000).toISOString();
  const reason = raw.reason_category_override ?? raw.reason_category;
  const detail =
    raw.reason_detail ??
    raw.project_detail ??
    (raw.heritage
      ? `Heritage or sentinel tree incident: ${raw.location_name}`
      : `Trees felled or cleared for ${raw.project_name ?? "development"} in ${raw.location_name}`);

  return {
    id,
    created_at: created,
    lat: raw.lat,
    lng: raw.lng,
    location_name: raw.location_name,
    state: raw.state,
    district: raw.district ?? null,
    tree_count: raw.tree_count ?? null,
    species: raw.species ?? ["Neem", "Peepal"],
    reason_category: reason,
    reason_detail: detail,
    project_name: raw.project_name ?? null,
    authority: raw.authority ?? null,
    ministry: raw.ministry ?? "Ministry of Environment, Forest and Climate Change",
    clearance_status: raw.clearance_status ?? "under_review",
    ngt_case: raw.ngt_case ?? null,
    source_url: `https://mod.example/incident/${index + 1}`,
    source_type: raw.source_type ?? "news",
    contributor_id: null,
    verified: raw.verified ?? false,
    media_urls: null,
    status: raw.status ?? "ongoing",
  };
}

const incidents = INCIDENTS.map(toIncident);

const tsContent = `import type { Incident } from './types';

/** ${incidents.length} seed incidents — India-wide deforestation + heritage trees */
export const MOCK_INCIDENTS: Incident[] = ${JSON.stringify(incidents, null, 2)};
`;

fs.writeFileSync(path.join(ROOT, "lib/mock-data.ts"), tsContent);

// SQL seed
const sqlValues = incidents
  .map((i) => {
    const species = i.species ? `ARRAY[${i.species.map((s) => `'${s.replace(/'/g, "''")}'`).join(",")}]` : "null";
    const created = i.created_at.slice(0, 10);
    return `(${i.lng}, ${i.lat}, '${i.location_name.replace(/'/g, "''")}', '${i.state.replace(/'/g, "''")}', ${i.district ? `'${i.district.replace(/'/g, "''")}'` : "null"}, ${i.tree_count ?? "null"}, ${species}, '${i.reason_category}', '${(i.reason_detail ?? "").replace(/'/g, "''")}', ${i.project_name ? `'${i.project_name.replace(/'/g, "''")}'` : "null"}, ${i.authority ? `'${i.authority.replace(/'/g, "''")}'` : "null"}, '${i.ministry.replace(/'/g, "''")}', '${i.clearance_status}', ${i.ngt_case ? `'${i.ngt_case}'` : "null"}, '${i.source_url}', '${i.source_type}', ${i.verified}, null, '${i.status}', '${created}')`;
  })
  .join(",\n");

const sql = `-- Seed ${incidents.length} incidents — India-wide (generated)
-- Run: node scripts/generate-mock-incidents.mjs

truncate table incidents cascade;

insert into incidents (lng, lat, location_name, state, district, tree_count, species, reason_category, reason_detail, project_name, authority, ministry, clearance_status, ngt_case, source_url, source_type, verified, media_urls, status, created_at) values
${sqlValues};
`;

fs.writeFileSync(path.join(ROOT, "supabase/seed.sql"), sql);

const states = new Set(incidents.map((i) => i.state));
const heritage = incidents.filter((i) =>
  /heritage|sacred|sentinel|monument|400\+|centuries/i.test(
    `${i.location_name} ${i.reason_detail} ${(i.species ?? []).join(" ")}`
  )
);

console.log(`Generated ${incidents.length} incidents`);
console.log(`States/UTs covered: ${states.size}`);
console.log(`Heritage-related: ${heritage.length}`);

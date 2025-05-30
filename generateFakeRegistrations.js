const fs = require("fs");

const lists = [
  "BMW - Male Driver ",
  "BMW - Mature Female Driver",
  "BP - Boy 12- 15 Years",
  "BP - Cashier",
  "BP - Mother ",
  "Spotify - Female Teenager",
  "Spotify - Male Young Adult"
];

const firstNamesMale = [
  "Lebo", "Sipho", "Johan", "Peter", "Michael", "Thabo", "Daniel", "Alex", "David", "Chris",
  "Brian", "James", "Sam", "Ethan", "Noah", "Liam", "Lucas", "Mason", "Logan", "Elijah",
  "Aiden", "Jayden", "Gabriel", "Carter", "Owen", "Matthew", "Jack", "Luke", "Henry", "Wyatt",
  "Sebastian", "Julian", "Levi", "Isaac", "Hunter", "Dylan", "Nathan", "Caleb", "Ryan", "Asher",
  "Leo", "Lincoln", "Jaxon", "Grayson", "Ezra", "Charles", "Josiah", "Hudson", "Christian", "Colton",
  "Brandon", "Dominic", "Miles", "Aaron", "Jason", "Tyler", "Vincent", "Blake", "Eli", "Maxwell",
  "Oscar", "Damian", "Jasper", "Axel", "Silas", "Brody", "Micah", "Graham", "Ryder", "Zane",
  "Tobias", "Cameron", "Emmett", "Kai", "Jude", "Beau", "Riley", "Paxton", "Phoenix", "Seth",
  "Tristan", "Cody", "Andile", "Sibusiso", "Mandla", "Siphesihle", "Thulani", "Bongani", "Siyabonga", "Vusi",
  "Mpho", "Kabelo", "Tshepo", "Katlego", "Tumelo", "Kgosi", "Lesego", "Karabo", "Neo", "Teboho"
];

const firstNamesFemale = [
  "Thandi", "Zanele", "Naledi", "Aisha", "Nomsa", "Emily", "Olivia", "Sophia", "Ava", "Isabella",
  "Mia", "Charlotte", "Amelia", "Harper", "Evelyn", "Abigail", "Ella", "Scarlett", "Grace", "Chloe",
  "Victoria", "Riley", "Aria", "Lily", "Aubrey", "Zoey", "Penelope", "Layla", "Lillian", "Nora",
  "Addison", "Brooklyn", "Hannah", "Stella", "Natalie", "Leah", "Zoe", "Hazel", "Violet", "Aurora",
  "Savannah", "Audrey", "Claire", "Skylar", "Ellie", "Paisley", "Everly", "Anna", "Caroline", "Nova",
  "Jade", "Sienna", "Ruby", "Faith", "Jasmine", "Megan", "Kayla", "Amber", "Alexa", "Summer",
  "Peyton", "Morgan", "Quinn", "Reagan", "Sydney", "Bailey", "Mackenzie", "Aaliyah", "Khloe", "Genesis",
  "Serenity", "Valentina", "Isla", "Elena", "Naomi", "Delilah", "Mila", "Willow", "Brooklynn", "Camila",
  "Madison", "Gianna", "Luna", "Sophie", "Makayla", "Gabriella", "Samantha", "Hailey", "Jordyn", "Taylor",
  "Imani", "Ayanda", "Lerato", "Refilwe", "Palesa", "Bokang", "Tshegofatso", "Boitumelo", "Nthabiseng", "Keabetswe"
];
const surnames = [
  "Mokoena", "Nkosi", "Dlamini", "Khumalo", "van der Merwe", "Patel", "Nguyen", "Zulu", "Smith", "Johnson",
  "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez",
  "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez",
  "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Ngubane", "Mthembu", "Mahlangu", "Mabaso", "Pillay",
  "Molefe", "Mokoetle", "Mahlatsi", "Mofokeng", "Motsoeneng", "Molekwa", "Mabena", "Mokgosi", "Mokone", "Mokgoro",
  "Sebeko", "Radebe", "Baloyi", "Mabaso", "Molebatsi", "Mokhonoana", "Mahlangu", "Mabunda", "Mabaso", "Mahlatsi",
  "Mabena", "Molekwa", "Mokgoro", "Mokgosi", "Mokone", "Molebatsi", "Mokhonoana", "Sebeko", "Radebe", "Baloyi",
  "Naidoo", "Govender", "Moodley", "Pillay", "Chetty", "Singh", "Reddy", "Naicker", "Padayachee", "Mudaly",
  "Botha", "Steyn", "Swanepoel", "Du Plessis", "Van Wyk", "Oosthuizen", "Pretorius", "Kruger", "Van der Walt", "Visser"
];

const ethnicities = ["Black", "White", "Coloured", "Indian", "Asian", "Mixed"];
const tshirtSizes = ["XS", "S", "M", "L", "XL"];
const availabilities = ["Yes"]

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomString(len = 6) {
  return Math.random().toString(36).substring(2, 2 + len);
}

function randomDate(startYear = 1960, endYear = 2012) {
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function randomPhone() {
  return `+27 ${Math.floor(60 + Math.random() * 40)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`;
}

function randomWorkHistory() {
  const jobs = [
    "Featured in a TV commercial.",
    "Background extra in a local film.",
    "Theatre performance in Johannesburg.",
    "Modelled for a fashion brand.",
    "Appeared in a music video.",
    "Acted in a student film.",
    "Voiceover for a radio ad.",
    "Dancer in a stage production.",
    "Stand-in for a lead actor.",
    "Presenter for a web series."
  ];
  return jobs[Math.floor(Math.random() * jobs.length)];
}

function randomAgency() {
  const agencies = ["Talent Africa", "Urban Faces", "Star Talent", "Casting Zone", "Elite Models"];
  return agencies[Math.floor(Math.random() * agencies.length)];
}

function randomImageUrls() {
  const count = Math.floor(Math.random() * 3) + 1;
  return Array.from({ length: count }, () => `https://picsum.photos/seed/${randomString(8)}/200/300`);
}

function randomVideoUrl() {
  return `https://videos.example.com/${randomString(10)}.mp4`;
}

const usedNames = new Set();

function makeFake(i, gender = "male") {
  let firstName, surname, nameKey;
  do {
    firstName = gender === "male"
      ? getRandom(firstNamesMale)
      : getRandom(firstNamesFemale);
    surname = getRandom(surnames);
    nameKey = `${firstName} ${surname}`;
  } while (usedNames.has(nameKey));
  usedNames.add(nameKey);

  const dob = randomDate();
  const age = 2024 - parseInt(dob.split("-")[0]);
  const ethnicity = getRandom(ethnicities);
  const tshirtSize = getRandom(tshirtSizes);
  const availability = getRandom(["Yes", "No", "Maybe"]);
  const agency = randomAgency();
  const agencyEmail = `${firstName.toLowerCase()}.${surname.toLowerCase()}@${agency.replace(/\s+/g, '').toLowerCase()}.com`;

  return {
    name: firstName,
    surname: surname,
    dateOfBirth: dob,
    gender,
    age,
    ethnicity,
    contact: randomPhone(),
    socialMedia: `https://instagram.com/${firstName.toLowerCase()}_${surname.toLowerCase()}_${randomString(4)}`,
    agency: agency,
    agencyEmail: agencyEmail,
    height: 150 + Math.floor(Math.random() * 51),
    tshirtSize: tshirtSize,
    waistSize: 26 + Math.floor(Math.random() * 15),
    pantsSize: 26 + Math.floor(Math.random() * 15),
    dressSize: gender === "female" ? 6 + Math.floor(Math.random() * 11) : "",
    shoeSize: 4 + Math.floor(Math.random() * 10),
    workHistory: randomWorkHistory(),
    workVisa: getRandom(["yes", "no"]),
    criminalRecord: getRandom(["yes", "no"]),
    driversLicense: getRandom(["yes", "no"]),
    availability: availability,
    date: randomDate(2023, 2024),
    images: [],
    video: ""
  };
}

const allLists = {};

lists.forEach(list => {
  let gender = "male";
  if (
    list.toLowerCase().includes("female") ||
    list.toLowerCase().includes("mother") ||
    list.toLowerCase().includes("teenager")
  ) {
    gender = "female";
  }
  const submissions = {};
  for (let i = 0; i < 50; i++) {
    // Generate a globally unique ID
    const safeList = list.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const uniqueId = `fake-id-${safeList}-${i + 1}-${randomString(6)}`;
    submissions[uniqueId] = makeFake(i, gender);
  }
  allLists[list] = { submissions };
});

fs.writeFileSync("fake-registrations.json", JSON.stringify({ lists: allLists }, null, 2));
console.log("Unique fake registrations JSON generated as fake-registrations.json");
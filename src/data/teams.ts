export interface TeamSection {
  code: string;
  name: string;
  group?: string;
  flag?: string;
  stickerCount?: number;
  players?: (string | null)[];
}

export const SECTIONS: TeamSection[] = [
  // Introdução (20 figurinhas: FWC01-FWC19 + FWC00)
  { code: "FWC", name: "Copa do Mundo 2026", flag: "🏆", players: [
    "Emblema Oficial",      // FWC01
    "Emblema Oficial",      // FWC02
    "Mascotes Oficiais",    // FWC03
    "Slogan Oficial",       // FWC04
    "Bola Oficial",         // FWC05
    "Canadá - Sede",        // FWC06
    "México - Sede",        // FWC07
    "EUA - Sede",           // FWC08
    "Meazza - Itália 1934",          // FWC09
    "O. Varela - Uruguai 1950",      // FWC10
    "F. Walter - Alemanha 1954",     // FWC11
    "Garrincha - Brasil 1962",       // FWC12
    "Beckenbauer - Alemanha 1974",   // FWC13
    "Maradona - Argentina 1986",     // FWC14
    "Romário - Brasil 1994",         // FWC15
    "Ronaldo - Brasil 2002",         // FWC16
    "Cannavaro - Itália 2006",       // FWC17
    "Götze - Alemanha 2014",         // FWC18
    "Messi - Argentina 2022",        // FWC19
    "Logo Panini",          // FWC00
  ]},

  // Grupo A
  { code: "MEX", name: "México", group: "A", flag: "🇲🇽", players: [
    null,               // MEX1 - Escudo
    "Luis Malagón",     // MEX2
    "Johan Vasquez",    // MEX3
    "Jorge Sánchez",    // MEX4
    "Cesar Montes",     // MEX5
    "Jesus Gallardo",   // MEX6
    "Israel Reyes",     // MEX7
    "Diego Lainez",     // MEX8
    "Carlos Rodriguez", // MEX9
    "Edson Alvarez",    // MEX10
    "Orbelin Pineda",   // MEX11
    "Marcel Ruiz",      // MEX12
    null,               // MEX13 - Foto do time
    "Érick Sánchez",    // MEX14
    "Hirving Lozano",   // MEX15
    "Santiago Giménez", // MEX16
    "Raúl Jiménez",     // MEX17
    "Alexis Vega",      // MEX18
    "Roberto Alvarado", // MEX19
    "Cesar Huerta",     // MEX20
  ]},
  { code: "RSA", name: "África do Sul", group: "A", flag: "🇿🇦", players: [
    null,                  // RSA1
    "Ronwen Williams",     // RSA2
    "Sipho Chaine",        // RSA3
    "Aubrey Modiba",       // RSA4
    "Samukele Kabini",     // RSA5
    "Mbekezeli Mbokazi",   // RSA6
    "Khulumani Ndamane",   // RSA7
    "Siyabonga Ngezana",   // RSA8
    "Khuliso Mudau",       // RSA9
    "Nkosinathi Sibisi",   // RSA10
    "Teboho Mokoena",      // RSA11
    "Thalente Mbatha",     // RSA12
    null,                  // RSA13
    "Bathasi Aubaas",      // RSA14
    "Yaya Sithole",        // RSA15
    "Sipho Mbule",         // RSA16
    "Lyle Foster",         // RSA17
    "Iqraam Rayners",      // RSA18
    "Mohau Nkota",         // RSA19
    "Oswin Appollis",      // RSA20
  ]},
  { code: "KOR", name: "Coreia do Sul", group: "A", flag: "🇰🇷", players: [
    null,              // KOR1
    "Hyeon-woo Jo",    // KOR2
    "Seung-Gyu Kim",   // KOR3
    "Min-jae Kim",     // KOR4
    "Yu-min Cho",      // KOR5
    "Young-woo Seol",  // KOR6
    "Han-beom Lee",    // KOR7
    "Tae-seok Lee",    // KOR8
    "Myung-jae Lee",   // KOR9
    "Jae-sung Lee",    // KOR10
    "In-beom Hwang",   // KOR11
    "Kang-in Lee",     // KOR12
    null,              // KOR13
    "Seung-ho Paik",   // KOR14
    "Jens Castrop",    // KOR15
    "Dong-yeong Lee",  // KOR16
    "Gue-sung Cho",    // KOR17
    "Heung-min Son",   // KOR18
    "Hee-chan Hwang",  // KOR19
    "Hyeon-Gyu Oh",    // KOR20
  ]},
  { code: "CZE", name: "República Tcheca", group: "A", flag: "🇨🇿", players: [
    null,              // CZE1
    "Matej Kovar",     // CZE2
    "Jindrich Stanek", // CZE3
    "Ladislav Krejci", // CZE4
    "Vladimir Coufal", // CZE5
    "Jaroslav Zeleny", // CZE6
    "Tomas Holes",     // CZE7
    "David Zima",      // CZE8
    "Michal Sadilek",  // CZE9
    "Lukas Provod",    // CZE10
    "Lukas Cerv",      // CZE11
    "Tomas Soucek",    // CZE12
    null,              // CZE13
    "Pavel Sulc",      // CZE14
    "Matej Vydra",     // CZE15
    "Vasil Kusej",     // CZE16
    "Tomas Chory",     // CZE17
    "Vaclav Cerny",    // CZE18
    "Adam Hlozek",     // CZE19
    "Patrik Schick",   // CZE20
  ]},

  // Grupo B
  { code: "CAN", name: "Canadá", group: "B", flag: "🇨🇦", players: [
    null,                  // CAN1
    "Dayne St.Clair",      // CAN2
    "Alphonso Davies",     // CAN3
    "Alistair Johnston",   // CAN4
    "Samuel Adekugbe",     // CAN5
    "Riche Larvea",        // CAN6
    "Derek Cornelius",     // CAN7
    "Moïse Bombito",       // CAN8
    "Kamal Miller",        // CAN9
    "Stephen Eustáquio",   // CAN10
    "Ismaël Koné",         // CAN11
    "Jonathan Osorio",     // CAN12
    null,                  // CAN13
    "Jacob Shaffelburg",   // CAN14
    "Mathieu Choinière",   // CAN15
    "Niko Sigur",          // CAN16
    "Tajon Buchanan",      // CAN17
    "Liam Millar",         // CAN18
    "Cyle Larin",          // CAN19
    "Jonathan David",      // CAN20
  ]},
  { code: "BIH", name: "Bósnia", group: "B", flag: "🇧🇦", players: [
    null,                     // BIH1
    "Nikola Vasilj",          // BIH2
    "Amer Dedic",             // BIH3
    "Sead Kolasinac",         // BIH4
    "Tarik Muharemovic",      // BIH5
    "Nihad Mujakic",          // BIH6
    "Nikola Katic",           // BIH7
    "Amir Hadziahmetovic",    // BIH8
    "Benjamin Tahirovic",     // BIH9
    "Armin Gigovic",          // BIH10
    "Ivan Sunjic",            // BIH11
    "Ivan Basic",             // BIH12
    null,                     // BIH13
    "Dzenis Burnic",          // BIH14
    "Esmir Bajraktarevic",    // BIH15
    "Amar Memic",             // BIH16
    "Ermedin Demirovic",      // BIH17
    "Edin Dzeko",             // BIH18
    "Samed Bazdar",           // BIH19
    "Haris Tabakovic",        // BIH20
  ]},
  { code: "QAT", name: "Catar", group: "B", flag: "🇶🇦", players: [
    null,                  // QAT1
    "Meshaal Barsham",     // QAT2
    "Sultan Albrake",      // QAT3
    "Lucas Mendes",        // QAT4
    "Homam Ahmed",         // QAT5
    "Boualem Khoukhi",     // QAT6
    "Pedro Miguel",        // QAT7
    "Tarek Salman",        // QAT8
    "Mohamed Al-Mannai",   // QAT9
    "Karim Boudiaf",       // QAT10
    "Assim Madibo",        // QAT11
    "Ahmed Fatehi",        // QAT12
    null,                  // QAT13
    "Mohammed Waad",       // QAT14
    "Abdulaziz Hatem",     // QAT15
    "Hassan Al-Haydos",    // QAT16
    "Edmilson Junior",     // QAT17
    "Akram Hassan Afif",   // QAT18
    "Ahmed Al Ganehi",     // QAT19
    "Almoez Ali",          // QAT20
  ]},
  { code: "SUI", name: "Suíça", group: "B", flag: "🇨🇭", players: [
    null,              // SUI1
    "Gregor Kobel",    // SUI2
    "Yvon Mvogo",      // SUI3
    "Manuel Akanji",   // SUI4
    "Ricardo Rodriguez", // SUI5
    "Nico Elvedi",     // SUI6
    "Aurèle Amenda",   // SUI7
    "Silvan Widmer",   // SUI8
    "Granit Xhaka",    // SUI9
    "Denis Zakaria",   // SUI10
    "Remo Freuler",    // SUI11
    "Fabian Rieder",   // SUI12
    null,              // SUI13
    "Ardon Jashari",   // SUI14
    "Johan Manzambi",  // SUI15
    "Michel Aebischer", // SUI16
    "Breel Embolo",    // SUI17
    "Ruben Vargas",    // SUI18
    "Dan Ndoye",       // SUI19
    "Zeki Amdouni",    // SUI20
  ]},

  // Grupo C
  { code: "BRA", name: "Brasil", group: "C", flag: "🇧🇷", players: [
    null,                // BRA1
    "Alisson",           // BRA2
    "Bento",             // BRA3
    "Marquinhos",        // BRA4
    "Éder Militão",      // BRA5
    "Gabriel Magalhães", // BRA6
    "Danilo",            // BRA7
    "Wesley",            // BRA8
    "Lucas Paquetá",     // BRA9
    "Casemiro",          // BRA10
    "Bruno Guimarães",   // BRA11
    "Luiz Henrique",     // BRA12
    null,                // BRA13
    "Vinicius Júnior",   // BRA14
    "Rodrygo",           // BRA15
    "João Pedro",        // BRA16
    "Matheus Cunha",     // BRA17
    "Gabriel Martinelli", // BRA18
    "Raphinha",          // BRA19
    "Estévão",           // BRA20
  ]},
  { code: "MAR", name: "Marrocos", group: "C", flag: "🇲🇦", players: [
    null,                  // MAR1
    "Yassine Bounou",      // MAR2
    "Munir El Kajoui",     // MAR3
    "Achraf Hakimi",       // MAR4
    "Noussair Mazraoui",   // MAR5
    "Nayef Aguerd",        // MAR6
    "Roman Saiss",         // MAR7
    "Jawad El Yamiq",      // MAR8
    "Adam Masina",         // MAR9
    "Sofyan Amrabat",      // MAR10
    "Azzedine Ounahi",     // MAR11
    "Eliesse Ben Seghir",  // MAR12
    null,                  // MAR13
    "Bilal El Khannouss",  // MAR14
    "Ismael Saibari",      // MAR15
    "Youssef En-Nesyri",   // MAR16
    "Abde Ezzalzouli",     // MAR17
    "Soufiane Rahimi",     // MAR18
    "Brahim Diaz",         // MAR19
    "Ayoub El Kaabi",      // MAR20
  ]},
  { code: "SCO", name: "Escócia", group: "C", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", players: [
    null,                // SCO1
    "Angus Gunn",        // SCO2
    "Jack Hendry",       // SCO3
    "Kieran Tierney",    // SCO4
    "Aaron Hickey",      // SCO5
    "Andrew Robertson",  // SCO6
    "Scott McKenna",     // SCO7
    "John Souttar",      // SCO8
    "Anthony Ralston",   // SCO9
    "Grant Hanley",      // SCO10
    "Scott McTominay",   // SCO11
    "Billy Gilmour",     // SCO12
    null,                // SCO13
    "Lewis Ferguson",    // SCO14
    "Ryan Christie",     // SCO15
    "Kenny McLean",      // SCO16
    "John McGinn",       // SCO17
    "Lyndon Dykes",      // SCO18
    "Che Adams",         // SCO19
    "Ben Doak",          // SCO20
  ]},
  { code: "HAI", name: "Haiti", group: "C", flag: "🇭🇹", players: [
    null,                     // HAI1
    "Johny Placide",          // HAI2
    "Carlens Arcus",          // HAI3
    "Martin Expérience",      // HAI4
    "Jean-Kevin Duverne",     // HAI5
    "Ricardo Adé",            // HAI6
    "Duke Lacroix",           // HAI7
    "Garven Metusala",        // HAI8
    "Hannes Delcroix",        // HAI9
    "Leverton Pierre",        // HAI10
    "Danley Jean Jacques",    // HAI11
    "Jean-Ricner Bellegarde", // HAI12
    null,                     // HAI13
    "Christopher Attys",      // HAI14
    "Derrick Etienne Jr.",    // HAI15
    "Josue Casimir",          // HAI16
    "Ruben Providence",       // HAI17
    "Duckens Nazon",          // HAI18
    "Louicius Deedson",       // HAI19
    "Frantzdy Pierrot",       // HAI20
  ]},

  // Grupo D
  { code: "USA", name: "Estados Unidos", group: "D", flag: "🇺🇸", players: [
    null,                  // USA1
    "Matt Freese",         // USA2
    "Chris Richards",      // USA3
    "Tim Ream",            // USA4
    "Mark McKenzie",       // USA5
    "Alex Freeman",        // USA6
    "Antonee Robinson",    // USA7
    "Tyler Adams",         // USA8
    "Tanner Tessmann",     // USA9
    "Weston McKennie",     // USA10
    "Christian Roldan",    // USA11
    "Timothy Weah",        // USA12
    null,                  // USA13
    "Diego Luna",          // USA14
    "Malik Tillman",       // USA15
    "Christian Pulisic",   // USA16
    "Brenden Aaronson",    // USA17
    "Ricardo Pepi",        // USA18
    "Haji Wright",         // USA19
    "Folarin Balogun",     // USA20
  ]},
  { code: "PAR", name: "Paraguai", group: "D", flag: "🇵🇾", players: [
    null,                       // PAR1
    "Roberto Fernandez",        // PAR2
    "Orlando Gill",             // PAR3
    "Gustavo Gomez",            // PAR4
    "Fabián Balbuena",          // PAR5
    "Juan José Cáceres",        // PAR6
    "Omar Alderete",            // PAR7
    "Junior Alonso",            // PAR8
    "Mathías Villasanti",       // PAR9
    "Diego Gomez",              // PAR10
    "Damián Bobadilla",         // PAR11
    "Andres Cubas",             // PAR12
    null,                       // PAR13
    "Matias Galarza",           // PAR14
    "Julio Enciso",             // PAR15
    "Alejandro Romero Gamarra", // PAR16
    "Miguel Almirón",           // PAR17
    "Ramon Sosa",               // PAR18
    "Angel Romero",             // PAR19
    "Antonio Sanabria",         // PAR20
  ]},
  { code: "AUS", name: "Austrália", group: "D", flag: "🇦🇺", players: [
    null,                  // AUS1
    "Mathew Ryan",         // AUS2
    "Joe Gauci",           // AUS3
    "Harry Souttar",       // AUS4
    "Alessandro Circati",  // AUS5
    "Jordan Bos",          // AUS6
    "Aziz Behich",         // AUS7
    "Cameron Burgess",     // AUS8
    "Lewis Miller",        // AUS9
    "Milos Degenek",       // AUS10
    "Jackson Irvine",      // AUS11
    "Riley McGree",        // AUS12
    null,                  // AUS13
    "Aiden O'Neill",       // AUS14
    "Connor Metcalfe",     // AUS15
    "Patrick Yazbek",      // AUS16
    "Craig Goodwin",       // AUS17
    "Kusini Yengi",        // AUS18
    "Nestory Irankunda",   // AUS19
    "Mohamed Touré",       // AUS20
  ]},
  { code: "TUR", name: "Turquia", group: "D", flag: "🇹🇷", players: [
    null,                   // TUR1
    "Ugurcan Cakir",        // TUR2
    "Mert Muldur",          // TUR3
    "Zeki Celik",           // TUR4
    "Abdulkerim Bardakci",  // TUR5
    "Caglar Soyuncu",       // TUR6
    "Merih Demiral",        // TUR7
    "Ferdi Kadioglu",       // TUR8
    "Kaan Ayhan",           // TUR9
    "Ismail Yuksek",        // TUR10
    "Hakan Calhanoglu",     // TUR11
    "Orkun Kokcu",          // TUR12
    null,                   // TUR13
    "Arda Guler",           // TUR14
    "Irfan Can Kahveci",    // TUR15
    "Yunus Akgun",          // TUR16
    "Can Uzun",             // TUR17
    "Baris Alper Yilmaz",   // TUR18
    "Kerem Akturkoglu",     // TUR19
    "Kenan Yildiz",         // TUR20
  ]},

  // Grupo E
  { code: "GER", name: "Alemanha", group: "E", flag: "🇩🇪", players: [
    null,                    // GER1
    "Marc-André ter Stegen", // GER2
    "Jonathan Tah",          // GER3
    "David Raum",            // GER4
    "Nico Schlotterbeck",    // GER5
    "Antonio Rüdiger",       // GER6
    "Waldemar Anton",        // GER7
    "Ridle Baku",            // GER8
    "Maximilian Mittelstadt", // GER9
    "Joshua Kimmich",        // GER10
    "Florian Wirtz",         // GER11
    "Felix Nmecha",          // GER12
    null,                    // GER13
    "Leon Goretzka",         // GER14
    "Jamal Musiala",         // GER15
    "Serge Gnabry",          // GER16
    "Kai Havertz",           // GER17
    "Leroy Sane",            // GER18
    "Karim Adeyemi",         // GER19
    "Nick Woltemade",        // GER20
  ]},
  { code: "ECU", name: "Equador", group: "E", flag: "🇪🇨", players: [
    null,                  // ECU1
    "Hernán Galíndez",     // ECU2
    "Gonzalo Valle",       // ECU3
    "Piero Hincapié",      // ECU4
    "Pervis Estupiñán",    // ECU5
    "Willian Pacho",       // ECU6
    "Ángelo Preciado",     // ECU7
    "Joel Ordóñez",        // ECU8
    "Moisés Caicedo",      // ECU9
    "Alan Franco",         // ECU10
    "Kendry Páez",         // ECU11
    "Pedro Vite",          // ECU12
    null,                  // ECU13
    "John Yeboah",         // ECU14
    "Leonardo Campana",    // ECU15
    "Gonzalo Plata",       // ECU16
    "Nilson Angulo",       // ECU17
    "Alan Minda",          // ECU18
    "Kevin Rodriguez",     // ECU19
    "Enner Valencia",      // ECU20
  ]},
  { code: "CIV", name: "Costa do Marfim", group: "E", flag: "🇨🇮", players: [
    null,                    // CIV1
    "Yahia Fofana",          // CIV2
    "Ghislain Konan",        // CIV3
    "Wilfried Singo",        // CIV4
    "Odilon Kossounou",      // CIV5
    "Evan Ndicka",           // CIV6
    "Willy Boly",            // CIV7
    "Emmanuel Agbadou",      // CIV8
    "Ousmane Diomande",      // CIV9
    "Franck Kessie",         // CIV10
    "Seko Fofana",           // CIV11
    "Ibrahim Sangare",       // CIV12
    null,                    // CIV13
    "Jean-Philippe Gbamin",  // CIV14
    "Amad Diallo",           // CIV15
    "Sébastien Haller",      // CIV16
    "Simon Adingra",         // CIV17
    "Yan Diomande",          // CIV18
    "Evann Guessand",        // CIV19
    "Oumar Diakite",         // CIV20
  ]},
  { code: "CUW", name: "Curaçao", group: "E", flag: "🇨🇼", players: [
    null,                   // CUW1
    "Eloy Room",            // CUW2
    "Armando Obispo",       // CUW3
    "Sherel Floranus",      // CUW4
    "Jurien Gaari",         // CUW5
    "Joshua Brenet",        // CUW6
    "Roshon Van Eijma",     // CUW7
    "Shurandy Sambo",       // CUW8
    "Livano Comenencia",    // CUW9
    "Godfried Roemeratoe",  // CUW10
    "Juninho Bacuna",       // CUW11
    "Leandro Bacuna",       // CUW12
    null,                   // CUW13
    "Tahith Chong",         // CUW14
    "Kenji Gorre",          // CUW15
    "Jearl Margaritha",     // CUW16
    "Jurgen Locadia",       // CUW17
    "Jeremy Antonisse",     // CUW18
    "Gervane Kastaneer",    // CUW19
    "Sontje Hansen",        // CUW20
  ]},

  // Grupo F
  { code: "NED", name: "Holanda", group: "F", flag: "🇳🇱", players: [
    null,                  // NED1
    "Bart Verbruggen",     // NED2
    "Virgil van Dijk",     // NED3
    "Micky van de Ven",    // NED4
    "Jurrien Timber",      // NED5
    "Denzel Dumfries",     // NED6
    "Nathan Aké",          // NED7
    "Jeremie Frimpong",    // NED8
    "Jan Paul van Hecke",  // NED9
    "Tijjani Reijnders",   // NED10
    "Ryan Gravenberch",    // NED11
    "Teun Koopmeiners",    // NED12
    null,                  // NED13
    "Frenkie de Jong",     // NED14
    "Xavi Simons",         // NED15
    "Justin Kluivert",     // NED16
    "Memphis Depay",       // NED17
    "Donyell Malen",       // NED18
    "Wout Weghorst",       // NED19
    "Cody Gakpo",          // NED20
  ]},
  { code: "JPN", name: "Japão", group: "F", flag: "🇯🇵", players: [
    null,                       // JPN1
    "Zion Suzuki",              // JPN2
    "Mochizuki Hiroki",         // JPN3
    "Ayumu Seko",               // JPN4
    "Junnosuke Suzuki",         // JPN5
    "Shogo Taniguchi",          // JPN6
    "Tsuyoshi Watanabe",        // JPN7
    "Kaishu Sano",              // JPN8
    "Yuki Soma",                // JPN9
    "Ao Tanaka",                // JPN10
    "Daichi Kamada",            // JPN11
    "Takefusa Kubo",            // JPN12
    null,                       // JPN13
    "Ritsu Doan",               // JPN14
    "Keito Nakamura",           // JPN15
    "Takumi Minamino",          // JPN16
    "Shuto Machino",            // JPN17
    "Junya Ito",                // JPN18
    "Koki Ogawa",               // JPN19
    "Ayase Ueda",               // JPN20
  ]},
  { code: "SWE", name: "Suécia", group: "F", flag: "🇸🇪", players: [
    null,                      // SWE1
    "Victor Johansson",        // SWE2
    "Isak Hien",               // SWE3
    "Gabriel Gudmundsson",     // SWE4
    "Emil Holm",               // SWE5
    "Victor Nilsson Lindelöf", // SWE6
    "Gustaf Lagerbielke",      // SWE7
    "Lucas Bergvall",          // SWE8
    "Hugo Larsson",            // SWE9
    "Jesper Karlström",        // SWE10
    "Yasin Ayari",             // SWE11
    "Mattias Svanberg",        // SWE12
    null,                      // SWE13
    "Daniel Svensson",         // SWE14
    "Ken Sema",                // SWE15
    "Roony Bardghji",          // SWE16
    "Dejan Kulusevski",        // SWE17
    "Anthony Elanga",          // SWE18
    "Alexander Isak",          // SWE19
    "Viktor Gyökeres",         // SWE20
  ]},
  { code: "TUN", name: "Tunísia", group: "F", flag: "🇹🇳", players: [
    null,                       // TUN1
    "Bechir Ben Said",          // TUN2
    "Aymen Dahmen",             // TUN3
    "Yan Valery",               // TUN4
    "Montassar Talbi",          // TUN5
    "Yassine Meriah",           // TUN6
    "Ali Abdi",                 // TUN7
    "Dylan Bronn",              // TUN8
    "Ellyes Skhiri",            // TUN9
    "Aissa Laidouni",           // TUN10
    "Ferjani Sassi",            // TUN11
    "Mohamed Ali Ben Romdhane", // TUN12
    null,                       // TUN13
    "Hannibal Mejbri",          // TUN14
    "Elias Achouri",            // TUN15
    "Elias Saad",               // TUN16
    "Hazem Mastouri",           // TUN17
    "Ismael Gharbi",            // TUN18
    "Sayfallah Ltaief",         // TUN19
    "Naim Sliti",               // TUN20
  ]},

  // Grupo G
  { code: "BEL", name: "Bélgica", group: "G", flag: "🇧🇪", players: [
    null,                   // BEL1
    "Thibaut Courtois",     // BEL2
    "Arthur Theate",        // BEL3
    "Timothy Castagne",     // BEL4
    "Zeno Debast",          // BEL5
    "Brandon Mechele",      // BEL6
    "Maxim De Cuyper",      // BEL7
    "Thomas Meunier",       // BEL8
    "Youri Tielemans",      // BEL9
    "Amadou Onana",         // BEL10
    "Nicolas Raskin",       // BEL11
    "Alexis Saelemaekers",  // BEL12
    null,                   // BEL13
    "Hans Vanaken",         // BEL14
    "Kevin De Bruyne",      // BEL15
    "Jérémy Doku",          // BEL16
    "Charles De Ketelaere", // BEL17
    "Leandro Trossard",     // BEL18
    "Loïs Openda",          // BEL19
    "Romelu Lukaku",        // BEL20
  ]},
  { code: "IRN", name: "Irã", group: "G", flag: "🇮🇷", players: [
    null,                      // IRN1
    "Alireza Beiranvand",      // IRN2
    "Morteza Pouraliganji",    // IRN3
    "Ehsan Hajsafi",           // IRN4
    "Milad Mohammadi",         // IRN5
    "Shojae Khalilzadeh",      // IRN6
    "Ramin Rezaeian",          // IRN7
    "Hossein Kanaani",         // IRN8
    "Sadegh Moharrami",        // IRN9
    "Saleh Hardani",           // IRN10
    "Saeed Ezatolahi",         // IRN11
    "Saman Ghoddos",           // IRN12
    null,                      // IRN13
    "Omid Noorafkan",          // IRN14
    "Roozbeh Cheshmi",         // IRN15
    "Mohammad Mohebi",         // IRN16
    "Sardar Azmoun",           // IRN17
    "Mehdi Taremi",            // IRN18
    "Alireza Jahanbakhsh",     // IRN19
    "Ali Gholizadeh",          // IRN20
  ]},
  { code: "EGY", name: "Egito", group: "G", flag: "🇪🇬", players: [
    null,                   // EGY1
    "Mohamed El Shenawy",   // EGY2
    "Mohamed Hany",         // EGY3
    "Mohamed Hamdy",        // EGY4
    "Yasser Ibrahim",       // EGY5
    "Khaled Sobhi",         // EGY6
    "Ramy Rabia",           // EGY7
    "Hossam Abdelmaguid",   // EGY8
    "Ahmed Fatouh",         // EGY9
    "Marwan Attia",         // EGY10
    "Zizo",                 // EGY11
    "Hamdy Fathy",          // EGY12
    null,                   // EGY13
    "Mohamed Lasheen",      // EGY14
    "Emam Ashour",          // EGY15
    "Osama Faisal",         // EGY16
    "Mohamed Salah",        // EGY17
    "Mostafa Mohamed",      // EGY18
    "Trezeguet",            // EGY19
    "Omar Marmoush",        // EGY20
  ]},
  { code: "NZL", name: "Nova Zelândia", group: "G", flag: "🇳🇿", players: [
    null,                   // NZL1
    "Max Crocombe",         // NZL2
    "Alex Paulsen",         // NZL3
    "Michael Boxall",       // NZL4
    "Liberato Cacace",      // NZL5
    "Tim Payne",            // NZL6
    "Tyler Bindon",         // NZL7
    "Francis de Vries",     // NZL8
    "Finn Surman",          // NZL9
    "Joe Bell",             // NZL10
    "Sarpreet Singh",       // NZL11
    "Ryan Thomas",          // NZL12
    null,                   // NZL13
    "Matthew Garbett",      // NZL14
    "Marko Stamenić",       // NZL15
    "Ben Old",              // NZL16
    "Chris Wood",           // NZL17
    "Elijah Just",          // NZL18
    "Callum McCowatt",      // NZL19
    "Kosta Barbarouses",    // NZL20
  ]},

  // Grupo H
  { code: "ESP", name: "Espanha", group: "H", flag: "🇪🇸", players: [
    null,                // ESP1
    "Unai Simon",        // ESP2
    "Robin Le Normand",  // ESP3
    "Aymeric Laporte",   // ESP4
    "Dean Huijsen",      // ESP5
    "Pedro Porro",       // ESP6
    "Dani Carvajal",     // ESP7
    "Marc Cucurella",    // ESP8
    "Martín Zubimendi",  // ESP9
    "Rodri",             // ESP10
    "Pedri",             // ESP11
    "Fabian Ruiz",       // ESP12
    null,                // ESP13
    "Mikel Merino",      // ESP14
    "Lamine Yamal",      // ESP15
    "Dani Olmo",         // ESP16
    "Nico Williams",     // ESP17
    "Ferran Torres",     // ESP18
    "Álvaro Morata",     // ESP19
    "Mikel Oyarzabal",   // ESP20
  ]},
  { code: "URU", name: "Uruguai", group: "H", flag: "🇺🇾", players: [
    null,                      // URU1
    "Sergio Rochet",           // URU2
    "Santiago Mele",           // URU3
    "Ronald Araujo",           // URU4
    "José María Giménez",      // URU5
    "Sebastian Caceres",       // URU6
    "Mathias Olivera",         // URU7
    "Guillermo Varela",        // URU8
    "Nahitan Nandez",          // URU9
    "Federico Valverde",       // URU10
    "Giorgian De Arrascaeta",  // URU11
    "Rodrigo Bentancur",       // URU12
    null,                      // URU13
    "Manuel Ugarte",           // URU14
    "Nicolás de la Cruz",      // URU15
    "Maxi Araujo",             // URU16
    "Darwin Núñez",            // URU17
    "Federico Viñas",          // URU18
    "Rodrigo Aguirre",         // URU19
    "Facundo Pellistri",       // URU20
  ]},
  { code: "KSA", name: "Arábia Saudita", group: "H", flag: "🇸🇦", players: [
    null,                        // KSA1
    "Nawaf Alaqidi",             // KSA2
    "Abdulrahman Al-Sanbi",      // KSA3
    "Saud Abdulhamid",           // KSA4
    "Nawaf Bouwashl",            // KSA5
    "Jihad Thakri",              // KSA6
    "Moteb Al-Harbi",            // KSA7
    "Hassan Altambakti",         // KSA8
    "Musab Aljuwayr",            // KSA9
    "Ziyad Aljohani",            // KSA10
    "Abdullah Alkhaibari",       // KSA11
    "Nasser Aldawsari",          // KSA12
    null,                        // KSA13
    "Saleh Abu Alshamat",        // KSA14
    "Marwan Alsahafi",           // KSA15
    "Salem Aldawsari",           // KSA16
    "Abdulrahman Al-Aboud",      // KSA17
    "Feras Akbrikan",            // KSA18
    "Saleh Alshehri",            // KSA19
    "Abdullah Al-Hamdan",        // KSA20
  ]},
  { code: "CPV", name: "Cabo Verde", group: "H", flag: "🇨🇻", players: [
    null,               // CPV1
    "Vozinha",          // CPV2
    "Logan Costa",      // CPV3
    "Pico",             // CPV4
    "Diney",            // CPV5
    "Steven Moreira",   // CPV6
    "Wagner Pina",      // CPV7
    "Joao Paulo",       // CPV8
    "Yannick Semedo",   // CPV9
    "Kevin Pina",       // CPV10
    "Patrick Andrade",  // CPV11
    "Jamiro Monteiro",  // CPV12
    null,               // CPV13
    "Deroy Duarte",     // CPV14
    "Garry Rodrigues",  // CPV15
    "Jovane Cabral",    // CPV16
    "Ryan Mendes",      // CPV17
    "Dailon Livramento", // CPV18
    "Willy Semedo",     // CPV19
    "Bebe",             // CPV20
  ]},

  // Grupo I
  { code: "FRA", name: "França", group: "I", flag: "🇫🇷", players: [
    null,                   // FRA1
    "Mike Maignan",         // FRA2
    "Theo Hernandez",       // FRA3
    "William Saliba",       // FRA4
    "Jules Kounde",         // FRA5
    "Ibrahima Konate",      // FRA6
    "Dayot Upamecano",      // FRA7
    "Lucas Digne",          // FRA8
    "Aurélien Tchouaméni",  // FRA9
    "Eduardo Camavinga",    // FRA10
    "Manu Kone",            // FRA11
    "Adrien Rabiot",        // FRA12
    null,                   // FRA13
    "Michael Olise",        // FRA14
    "Ousmane Dembele",      // FRA15
    "Bradley Barcola",      // FRA16
    "Désiré Doué",          // FRA17
    "Kingsley Coman",       // FRA18
    "Hugo Ekitike",         // FRA19
    "Kylian Mbappé",        // FRA20
  ]},
  { code: "SEN", name: "Senegal", group: "I", flag: "🇸🇳", players: [
    null,                    // SEN1
    "Edouard Mendy",         // SEN2
    "Yehvann Diouf",         // SEN3
    "Moussa Niakhaté",       // SEN4
    "Abdoulaye Seck",        // SEN5
    "Ismail Jakobs",         // SEN6
    "El Hadji Malick Diouf", // SEN7
    "Kalidou Koulibaly",     // SEN8
    "Idrissa Gana Gueye",    // SEN9
    "Pape Matar Sarr",       // SEN10
    "Pape Gueye",            // SEN11
    "Habib Diarra",          // SEN12
    null,                    // SEN13
    "Lamine Camara",         // SEN14
    "Sadio Mane",            // SEN15
    "Ismaïla Sarr",          // SEN16
    "Boulaye Dia",           // SEN17
    "Iliman Ndiaye",         // SEN18
    "Nicolas Jackson",       // SEN19
    "Krepin Diatta",         // SEN20
  ]},
  { code: "NOR", name: "Noruega", group: "I", flag: "🇳🇴", players: [
    null,                        // NOR1
    "Orjan Nyland",              // NOR2
    "Julian Ryerson",            // NOR3
    "Leo Ostigård",              // NOR4
    "Kristoffer Ajer",           // NOR5
    "Marcus Holmgren Pedersen",  // NOR6
    "David Møller Wolfe",        // NOR7
    "Torbjørn Heggem",           // NOR8
    "Morten Thorsby",            // NOR9
    "Martin Ødegaard",           // NOR10
    "Sander Berge",              // NOR11
    "Andreas Schjelderup",       // NOR12
    null,                        // NOR13
    "Patrick Berg",              // NOR14
    "Erling Haaland",            // NOR15
    "Alexander Sørloth",         // NOR16
    "Aron Dønnum",               // NOR17
    "Jørgen Strand Larsen",      // NOR18
    "Antonio Nusa",              // NOR19
    "Oscar Bobb",                // NOR20
  ]},
  { code: "IRQ", name: "Iraque", group: "I", flag: "🇮🇶", players: [
    null,               // IRQ1
    "Jalal Hassan",     // IRQ2
    "Rebin Sulaka",     // IRQ3
    "Hussein Ali",      // IRQ4
    "Akam Hashem",      // IRQ5
    "Merchas Doski",    // IRQ6
    "Zaid Tahseen",     // IRQ7
    "Manaf Younis",     // IRQ8
    "Zidane Iqbal",     // IRQ9
    "Amir Al-Ammari",   // IRQ10
    "Ibrahim Bavesh",   // IRQ11
    "Ali Jasim",        // IRQ12
    null,               // IRQ13
    "Youssef Amyn",     // IRQ14
    "Aimar Sher",       // IRQ15
    "Marko Farji",      // IRQ16
    "Osama Rashid",     // IRQ17
    "Ali Al-Hamadi",    // IRQ18
    "Aymen Hussein",    // IRQ19
    "Mohanad Ali",      // IRQ20
  ]},

  // Grupo J
  { code: "ARG", name: "Argentina", group: "J", flag: "🇦🇷", players: [
    null,                  // ARG1
    "Emiliano Martínez",   // ARG2
    "Nahuel Molina",       // ARG3
    "Cristian Romero",     // ARG4
    "Nicolás Otamendi",    // ARG5
    "Nicolás Tagliafico",  // ARG6
    "Leonardo Balerdi",    // ARG7
    "Enzo Fernández",      // ARG8
    "Alexis Mac Allister", // ARG9
    "Rodrigo De Paul",     // ARG10
    "Exequiel Palacios",   // ARG11
    "Leandro Paredes",     // ARG12
    null,                  // ARG13
    "Nico Paz",            // ARG14
    "Franco Mastantuono",  // ARG15
    "Nico González",       // ARG16
    "Lionel Messi",        // ARG17
    "Lautaro Martínez",    // ARG18
    "Julián Álvarez",      // ARG19
    "Giuliano Simeone",    // ARG20
  ]},
  { code: "AUT", name: "Áustria", group: "J", flag: "🇦🇹", players: [
    null,                   // AUT1
    "Alexander Schlager",   // AUT2
    "Patrick Pentz",        // AUT3
    "David Alaba",          // AUT4
    "Kevin Danso",          // AUT5
    "Philipp Lienhart",     // AUT6
    "Stefan Posch",         // AUT7
    "Phillipp Mwene",       // AUT8
    "Alexander Prass",      // AUT9
    "Xaver Schlager",       // AUT10
    "Marcel Sabitzer",      // AUT11
    "Konrad Laimer",        // AUT12
    null,                   // AUT13
    "Florian Grillitsch",   // AUT14
    "Nicolas Seiwald",      // AUT15
    "Romano Schmid",        // AUT16
    "Patrick Wimmer",       // AUT17
    "Christoph Baumgartner", // AUT18
    "Michael Gregoritsch",  // AUT19
    "Marko Arnautović",     // AUT20
  ]},
  { code: "ALG", name: "Argélia", group: "J", flag: "🇩🇿", players: [
    null,                    // ALG1
    "Alexis Guendouz",       // ALG2
    "Ramy Bensebaini",       // ALG3
    "Youcef Atal",           // ALG4
    "Rayan Aït-Nouri",       // ALG5
    "Mohamed Amine Tougai",  // ALG6
    "Aïssa Mandi",           // ALG7
    "Ismael Bennacer",       // ALG8
    "Houssem Aouar",         // ALG9
    "Hicham Boudaoui",       // ALG10
    "Ramiz Zerrouki",        // ALG11
    "Nabil Bentalab",        // ALG12
    null,                    // ALG13
    "Farés Chaibi",          // ALG14
    "Riyad Mahrez",          // ALG15
    "Said Benrahma",         // ALG16
    "Anis Hadj Moussa",      // ALG17
    "Amine Gouiri",          // ALG18
    "Baghdad Bounedjah",     // ALG19
    "Mohammed Amoura",       // ALG20
  ]},
  { code: "JOR", name: "Jordânia", group: "J", flag: "🇯🇴", players: [
    null,                    // JOR1
    "Yazeed Abulaila",       // JOR2
    "Ihsan Haddad",          // JOR3
    "Mohammad Abu Hashish",  // JOR4
    "Yazan Al-Arab",         // JOR5
    "Abdallah Nasib",        // JOR6
    "Saleem Obaid",          // JOR7
    "Mohammad Abualnadi",    // JOR8
    "Ibrahim Saadeh",        // JOR9
    "Nizar Al-Rashdan",      // JOR10
    "Noor Al-Rawabdeh",      // JOR11
    "Mohannad Abu Taha",     // JOR12
    null,                    // JOR13
    "Amer Jamous",           // JOR14
    "Musa Al-Taamari",       // JOR15
    "Yazan Al-Naimat",       // JOR16
    "Mahmoud Al-Mardi",      // JOR17
    "Ali Olwan",             // JOR18
    "Mohammad Abu Zrayq",    // JOR19
    "Ibrahim Sabra",         // JOR20
  ]},

  // Grupo K
  { code: "POR", name: "Portugal", group: "K", flag: "🇵🇹", players: [
    null,                  // POR1
    "Diogo Costa",         // POR2
    "Jose Sa",             // POR3
    "Ruben Dias",          // POR4
    "João Cancelo",        // POR5
    "Diogo Dalot",         // POR6
    "Nuno Mendes",         // POR7
    "Gonçalo Inácio",      // POR8
    "Bernardo Silva",      // POR9
    "Bruno Fernandes",     // POR10
    "Ruben Neves",         // POR11
    "Vitinha",             // POR12
    null,                  // POR13
    "João Neves",          // POR14
    "Cristiano Ronaldo",   // POR15
    "Francisco Trincão",   // POR16
    "João Félix",          // POR17
    "Gonçalo Ramos",       // POR18
    "Pedro Neto",          // POR19
    "Rafael Leão",         // POR20
  ]},
  { code: "COD", name: "RD Congo", group: "K", flag: "🇨🇩", players: [
    null,                    // COD1
    "Lionel Mpasi",          // COD2
    "Aaron Wan-Bissaka",     // COD3
    "Axel Tuanzebe",         // COD4
    "Arthur Masuaku",        // COD5
    "Chancel Mbemba",        // COD6
    "Joris Kayembe",         // COD7
    "Charles Pickel",        // COD8
    "Ngal'ayel Mukau",       // COD9
    "Edo Kayembe",           // COD10
    "Samuel Moutoussamy",    // COD11
    "Noah Sadiki",           // COD12
    null,                    // COD13
    "Théo Bongonda",         // COD14
    "Meschak Elia",          // COD15
    "Yoane Wissa",           // COD16
    "Brian Cipenga",         // COD17
    "Fiston Mayele",         // COD18
    "Cédric Bakambu",        // COD19
    "Nathanaël Mbuku",       // COD20
  ]},
  { code: "UZB", name: "Uzbequistão", group: "K", flag: "🇺🇿", players: [
    null,                    // UZB1
    "Utkir Yusupov",         // UZB2
    "Farrukh Sayfiev",       // UZB3
    "Sherzod Nasrullaev",    // UZB4
    "Umar Eshmurodov",       // UZB5
    "Husniddin Aliqulov",    // UZB6
    "Rustamjon Ashurmatov",  // UZB7
    "Khojiakbar Alijonov",   // UZB8
    "Abdukodir Khusanov",    // UZB9
    "Odiljon Hamrobekov",    // UZB10
    "Otabek Shukurov",       // UZB11
    "Jamshid Iskanderov",    // UZB12
    null,                    // UZB13
    "Azizbek Turgunboev",    // UZB14
    "Khojimat Erkinov",      // UZB15
    "Eldor Shomurodov",      // UZB16
    "Oston Urunov",          // UZB17
    "Jaloliddin Masharipov", // UZB18
    "Igor Sergeev",          // UZB19
    "Abbosbek Fayzullaev",   // UZB20
  ]},
  { code: "COL", name: "Colômbia", group: "K", flag: "🇨🇴", players: [
    null,                      // COL1
    "Camilo Vargas",           // COL2
    "David Ospina",            // COL3
    "Dávinson Sánchez",        // COL4
    "Yerry Mina",              // COL5
    "Daniel Munoz",            // COL6
    "Johan Mojica",            // COL7
    "Jhon Lucumí",             // COL8
    "Santiago Arias",          // COL9
    "Jefferson Lerma",         // COL10
    "Kevin Castaño",           // COL11
    "Richard Rios",            // COL12
    null,                      // COL13
    "James Rodriguez",         // COL14
    "Juan Fernando Quintero",  // COL15
    "Jorge Carrascal",         // COL16
    "Jon Arias",               // COL17
    "Jhon Cordova",            // COL18
    "Luis Suarez",             // COL19
    "Luis Diaz",               // COL20
  ]},

  // Grupo L
  { code: "ENG", name: "Inglaterra", group: "L", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", players: [
    null,                      // ENG1
    "Jordan Pickford",         // ENG2
    "John Stones",             // ENG3
    "Marc Guéhi",              // ENG4
    "Ezri Konsa",              // ENG5
    "Trent Alexander-Arnold",  // ENG6
    "Reece James",             // ENG7
    "Dan Burn",                // ENG8
    "Jordan Henderson",        // ENG9
    "Declan Rice",             // ENG10
    "Jude Bellingham",         // ENG11
    "Cole Palmer",             // ENG12
    null,                      // ENG13
    "Morgan Rogers",           // ENG14
    "Anthony Gordon",          // ENG15
    "Phil Foden",              // ENG16
    "Bukayo Saka",             // ENG17
    "Harry Kane",              // ENG18
    "Marcus Rashford",         // ENG19
    "Ollie Watkins",           // ENG20
  ]},
  { code: "CRO", name: "Croácia", group: "L", flag: "🇭🇷", players: [
    null,                  // CRO1
    "Dominik Livaković",   // CRO2
    "Duje Caleta-Car",     // CRO3
    "Joško Gvardiol",      // CRO4
    "Josip Stanišić",      // CRO5
    "Luka Vušković",       // CRO6
    "Josip Šutalo",        // CRO7
    "Kristijan Jakić",     // CRO8
    "Luka Modrić",         // CRO9
    "Mateo Kovačić",       // CRO10
    "Martin Baturina",     // CRO11
    "Lovro Majer",         // CRO12
    null,                  // CRO13
    "Mario Pašalić",       // CRO14
    "Petar Sučić",         // CRO15
    "Ivan Perišić",        // CRO16
    "Marco Pašalić",       // CRO17
    "Ante Budimir",        // CRO18
    "Andrej Kramarić",     // CRO19
    "Franjo Ivanović",     // CRO20
  ]},
  { code: "PAN", name: "Panamá", group: "L", flag: "🇵🇦", players: [
    null,                     // PAN1
    "Orlando Mosquera",       // PAN2
    "Luis Mejia",             // PAN3
    "Fidel Escobar",          // PAN4
    "Andres Andrade",         // PAN5
    "Michael Amir Murillo",   // PAN6
    "Eric Davis",             // PAN7
    "Jose Cordoba",           // PAN8
    "Cesar Blackman",         // PAN9
    "Cristian Martinez",      // PAN10
    "Aníbal Godoy",           // PAN11
    "Adalberto Carrasquilla", // PAN12
    null,                     // PAN13
    "Édgar Bárcenas",         // PAN14
    "Carlos Harvey",          // PAN15
    "Ismael Díaz",            // PAN16
    "Jose Fajardo",           // PAN17
    "Cecilio Waterman",       // PAN18
    "Jose Luiz Rodriguez",    // PAN19
    "Alberto Quintero",       // PAN20
  ]},
  { code: "GHA", name: "Gana", group: "L", flag: "🇬🇭", players: [
    null,                    // GHA1
    "Lawrence Ati Zigi",     // GHA2
    "Tariq Lamptey",         // GHA3
    "Mohammed Salisu",       // GHA4
    "Alidu Seidu",           // GHA5
    "Alexander Djiku",       // GHA6
    "Gideon Mensah",         // GHA7
    "Caleb Yirenkyi",        // GHA8
    "Abdul Fatawu Issahaku", // GHA9
    "Thomas Partey",         // GHA10
    "Salis Abdul Samed",     // GHA11
    "Kamaldeen Sulemana",    // GHA12
    null,                    // GHA13
    "Mohammed Kudus",        // GHA14
    "Iñaki Williams",        // GHA15
    "Jordan Ayew",           // GHA16
    "Andre Ayew",            // GHA17
    "Joseph Paintsil",       // GHA18
    "Osman Bukari",          // GHA19
    "Antoine Semenyo",       // GHA20
  ]},

  // Patrocinador (14 figurinhas — jogadores selecionados pela Coca-Cola)
  { code: "COCA", name: "Coca-Cola", flag: "🥤", stickerCount: 14, players: [
    "Lamine Yamal",      // COCA1
    "Gabriel Magalhães", // COCA2
    "Joshua Kimmich",    // COCA3
    "Harry Kane",        // COCA4
    "Santiago Giménez",  // COCA5
    "Joško Gvardiol",    // COCA6
    "Federico Valverde", // COCA7
    "Jefferson Lerma",   // COCA8
    "Enner Valencia",    // COCA9
    "Emiliano Martínez", // COCA10
    "Virgil van Dijk",   // COCA11
    "Alphonso Davies",   // COCA12
    "Raúl Jiménez",      // COCA13
    "Lautaro Martínez",  // COCA14
  ]},

];

export const STICKERS_PER_SECTION = 20;
export const TOTAL_STICKERS = SECTIONS.reduce(
  (acc, s) => acc + (s.stickerCount ?? STICKERS_PER_SECTION), 0
); // 1004

export function getStickerNumber(code: string, i: number): string {
  if (code === "FWC" && i === 1) return "00";
  if (code === "FWC" && i > 1) return String(i - 1).padStart(2, "0");
  return String(i);
}

// Generate all sticker IDs in order
export const getAllStickerIds = (): string[] => {
  const ids: string[] = [];
  for (const section of SECTIONS) {
    const count = section.stickerCount ?? STICKERS_PER_SECTION;
    for (let i = 1; i <= count; i++) {
      ids.push(`${section.code}${getStickerNumber(section.code, i)}`);
    }
  }
  return ids;
};

// Get section for a sticker ID
export const getSectionForSticker = (id: string): TeamSection | undefined => {
  const code = id.replace(/\d+$/, "");
  return SECTIONS.find((s) => s.code === code);
};

// Get player name for a sticker ID (e.g. "BRA5" → "Éder Militão")
export const getPlayerName = (id: string): string | undefined => {
  const section = getSectionForSticker(id);
  if (!section?.players) return undefined;
  const numStr = id.replace(/^[A-Z]+/, "");
  if (numStr === "00") return section.players[section.players.length - 1] ?? undefined;
  const num = parseInt(numStr, 10);
  if (isNaN(num) || num < 1) return undefined;
  return section.players[num - 1] ?? undefined;
};

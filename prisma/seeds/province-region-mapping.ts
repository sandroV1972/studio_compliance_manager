import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Mappatura completa di tutte le 107 province italiane alle 20 regioni
 * Fonte: ISTAT - Codici delle province italiane
 */
export const provinceRegionData = [
  // VALLE D'AOSTA
  { provinceCode: "AO", provinceName: "Aosta", regionName: "Valle d'Aosta" },

  // PIEMONTE
  { provinceCode: "AL", provinceName: "Alessandria", regionName: "Piemonte" },
  { provinceCode: "AT", provinceName: "Asti", regionName: "Piemonte" },
  { provinceCode: "BI", provinceName: "Biella", regionName: "Piemonte" },
  { provinceCode: "CN", provinceName: "Cuneo", regionName: "Piemonte" },
  { provinceCode: "NO", provinceName: "Novara", regionName: "Piemonte" },
  { provinceCode: "TO", provinceName: "Torino", regionName: "Piemonte" },
  {
    provinceCode: "VB",
    provinceName: "Verbano-Cusio-Ossola",
    regionName: "Piemonte",
  },
  { provinceCode: "VC", provinceName: "Vercelli", regionName: "Piemonte" },

  // LOMBARDIA
  { provinceCode: "BG", provinceName: "Bergamo", regionName: "Lombardia" },
  { provinceCode: "BS", provinceName: "Brescia", regionName: "Lombardia" },
  { provinceCode: "CO", provinceName: "Como", regionName: "Lombardia" },
  { provinceCode: "CR", provinceName: "Cremona", regionName: "Lombardia" },
  { provinceCode: "LC", provinceName: "Lecco", regionName: "Lombardia" },
  { provinceCode: "LO", provinceName: "Lodi", regionName: "Lombardia" },
  { provinceCode: "MN", provinceName: "Mantova", regionName: "Lombardia" },
  { provinceCode: "MI", provinceName: "Milano", regionName: "Lombardia" },
  {
    provinceCode: "MB",
    provinceName: "Monza e Brianza",
    regionName: "Lombardia",
  },
  { provinceCode: "PV", provinceName: "Pavia", regionName: "Lombardia" },
  { provinceCode: "SO", provinceName: "Sondrio", regionName: "Lombardia" },
  { provinceCode: "VA", provinceName: "Varese", regionName: "Lombardia" },

  // TRENTINO-ALTO ADIGE
  {
    provinceCode: "BZ",
    provinceName: "Bolzano",
    regionName: "Trentino-Alto Adige",
  },
  {
    provinceCode: "TN",
    provinceName: "Trento",
    regionName: "Trentino-Alto Adige",
  },

  // VENETO
  { provinceCode: "BL", provinceName: "Belluno", regionName: "Veneto" },
  { provinceCode: "PD", provinceName: "Padova", regionName: "Veneto" },
  { provinceCode: "RO", provinceName: "Rovigo", regionName: "Veneto" },
  { provinceCode: "TV", provinceName: "Treviso", regionName: "Veneto" },
  { provinceCode: "VE", provinceName: "Venezia", regionName: "Veneto" },
  { provinceCode: "VR", provinceName: "Verona", regionName: "Veneto" },
  { provinceCode: "VI", provinceName: "Vicenza", regionName: "Veneto" },

  // FRIULI-VENEZIA GIULIA
  {
    provinceCode: "GO",
    provinceName: "Gorizia",
    regionName: "Friuli-Venezia Giulia",
  },
  {
    provinceCode: "PN",
    provinceName: "Pordenone",
    regionName: "Friuli-Venezia Giulia",
  },
  {
    provinceCode: "TS",
    provinceName: "Trieste",
    regionName: "Friuli-Venezia Giulia",
  },
  {
    provinceCode: "UD",
    provinceName: "Udine",
    regionName: "Friuli-Venezia Giulia",
  },

  // LIGURIA
  { provinceCode: "GE", provinceName: "Genova", regionName: "Liguria" },
  { provinceCode: "IM", provinceName: "Imperia", regionName: "Liguria" },
  { provinceCode: "SP", provinceName: "La Spezia", regionName: "Liguria" },
  { provinceCode: "SV", provinceName: "Savona", regionName: "Liguria" },

  // EMILIA-ROMAGNA
  { provinceCode: "BO", provinceName: "Bologna", regionName: "Emilia-Romagna" },
  { provinceCode: "FE", provinceName: "Ferrara", regionName: "Emilia-Romagna" },
  {
    provinceCode: "FC",
    provinceName: "Forlì-Cesena",
    regionName: "Emilia-Romagna",
  },
  { provinceCode: "MO", provinceName: "Modena", regionName: "Emilia-Romagna" },
  { provinceCode: "PR", provinceName: "Parma", regionName: "Emilia-Romagna" },
  {
    provinceCode: "PC",
    provinceName: "Piacenza",
    regionName: "Emilia-Romagna",
  },
  { provinceCode: "RA", provinceName: "Ravenna", regionName: "Emilia-Romagna" },
  {
    provinceCode: "RE",
    provinceName: "Reggio Emilia",
    regionName: "Emilia-Romagna",
  },
  { provinceCode: "RN", provinceName: "Rimini", regionName: "Emilia-Romagna" },

  // TOSCANA
  { provinceCode: "AR", provinceName: "Arezzo", regionName: "Toscana" },
  { provinceCode: "FI", provinceName: "Firenze", regionName: "Toscana" },
  { provinceCode: "GR", provinceName: "Grosseto", regionName: "Toscana" },
  { provinceCode: "LI", provinceName: "Livorno", regionName: "Toscana" },
  { provinceCode: "LU", provinceName: "Lucca", regionName: "Toscana" },
  { provinceCode: "MS", provinceName: "Massa-Carrara", regionName: "Toscana" },
  { provinceCode: "PI", provinceName: "Pisa", regionName: "Toscana" },
  { provinceCode: "PT", provinceName: "Pistoia", regionName: "Toscana" },
  { provinceCode: "PO", provinceName: "Prato", regionName: "Toscana" },
  { provinceCode: "SI", provinceName: "Siena", regionName: "Toscana" },

  // UMBRIA
  { provinceCode: "PG", provinceName: "Perugia", regionName: "Umbria" },
  { provinceCode: "TR", provinceName: "Terni", regionName: "Umbria" },

  // MARCHE
  { provinceCode: "AN", provinceName: "Ancona", regionName: "Marche" },
  { provinceCode: "AP", provinceName: "Ascoli Piceno", regionName: "Marche" },
  { provinceCode: "FM", provinceName: "Fermo", regionName: "Marche" },
  { provinceCode: "MC", provinceName: "Macerata", regionName: "Marche" },
  { provinceCode: "PU", provinceName: "Pesaro e Urbino", regionName: "Marche" },

  // LAZIO
  { provinceCode: "FR", provinceName: "Frosinone", regionName: "Lazio" },
  { provinceCode: "LT", provinceName: "Latina", regionName: "Lazio" },
  { provinceCode: "RI", provinceName: "Rieti", regionName: "Lazio" },
  { provinceCode: "RM", provinceName: "Roma", regionName: "Lazio" },
  { provinceCode: "VT", provinceName: "Viterbo", regionName: "Lazio" },

  // ABRUZZO
  { provinceCode: "AQ", provinceName: "L'Aquila", regionName: "Abruzzo" },
  { provinceCode: "CH", provinceName: "Chieti", regionName: "Abruzzo" },
  { provinceCode: "PE", provinceName: "Pescara", regionName: "Abruzzo" },
  { provinceCode: "TE", provinceName: "Teramo", regionName: "Abruzzo" },

  // MOLISE
  { provinceCode: "CB", provinceName: "Campobasso", regionName: "Molise" },
  { provinceCode: "IS", provinceName: "Isernia", regionName: "Molise" },

  // CAMPANIA
  { provinceCode: "AV", provinceName: "Avellino", regionName: "Campania" },
  { provinceCode: "BN", provinceName: "Benevento", regionName: "Campania" },
  { provinceCode: "CE", provinceName: "Caserta", regionName: "Campania" },
  { provinceCode: "NA", provinceName: "Napoli", regionName: "Campania" },
  { provinceCode: "SA", provinceName: "Salerno", regionName: "Campania" },

  // PUGLIA
  { provinceCode: "BA", provinceName: "Bari", regionName: "Puglia" },
  {
    provinceCode: "BT",
    provinceName: "Barletta-Andria-Trani",
    regionName: "Puglia",
  },
  { provinceCode: "BR", provinceName: "Brindisi", regionName: "Puglia" },
  { provinceCode: "FG", provinceName: "Foggia", regionName: "Puglia" },
  { provinceCode: "LE", provinceName: "Lecce", regionName: "Puglia" },
  { provinceCode: "TA", provinceName: "Taranto", regionName: "Puglia" },

  // BASILICATA
  { provinceCode: "MT", provinceName: "Matera", regionName: "Basilicata" },
  { provinceCode: "PZ", provinceName: "Potenza", regionName: "Basilicata" },

  // CALABRIA
  { provinceCode: "CZ", provinceName: "Catanzaro", regionName: "Calabria" },
  { provinceCode: "CS", provinceName: "Cosenza", regionName: "Calabria" },
  { provinceCode: "KR", provinceName: "Crotone", regionName: "Calabria" },
  {
    provinceCode: "RC",
    provinceName: "Reggio Calabria",
    regionName: "Calabria",
  },
  { provinceCode: "VV", provinceName: "Vibo Valentia", regionName: "Calabria" },

  // SICILIA
  { provinceCode: "AG", provinceName: "Agrigento", regionName: "Sicilia" },
  { provinceCode: "CL", provinceName: "Caltanissetta", regionName: "Sicilia" },
  { provinceCode: "CT", provinceName: "Catania", regionName: "Sicilia" },
  { provinceCode: "EN", provinceName: "Enna", regionName: "Sicilia" },
  { provinceCode: "ME", provinceName: "Messina", regionName: "Sicilia" },
  { provinceCode: "PA", provinceName: "Palermo", regionName: "Sicilia" },
  { provinceCode: "RG", provinceName: "Ragusa", regionName: "Sicilia" },
  { provinceCode: "SR", provinceName: "Siracusa", regionName: "Sicilia" },
  { provinceCode: "TP", provinceName: "Trapani", regionName: "Sicilia" },

  // SARDEGNA
  { provinceCode: "CA", provinceName: "Cagliari", regionName: "Sardegna" },
  {
    provinceCode: "CI",
    provinceName: "Carbonia-Iglesias",
    regionName: "Sardegna",
  },
  { provinceCode: "NU", provinceName: "Nuoro", regionName: "Sardegna" },
  { provinceCode: "OG", provinceName: "Ogliastra", regionName: "Sardegna" },
  { provinceCode: "OR", provinceName: "Oristano", regionName: "Sardegna" },
  { provinceCode: "OT", provinceName: "Olbia-Tempio", regionName: "Sardegna" },
  { provinceCode: "SS", provinceName: "Sassari", regionName: "Sardegna" },
  {
    provinceCode: "VS",
    provinceName: "Medio Campidano",
    regionName: "Sardegna",
  },
  { provinceCode: "SU", provinceName: "Sud Sardegna", regionName: "Sardegna" },
];

export async function seedProvinceRegionMapping() {
  console.log("🗺️  Seeding province-region mapping...");

  for (const mapping of provinceRegionData) {
    await prisma.provinceRegionMapping.upsert({
      where: { provinceCode: mapping.provinceCode },
      update: {
        provinceName: mapping.provinceName,
        regionName: mapping.regionName,
      },
      create: {
        provinceCode: mapping.provinceCode,
        provinceName: mapping.provinceName,
        regionName: mapping.regionName,
        country: "IT",
      },
    });
  }

  console.log(
    `✅ Seeded ${provinceRegionData.length} province-region mappings`,
  );
}

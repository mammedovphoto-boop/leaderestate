// Настройки агентства. Всё, что может поменяться, лежит здесь.
export const CONFIG = {
  name: "Leader Estate",
  // Номер агентства: звонки, SMS и WhatsApp. Взят из профиля Instagram @leader_estate.tm.
  phone: "+99364896646",
  phoneDisplay: "+993 64 89 66 46",
  whatsapp: "99364896646",
  instagram: "leader_estate.tm",
  siteUrl: "https://leaderestate.pages.dev",
  defaultLang: "ru", // ru | tm | en
  langs: ["ru", "tm", "en"],
  currencies: ["TMT", "USD"],
  // Районы для выбора в заявке. id не менять, названия можно править и дополнять.
  districts: [
    { group: "g_etrap", items: [
      { id: "bagtyyarlyk", ru: "Багтыярлык этрап", tm: "Bagtyýarlyk etraby", en: "Bagtyyarlyk district" },
      { id: "berkararlyk", ru: "Беркарарлык этрап", tm: "Berkararlyk etraby", en: "Berkararlyk district" },
      { id: "buzmeyin", ru: "Бузмеин этрап", tm: "Büzmeýin etraby", en: "Buzmeyin district" },
      { id: "kopetdag", ru: "Копетдаг этрап", tm: "Köpetdag etraby", en: "Kopetdag district" },
    ]},
    { group: "g_mkr", items: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 30].map((n) => (
      { id: "mkr" + n, ru: n + " микрорайон", tm: n + "-nji mikroraýon".replace("nji", [6, 9, 10, 30].includes(n) ? "njy" : "nji"), en: "Microdistrict " + n }
    ))},
    { group: "g_parahat", items: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
      { id: "parahat" + n, ru: `Парахат ${n} (Мир ${n})`, tm: `Parahat ${n} (Mir ${n})`, en: `Parahat ${n} (Mir ${n})` }
    ))},
    { group: "g_gaudan", items: [
      { id: "gaudan_a", ru: "Гаудан А", tm: "Gaudan A", en: "Gaudan A" },
      { id: "gaudan_b", ru: "Гаудан Б", tm: "Gaudan B", en: "Gaudan B" },
      { id: "gaudan_w", ru: "Гаудан В", tm: "Gaudan W", en: "Gaudan V" },
    ]},
    { group: "g_city", items: [
      { id: "center", ru: "Центр города", tm: "Şäheriň merkezi", en: "City centre" },
      { id: "hitrowka", ru: "Хитровка", tm: "Hitrowka", en: "Hitrovka" },
      { id: "tazezaman", ru: "Тязе заман", tm: "Täze zaman", en: "Taze Zaman" },
      { id: "choganly", ru: "Чоганлы", tm: "Çoganly", en: "Choganly" },
      { id: "koshi", ru: "Кёши", tm: "Köşi", en: "Koshi" },
      { id: "gurtly", ru: "Гуртлы", tm: "Gurtly", en: "Gurtly" },
      { id: "bekrewe", ru: "Бекреве", tm: "Bekrewe", en: "Bekrewe" },
      { id: "berzengi", ru: "Берзенги", tm: "Berzeňňi", en: "Berzengi" },
      { id: "bagyr", ru: "Багир", tm: "Bagyr", en: "Bagyr" },
      { id: "garadamak", ru: "Гарадамак", tm: "Garadamak", en: "Garadamak" },
      { id: "olympic", ru: "Олимпийский городок", tm: "Olimpiýa şäherçesi", en: "Olympic Village" },
      { id: "airport", ru: "Район аэропорта", tm: "Howa menziliniň töweregi", en: "Airport area" },
    ]},
    { group: "g_suburb", items: [
      { id: "anew", ru: "Аннау", tm: "Änew", en: "Anau" },
      { id: "arkadag", ru: "Аркадаг", tm: "Arkadag şäheri", en: "Arkadag city" },
      { id: "gokdepe", ru: "Гёкдепе", tm: "Gökdepe", en: "Gokdepe" },
      { id: "akbugday", ru: "Ак бугдай этрап", tm: "Ak bugdaý etraby", en: "Ak Bugday district" },
    ]},
  ],
};

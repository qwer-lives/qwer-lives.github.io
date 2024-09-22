var locale = "ko";

const supportedLocales = ["en", "ko"];

const translations = {
    "en": {
        "last_updated": "Last updated",
        "livestracker": "Livestreams Tracker",
        "members": "Members",
        "chodan": "Chodan",
        "magenta": "Magenta",
        "hina": "Hina",
        "siyeon": "Siyeon",
        "chodan_filter": "Q",
        "magenta_filter": "W",
        "hina_filter": "E",
        "siyeon_filter": "R",
        "hapbang": "Hapbang/ft.",
        "multiple": "Multiple",
        "charmingjo": "CharmingJo",
        "honeychurros": "Honeychurros",
        "chimchakman": "Chimchakman",
        "kimgyeran": "KimGyeran",
        "zoodasa": "Zoodasa",
        "parkppippi": "ParkPpiPpi",
        "moonwol": "Moonwol",
        "yomi": "Yomi",
        "jinjalim": "Jinjalim",
        "raon": "Raon",
        "coomo": "Coomo",
        "ashb": "AshB",
        "eunjipyo": "EunjiPyo",
        "needmorecash": "Needmorecash",
        "158mcm": "158mcm",
        "neo": "Neo",
        "fivek": "FiveK",
        "hangang": "Hangang",
        "panibottle": "PaniBottle",
        "jinyongjin": "JinYongJin",
        "sezero": "SeZero",
        "kaogaii": "Kaogaii",
        "yuukakato": "YuukaKato",
        "maedareiko": "MaedaReiko",
        "aikasatsuki": "AikaSatsuki",
        "anjumanabe": "AnjuManabe",
        "yuinadeguchi": "YuinaDeguchi",
        "wakanasumino": "WakanaSumino",
        "asaomomoka": "AsaoMomoka",
        "wadamiyu": "WadaMiyu",
        "misakiyoshino": "MisakiYoshino",
        "ayakasakurada": "AyakaSakurada",
        "chihirokawakami": "ChihiroKawakami",
        "yukinotanaka": "YukinoTanaka",
        "friend": "Friend",
        "links_filter": "Links",
        "link_public": "Public",
        "private": "Private",
        "link_missing": "Missing",
        "field_title": "Title",
        "field_members": "Mem",
        "field_people": "People",
        "field_start_time": "Start time",
        "field_duration": "Duration",
        "field_platform": "Platform",
        "field_link": "Link",
        "twitch": "Twitch",
        "datatwitch": "DataTwitch",
        "instagram": "Instagram",
        "weverse": "Weverse",
        "youtube": "YouTube",
        "qweryoutube": "QWERYouTube",
        "zenflix": "Zenflix",
        "chzzk": "Chzzk",
        "tv": "TV",
        "showroom": "Showroom",
    },
    "ko": {
        "last_updated": "최근 수정일",
        "livestracker": "라방 목록",
        "members": "멤버",
        "chodan": "쵸단",
        "magenta": "마젠타",
        "hina": "히나",
        "siyeon": "시연",
        "chodan_filter": "쵸단",
        "magenta_filter": "마젠타",
        "hina_filter": "히나",
        "siyeon_filter": "시연",
        "hapbang": '합방/ft.',
        "multiple": "Multiple",
        "charmingjo": "조매력",
        "honeychurros": "허니츄러스",
        "chimchakman": "침착맨",
        "kimgyeran": "김계란",
        "zoodasa": "주다사",
        "parkppippi": "박삐삐",
        "moonwol": "문월",
        "yomi": "요미냥",
        "jinjalim": "진자림",
        "raon": "라온",
        "coomo": "쿠모",
        "ashb": "애쉬비",
        "eunjipyo": "표은지",
        "needmorecash": "닛몰캐쉬",
        "158mcm": "일오팔",
        "neo": "네오",
        "fivek": "손오천",
        "hangang": "한갱",
        "panibottle": "빠니보틀",
        "jinyongjin": "진용진",
        "sezero": "세제로",
        "kaogaii": "가오가이",
        "yuukakato": "加藤夕夏",
        "maedareiko": "前田令子",
        "aikasatsuki": "佐月愛果",
        "anjumanabe": "眞鍋杏樹",
        "yuinadeguchi": "出口結菜",
        "wakanasumino": "隅野和奏",
        "asaomomoka": "浅尾桃香",
        "wadamiyu": "和田海佑",
        "misakiyoshino": "芳野心咲",
        "ayakasakurada": "桜田彩叶",
        "chihirokawakami": "川上千尋",
        "yukinotanaka": "田中雪乃",
        "friend": "친구",
        "links_filter": "링크",
        "link_public": "공개",
        "private": "비공개",
        "link_missing": "없음",
        "field_title": "제목",
        "field_members": "멤버",
        "field_people": "출연",
        "field_start_time": "시간",
        "field_duration": "기간",
        "field_platform": "플랫폼",
        "field_link": "링크",
        "twitch": "트위치",
        "datatwitch": "DataTwitch",
        "instagram": "인스타그램",
        "weverse": "위버스",
        "youtube": "유튜브",
        "qweryoutube": "공식 유튜브",
        "zenflix": "젠플릭스",
        "chzzk": "치지직",
        "tv": "TV",
        "showroom": "쇼룸",
    }
};

function translateKey(key) {
    value = translations[locale][key.toString().toLowerCase()];
    if (!value) {
        console.log("Translation not found: " + locale + " - " + key);
    }
    return value;
}

function translateElement(element) {
    const key = element.getAttribute("data-i18n-key");
    const translation = translateKey(key);
    element.innerText = translation;
}

function translatePage() {
    document.querySelectorAll("[data-i18n-key]").forEach(translateElement);
}

function changeLocale(loc) {
    locale = loc;
    document.querySelector("#lang_select_ko").classList.toggle("lang_select_on", (locale == "ko"));
    document.querySelector("#lang_select_ko").classList.toggle("lang_select_off", (locale != "ko"));
    document.querySelector("#lang_select_en").classList.toggle("lang_select_on", (locale == "en"));
    document.querySelector("#lang_select_en").classList.toggle("lang_select_off", (locale != "en"));
    translatePage();
}

function initializeUserLocale() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var userLocale = urlParams.get('locale');
    if (!userLocale) {
        locales = navigator.languages.map((loc) => loc.split("-")[0]);
        if (locales.length > 0 && supportedLocales.includes(locales[0])) {
            userLocale = locales[0];
        }
    }
    if (!userLocale) {
        userLocale = "ko";
    }
    changeLocale(userLocale);
}


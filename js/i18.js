var locale = "kr";

const supportedLocales = ["en", "kr"];

const translations = {
    "en": {
        "last_updated": "Last updated",
        "members": "Members",
        "chodan": "Chodan",
        "magenta": "Magenta",
        "hina": "Hina",
        "siyeon": "Siyeon",
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
        "ashb": "AshB",
        "eunjipyo": "EunjiPyo",
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
        "chhzk": "Chzzk",
        "tv": "TV",
        "showroom": "Showroom",
    },
    "kr": {
        "last_updated": "최근 수정일",
        "members": "멤버",
        "chodan": "쵸단",
        "magenta": "마젠타",
        "hina": "히나",
        "siyeon": "시연",
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
        "ashb": "애쉬비",
        "eunjipyo": "표은지",
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
        "chhzk": "치지직",
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
    document.querySelector("#lang_select_kr").classList.toggle("lang_select_on", (locale == "kr"));
    document.querySelector("#lang_select_kr").classList.toggle("lang_select_off", (locale != "kr"));
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
        userLocale = "en";
    }
    changeLocale(userLocale);
}


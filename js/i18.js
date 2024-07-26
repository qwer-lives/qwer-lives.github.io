var locale = "kr";

const translations = {
    "en": {
        "last_updated": "Last updated: ",
        "members": "Members:",
        "chodan": "Chodan",
        "magenta": "Magenta",
        "hina": "Hina",
        "siyeon": "Siyeon",
        "hapbang": "Hapbang/ft.",
        "multiple": "Multiple",
        "links_filter": "Link:",
        "link_all": "All",
        "link_private": "Only private",
        "link_public": "Only public",
    },
    "kr": {
        "last_updated": "Last updated: ",
        "members": "멤버:",
        "chodan": "쵸단",
        "magenta": "마젠타",
        "hina": "히나",
        "siyeon": "시연",
        "hapbang": '합방/ft.',
        "multiple": "Multiple",
        "links_filter": "링크:",
        "link_all": "All",
        "link_private": "Only private",
        "link_public": "Only public",
    }
};

function translateElement(element) {
  const key = element.getAttribute("data-i18n-key");
  const translation = translations[locale][key];
  console.log(translation);
  element.innerText = translation;
}

function translatePage() {
  document.querySelectorAll("[data-i18n-key]").forEach(translateElement);
}

//document.addEventListener("DOMContentLoaded", translatePage);

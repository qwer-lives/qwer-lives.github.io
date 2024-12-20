const membersInfo = {
    chodan: {
        value: 0,
        color: "#e6e3d5",
    },
    magenta: {
        value: 1,
        color: "#fc28fc",
    },
    hina: {
        value: 2,
        color: "dodgerblue",
    },
    siyeon: {
        value: 3,
        color: "lime",
    },
};
const linkPlatforms = ["chzzk", "instagram", "weverse"];
const maxYear = 2024;
const minYear = 2017;

var chart = null;
var selectedPath = null;
var hapbangValue = null;
var customColorScale = null;
var showVideoInfo = false;
var currentYear = 2024;


function prevPage() {
    if (currentYear - 2 >= minYear) {
        currentYear -= 2;
        updateChart();
    }
}

function nextPage() {
    if (currentYear + 2 <= maxYear) {
        currentYear += 2;
        updateChart();
    }
}

function getTranslatedSpan(key, extra="") {
    i18key = key.toLowerCase().replace(/ /g,"_");
    i18val = translateKey(i18key);
    return "<span " + extra + " data-i18n-key='" + i18key + "'>" + i18val + "</span>";
}

function getPlatformFromLink(link) {
    for (let platform of linkPlatforms) {
        if (link.includes(platform)) {
            return platform;
        }
    }
    return "youtube";
}

function getViewDiv(elemData, divClass) {
    var text = "<div class='" + divClass + "'>"
    // Thumbnail
    tPath = "thumbs/missing.jpg";
    tWidth = 290;
    tHeight = 175;
    if (elemData["thumbnail"]) {
        tPath = elemData["thumbnail"][0];
        tWidth = elemData["thumbnail"][1];
        tHeight = elemData["thumbnail"][2];
    }
    text += "<div align='center'><img src='" + tPath + "' ";
    text += "width='" + tWidth + "' height='" + tHeight + "'/></div>";
    text += "<div class='fields_container'>";
    // Members and title
    text += "<div class='field_members_title'>";
    const membersValue = elemData["members"];
    for (let i = 0; i < membersValue.length; ++i) {
        if (i > 0) {
            text += "<span> </span>";
        }
        name = membersValue[i].toLowerCase();
        color = membersInfo[name].color;
        colorProperty = "style='color:" + color + "'";
        text += getTranslatedSpan(membersValue[i] + "_filter", colorProperty);
    }
    if ("title" in elemData) {
        text += "<div class='field_title'>" + elemData["title"] + "</div>";
    }
    text += "</div>";
    // Start time and duration
    timeElems = [];
    if ("start time" in elemData) {
        timeElems.push(["start time", elemData["start time"]]);
    }
    if ("duration" in elemData) {
        timeElems.push(["duration", elemData["duration"]]);
    }
    if (timeElems.length > 0) {
        text += "<div class='field_leftright'>";
        for (let i = 0; i < timeElems.length; ++i) {
            translatedSpan = getTranslatedSpan("field_" + timeElems[i][0]);
            text += (i == 0) ? "<div class='field_left'>" : "<div class='field_right'>";
            text += getTranslatedSpan("field_" + timeElems[i][0]) + "<span>: </span><span>" + timeElems[i][1] + "</span>"
            if (timeElems[i][0] == "start time" && elemData["extra day"]) {
                text += "<span class='extra_day'> +1</span>";
            }
            text += "</div>";
        }
        text += "</div>"
    }
    // Other fields
    const fieldsToIgnore = ["thumbnail", "account", "train", "members", "title",
                            "duration", "start time", "extra day", "platform", "link"];
    firstElem = true;
    text += "<div class='other_fields'>";
    for (const [j, [key, value]] of Object.entries(Object.entries(elemData))) {
        if (fieldsToIgnore.includes(key) || (!showVideoInfo && key == "quality")) {
            continue;
        }
        if (firstElem) {
            firstElem = false;
        } else {
            text += "<br>";
        }
        text += getTranslatedSpan("field_" + key) + "<span>: </span>";
        if (key == "people") {
            for (let i = 0; i < value.length; ++i) {
                if (i > 0) {
                    text += "<span>, </span>";
                }
                text += getTranslatedSpan(value[i]);
            }
        } else {
            text += '<span>' + value + '</span>';
        }
    }
    text += "</div>";
    // Platform and link
    text += "<div class='field_leftright'>";
    text += "<div class='field_left'>" + getTranslatedSpan(elemData["platform"]);
    if (elemData["account"]) {
        const account = elemData["account"];
        color = membersInfo[account.toLowerCase()].color;
        colorProperty = "style='color:" + color + "; font-weight: bold'";
        text += "<span> (</span>" + getTranslatedSpan(account + "_filter", colorProperty) + "<span>)</span>";
    }
    text += "</div>";
    if ("link" in elemData) {
        text += "<div class='field_right'>";
        value = elemData["link"];
        if (value.startsWith("http")) {
            platform = elemData["platform"].toLowerCase();
            normalizedPlatform = getPlatformFromLink(value);
            iconPath = "icons/" + normalizedPlatform + ".svg";
            text += "<a class='out_link' target='_blank' href='" + value + "'>" + getTranslatedSpan("field_link");
            text += "<img class='platform_icon' src='" + iconPath + "'></a>";
        } else {
            text += getTranslatedSpan(value);
        }
        text += "</div>";
    }
    text += "</div></div></div>"
    return text;
}

function buildChart() {
    if (chart) {
        return;
    }
    
    chart = anychart.calendar();
    chart.contextMenu(false);
    chart.background("#22282D");
    chart.colorScale(customColorScale);
    chart.colorRange(false)
    
    const stroke = {
        keys: ["0 rgba(155,5,0,0.8)", "1 rgba(255,215,1)"],
        lineJoin: "round",
        angle: 45,
        thickness: 3,
    };
    
    chart.months()
        .stroke("#474747")
        .noDataStroke("#474747");
    chart.days()
        .spacing(4)
        .stroke(function() {
            return false;
            //return this.value >= hapbangValue ? stroke : false;
        })
        .noDataStroke(false)
        .noDataFill("#2d333b")
        .noDataHatchFill(false)
        .hovered()
            .fill({color: "black", opacity: 0.3})
            .stroke({color: '#dfdfdf', thickness: 2});
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        chart.tooltip(false);
    } else {
        chart.tooltip().allowLeaveStage(true).position("left-top").useHtml(true).format(function() {
            var text = "";
            text += "<div class='info_tooltip'>";
            var columns = [];
            if (this.getData("elems").length == 4) {
                columns = [[0,1],[2,3]];
            } else {
                let col = [];
                for (let i = 0; i < this.getData("elems").length; ++i) {
                    col.push(i);
                    if (col.length == 3) {
                        columns.push(col);
                        col = [];
                    }
                }
                if (col.length > 0) {
                    columns.push(col);
                }
            }
            for (let i = 0; i < columns.length; i++) {
                if (i > 0) {
                    text += "<div class='info_tooltip_column_separator'></div>";
                }
                text += "<div class='info_tooltip_column'>";
                for (let j = 0; j < columns[i].length; ++j) {
                    if (j > 0) {
                        text += "<hr noshade='true' class='anychart-tooltip-separator'>"
                    }
                    let ind = columns[i][j];
                    text += getViewDiv(this.getData("elems")[ind], "tooltip_elem");
                }
                text += "</div>";
            }
            text += "</div>"
            return text;
        });
    }
    
    chart.listen("pointClick", function(e) {
        const row = chart.data().row(e.dataIndex);
        if (!row) {
            // Weird but happens
            return;
        }
        
        if (selectedPath != null) {
            selectedPath.setAttribute("stroke", "none");
        }
        const elemId = e.originalEvent.getOriginalEvent().target.he
        selectedPath = document.getElementById(elemId);
        
        selectedPath.setAttribute("stroke", "#dfdfdf");
        selectedPath.setAttribute("stroke-width", "2");
        
        dateString = row['x'];
        var elemDate = document.getElementById("elem_date");
        elemDate.innerHTML = dateString;
      
        const elems = row["elems"];
        var htmlContent = '';
        for (let i = 0; i < elems.length; i++) {
            htmlContent += getViewDiv(elems[i], "info_elem");
        }
        document.getElementById("sep_before_info").style.visibility = 'visible';
        document.getElementById("elem_info_container").innerHTML = htmlContent;
    });

    chart.listen("chartDraw", function() {
        document.getElementById("container").style.height = (chart.getActualHeight() + 20) + "px";
        credits = document.querySelector(".anychart-credits");
        if (credits) {
            credits.remove();
        }
    });
    chart.container("container");
    chart.draw();
}

function updateChart() {
    if (selectedPath != null) {
        selectedPath.setAttribute("stroke", "none");
        selectedPath = null;
    }
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const trainMode = document.getElementById('train_mode_box').checked;
    const smartDatesMode = document.getElementById('smart_dates_box').checked;
    showVideoInfo = document.getElementById('video_info_box').checked;
    const hapbangOnlyMode = document.getElementById('hapbang_only_box').checked;
    const intersectMembers = document.getElementById('intersect_members_box').checked;
    
    const linkCheckboxes = document.querySelectorAll('.link_check:checked');
    const selectedLinks = [...linkCheckboxes].map(e => (e.getAttribute('value')));
    const memberCheckboxes = document.querySelectorAll('.member_check:checked');
    const selectedMembers = [...memberCheckboxes].map(e => (e.getAttribute('value')));
    const accountCheckboxes = document.querySelectorAll('.account_check:checked');
    const selectedAccounts = [...accountCheckboxes].map(e => (e.getAttribute('value')));
    
    const leftYear = currentYear-1;
    document.getElementById('years_indicator_div').textContent = leftYear + " ~ " + currentYear;
    filteredData = Object.fromEntries(Object.entries(fullData).filter(([date]) => {
        const intDate = parseInt(date.substring(0, 4));
        return leftYear <= intDate && intDate <= currentYear
    }));
    countPerYear = {};
    for (let i = leftYear; i <= currentYear; ++i) {
        countPerYear[i.toString()] = 0;
    }

    transformedData = {};
    if (!smartDatesMode) {
        transformedData = filteredData;
    } else {
        for (const [date, row] of Object.entries(filteredData)) {
            for (let elem of row) {
                transformedDate = date;
                transformedElem = elem;
                if (elem["start time"] && elem["start time"].substring(0, 2) < "05") {
                    dateObject = new Date(Date.parse(date));
                    dateObject = new Date(dateObject.getTime() - (24 * 60 * 60 * 1000));
                    transformedDate = dateObject.toISOString().split('T')[0];
                    transformedElem = {...elem};
                    transformedElem["extra day"] = true;
                }
                if (!(transformedDate in transformedData)) {
                    transformedData[transformedDate] = [];
                }
                transformedData[transformedDate].push(transformedElem);
            }
        }
    }
    
    var data = [];
    for (const [date, row] of Object.entries(transformedData)) {
        var goodElems = row.filter(elem => {
            const hasPublicLink = (elem["link"] && elem["link"].startsWith("http"));
            const hasPrivateLink = (elem["link"] && elem["link"].startsWith("Private"));
            if (!elem["link"] && !selectedLinks.includes("Missing")) {
                return false;
            } 
            if (hasPrivateLink && !selectedLinks.includes("Private")) {
                return false;
            } 
            if (hasPublicLink && !selectedLinks.includes("Public")) {
                return false;
            }
            if (trainMode && elem["train"] == "False") {
                return false;
            }
            platformKey = elem["platform"].toLowerCase();
            platformChecked = document.getElementById("platform_" + platformKey + "_box").checked;
            if (!platformChecked) {
                return false;
            }
            accountKey = elem["account"] ?? "Other"
            if (!selectedAccounts.includes(accountKey)) {
                return false;
            }
            const hapbang = (elem["members"].length > 1 || ("people" in elem && elem["people"].length > 0));
            if (hapbangOnlyMode && !hapbang) {
                return false;
            }
            if (intersectMembers) {
                for (let mem of selectedMembers) {
                    if (!elem["members"].includes(mem)) {
                        return false;
                    }
                }
                return true;
            } else {
                for (let mem of elem["members"]) {
                    if (selectedMembers.includes(mem)) {
                        return true;
                    }
                }
                return false;
            }
        });
        if (goodElems.length == 0) {
            continue;
        }
        var rowValue = 0;
        var hasHapbang = false;
        for (let i = 0; i < goodElems.length; ++i) {
            const elem = goodElems[i];
            if (elem["members"].length > 1 || ("people" in elem && elem["people"].length > 0)) {
                hasHapbang = true;
            }
            for (let j = 0; j < elem["members"].length; ++j) {
                memberName = elem["members"][j].toLowerCase();
                rowValue |= (1 << membersInfo[memberName].value);
            }
        }
        if (hasHapbang) {
            value += hapbangValue;
        }
        const dateYear = date.substring(0, 4);
        countPerYear[dateYear] += 1;
        data.push({
            x: date,
            value: rowValue,
            elems: goodElems,
        });
    }
    
    for (const [year, count] of Object.entries(countPerYear)) {
        if (count == 0) {
            data.push({
                x: year + "-12-31",
                value: -1,
                elems: [],
            });
        }
    }
    
    chart.data(data);
    
    if (currentYear - 2 < minYear) {
        document.getElementById("prev_page_div").style.visibility = "hidden";
    } else {
        document.getElementById("prev_page_div").style.visibility = "visible";
    }
    if (currentYear + 2 > maxYear) {
        document.getElementById("next_page_div").style.visibility = "hidden";
    } else {
        document.getElementById("next_page_div").style.visibility = "visible";
    }
    document.getElementById("elem_date").innerHTML = '';
    document.getElementById("elem_info_container").innerHTML = '';
    document.getElementById("sep_before_info").style.visibility = "hidden";
}

function modifyBoxIfNeeded(urlParams, field) {
    const checkStatus = urlParams.get(field);
    if (checkStatus != null) {
        document.getElementById(field + "_box").checked = (checkStatus === "true");
    }
}

function getGradient(colors) {
    if (curColors.length == 1) {
        return colors;
    }
    if (curColors.length == 2) {
        return [`.49 ${colors[0]}`, `.50 ${colors[1]}`];
    }
    if (curColors.length == 3) {
        return [`.32 ${colors[0]}`, `.33 ${colors[1]}`, `.65 ${colors[1]}`, `.66 ${colors[2]}`]
    }
    if (curColors.length == 4) {
        return [`.24 ${colors[0]}`, `.25 ${colors[1]}`, `.49 ${colors[1]}`, `.50 ${colors[2]}`, `.74 ${colors[2]}`, `.75 ${colors[3]}`]
    }
    return ["black"];
}

anychart.onDocumentReady(function () {
    // Initialize arrays and colors
    const numMembers = Object.keys(membersInfo).length;
    hapbangValue = (1 << (numMembers - 1)) + 1;
    var rangesArray = [];
    var colorsArray = [];
    for (let i = 1; i < (1 << numMembers); ++i) {
        curColors = [];
        j = 0;
        for (const [memberName, info] of Object.entries(membersInfo)) {
            if (i&(1 << j)) {
                curColors.push(info.color);
            }
            ++j;
        }
        const gradient = getGradient(curColors);
        rangesArray.push({equal: i});
        rangesArray.push({equal: i + hapbangValue});
        colorsArray.push(gradient);
        colorsArray.push(gradient);
    }
    
    rangesArray.push({equal: -1});
    colorsArray.push("#2d333b");
    customColorScale = anychart.scales.ordinalColor();
    customColorScale.ranges(rangesArray);
    customColorScale.colors(colorsArray);

    // Generate platform filters
    baseHtml = `<label>
          <input type="checkbox" id="platform_%plat%_box" name="platform_%plat%_box" value="%plat%" class="platform_check" onchange="updateChart()" checked/>
          <span data-i18n-key="%plat%">%plat%</span>
        </label>
        <span class="horizontal_separator"> | </span>`
        
    platforms = ["twitch", "datatwitch", "instagram", "weverse", "youtube", "qweryoutube", "zenflix", "chzzk", "tv", "showroom", "melon", "afreeca", "soop"];
    innerHtml = `<span id="platform_prefix"><span data-i18n-key="field_platform">Platform</span>:</span>`;
    for (let i = 0; i < platforms.length; ++i) {
        html = baseHtml.replaceAll("%plat%", platforms[i]);
        if (platforms[i] == "datatwitch") {
            html = html.replace("checked", "");
        }
        innerHtml += html;
    }
    document.getElementById("filter_platform").innerHTML =innerHtml;
    
    initializeUserLocale();
    document.getElementById("last_updated").innerHTML = updateDate;
    
    for (const [memberName, info] of Object.entries(membersInfo)) {
        const colorClass = '.' + memberName + '_color';
        const colorElems = document.querySelectorAll(colorClass);
        for (let j = 0; j < colorElems.length; ++j) {
            colorElems[j].style.setProperty('color', info.color);
        }
        const accentColorClass = '.' + memberName + '_accentcolor';
        const accentColorElems = document.querySelectorAll(accentColorClass);
        for (let j = 0; j < accentColorElems.length; ++j) {
            accentColorElems[j].style.setProperty('accent-color', info.color);
        }
    }
    
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    modifyBoxIfNeeded(urlParams, "chodan");
    modifyBoxIfNeeded(urlParams, "magenta");
    modifyBoxIfNeeded(urlParams, "hina");
    modifyBoxIfNeeded(urlParams, "siyeon");
    modifyBoxIfNeeded(urlParams, "link_public");
    modifyBoxIfNeeded(urlParams, "link_private");
    modifyBoxIfNeeded(urlParams, "link_missing");
    
    if (urlParams.get("advancedFilters") == "true") {
        document.getElementById("advanced_filters").style.display = "flow-root";
    }
    
    buildChart();
    updateChart();
    document.getElementsByTagName("html")[0].style.visibility = "visible";
});


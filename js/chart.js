const memberNames = ["Chodan", "Magenta", "Hina", "Siyeon"];
const memberColors = ["#e6e3d5", "#fc28fc", "dodgerblue", "lime", "yellow", "darkorange"];

var chart = null;
var selectedPath = null;
var memberToValue = null;
var hapbangValue = null;
var multipleValue = null;
var showVideoInfo = false;
    

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
    // Info
    text += "<div class='fields_container'>";
    for (const [j, [key, value]] of Object.entries(Object.entries(elemData))) {
        if (key == "thumbnail" || key == "account" || key == "train") {
            continue;
        }
        if (!showVideoInfo && key == "quality") {
            continue;
        }
        if (j > 0) {
            text += "<br>";
        }
        i18key = "field_" + key.replace(/ /g,"_");
        if (key == "members" && value.length == 4) {
            i18key += "_short";
        }
        cKey = key.charAt(0).toUpperCase() + key.slice(1);
        i18val = translateKey(i18key);
        keySpan = '<span data-i18n-key="' + i18key + '">' + i18val + "</span>";
        text += keySpan + "<span>: </span>";
        if (key == "link") {
            if (value.startsWith("http")) {
                var hostname = new URL(value).hostname;
                hostname = hostname.replace('www.', '');
                hostname = hostname.replace('.com', '');
                hostname = hostname.replace('.io', '');
                hostname = hostname.charAt(0).toUpperCase() + hostname.slice(1);
                text += "<a class='out_link' target='_blank' href='" + value + "'>" + hostname + "</a>";
            } else {
                text += '<span data-i18n-key="' + value + '">' + translateKey(value) + "</span>";
            }
        } else if (key == "members" || key == "people") {
            for (let i = 0; i < value.length; ++i) {
                if (i > 0) {
                    text += "<span>, </span>";
                }
                text += '<span data-i18n-key="' + value[i] + '">' + translateKey(value[i]) + "</span>";
            }
        } else if (key == "platform") {
            text += '<span data-i18n-key="' + value + '">' + translateKey(value) + "</span>";
            if (elemData["account"]) {
                const account = elemData["account"];
                text += "<span> (</span>";
                text += '<span data-i18n-key="' + account + '">' + translateKey(account) + "</span><span>)</span>";
            }
        } else {
            text += '<span>' + value + '</span>';
        }
    }
    text += "</div></div>"
    return text;
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

function buildChart() {
    if (chart) {
        return;
    }
    const noGradientElems = document.querySelectorAll('.nogradient');
    
    memberToValue = {};
    for (let i = 0; i < memberNames.length; ++i) {
        memberToValue[memberNames[i]] = (1 << i);
    }
    hapbangValue = (1 << (memberNames.length - 1)) + 1;
    multipleValue = hapbangValue + 1;
    
    var rangesArray = [];
    var colorsArray = [];
    for (let i = 1; i < (1 << memberNames.length); ++i) {
        curColors = [];
        for (let j = 0; j < memberNames.length; ++j) {
            if (i&(1<<j)) {
                curColors.push(memberColors[j]);
            }
        }
        const gradient = getGradient(curColors);
        rangesArray.push({equal: i});
        colorsArray.push(gradient);
    }
    for (let i = 0; i < noGradientElems.length; ++i) {
        noGradientElems[i].style.display = 'none';
    }
    const customColorScale = anychart.scales.ordinalColor();
    customColorScale.ranges(rangesArray);
    customColorScale.colors(colorsArray);
    
    chart = anychart.calendar();
    chart.contextMenu(false);
    chart.background("#22282D");
    chart.colorScale(customColorScale);
    chart.colorRange(false)
    
    chart.months()
        .stroke("#474747")
        .noDataStroke("#474747");
    chart.days()
        .spacing(4)
        .stroke(false)
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
            for (let i = 0; i < this.getData("elems").length; i++) {
                if (i > 0) {
                    text += "<hr noshade='true' class='anychart-tooltip-separator'>"
                }
                text += getViewDiv(this.getData("elems")[i], "tooltip_elem")
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
    
    const linkCheckboxes = document.querySelectorAll('.link_check:checked');
    const selectedLinks = [...linkCheckboxes].map(e => (e.getAttribute('value')));
    const memberCheckboxes = document.querySelectorAll('.member_check:checked');
    const selectedMembers = [...memberCheckboxes].map(e => (e.getAttribute('value')));
    const accountCheckboxes = document.querySelectorAll('.account_check:checked');
    const selectedAccounts = [...accountCheckboxes].map(e => (e.getAttribute('value')));
    
    transformedData = {};
    if (!smartDatesMode) {
        transformedData = fullData;
    } else {
        for (const [date, row] of Object.entries(fullData)) {
            for (let elem of row) {
                transformedDate = date;
                transformedElem = elem;
                if (elem["start time"] && elem["start time"].substring(0, 2) < "05") {
                    dateObject = new Date(Date.parse(date));
                    dateObject = new Date(dateObject.getTime() - (24 * 60 * 60 * 1000));
                    transformedDate = dateObject.toISOString().split('T')[0];
                    transformedElem = {...elem};
                    transformedElem["start time"] += " (+1d)";
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
            for (let mem of elem["members"]) {
                if (selectedMembers.includes(mem)) {
                    return true;
                }
            }
            return false;
        });
        if (goodElems.length == 0) {
            continue;
        }
        var rowValue = 0;
        for (let i = 0; i < goodElems.length; ++i) {
            for (let j = 0; j < goodElems[i]["members"].length; ++j) {
                rowValue |= memberToValue[goodElems[i]["members"][j]];
            }
        }
        data.push({
            x: date,
            value: rowValue,
            elems: goodElems,
        });
    }
    
    chart.data(data);
    
    document.getElementById("elem_date").innerHTML = '';
    document.getElementById("elem_info_container").innerHTML = '';
    document.getElementById("sep_before_info").style.visibility = 'hidden';
}

function modifyBoxIfNeeded(urlParams, field) {
    const checkStatus = urlParams.get(field);
    if (checkStatus != null) {
        document.getElementById(field + '_box').checked = (checkStatus === 'true');
    }
}

anychart.onDocumentReady(function () {
    // Generate platform filters
    baseHtml = `<label>
          <input type="checkbox" id="platform_%plat%_box" name="platform_%plat%_box" value="%plat%" class="platform_check" onchange="updateChart()" checked/>
          <span data-i18n-key="%plat%">%plat%</span>
        </label>
        <span class="horizontal_separator"> | </span>`
        
    platforms = ["twitch", "datatwitch", "instagram", "weverse", "youtube", "qweryoutube", "zenflix", "chzzk", "tv", "showroom", "melon"];
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
    
    const titleLetters = document.querySelectorAll('.title_letter');
    for (let i = 0; i < titleLetters.length; ++i) {
        titleLetters[i].style.setProperty('color', memberColors[i]);
    }
    const memberCheckboxes = document.querySelectorAll('.member_check');
    for (let i = 0; i < memberCheckboxes.length; ++i) {
        memberCheckboxes[i].style.setProperty('accent-color', memberColors[i]);
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

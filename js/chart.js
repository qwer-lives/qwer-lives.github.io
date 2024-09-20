const memberNames = ["Chodan", "Magenta", "Hina", "Siyeon"];
const memberColors = ["#e6e3d5", "#fc28fc", "dodgerblue", "lime", "yellow", "darkorange"];

var chart = null;
var selectedPath = null;
var memberToValue = null;
var hapbangValue = null;
var multipleValue = null;
var trainMode = false;

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
        if (j > 0) {
            text += "<br>";
        }
        i18key = "field_" + key.replace(/ /g,"_");
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

function getBreakdownMembers() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const breakdownMembersParam = urlParams.get('breakdownMembers');
    if (breakdownMembersParam === 'false') {
        return false;
    }
    return true;
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
    if (getBreakdownMembers()) {
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
    } else {
        for (let i = 0; i < memberNames.length; i++) {
            rangesArray.push({equal: memberToValue[memberNames[i]]});
        }
        rangesArray.push({equal: hapbangValue});
        rangesArray.push({equal: multipleValue});
        colorsArray = memberColors;
        for (let i = 0; i < noGradientElems.length; ++i) {
            noGradientElems[i].style.display = 'inline';
        }
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
    const includeTwitchData = urlParams.get('dataTwitch');
    const breakdownMembers = getBreakdownMembers();
    
    const linkCheckboxes = document.querySelectorAll('.link_check:checked');
    const selectedLinks = [...linkCheckboxes].map(e => (e.getAttribute('value')));
    const memberCheckboxes = document.querySelectorAll('.member_check:checked');
    const selectedMembers = [...memberCheckboxes].map(e => (e.getAttribute('value')));
    
    var data = [];
    var indexHapbang = [];
    for (const [date, row] of Object.entries(fullData)) {
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
            if (elem["platform"] == "DataTwitch" && !includeTwitchData) {
                return false;
            }
            if (trainMode && elem["train"] == "False") {
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
        var isHapbang = false;
        if (breakdownMembers) {
            for (let i = 0; i < goodElems.length; ++i) {
                if (goodElems[i]["members"].length > 1) {
                    isHapbang = true;
                }
                for (let j = 0; j < goodElems[i]["members"].length; ++j) {
                    rowValue |= memberToValue[goodElems[i]["members"][j]];
                }
            }
        } else {
            if (goodElems.length > 1) {
                rowValue = multipleValue;
            } else if (goodElems[0]["members"].length > 1 || goodElems[0]["people"]) {
                rowValue = hapbangValue;
            } else {
                rowValue = memberToValue[goodElems[0]["members"][0]];
            }
        }
        indexHapbang.push(isHapbang);
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
    if (urlParams.get("trainMode") == "true") {
        trainMode = true;
    }
    modifyBoxIfNeeded(urlParams, "chodan");
    modifyBoxIfNeeded(urlParams, "magenta");
    modifyBoxIfNeeded(urlParams, "hina");
    modifyBoxIfNeeded(urlParams, "siyeon");
    modifyBoxIfNeeded(urlParams, "link_public");
    modifyBoxIfNeeded(urlParams, "link_private");
    modifyBoxIfNeeded(urlParams, "link_missing");
    
    buildChart();
    updateChart();
    document.getElementsByTagName("html")[0].style.visibility = "visible";
});

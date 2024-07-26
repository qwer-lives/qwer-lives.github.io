const memberColors = ["#e6e3d5", "#fc28fc", "dodgerblue", "lime", "yellow", "darkorange"];
const memberToValue = { "Chodan": 1, "Magenta": 2, "Hina": 4, "Siyeon": 8};

var chart = null;
var selectedPath = null;

function getViewDiv(elemData, divClass) {
    var text = "<div class='" + divClass + "'>"
    if (elemData["thumbnail"]) {
        text += "<div align='center'><img width='20' src='" + elemData["thumbnail"] + "'></div><div>";
    }
    for (const [j, [key, value]] of Object.entries(Object.entries(elemData))) {
        if (key == "thumbnail") {
            continue;
        }
        if (j > 0) {
            text += "<br>";
        }
        cKey = key.charAt(0).toUpperCase() + key.slice(1);
        if (key == "link" && value != "Private") {
            var hostname = new URL(value).hostname;
            hostname = hostname.replace('www.', '');
            hostname = hostname.replace('.com', '');
            hostname = hostname.replace('.io', '');
            hostname = hostname.charAt(0).toUpperCase() + hostname.slice(1);
            text += cKey + ": <a href='" + value + "'>" + hostname + "</a>";
        } else if (Array.isArray(value)) {
            text += cKey + ": " + value.join(", ");
        } else {
            text += cKey + ": " + value;
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

    var rangesArray = [];
    var colorsArray = [];
    if (getBreakdownMembers()) {
        for (let i = 1; i < (1 << 4); ++i) {
            curColors = [];
            for (let j = 0; j < 4; ++j) {
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
        valuesAndExtra = [1, 2, 4, 8, 9, 10];
        for (let i = 0; i < valuesAndExtra.length; i++) {
            rangesArray.push({equal: valuesAndExtra[i]})
        }
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
        console.log(e);
        if (selectedPath != null) {
            selectedPath.setAttribute("stroke", "none");
        }
        const row = chart.data().row(e.dataIndex);
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
    
    const linkRadio = document.querySelector('.link_radio:checked');
    const linkRadioValue = linkRadio.getAttribute('value');
    const memberCheckboxes = document.querySelectorAll('.member_check:checked');
    const selectedMembers = [...memberCheckboxes].map(e => (e.getAttribute('value')));
    
    var data = [];
    for (const [date, row] of Object.entries(fullData)) {
        var goodElems = row.filter(elem => {
            const hasLink = elem["link"] && elem["link"] != "Private";
            if ((linkRadioValue == 'Private' && hasLink) || (linkRadioValue == 'Public') && !hasLink) {
                return false;
            }
            if (elem["platform"] == "DataTwitch" && !includeTwitchData) {
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
        if (breakdownMembers) {
            for (let i = 0; i < goodElems.length; ++i) {
                for (let j = 0; j < goodElems[i]["members"].length; ++j) {
                    rowValue |= memberToValue[goodElems[i]["members"][j]];
                }
            }
        } else {
            if (goodElems.length > 1) {
                rowValue = 10;
            } else if (goodElems[0]["members"].length > 1 || goodElems[0]["people"]) {
                rowValue = 9;
            } else {
                rowValue = memberToValue[goodElems[0]["members"][0]];
            }
        }
        data.push({
            x: date,
            value: rowValue,
            elems: goodElems,
        });
    }
    
    chart.data(data);
    chart.draw();
    
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
    console.log(updateDate);
    document.getElementById("last_updated").innerHTML = updateDate;
    const legendBoxes = document.querySelectorAll('.box');
    for (let i = 0; i < legendBoxes.length; ++i) {
        legendBoxes[i].style.setProperty('--color', memberColors[i]);
    }
    
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    modifyBoxIfNeeded(urlParams, 'chodan');
    modifyBoxIfNeeded(urlParams, 'magenta');
    modifyBoxIfNeeded(urlParams, 'hina');
    modifyBoxIfNeeded(urlParams, 'siyeon');
    const linkMode = urlParams.get('link');
    if (linkMode === 'all') {
        document.getElementById('link_all').checked = true;
    } else if (linkMode === 'private') {
        document.getElementById('link_private').checked = true;
    } else if (linkMode === 'public') {
        document.getElementById('link_public').checked = true;
    }
    
    buildChart();
    updateChart();
});

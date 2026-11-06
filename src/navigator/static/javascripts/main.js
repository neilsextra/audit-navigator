'use strict'

var tableView = null;
var userList = [];
var entryList = [];
var rows = [];

var barchartThroughput = null;
var barchartRequests = null;
var barchartExecuteTime = null;

function convert(date) {
    const dateObj = new Date(date);

    return dateObj.getTime();

}

function formatTime(epochTime, adjustment = 1) {
    const date = new Date(epochTime * adjustment);

    date.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;

}

async function command(action) {
    try {

        document.getElementById("wait-dialog").showModal();

        var message = new Message();

        var response = await message.command(
            document.getElementById("datalake-url").value,
            document.getElementById("datalake-namespace").value,
            document.getElementById("datalake-userid").value,
            document.getElementById("datalake-password").value,
            document.getElementById("identity-url").value,
            document.getElementById("identity-userid").value,
            document.getElementById("identity-password").value,
            document.getElementById("identity-client").value,
            document.getElementById("identity-secret").value,
            action);

        document.getElementById("wait-dialog").close();

        document.getElementById("command-dialog").close();

        document.getElementById("cancel-command-dialog").style.visibility = "visible";
        document.getElementById("command-button").disabled = false;

        document.getElementById("status").innerHTML = `${document.getElementById("datalake-url").value} - connected`;

        await updateStatus();

        enable("server-action");

        document.getElementById("wait-dialog").close();
        document.getElementById("command-dialog").close();

    } catch (exception) {

        if (exception.trace) {
            console.log(exception.trace);
        } else {
            console.log(exception);
        }

        document.getElementById("wait-dialog").close();
        showError(exception.message);

    }

}

function enable(className, enable = true) {

    for (var button of document.getElementsByClassName(className)) {
        button.disabled = !enable;
    }

}

function showError(message) {

    document.getElementById("error-message").innerHTML = message;
    document.getElementById("error-dialog").showModal();

}

function clean(id) {
    var element = document.getElementById(id);

    while (element.hasChildNodes()) {
        element.removeChild(element.firstChild);
    }

}

function activate(pages) {

    for (var page of pages) {
        document.getElementById(page["tab"]).classList = page['activate'] ? "rotate-active" : "rotate-inactive";
        document.getElementById(page["panel"]).style.display = page['activate'] ? "inline-block" : "none";
    }

}
function addRow(table, value, callback) {
    var row = table.insertRow();

    row.setAttribute("onclick", `window.${callback}('${value}')`, 0);

    var cell = row.insertCell();
    cell.className = "result-table-item";
    cell.style.textWrap = "nowrap";
    cell.style.whiteSpace = "nowrap";

    cell.innerHTML = value;

}

/**
 * Respond to the Document 'ready' event
 */
window.onload = async function () {

    document.getElementById("ok-connect-dialog").addEventListener('click', async (e) => {

        document.getElementById("wait-dialog").showModal();

        try {
            var message = new Message();

            var response = await message.status(
                document.getElementById("datalake-url").value,
                document.getElementById("datalake-namespace").value,
                document.getElementById("datalake-userid").value,
                document.getElementById("datalake-password").value,
                document.getElementById("datalake-table").value);
                document.getElementById("connect-dialog").close();
                
            document.getElementById("wait-dialog").close();
            
            document.getElementById("status").innerHTML = `${document.getElementById("datalake-url").value}:` +
                                                          `${document.getElementById("datalake-table").value} - connected`;

            document.getElementById("connect-dialog").close();

        } catch (exception) {

            if (exception.trace) {
                console.log(exception.trace);
            } else {
                console.log(exception);
            }

            document.getElementById("wait-dialog").close();
            showError(exception.message);

        }

    });

    document.getElementById("cancel-connect-dialog").addEventListener('click', async (e) => {

        document.getElementById("connect-dialog").close();

    });

    document.getElementById("info-button").addEventListener('click', async (e) => {

        try {
            document.getElementById("wait-dialog").showModal();

            var message = new Message();

            var response = await message.status(
                document.getElementById("datalake-url").value,
                document.getElementById("datalake-namespace").value,
                document.getElementById("datalake-userid").value,
                document.getElementById("datalake-password").value,
                document.getElementById("datalake-table").value);

            for (var column of response["response"]) {

                if (column["col"] == "json:control") {
                    var tokens = JSON.parse(column["val"]);
                    document.getElementById("token-view").replaceChildren();
                    document.getElementById("token-view").appendChild(renderjson(tokens));

                } else if (column["col"] == "json:checkpoint") {
                    var checkpoint = JSON.parse(column["val"]);

                    if (checkpoint["time"] != 0) {
                        checkpoint["converted"] = formatTime(checkpoint["time"]);
                    }

                    document.getElementById("checkpoint-view").replaceChildren();
                    document.getElementById("checkpoint-view").appendChild(renderjson(checkpoint));

                }

            }

            document.getElementById("wait-dialog").close();
            document.getElementById("info-dialog").showModal();

        } catch (exception) {

            if (exception.trace) {
                console.log(exception.trace);
            } else {
                console.log(exception);
            }

            document.getElementById("wait-dialog").close();
            showError(exception.message);

        }

    });

    document.getElementById("search-button").addEventListener('click', async (e) => {
        try {
            document.getElementById("wait-dialog").showModal();

            var message = new Message();
            var response = await message.search(
                document.getElementById("datalake-url").value,
                document.getElementById("datalake-namespace").value,
                document.getElementById("datalake-userid").value,
                document.getElementById("datalake-password").value,
                document.getElementById("datalake-table").value,
                document.getElementById("search-argument").value,
                document.getElementById("search-limit").value
            );

            console.log(response);

        } catch (exception) {

            if (exception.trace) {
                console.log(exception.trace);
            } else {
                console.log(exception);
            }

            document.getElementById("wait-dialog").close();
            showError(exception.message);

        }

    });

    document.getElementById("close-info-dialog").addEventListener('click', async (e) => {

        document.getElementById("info-dialog").close();

    });

    document.getElementById("connect-dialog").addEventListener('input', function (event) {
        const container = document.getElementById('connect-dialog');
        const fields = container.querySelectorAll('input, select, textarea');

        var enabled = Array.from(fields).every(field => field.checkValidity());

        for (var button of container.getElementsByClassName('server-command')) {
            button.disabled = !enabled;
        }

    });
    renderjson.setShowToLevel(3);

    activateTabs('info-tabs', 'summary-panel', 'info-tab1');
    activateTabs('connection-tabs', 'datalake-panel', 'connection-tab1');

    document.getElementById("connect-dialog").showModal();

}

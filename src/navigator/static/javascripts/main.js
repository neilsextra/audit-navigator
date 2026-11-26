'use strict'

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

function find(table, dn) {

    for (var iRow = 0, row; row = table.rows[iRow]; iRow++) {

        for (var iCell = 0, col; col = row.cells[iCell]; iCell++) {

            if (dn.trim() == col.innerText.trim()) {
                return true;
            }
        }
    }

    return false;

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

/**
 * Add a row to a nominated table ensures uniqueness
 * @param {string} elementId the table identifier
 * @param {string} value the value to identifer
 * @param {string} callback the callback function
 */
function addRow(elementId, value, callback) {
    var table = document.getElementById(elementId);
    var item = -1;

    exit: for (var iRow = 0, row; row = table.rows[iRow]; iRow++) {

        for (var iCell = 0, col; col = row.cells[iCell]; iCell++) {

            if (value.trim() == col.innerText.trim()) {
                item = iRow;
                break exit;
            }
        }
    }

    if (item == -1) {
        var row = table.insertRow();

        row.setAttribute("onclick", `window.${callback}('${value}')`, 0);

        var cell = row.insertCell();

        cell.className = "result-table-item";
        cell.style.textWrap = "nowrap";
        cell.style.whiteSpace = "nowrap";
        cell.innerHTML = value;

    }

}

/**
 * Delete a row from a nominated table
 * @param {string} elementId the table identifier
 * @param {string} value the value to identifer
 */
function deleteRow(elementId, value) {
    var table = document.getElementById(elementId);

    var item = -1;

    exit: for (var iRow = 0, row; row = table.rows[iRow]; iRow++) {

        for (var iCell = 0, col; col = row.cells[iCell]; iCell++) {

            if (value.trim() == col.innerText.trim()) {
                item = iRow;
                break exit;
            }
        }
    }

    if (item != -1) {
        table.deleteRow(item);
    }
}

/**
 * Setup the various tag tables
 * @param {string} container the name of the container - "bookmarks" or "history"
 * @param {elementId} the table identifier
 */
function setup(container, elementId) {
    var tagStorage = window.localStorage.getItem(`navigator:${container}`);
    var tags = tagStorage != null ? JSON.parse(tagStorage) : [];

    for (var tag in tags) {
        addRow(elementId, tags[tag].key, 'retrieve');
    }

}

/**
 * Add a value to the local storage and table
 * @param {string} container the name of the container - "bookmarks" or "history"
 * @param {string} elementId the table identifier
 * @param {string} value the value to add
 */
function update(container, elementId, value) {

    var keyStorage = window.localStorage.getItem(`navigator:${container}`);
    var keys = keyStorage != null ? JSON.parse(keyStorage) : [];

    var found = false;

    exit: for (var key in keys) {

        if (keys[key].key == value) {
            found = true;
            break exit;
        }

    }

    if (!found) {

        keys.push({
            "key": value
        });

        window.localStorage.setItem(`navigator:${container}`, JSON.stringify(keys));

        addRow(elementId, value, retrieve);

    }

}

/**
 * Remove a value to the local storage and table
 * @param {string} container the name of the container - "bookmarks" or "history"
 * @param {string} elementId the table identifier
 * @param {string} value the value to remove from the table
 */
function remove(container, elementId, value) {

    var containerStorage = window.localStorage.getItem(`navigator:${container}`);
    var entries = containerStorage != null ? JSON.parse(containerStorage) : [];
    var filteredEntries = entries.filter(item => item !== value);

    window.localStorage.setItem(`navigator:${container}`, JSON.stringify(filteredEntries));

    deleteRow(elementId, value);

}

/**
 * Filter the values in a table
 * @param {string} elementId the table identifier
 * @param {string} entries an array of keys
 * @param {string} value the value to add
 */
function filter(elementId, entries, filter) {

    var table = document.getElementById(elementId);

    table.innerHTML = "";

    for (var entry of entries) {

        if (entry['key'].toLowerCase().indexOf(filter.toLowerCase()) != -1) {
            var row = table.insertRow();

            row.setAttribute("onclick", `window.select('${entry['key']}')`, 0);

            var cell = row.insertCell();

            cell.className = "result-table-item";
            cell.style.textWrap = "nowrap";
            cell.style.whiteSpace = "nowrap";

            cell.innerHTML = entry['key'];

        }

    }

}

function snapshots(requests, request) {
    var stringUtils = new StringUtils();

    document.getElementById('request-timeline').replaceChildren();

    var template = document.getElementById("snapshot-version").text;
    for (var request of requests) {

        stringUtils.append(template, 'request-timeline',
            {
                "time": request["creationTime"],
                "request": request["key"],
                "class": "container-selected"
            });

    }

}

/**
 * Perform an action (generally - retrieve the cotrol record)
 * @param {string} action the action to perform
 */
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
/**
 * Search for a specific records base on the provided argument
 * @param {string} argument the search arguement
 * @param {int} limit the number of recrods to return
 */
async function search(argument, limit) {
    try {
        document.getElementById("wait-dialog").showModal();

        var message = new Message();
        var response = await message.search(
            document.getElementById("datalake-url").value,
            document.getElementById("datalake-namespace").value,
            document.getElementById("datalake-userid").value,
            document.getElementById("datalake-password").value,
            document.getElementById("datalake-table").value,
            argument, limit
        );

        document.getElementById("wait-dialog").close();

        window.response = response["response"];

        var rows = {}

        for (var row of response["response"]) {

            if (!(['_', '$', '-'].includes(row['key']))) {

                var cells = {}

                for (var cell of row["cells"]) {
                    cells[cell["col"]] = cell["val"].trim().length == 0 ? {} : JSON.parse(cell["val"]);
                }

                rows[row['key']] = cells

            }

        }

        window.rows = rows;
        document.getElementById("wait-dialog").close();

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

/**
 * Select the selected request's summary and history
 * @param {string} request the request identifier
 */
function select(request) {

    display(request);

    var requests = [];

    console.log(request);
    console.log(JSON.stringify(window.rows[request]['json:summary']["creationTime"]));

    requests.push(
        {
            "key": request,
            "creationTime": formatTime(JSON.stringify(window.rows[request]['json:summary']["creationTime"]))
        }
    );

    snapshots(requests, request);

}

/**
 * Display the selected request's summary and history
 * @param {string} request the request identifier
 */
function display(request) {

    window.request = request;

    document.getElementById("json:summary").replaceChildren();
    document.getElementById("json:history").replaceChildren();

    for (var col of Object.keys(window.rows[request])) {
        document.getElementById(col).appendChild(renderjson(window.rows[request][col]));
    }

    addRow("history-table", request, 'retrieve');

    document.getElementById("request-view").style.visibility = "visible";

}

/**
 * retrieve the record before selecing the record
 * @param {string} request the request identifier
 */
async function retrieve(request) {

    if (!(request in window.rows)) {
        await search(request, 1);
    }

    select(request);

}

/**
 * Respond to the Document 'ready' event
 */
window.onload = async function () {

    document.getElementById("ok-connect-dialog").addEventListener('click', async (e) => {
        var stringUtils = new StringUtils();

        document.getElementById("wait-dialog").showModal();

        try {
            var message = new Message();

            var response = await message.status(
                document.getElementById("datalake-url").value,
                document.getElementById("datalake-namespace").value,
                document.getElementById("datalake-userid").value,
                document.getElementById("datalake-password").value,
                document.getElementById("datalake-table").value);

            for (var column of response["response"]) {
                var searchIndex = document.getElementById("search-index");

                if (column["col"] == "json:indexes") {
                    var indexes = JSON.parse(column["val"]);

                    for (var index of indexes) {
                        var option = new Option(stringUtils.capitalize(index["label"]), index["label"]);

                        searchIndex.add(option)

                    }

                }

            }

            document.getElementById("connect-dialog").close();
            document.getElementById("wait-dialog").close();

            document.getElementById("status").innerHTML = `${document.getElementById("datalake-url").value}:` +
                `${document.getElementById("datalake-table").value} - connected`;

            document.getElementById("cancel-connect-dialog").disabled = false;

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

    document.getElementById("connect-button").addEventListener('click', async (e) => {

        document.getElementById("connect-dialog").showModal()

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

                } else if (column["col"] == "json:indexes") {
                    var indexes = JSON.parse(column["val"]);

                    document.getElementById("indexes-view").replaceChildren();
                    document.getElementById("indexes-view").appendChild(renderjson(indexes));

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
        document.getElementById("wait-dialog").showModal();

        await search(
            document.getElementById("search-argument").value,
            document.getElementById("search-limit").value
        );

        var table = document.getElementById("search-table");

        while (table.rows.length > 0) {
            table.deleteRow(0);
        }

        for (var request of Object.keys(window.rows)) {
            addRow("search-table", request, 'select');
        }

    });

    document.getElementById("close-info-dialog").addEventListener('click', async (e) => {

        document.getElementById("info-dialog").close();

    });

    document.getElementById("connect-dialog").addEventListener('input', function (event) {

        try {
            const container = document.getElementById('connect-dialog');
            const fields = container.querySelectorAll('input, select, textarea');

            var enabled = Array.from(fields).every(field => field.checkValidity());

            for (var button of document.getElementsByClassName('navigator-action')) {
                button.disabled = !enabled;
            }

        } catch (exception) {
            showError(exception.message);
        }

    });

    document.getElementById(`bookmark-button`).addEventListener('click', async function (event) {

        update("bookmarks", "bookmarks-table", window.request)

    });

    document.getElementById(`unbookmark-button`).addEventListener('click', async function (event) {

        remove("bookmarks", "bookmarks-table", window.request);

    });

    document.getElementById(`filter-bookmarks-button`).addEventListener('click', async (e) => {

        var bookmarkStorage = window.localStorage.getItem(`navigator:bookmarks`);

        filter("bookmarks-table",
            bookmarkStorage != null ? JSON.parse(bookmarkStorage) : [],
            document.getElementById("filter-bookmarks").value);

    });

    document.getElementById(`filter-history-button`).addEventListener('click', async (e) => {

        filter("history-table", window.requests, document.getElementById("filter-bookmarks").value);

    });

    document.getElementById(`clear-bookmarks-button`).addEventListener('click', async (e) => {

        window.localStorage.removeItem(`navigator:bookmarks`);

        document.getElementById(`bookmarks-table`).innerHTML = "";

    });

    document.getElementById(`clear-history-button`).addEventListener('click', async (e) => {

        window.history = [];
        document.getElementById(`history-table`).innerHTML = "";

    });

    document.getElementById('search-limit').addEventListener('input', function (event) {
        document.getElementById('search-limit-value').textContent = event.target.value;
    });

    renderjson.setShowToLevel(3);

    window.rows = {};
    window.requests = [];

    window.select = select;

    setup('bookmarks', 'bookmarks-table');

    activateTabs('info-tabs', 'summary-panel', 'info-tab1');
    activateTabs('connection-tabs', 'datalake-panel', 'connection-tab1');
    activateTabs('request-tabs', 'request-summary-panel', 'request-tab1');
    activateTabs('action-tabs', 'search-panel', 'action-tab1');

    document.getElementById("connect-dialog").showModal();

}

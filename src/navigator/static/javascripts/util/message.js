function Message() {

    this._status = function (datalakeUrl, datalakeNamespace, datalakeUserid, datalakePassword,
        datalakeTable) {

        return new Promise((accept, reject) => {
            let parmURL = `/status`

            var xhttp = new XMLHttpRequest();

            xhttp.open("GET", parmURL, true);

            xhttp.setRequestHeader("datalake-url", datalakeUrl);
            xhttp.setRequestHeader("datalake-namespace", datalakeNamespace);
            xhttp.setRequestHeader("datalake-userid", datalakeUserid);
            xhttp.setRequestHeader("datalake-password", datalakePassword);
            xhttp.setRequestHeader("datalake-table", datalakeTable);

            xhttp.onreadystatechange = async function () {
                xhttp.onload = function () {

                    if (this.readyState === 4 && this.status === 200) {
                        var response = JSON.parse(xhttp.response);

                        accept({
                            status: this.status,
                            response: response
                        });

                    } else {

                        reject({
                            status: this.status,
                            message: this.statusText
                        });

                    }

                };

                xhttp.onerror = function () {
                };

            }

            xhttp.send();

        });

    }.bind(this);

    this._search = function (datalakeUrl, datalakeNamespace, datalakeUserid, datalakePassword,
        datbaseTable, filter, limit) {

        return new Promise((accept, reject) => {
            let parmURL = `/search?filter=${filter}&limit=${limit}`

            var xhttp = new XMLHttpRequest();

            xhttp.open("GET", parmURL, true);

            xhttp.setRequestHeader("datalake-url", datalakeUrl);
            xhttp.setRequestHeader("datalake-namespace", datalakeNamespace);
            xhttp.setRequestHeader("datalake-userid", datalakeUserid);
            xhttp.setRequestHeader("datalake-password", datalakePassword);
            xhttp.setRequestHeader("datalake-table", datbaseTable);
            xhttp.onreadystatechange = async function () {
                xhttp.onload = function () {

                    if (this.readyState === 4 && this.status === 200) {
                        var response = JSON.parse(xhttp.response);

                        accept({
                            status: this.status,
                            response: response
                        });

                    } else {

                        reject({
                            status: this.status,
                            message: this.statusText
                        });

                    }

                };

                xhttp.onerror = function () {
                };

            }

            xhttp.send();

        });

    }.bind(this);

}

Message.prototype.status = function (datalakeUrl, datalakeNamespace,
    datalakeUserid, datalakePassword,
    datalakeTable) {

    return this._status(datalakeUrl, datalakeNamespace,
        datalakeUserid, datalakePassword,
        datalakeTable);

}

Message.prototype.search = function (datalakeUrl, datalakeNamespace,
    datalakeUserid, datalakePassword, datalakeTable, filter, limit) {
 
    return this._search(datalakeUrl, datalakeNamespace,
        datalakeUserid, datalakePassword,
        datalakeTable,
        filter, limit);

}

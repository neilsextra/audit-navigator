function StringUtils() {

    StringUtils.prototype.substitute = (template, values) => {
        let html = template;

        let keys = Object.keys(values);

        for (let key in keys) {
             html = html.split("${" + keys[key] + "}").join(values[keys[key]]);
        }

        return document.createRange().createContextualFragment(html);

    }

    StringUtils.prototype.append = (template, parent, values) => {
        let html = template;
        let keys = Object.keys(values);
        let node = document.getElementById(parent);

        for (let key in keys) {
             html = html.split("${" + keys[key] + "}").join(values[keys[key]]);
        }
        
        const range = document.createRange();

        range.selectNodeContents(node);
             
        node.appendChild(range.createContextualFragment(html));

    }

}

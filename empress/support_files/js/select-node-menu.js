define([], function() {
    function SelectedNodeMenu(empress, drawer) {
        this.empress = empress;
        this.drawer = drawer;
        this.cols = [];
        this.TYPES = {
            TREE_DATA: "t",
            SAMPLE_DATA: "s",
            FEATRUE_DATA: "f"
        };
        this.table = document.getElementById("hover-table");
        this.box = document.getElementById("hover-box");
        this.sel = document.getElementById("hover-select");
        this.addBtn = document.getElementById("hover-add-btn");
        this.node = null;
    }

    SelectedNodeMenu.prototype.initialize = function() {
        // add items to select
        var selOpts = this.empress.getSampleCategories();
        for (var i = 0; i < selOpts.length; i++) {
            var opt = document.createElement("option");
            opt.value = selOpts[i];
            opt.innerHTML = selOpts[i];
            this.sel.appendChild(opt);
        }

        // add event to add button
        var selectMenu = this;
        var click = function() {
            var val = selectMenu.sel.value;
            selectMenu.addMenuColumn(val, "s");
            selectMenu.showNodeMenu();
        };
        this.addBtn.onclick = click;
    };

    SelectedNodeMenu.prototype.addMenuColumn = function(colName, type) {
        this.cols.push({ col: colName, type: type });
    };

    SelectedNodeMenu.prototype.showNodeMenu = function() {
        var node = this.node;
        this.table.innerHTML = "";

        // add id row
        var row = this.table.insertRow(-1);
        var cell = row.insertCell(-1);
        cell.innerHTML = "<b>ID</b>";
        cell = row.insertCell(-1);
        cell.innerHTML = node.name;

        // show either leaf or internal node
        var emp = this.empress;
        var t = emp._tree;
        if (t.isleaf(t.postorderselect(emp._nameToKeys[node.name][0]))) {
            this.showLeafNode(row);
        } else {
            this.showInternalNode(row);
        }

        // get table coords
        var x = this.empress.getX(node);
        var y = this.empress.getY(node);
        var tableLoc = this.drawer.toScreeSpace(x, y);

        // set table location. add slight offset to location so menu appears
        // next to node instead of on top of it.
        this.box.style.left = Math.floor(tableLoc.x + 23) + "px";
        this.box.style.top = Math.floor(tableLoc.y - 43) + "px";

        // show table
        this.box.classList.remove("hidden");
    };

    SelectedNodeMenu.prototype.showLeafNode = function(row) {
        for (var i = 0; i < this.cols.length; i++) {
            // add row
            var col = this.cols[i].col;

            /*
             * Once feature metadata is available, this will be used to flag
             * if col is from the sample or feature metadata
             *
             *  var type = this.cols[i].type; // tree, sample, or feature
             */
            row = this.table.insertRow(-1);
            cell = row.insertCell(-1);
            cell.innerHTML = "<b>" + col + "</b>";

            // add row values
            var obs = this.empress._biom.getObsCountsBy(col, this.node.name);
            var categories = Object.keys(obs);
            categories.sort();
            for (var j = 0; j < categories.length; j++) {
                cell = row.insertCell(-1);
                cell.innerHTML =
                    "<p>" +
                    categories[j] +
                    "<br>" +
                    obs[categories[j]] +
                    "</p>";
            }
        }
    };

    SelectedNodeMenu.prototype.showInternalNode = function(row) {
        // find first and last preorder positions of the subtree spanned by node
        var emp = this.empress;
        var t = emp._tree;
        var n = t.postorderselect(emp._nameToKeys[this.node.name][0]);
        var start = t.preorder(t.fchild(n));
        var end = t.preorder(t.lchild(n));
        while (!t.isleaf(t.preorderselect(end))) {
            end = t.preorder(t.lchild(t.preorderselect(end)));
        }

        var tips = [];
        for (var i = start; i <= end; i++) {
            var node = t.preorderselect(i);
            if (t.isleaf(node)) {
                tips.push(t.name(node));
            }
        }
        var samples = emp._biom.getSamplesByObservations(tips);

        for (i = 0; i < this.cols.length; i++) {
            // add row
            var col = this.cols[i].col;
            var type = this.cols[i].type; // tree, sample, or feature
            row = this.table.insertRow(-1);
            cell = row.insertCell(-1);
            cell.innerHTML = "<b>" + col + "<b>";

            var result = emp._biom.getSampleValuesCount(samples, col);
            categories = emp._biom.getUniqueSampleValues(col);
            categories.sort();
            for (var j = 0; j < categories.length; j++) {
                var category = categories[j];
                var count = 0;
                if (category in result) {
                    count = result[category];
                }
                cell = row.insertCell(-1);
                cell.innerHTML = "<p>" + category + "<br>" + count + "</p>";
            }
        }
    };

    SelectedNodeMenu.prototype.clearSelectedNode = function() {
        this.table.innerHTML = "";
        this.node = null;
        this.box.classList.add("hidden");
        this.drawer.loadSelectedNodeBuff([]);
    };

    SelectedNodeMenu.prototype.setSelectedNode = function(node) {
        var x = this.empress.getX(node);
        var y = this.empress.getY(node);
        this.drawer.loadSelectedNodeBuff([x, y, 0, 1, 0]);
        this.node = node;
        this.showNodeMenu(node);
    };

    return SelectedNodeMenu;
});

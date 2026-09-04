(function () {
    "use strict";

    var childProcess = require("child_process");
    var fs = require("fs");
    var path = require("path");
    var directory = __dirname;
    var selfName = path.basename(__filename);
    var files = fs.readdirSync(directory).filter(function (name) {
        return /^run-.*\.js$/.test(name) && name !== selfName;
    }).sort();
    var passed = 0;
    var casesPassed = 0;
    var casesTotal = 0;

    function lastRatio(output) {
        var lines = String(output || "").split(/\r?\n/);
        var found = null;
        for (var j = 0; j < lines.length; j++) {
            var match = lines[j].match(/(\d+)\/(\d+)/);
            if (match) found = match;
        }
        return found;
    }

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var result = childProcess.spawnSync(process.execPath, [path.join(directory, file)], {
            encoding: "utf8"
        });
        if (result.status === 0) {
            var ratio = lastRatio(result.stdout);
            passed++;
            if (ratio) {
                casesPassed += parseInt(ratio[1], 10);
                casesTotal += parseInt(ratio[2], 10);
            }
            console.log("PASS [" + file + "]");
        } else {
            console.error("FAIL [" + file + "]");
            if (result.stdout) console.error(result.stdout);
            if (result.stderr) console.error(result.stderr);
        }
    }

    console.log("-----");
    console.log("SUÍTES: " + passed + "/" + files.length + " passando");
    console.log("CASOS: " + casesPassed + "/" + casesTotal + " passando");
    if (passed !== files.length) process.exit(1);
})();

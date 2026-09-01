(function (self) {
    "use strict";
    var entries = [];
    var checksum = 0;
    var i;
    var value;
    for (i = 0; i < 32768; i += 1) {
        value = "verbete-z-" + String(i) + "-portugues-brasileiro-contexto-local-prova-de-carga";
        entries.push(value);
        checksum = (checksum + value.length + i) % 1000003;
    }
    self.PROBE_SHARD = { entries: entries, checksum: checksum };
}(self));
